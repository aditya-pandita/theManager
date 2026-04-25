import { ticketRepo } from '../repositories/ticket-repo';
import { agentRunRepo } from '../repositories/agent-run-repo';
import { checkpointRepo } from '../repositories/checkpoint-repo';
import { changelogRepo } from '../repositories/changelog-repo';
import { activityService } from '../activity/activity-service';
import { orchestrator } from '../agents/orchestrator';
import { agentRegistry } from '../agents/registry';
import { contextStore } from '../agents/context-store';
import { failureHandler } from '../agents/failure-handler';
import { resolveWorkspace, ticketSlug } from '../workspace/workspace-resolver';
import { gitRunner } from '../workspace/git-runner';
import { applyFiles, type CoderFile } from '../workspace/file-applier';
import { gitService } from './git-service';
import type { TicketType, AgentName, PipelineConfig } from '../types/agent';

type SSECallback = (event: object) => void;

function detectTicketType(ticket: { tags?: string[] }): TicketType {
  const tags = ticket.tags ?? [];
  if (tags.includes('bug')) return 'bug';
  if (tags.includes('refactor')) return 'refactor';
  if (tags.includes('docs')) return 'docs';
  if (tags.includes('test')) return 'test';
  return 'feature';
}

export const pipelineService = {
  subscribe(ticketId: string, cb: SSECallback): void {
    orchestrator.subscribe(ticketId, cb);
  },

  unsubscribe(ticketId: string, cb: SSECallback): void {
    orchestrator.unsubscribe(ticketId, cb);
  },

  async run(ticketId: string, ticketType?: string): Promise<void> {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    // Guard: refuse to start a second pipeline while one is in flight.
    // Without this, a stray UI click or curl re-fire spawns a parallel chain and
    // pollutes the agent_runs timeline.
    const currentState = (ticket as any).pipelineState;
    if (currentState === 'running' || currentState === 'awaiting_approval') {
      throw new Error(`Pipeline is already ${currentState} for this ticket`);
    }
    if ((ticket as any).isLocked) {
      throw new Error('Ticket is locked — unlock before running the pipeline');
    }

    const type = (ticketType as TicketType) ?? detectTicketType(ticket);
    // Run pipeline async — don't await so the HTTP response returns immediately
    orchestrator.runPipeline(ticket, type).catch((err) =>
      console.error('[pipeline] error:', err.message)
    );
  },

  async runAgent(ticketId: string, agentName: AgentName): Promise<void> {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const run = await agentRunRepo.create({ ticketId, agent: agentName, status: 'running' });
    orchestrator.emit(ticketId, { type: 'agent:started', ticketId, agent: agentName });

    try {
      const ctx = await contextStore.getAll(ticketId);
      const agent = agentRegistry.get(agentName);
      const config = agentRegistry.getConfig(agentName);
      const output = await failureHandler.run(agent, { ticket, contextStore: ctx }, config);

      await agentRunRepo.complete(run.id, output.data as object, output.tokensInput, output.tokensOutput, output.durationMs);
      await contextStore.set(ticketId, agentName, output.data, agentName);
      orchestrator.emit(ticketId, { type: 'agent:completed', ticketId, agent: agentName, confidence: output.confidence });
      activityService.log({ ticketId, actorType: 'agent', actorName: agentName, actionType: 'agent_completed', tokensUsed: output.tokensInput + output.tokensOutput }).catch(() => {});
    } catch (err) {
      const message = (err as Error).message;
      await agentRunRepo.fail(run.id, message, agentRegistry.getConfig(agentName).maxRetries);
      orchestrator.emit(ticketId, { type: 'agent:failed', ticketId, agent: agentName, error: message });
      throw err;
    }
  },

  async pause(ticketId: string): Promise<void> {
    await ticketRepo.setPaused(ticketId, true);
    // Interrupt the in-flight agent's Gemma call right away (if any). Without this,
    // pause only takes effect between agents — useless when one agent is hung.
    const aborted = orchestrator.abortActiveAgent(ticketId, 'pause');
    activityService.log({ ticketId, actorType: 'user', actionType: 'pipeline_paused', payload: aborted ? { abortedAgent: aborted.agent, runId: aborted.runId } : {} }).catch(() => {});
  },

  async resume(ticketId: string): Promise<void> {
    await ticketRepo.setPaused(ticketId, false);

    const ticket = await ticketRepo.findById(ticketId);
    if (ticket) {
      const type = detectTicketType(ticket);
      orchestrator.runPipeline(ticket, type).catch((err) => console.error('[pipeline] resume error:', err.message));
    }
    activityService.log({ ticketId, actorType: 'user', actionType: 'pipeline_resumed' }).catch(() => {});
  },

  async skip(ticketId: string): Promise<void> {
    // Interrupt the running agent — the orchestrator's catch block will see
    // the abort with reason='skip', mark the run as skipped, and `continue`
    // to the next agent in the chain.
    const aborted = orchestrator.abortActiveAgent(ticketId, 'skip');
    if (aborted) {
      activityService.log({ ticketId, actorType: 'user', actionType: 'agent_skipped', payload: { agent: aborted.agent, runId: aborted.runId } }).catch(() => {});
      return;
    }
    // Fallback: nothing was running — just mark any stale 'running' rows as skipped.
    const runs = await agentRunRepo.findByTicket(ticketId);
    const running = runs.find((r) => r.status === 'running');
    if (running) await agentRunRepo.skip(running.id);
  },

  async approve(ticketId: string): Promise<void> {
    const checkpoints = await checkpointRepo.findPendingByTicket(ticketId);
    if (checkpoints.length === 0) throw new Error('No pending checkpoint');
    await checkpointRepo.approve(checkpoints[0].id);

    await ticketRepo.setPaused(ticketId, false);

    const ticket = await ticketRepo.findById(ticketId);
    if (ticket) {
      const type = detectTicketType(ticket);
      orchestrator.runPipeline(ticket, type).catch((err) => console.error('[pipeline] resume error:', err.message));
    }
    activityService.log({ ticketId, actorType: 'user', actionType: 'ticket_approved' }).catch(() => {});
  },

  async reject(ticketId: string, feedback: string): Promise<void> {
    const checkpoints = await checkpointRepo.findPendingByTicket(ticketId);
    if (checkpoints.length === 0) throw new Error('No pending checkpoint');
    await checkpointRepo.reject(checkpoints[0].id, feedback);
    activityService.log({ ticketId, actorType: 'user', actionType: 'ticket_rejected', payload: { feedback } }).catch(() => {});
  },

  async getStatus(ticketId: string): Promise<object> {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');
    const runs = await agentRunRepo.findByTicket(ticketId);
    const checkpoints = await checkpointRepo.findPendingByTicket(ticketId);
    return {
      pipelineState: (ticket as any).pipelineState ?? 'idle',
      currentAgent:  (ticket as any).currentAgent ?? null,
      isPaused:      (ticket as any).isPaused ?? false,
      isLocked:      (ticket as any).isLocked ?? false,
      recentRuns:    runs.slice(0, 5),
      pendingCheckpoints: checkpoints,
    };
  },

  async lock(ticketId: string, locked: boolean): Promise<void> {
    await ticketRepo.setLocked(ticketId, locked);
    activityService.log({ ticketId, actorType: 'user', actionType: 'ticket_locked', payload: { locked } }).catch(() => {});
  },

  /**
   * Apply the latest Coder agent's output to a workspace.
   *
   * - Resolves the workspace: project's folderPath if linked, else /tmp/decidr-output/<ticketId>/.
   * - Initializes a sandbox as a git repo on first run.
   * - Creates (or checks out) a DC-<id>/<slug-of-title> branch when the workspace is git.
   * - Validates and writes each file (path-safety, denylist, never-overwrite).
   * - Stages + commits with the Coder's commitMessage.
   * - Registers the branch + commit in Decidr's git tables so they show on the Git tab.
   *
   * dryRun=true returns the planned writes without touching disk or git.
   */
  async applyCoderOutput(ticketId: string, opts: { dryRun?: boolean } = {}): Promise<{
    workspace: { rootDir: string; isProjectLinked: boolean; isGit: boolean };
    branch?: string;
    written: Array<{ path: string; bytes: number; previouslyExisted: boolean }>;
    rejected: Array<{ path: string; reason: string }>;
    commitHash?: string;
    commitMessage?: string;
    dryRun: boolean;
    error?: string;
  }> {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    // Find the latest completed Coder run for this ticket
    const runs = await agentRunRepo.findByTicket(ticketId);
    const coderRun = runs
      .filter((r) => r.agent === 'coder' && r.status === 'completed' && r.output)
      .sort((a, b) => b.id - a.id)[0];
    if (!coderRun) {
      throw new Error('No completed Coder agent output found for this ticket. Run the pipeline first.');
    }

    const out = coderRun.output as { files?: CoderFile[]; commitMessage?: string };
    const files = Array.isArray(out?.files) ? out.files : [];
    const commitMessage = (out?.commitMessage ?? `Apply ticket ${ticketId} from Decidr Code`).trim();
    if (files.length === 0) {
      return {
        workspace: { rootDir: '', isProjectLinked: false, isGit: false },
        written: [], rejected: [{ path: '<all>', reason: 'Coder output had no files' }],
        dryRun: !!opts.dryRun,
      };
    }

    const workspace = await resolveWorkspace(ticketId);
    const dryRun = !!opts.dryRun;

    // Sandbox autoinit: turn /tmp/decidr-output/<ticketId>/ into a git repo on first apply
    if (!workspace.isProjectLinked && !workspace.isGit && !dryRun) {
      const init = gitRunner.init(workspace.rootDir);
      if (init.ok) workspace.isGit = true;
    }

    // Create / checkout DC-<id>/<slug> branch when applicable
    const branchName = `${ticket.id}/${ticketSlug(ticket.title)}`;
    if (workspace.isGit && !dryRun) {
      const checkout = gitRunner.checkoutBranch(workspace.rootDir, branchName, true);
      if (!checkout.ok) {
        return {
          workspace: { rootDir: workspace.rootDir, isProjectLinked: workspace.isProjectLinked, isGit: workspace.isGit },
          branch: branchName, written: [], rejected: [],
          dryRun, error: `Failed to checkout ${branchName}: ${checkout.stderr}`,
        };
      }
    }

    // Write the files
    const result = applyFiles({ rootDir: workspace.rootDir, files, dryRun });

    let commitHash: string | undefined;
    if (workspace.isGit && !dryRun && result.written.length > 0) {
      const paths = result.written.map((w) => w.path);
      const commit = gitRunner.addAndCommit(workspace.rootDir, paths, commitMessage);
      if (commit.ok && commit.hash) {
        commitHash = commit.hash;
        // Register the branch and commit in Decidr's tables (post-commit hooks fire only on
        // the project's *own* repo, but applies happen in our code path so we record manually).
        await gitService.linkBranch(ticketId, branchName).catch(() => {});
        await gitService.reportCommit({
          branch: branchName,
          hash: commitHash,
          message: commitMessage,
          author: 'Decidr Code',
          authorEmail: 'noreply@decidr.code',
          files: paths,
        }).catch(() => {});
      }
    }

    if (!dryRun && (result.written.length > 0 || result.rejected.length > 0)) {
      await changelogRepo.append(
        ticketId,
        `Apply: ${result.written.length} written, ${result.rejected.length} rejected${commitHash ? ` (commit ${commitHash.slice(0, 7)})` : ''}`,
        'Decidr Code',
      );
      activityService.log({
        ticketId, actorType: 'system', actionType: 'pipeline_completed',
        payload: { event: 'apply', written: result.written.length, rejected: result.rejected.length, commitHash, branch: branchName },
      }).catch(() => {});
    }

    return {
      workspace: { rootDir: workspace.rootDir, isProjectLinked: workspace.isProjectLinked, isGit: workspace.isGit },
      branch: workspace.isGit ? branchName : undefined,
      written: result.written,
      rejected: result.rejected,
      commitHash,
      commitMessage,
      dryRun,
    };
  },

  /**
   * Force-reset a ticket's pipeline state. Use when a pipeline crashed mid-run
   * and the ticket is stuck in 'running' / 'awaiting_approval' so the UI's
   * Run button is hidden. Also marks any orphaned agent_runs as 'cancelled'.
   */
  async reset(ticketId: string): Promise<{ cancelledRuns: number }> {
    const runs = await agentRunRepo.findByTicket(ticketId);
    const orphans = runs.filter((r) => r.status === 'running');
    for (const r of orphans) {
      await agentRunRepo.fail(r.id, 'Pipeline reset by user', r.retryCount ?? 0);
    }
    await ticketRepo.updatePipelineState(ticketId, 'idle', null);
    await ticketRepo.setPaused(ticketId, false);
    activityService.log({
      ticketId, actorType: 'user', actionType: 'pipeline_reset',
      payload: { cancelledRuns: orphans.length },
    }).catch(() => {});
    return { cancelledRuns: orphans.length };
  },
};
