import { agentRegistry } from './registry';
import { contextStore } from './context-store';
import { failureHandler } from './failure-handler';
import { activityService } from '../activity/activity-service';
import { agentRunRepo } from '../repositories/agent-run-repo';
import { checkpointRepo } from '../repositories/checkpoint-repo';
import { ticketRepo } from '../repositories/ticket-repo';
import { reasoningRepo } from '../repositories/reasoning-repo';
import type { AgentName, PipelineConfig, TicketType } from '../types/agent';
import type { Ticket } from '../types/ticket';
import type { TreeNode } from '../types/reasoning';

// Build a consolidated decision tree from completed agent runs.
// Each agent becomes a top-level branch under the ticket's problem node;
// the agent's output.data populates the leaf children.
async function buildConsolidatedReasoning(
  ticketId: string,
  ticketTitle: string,
): Promise<{ tree: TreeNode; summary: string; timeMs: number; logs: any[] }> {
  const runs = (await agentRunRepo.findByTicket(ticketId))
    .filter((r) => r.status === 'completed')
    .sort((a, b) => a.id - b.id);

  // Take the LATEST run per agent so re-runs don't double-count branches
  const latestPerAgent = new Map<string, typeof runs[0]>();
  for (const r of runs) latestPerAgent.set(r.agent, r);
  const ordered = Array.from(latestPerAgent.values()).sort((a, b) => a.id - b.id);

  const NODE_TYPE: Record<string, TreeNode['type']> = {
    planner: 'decision', architect: 'decision', coder: 'chosen',
    tester: 'investigation', reviewer: 'decision', debugger: 'root_cause', docs: 'chosen',
  };
  const LABEL: Record<string, string> = {
    planner:   'Planner — broke ticket into sub-tasks',
    architect: 'Architect — designed solution',
    coder:     'Coder — generated file contents',
    tester:    'Tester — wrote test suite',
    reviewer:  'Reviewer — code review verdict',
    debugger:  'Debugger — root-cause investigation',
    docs:      'Docs — updated documentation',
  };

  const root: TreeNode = {
    id: 'r0', type: 'problem', label: ticketTitle,
    detail: 'Multi-agent pipeline processed this ticket. Each branch below is one specialist agent.',
    children: [],
  };

  let idx = 0;
  for (const run of ordered) {
    idx++;
    const out = (run.output ?? {}) as any;
    const children: TreeNode[] = [];

    if (run.agent === 'planner' && Array.isArray(out.tasks)) {
      out.tasks.slice(0, 6).forEach((t: any, j: number) => children.push({
        id: `r${idx}_${j+1}`, type: 'investigation',
        label: t?.title ?? `Task ${j+1}`,
        detail: typeof t?.description === 'string' ? t.description.slice(0, 300) : undefined,
      }));
    } else if (run.agent === 'architect') {
      if (out.designNote) children.push({ id: `r${idx}_d`, type: 'discovery', label: 'Design note', detail: String(out.designNote).slice(0, 400) });
      (out.affectedComponents ?? []).slice(0, 5).forEach((c: any, j: number) => children.push({ id: `r${idx}_c${j+1}`, type: 'investigation', label: `Component: ${c}` }));
      (out.patterns ?? []).slice(0, 5).forEach((p: any, j: number) => children.push({ id: `r${idx}_p${j+1}`, type: 'discovery', label: `Pattern: ${p}` }));
    } else if (run.agent === 'coder') {
      if (out.commitMessage) children.push({ id: `r${idx}_cm`, type: 'chosen', label: 'Commit', detail: String(out.commitMessage) });
      (out.files ?? []).slice(0, 8).forEach((f: any, j: number) => children.push({ id: `r${idx}_f${j+1}`, type: 'investigation', label: `File: ${f?.path ?? f}` }));
    } else if (run.agent === 'tester') {
      (out.testFiles ?? []).slice(0, 5).forEach((f: any, j: number) => children.push({ id: `r${idx}_t${j+1}`, type: 'investigation', label: `Test: ${f?.path ?? f}` }));
      if (out.results) children.push({ id: `r${idx}_res`, type: 'discovery', label: `Results: ${out.results.passed ?? 0}/${out.results.total ?? 0} pass, coverage Δ${out.results.coverageDelta ?? 0}` });
    } else if (run.agent === 'reviewer') {
      if (out.overallScore != null) children.push({ id: `r${idx}_s`, type: 'discovery', label: `Overall score: ${out.overallScore}/100` });
      (out.fileReviews ?? []).slice(0, 5).forEach((fr: any, j: number) => children.push({ id: `r${idx}_fr${j+1}`, type: 'investigation', label: `${fr?.path ?? '?'} — ${fr?.score ?? '?'}/100` }));
    } else if (run.agent === 'debugger') {
      if (out.rootCause) children.push({ id: `r${idx}_rc`, type: 'root_cause', label: 'Root cause', detail: String(out.rootCause).slice(0, 400) });
      if (out.regressionRisk) children.push({ id: `r${idx}_rr`, type: 'discovery', label: `Regression risk: ${out.regressionRisk}` });
    } else if (run.agent === 'docs') {
      if (out.changelogEntry) children.push({ id: `r${idx}_cl`, type: 'chosen', label: 'Changelog', detail: String(out.changelogEntry).slice(0, 400) });
      (out.updatedFiles ?? []).slice(0, 5).forEach((f: any, j: number) => children.push({ id: `r${idx}_uf${j+1}`, type: 'investigation', label: `Doc: ${f?.path ?? f}` }));
    }

    root.children!.push({
      id: `r${idx}`,
      type: NODE_TYPE[run.agent] ?? 'decision',
      label: LABEL[run.agent] ?? run.agent,
      detail: `Agent run #${run.id} — ${run.durationMs ?? 0}ms, ${(run.tokensInput ?? 0) + (run.tokensOutput ?? 0)} tokens`,
      children,
    });
  }

  const totalMs = ordered.reduce((s, r) => s + (r.durationMs ?? 0), 0);
  const summary = `Pipeline processed by ${ordered.map((r) => r.agent.charAt(0).toUpperCase() + r.agent.slice(1)).join(' → ')} on Gemma 4`;
  const logs = ordered.map((r, i) => ({
    step: i + 1, phase: 'Implementation' as const,
    action: `${r.agent} agent`,
    reasoning: `completed in ${r.durationMs ?? 0}ms`,
    durationMs: r.durationMs ?? 0,
  }));
  return { tree: root, summary, timeMs: totalMs, logs };
}

type SSECallback = (event: object) => void;

const PIPELINE_ROUTES: Record<TicketType, AgentName[]> = {
  feature:  ['planner', 'architect', 'coder', 'tester', 'reviewer', 'docs'],
  bug:      ['debugger', 'tester', 'reviewer'],
  refactor: ['architect', 'coder', 'tester', 'reviewer'],
  docs:     ['docs', 'reviewer'],
  test:     ['tester'],
};

const DEFAULT_CONFIG: PipelineConfig = {
  checkpointsEnabled: {
    afterPlanner: false, afterArchitect: false, afterCoder: false,
    afterTester: false, afterReviewer: false, beforeMerge: false,
  },
  skippedAgents: [],
  maxConcurrentAgents: 1,
};

const sseListeners = new Map<string, SSECallback[]>();

// Tracks the AbortController for whichever agent is currently running on a ticket,
// so pause/skip can interrupt the in-flight Gemini/Gemma call instead of waiting
// for it to return naturally.
type ActiveAgent = { agent: AgentName; runId: number; controller: AbortController; reason?: 'pause' | 'skip' };
const activeAgents = new Map<string, ActiveAgent>();

export const orchestrator = {
  subscribe(ticketId: string, cb: SSECallback): void {
    const list = sseListeners.get(ticketId) ?? [];
    list.push(cb);
    sseListeners.set(ticketId, list);
  },

  unsubscribe(ticketId: string, cb: SSECallback): void {
    const list = sseListeners.get(ticketId) ?? [];
    sseListeners.set(ticketId, list.filter((l) => l !== cb));
  },

  emit(ticketId: string, event: object): void {
    (sseListeners.get(ticketId) ?? []).forEach((cb) => { try { cb(event); } catch {} });
  },

  /**
   * Abort whichever agent is currently running on this ticket. Used by
   * pipelineService.pause and pipelineService.skip so the in-flight Gemma call
   * is cancelled immediately, not after it returns naturally.
   * Returns the agent name that was aborted, or null if none was running.
   */
  abortActiveAgent(ticketId: string, reason: 'pause' | 'skip'): { agent: AgentName; runId: number } | null {
    const active = activeAgents.get(ticketId);
    if (!active) return null;
    active.reason = reason;
    try { active.controller.abort(); } catch {}
    return { agent: active.agent, runId: active.runId };
  },

  async runPipeline(ticket: Ticket, ticketType: TicketType, config: PipelineConfig = DEFAULT_CONFIG): Promise<void> {
    const chain = PIPELINE_ROUTES[ticketType].filter((a) => !config.skippedAgents.includes(a));

    // Mark pipeline running so the UI hides the Run button and the server-side guard
    // in pipelineService.run rejects accidental re-fires.
    await ticketRepo.updatePipelineState(ticket.id, 'running', null);
    this.emit(ticket.id, { type: 'pipeline:started', ticketId: ticket.id, chain });
    activityService.log({ ticketId: ticket.id, actorType: 'system', actionType: 'pipeline_started', payload: { chain } }).catch(() => {});

    for (const agentName of chain) {
      // Reload ticket to get latest pause/lock state
      const current = await ticketRepo.findById(ticket.id);
      if (!current) break;

      if ((current as any).isPaused) {
        await ticketRepo.updatePipelineState(ticket.id, 'paused', agentName);
        this.emit(ticket.id, { type: 'pipeline:paused', ticketId: ticket.id, atAgent: agentName });
        activityService.log({ ticketId: ticket.id, actorType: 'system', actionType: 'pipeline_paused', payload: { atAgent: agentName } }).catch(() => {});
        return;
      }

      if ((current as any).isLocked) {
        await ticketRepo.updatePipelineState(ticket.id, 'blocked', agentName);
        this.emit(ticket.id, { type: 'pipeline:locked', ticketId: ticket.id });
        return;
      }

      // Reflect "currently running this agent" on the ticket row
      await ticketRepo.updatePipelineState(ticket.id, 'running', agentName);

      // Create agent run record
      const run = await agentRunRepo.create({ ticketId: ticket.id, agent: agentName, status: 'running' });

      // Per-agent AbortController so pause/skip can interrupt the in-flight Gemma call
      const controller = new AbortController();
      activeAgents.set(ticket.id, { agent: agentName, runId: run.id, controller });

      this.emit(ticket.id, { type: 'agent:started', ticketId: ticket.id, agent: agentName });
      activityService.log({ ticketId: ticket.id, actorType: 'agent', actorName: agentName, actionType: 'agent_started', payload: { runId: run.id } }).catch(() => {});

      try {
        const ctx = await contextStore.getAll(ticket.id);
        const agent = agentRegistry.get(agentName);
        const agentConfig = agentRegistry.getConfig(agentName);

        const output = await failureHandler.run(agent, { ticket: current, contextStore: ctx }, agentConfig, controller.signal);

        // Successful completion — clear the active controller before recording.
        activeAgents.delete(ticket.id);

        await agentRunRepo.complete(run.id, output.data as object, output.tokensInput, output.tokensOutput, output.durationMs);
        await contextStore.set(ticket.id, agentName === 'coder' ? 'code_files' : agentName, output.data, agentName);

        activityService.log({
          ticketId: ticket.id, actorType: 'agent', actorName: agentName,
          actionType: 'agent_completed',
          payload: { runId: run.id, confidence: output.confidence, durationMs: output.durationMs },
          tokensUsed: output.tokensInput + output.tokensOutput,
        }).catch(() => {});

        this.emit(ticket.id, {
          type: 'agent:completed', ticketId: ticket.id, agent: agentName,
          confidence: output.confidence, durationMs: output.durationMs,
        });

        // Check human checkpoint
        const checkpointKey = `after${agentName.charAt(0).toUpperCase() + agentName.slice(1)}` as keyof PipelineConfig['checkpointsEnabled'];
        if (config.checkpointsEnabled[checkpointKey]) {
          await checkpointRepo.create(ticket.id, agentName, output.data);
          await ticketRepo.updatePipelineState(ticket.id, 'awaiting_approval', agentName);
          this.emit(ticket.id, { type: 'pipeline:awaiting_approval', ticketId: ticket.id, agent: agentName });
          activityService.log({ ticketId: ticket.id, actorType: 'system', actionType: 'pipeline_paused', payload: { reason: 'checkpoint', agent: agentName } }).catch(() => {});
          return;
        }

      } catch (err) {
        // Was this an abort triggered by pause/skip from outside?
        const cancellationReason = activeAgents.get(ticket.id)?.reason;
        activeAgents.delete(ticket.id);

        const message = (err as Error).message ?? String(err);
        const aborted = controller.signal.aborted ||
                        (err as Error).name === 'AbortError' ||
                        message.toLowerCase().includes('abort');

        if (aborted && cancellationReason === 'skip') {
          // Skip: mark this run as skipped and continue to the next agent.
          await agentRunRepo.skip(run.id);
          activityService.log({ ticketId: ticket.id, actorType: 'user', actionType: 'agent_skipped', payload: { agent: agentName, runId: run.id } }).catch(() => {});
          this.emit(ticket.id, { type: 'agent:skipped', ticketId: ticket.id, agent: agentName });
          continue;
        }

        if (aborted && cancellationReason === 'pause') {
          // Pause: mark this run as failed (cancelled) and exit. The user will resume later.
          await agentRunRepo.fail(run.id, 'Cancelled by user (pause)', 0);
          await ticketRepo.updatePipelineState(ticket.id, 'paused', agentName);
          activityService.log({ ticketId: ticket.id, actorType: 'user', actionType: 'pipeline_paused', payload: { atAgent: agentName, runId: run.id } }).catch(() => {});
          this.emit(ticket.id, { type: 'pipeline:paused', ticketId: ticket.id, atAgent: agentName });
          return;
        }

        // Real failure (model error, parse error, etc.) — block and bail.
        await agentRunRepo.fail(run.id, message, agentRegistry.getConfig(agentName).maxRetries);
        await ticketRepo.updatePipelineState(ticket.id, 'blocked', agentName);
        activityService.log({ ticketId: ticket.id, actorType: 'agent', actorName: agentName, actionType: 'agent_failed', payload: { error: message } }).catch(() => {});
        this.emit(ticket.id, { type: 'agent:failed', ticketId: ticket.id, agent: agentName, error: message });
        this.emit(ticket.id, { type: 'pipeline:blocked', ticketId: ticket.id, reason: message });
        return;
      }
    }

    // Persist a consolidated reasoning tree to tickets.reasoning so the UI's
    // Reasoning tab has something to render. Best-effort — log and swallow on failure.
    try {
      const r = await buildConsolidatedReasoning(ticket.id, ticket.title);
      await reasoningRepo.upsert(ticket.id, {
        summary: r.summary,
        confidence: 0.85,
        timeMs: r.timeMs,
        tree: r.tree,
        logs: r.logs as any,
      });
    } catch (e) {
      console.error('[orchestrator] consolidated reasoning save failed:', (e as Error).message);
    }

    // Pipeline finished cleanly — clear the running marker so the UI re-enables Run.
    await ticketRepo.updatePipelineState(ticket.id, 'completed', null);
    activityService.log({ ticketId: ticket.id, actorType: 'system', actionType: 'pipeline_completed' }).catch(() => {});
    this.emit(ticket.id, { type: 'pipeline:completed', ticketId: ticket.id });
  },
};
