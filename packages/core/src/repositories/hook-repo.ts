import { desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { hookEvents } from '../db/schema';
import type { HookEvent } from '../types/hook';

export const hookRepo = {
  async append(event: string, payload: Record<string, unknown> | null): Promise<void> {
    await db.insert(hookEvents).values({ event, payload });
  },

  async getRecent(limit = 100): Promise<HookEvent[]> {
    const result = await db
      .select()
      .from(hookEvents)
      .orderBy(desc(hookEvents.createdAt))
      .limit(limit);
    return result as unknown as HookEvent[];
  },
};
