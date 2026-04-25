import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection';
import { pipelineCheckpoints } from '../db/schema';
import { now } from '../utils/timestamp';
import type { PipelineCheckpoint, AgentName } from '../types/agent';

export const checkpointRepo = {
  async create(ticketId: string, agent: AgentName, output: unknown): Promise<PipelineCheckpoint> {
    const [row] = await db
      .insert(pipelineCheckpoints)
      .values({ ticketId, agent, output, status: 'pending' })
      .returning();
    return row as unknown as PipelineCheckpoint;
  },

  async approve(id: number): Promise<PipelineCheckpoint> {
    const [row] = await db
      .update(pipelineCheckpoints)
      .set({ status: 'approved', resolvedAt: now() })
      .where(eq(pipelineCheckpoints.id, id))
      .returning();
    return row as unknown as PipelineCheckpoint;
  },

  async reject(id: number, feedback: string): Promise<PipelineCheckpoint> {
    const [row] = await db
      .update(pipelineCheckpoints)
      .set({ status: 'rejected', feedback, resolvedAt: now() })
      .where(eq(pipelineCheckpoints.id, id))
      .returning();
    return row as unknown as PipelineCheckpoint;
  },

  async findPendingByTicket(ticketId: string): Promise<PipelineCheckpoint[]> {
    const rows = await db
      .select()
      .from(pipelineCheckpoints)
      .where(and(eq(pipelineCheckpoints.ticketId, ticketId), eq(pipelineCheckpoints.status, 'pending')));
    return rows as unknown as PipelineCheckpoint[];
  },

  async findByTicket(ticketId: string): Promise<PipelineCheckpoint[]> {
    const rows = await db
      .select()
      .from(pipelineCheckpoints)
      .where(eq(pipelineCheckpoints.ticketId, ticketId));
    return rows as unknown as PipelineCheckpoint[];
  },
};
