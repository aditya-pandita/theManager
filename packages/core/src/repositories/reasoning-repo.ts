import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { reasoning } from '../db/schema';
import type { Reasoning, NewReasoning } from '../types/reasoning';
import { now } from '../utils/timestamp';

export const reasoningRepo = {
  async upsert(ticketId: string, input: NewReasoning): Promise<Reasoning> {
    const existing = await db
      .select()
      .from(reasoning)
      .where(eq(reasoning.ticketId, ticketId))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(reasoning)
        .set({ ...input, updatedAt: now() })
        .where(eq(reasoning.ticketId, ticketId))
        .returning();
      return updated as unknown as Reasoning;
    }

    const [inserted] = await db
      .insert(reasoning)
      .values({ ticketId, ...input })
      .returning();
    return inserted as unknown as Reasoning;
  },

  async findByTicket(ticketId: string): Promise<Reasoning | null> {
    const [result] = await db
      .select()
      .from(reasoning)
      .where(eq(reasoning.ticketId, ticketId))
      .limit(1);
    return (result as unknown as Reasoning) ?? null;
  },
};
