import { db } from '../db/connection';
import { sessions } from '../db/schema';

export const sessionRepo = {
  async create(metadata?: Record<string, unknown>): Promise<{ id: number }> {
    const [session] = await db
      .insert(sessions)
      .values({ metadata: metadata ?? null })
      .returning({ id: sessions.id });
    return session;
  },

  async findAll(): Promise<typeof sessions.$inferSelect[]> {
    return db.select().from(sessions).orderBy(sessions.startedAt);
  },
};
