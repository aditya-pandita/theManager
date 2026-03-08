import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { userStories } from '../db/schema';
import type { UserStory } from '../types/ticket';
import { now } from '../utils/timestamp';

export interface UpsertUserStory {
  role?: string;
  want?: string;
  benefit?: string;
  acceptanceCriteria?: string;
  files?: string[];
}

export const userStoryRepo = {
  async upsert(ticketId: string, input: UpsertUserStory): Promise<UserStory> {
    const existing = await db.select().from(userStories).where(eq(userStories.ticketId, ticketId));
    if (existing.length > 0) {
      const [updated] = await db
        .update(userStories)
        .set({ ...input, updatedAt: now() })
        .where(eq(userStories.ticketId, ticketId))
        .returning();
      return updated as unknown as UserStory;
    }
    const [created] = await db
      .insert(userStories)
      .values({
        ticketId,
        role: input.role ?? '',
        want: input.want ?? '',
        benefit: input.benefit ?? '',
        acceptanceCriteria: input.acceptanceCriteria ?? '',
        files: input.files ?? [],
      })
      .returning();
    return created as unknown as UserStory;
  },

  async findByTicket(ticketId: string): Promise<UserStory | null> {
    const result = await db.select().from(userStories).where(eq(userStories.ticketId, ticketId));
    return (result[0] as unknown as UserStory) ?? null;
  },
};
