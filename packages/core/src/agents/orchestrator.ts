import fs from 'fs';
import path from 'path';
import { agentRegistry } from './registry';
import { contextStore } from './context-store';
import { failureHandler } from './failure-handler';
import { activityService } from '../activity/activity-service';
import { agentRunRepo } from '../repositories/agent-run-repo';
import { checkpointRepo } from '../repositories/checkpoint-repo';
import { ticketRepo } from '../repositories/ticket-repo';
import { projectRepo } from '../repositories/project-repo';
import { reasoningRepo } from '../repositories/reasoning-repo';
import type { AgentName, PipelineConfig, TicketType } from '../types/agent';
import type { Ticket } from '../types/ticket';
import type { TreeNode } from '../types/reasoning';

// Write agent-generated files directly to the project folder on disk.
// Code/test/scaffold files go at the project root (e.g. folderPath/src/components/Login.tsx).
// Planning artifacts (design notes, task lists) go into decidr/planning/.
function writeAgentOutputInline(folderPath: string, ticketId: string, agentName: string, data: Record<string, unknown>): void {
  const decidrDir = path.join(folderPath, 'decidr');

  if (agentName === 'planner') {
    // Write root config/scaffold files designed by planner (package.json, tsconfig, etc.)
    const struct = data.projectStructure as { directories?: string[]; rootFiles?: Array<{ path: string; content: string }> } | undefined;
    if (struct) {
      // Create directories
      for (const dir of (struct.directories ?? [])) {
        fs.mkdirSync(path.join(folderPath, dir), { recursive: true });
      }
      // Write root files (package.json, tsconfig.json, README.md, .gitignore, etc.)
      for (const f of (struct.rootFiles ?? [])) {
        if (!f?.path || f.content == null) continue;
        const dest = path.join(folderPath, f.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }
    // Also save task plan to decidr/planning/ for reference
    const planDir = path.join(decidrDir, 'planning');
    fs.mkdirSync(planDir, { recursive: true });
    fs.writeFileSync(path.join(planDir, `${ticketId}-tasks.json`), JSON.stringify(data.tasks ?? data, null, 2), 'utf-8');

  } else if (agentName === 'architect') {
    // Write scaffold/stub files at real project paths
    const scaffoldFiles = data.scaffoldFiles as Array<{ path: string; content: string }> | undefined;
    if (Array.isArray(scaffoldFiles)) {
      for (const f of scaffoldFiles) {
        if (!f?.path || f.content == null) continue;
        const dest = path.join(folderPath, f.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }
    // Save design note to decidr/planning/ for reference
    const planDir = path.join(decidrDir, 'planning');
    fs.mkdirSync(planDir, { recursive: true });
    const note = (data.designNote as string) ?? JSON.stringify(data, null, 2);
    fs.writeFileSync(path.join(planDir, `${ticketId}-design.md`), note, 'utf-8');

  } else if (agentName === 'coder') {
    // Write generated code files directly at project root paths
    const files = data.files as Array<{ path: string; content: string }> | undefined;
    if (Array.isArray(files)) {
      for (const f of files) {
        if (!f?.path || f.content == null) continue;
        // Strip any accidental decidr/ prefix agents might add
        const cleanPath = f.path.replace(/^decidr\/(?:code\/)?(?:[^/]+\/)?/, '');
        const dest = path.join(folderPath, cleanPath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }

  } else if (agentName === 'tester') {
    // Write test files at real project paths
    const files = data.testFiles as Array<{ path: string; content: string }> | undefined;
    if (Array.isArray(files)) {
      for (const f of files) {
        if (!f?.path || f.content == null) continue;
        const cleanPath = f.path.replace(/^decidr\/(?:tests\/)?(?:[^/]+\/)?/, '');
        const dest = path.join(folderPath, cleanPath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }

  } else if (agentName === 'docs') {
    const entry = data.changelogEntry as string | undefined;
    if (entry) {
      // Changelog goes into decidr/ since it's metadata, not source code
      const docsDir = path.join(decidrDir, 'docs');
      fs.mkdirSync(docsDir, { recursive: true });
      fs.writeFileSync(path.join(docsDir, `${ticketId}-changelog.md`), entry, 'utf-8');
    }
    // Also write any updated doc files (README etc.) at project root
    const updatedFiles = data.updatedFiles as Array<{ path: string; content: string }> | undefined;
    if (Array.isArray(updatedFiles)) {
      for (const f of updatedFiles) {
        if (!f?.path || f.content == null) continue;
        const dest = path.join(folderPath, f.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }

  } else if (agentName === 'reviewer') {
    const planDir = path.join(decidrDir, 'planning');
    fs.mkdirSync(planDir, { recursive: true });
    fs.writeFileSync(path.join(planDir, `${ticketId}-review.json`), JSON.stringify(data, null, 2), 'utf-8');
  }
}

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

      this.emit(ticket.id, { type: 'agent:started', ticketId: ticket.id, agent: agentName });
      activityService.log({ ticketId: ticket.id, actorType: 'agent', actorName: agentName, actionType: 'agent_started', payload: { runId: run.id } }).catch(() => {});

      try {
        const ctx = await contextStore.getAll(ticket.id);
        const agent = agentRegistry.get(agentName);
        const agentConfig = agentRegistry.getConfig(agentName);

        const output = await failureHandler.run(agent, { ticket: current, contextStore: ctx }, agentConfig);

        await agentRunRepo.complete(run.id, output.data as object, output.tokensInput, output.tokensOutput, output.durationMs);
        await contextStore.set(ticket.id, agentName === 'coder' ? 'code_files' : agentName, output.data, agentName);
        // Store projectStructure separately so all downstream agents can access it
        if (agentName === 'planner' && (output.data as any)?.projectStructure) {
          await contextStore.set(ticket.id, 'projectStructure', (output.data as any).projectStructure, 'planner');
        }

        // Write agent outputs to project folder on disk so devs can open in IDE
        try {
          const proj = ticket.projectId ? await projectRepo.findById(ticket.projectId) : null;
          if (proj?.folderPath) {
            writeAgentOutputInline(proj.folderPath, ticket.id, agentName, output.data as Record<string, unknown>);
          }
        } catch (e) {
          console.warn('[orchestrator] disk write skipped:', (e as Error).message);
        }

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
        const message = (err as Error).message;
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
