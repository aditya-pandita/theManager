import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection';
import { agentContext } from '../db/schema';
import { now } from '../utils/timestamp';
import type { AgentContextEntry, AgentName } from '../types/agent';

export const agentContextRepo = {
  async set(ticketId: string, key: string, value: unknown, agent: AgentName): Promise<AgentContextEntry> {
    const existing = await db
      .select()
      .from(agentContext)
      .where(and(eq(agentContext.ticketId, ticketId), eq(agentContext.key, key)))
      .limit(1);

    if (existing.length > 0) {
      const [row] = await db
        .update(agentContext)
        .set({ value, agent, version: existing[0].version + 1, updatedAt: now() })
        .where(and(eq(agentContext.ticketId, ticketId), eq(agentContext.key, key)))
        .returning();
      return row as unknown as AgentContextEntry;
    }

    const [row] = await db
      .insert(agentContext)
      .values({ ticketId, key, value, agent })
      .returning();
    return row as unknown as AgentContextEntry;
  },

  async get(ticketId: string, key: string): Promise<AgentContextEntry | null> {
    const [row] = await db
      .select()
      .from(agentContext)
      .where(and(eq(agentContext.ticketId, ticketId), eq(agentContext.key, key)))
      .limit(1);
    return (row as unknown as AgentContextEntry) ?? null;
  },

  async getAll(ticketId: string): Promise<Record<string, unknown>> {
    const rows = await db
      .select()
      .from(agentContext)
      .where(eq(agentContext.ticketId, ticketId));
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },

  async deleteAll(ticketId: string): Promise<void> {
    await db.delete(agentContext).where(eq(agentContext.ticketId, ticketId));
  },
};
