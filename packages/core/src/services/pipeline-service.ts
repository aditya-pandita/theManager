import { ticketRepo } from '../repositories/ticket-repo';
import { agentRunRepo } from '../repositories/agent-run-repo';
import { checkpointRepo } from '../repositories/checkpoint-repo';
import { activityService } from '../activity/activity-service';
import { orchestrator } from '../agents/orchestrator';
import { agentRegistry } from '../agents/registry';
import { contextStore } from '../agents/context-store';
import { failureHandler } from '../agents/failure-handler';
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
    await ticketRepo.update(ticketId, {} as any);
    // Update isPaused via raw update — ticketRepo.update only takes known fields
    // We update directly using the db import pattern
    const { db } = await import('../db/connection');
    const { tickets } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');
    await db.update(tickets).set({ isPaused: true } as any).where(eq(tickets.id, ticketId));
    activityService.log({ ticketId, actorType: 'user', actionType: 'pipeline_paused' }).catch(() => {});
  },

  async resume(ticketId: string): Promise<void> {
    const { db } = await import('../db/connection');
    const { tickets } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');
    await db.update(tickets).set({ isPaused: false } as any).where(eq(tickets.id, ticketId));

    const ticket = await ticketRepo.findById(ticketId);
    if (ticket) {
      const type = detectTicketType(ticket);
      orchestrator.runPipeline(ticket, type).catch((err) => console.error('[pipeline] resume error:', err.message));
    }
    activityService.log({ ticketId, actorType: 'user', actionType: 'pipeline_resumed' }).catch(() => {});
  },

  async skip(ticketId: string): Promise<void> {
    const runs = await agentRunRepo.findByTicket(ticketId);
    const running = runs.find((r) => r.status === 'running');
    if (running) await agentRunRepo.skip(running.id);
  },

  async approve(ticketId: string): Promise<void> {
    const checkpoints = await checkpointRepo.findPendingByTicket(ticketId);
    if (checkpoints.length === 0) throw new Error('No pending checkpoint');
    await checkpointRepo.approve(checkpoints[0].id);

    const { db } = await import('../db/connection');
    const { tickets } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');
    await db.update(tickets).set({ isPaused: false } as any).where(eq(tickets.id, ticketId));

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
    const { db } = await import('../db/connection');
    const { tickets } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');
    await db.update(tickets).set({ isLocked: locked } as any).where(eq(tickets.id, ticketId));
    activityService.log({ ticketId, actorType: 'user', actionType: 'ticket_locked', payload: { locked } }).catch(() => {});
  },
};
