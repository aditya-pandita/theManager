import { agentRegistry } from './registry';
import { contextStore } from './context-store';
import { failureHandler } from './failure-handler';
import { activityService } from '../activity/activity-service';
import { agentRunRepo } from '../repositories/agent-run-repo';
import { checkpointRepo } from '../repositories/checkpoint-repo';
import { ticketRepo } from '../repositories/ticket-repo';
import type { AgentName, PipelineConfig, TicketType } from '../types/agent';
import type { Ticket } from '../types/ticket';

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

    await ticketRepo.update(ticket.id, { status: ticket.status });
    // Mark pipeline running
    await (ticketRepo as any).updatePipelineState?.(ticket.id, 'running', null);
    this.emit(ticket.id, { type: 'pipeline:started', ticketId: ticket.id, chain });
    activityService.log({ ticketId: ticket.id, actorType: 'system', actionType: 'pipeline_started', payload: { chain } }).catch(() => {});

    for (const agentName of chain) {
      // Reload ticket to get latest pause/lock state
      const current = await ticketRepo.findById(ticket.id);
      if (!current) break;

      if ((current as any).isPaused) {
        this.emit(ticket.id, { type: 'pipeline:paused', ticketId: ticket.id, atAgent: agentName });
        activityService.log({ ticketId: ticket.id, actorType: 'system', actionType: 'pipeline_paused', payload: { atAgent: agentName } }).catch(() => {});
        return;
      }

      if ((current as any).isLocked) {
        this.emit(ticket.id, { type: 'pipeline:locked', ticketId: ticket.id });
        return;
      }

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
          this.emit(ticket.id, { type: 'pipeline:awaiting_approval', ticketId: ticket.id, agent: agentName });
          activityService.log({ ticketId: ticket.id, actorType: 'system', actionType: 'pipeline_paused', payload: { reason: 'checkpoint', agent: agentName } }).catch(() => {});
          return;
        }

      } catch (err) {
        const message = (err as Error).message;
        await agentRunRepo.fail(run.id, message, agentRegistry.getConfig(agentName).maxRetries);
        activityService.log({ ticketId: ticket.id, actorType: 'agent', actorName: agentName, actionType: 'agent_failed', payload: { error: message } }).catch(() => {});
        this.emit(ticket.id, { type: 'agent:failed', ticketId: ticket.id, agent: agentName, error: message });
        this.emit(ticket.id, { type: 'pipeline:blocked', ticketId: ticket.id, reason: message });
        return;
      }
    }

    activityService.log({ ticketId: ticket.id, actorType: 'system', actionType: 'pipeline_completed' }).catch(() => {});
    this.emit(ticket.id, { type: 'pipeline:completed', ticketId: ticket.id });
  },
};
