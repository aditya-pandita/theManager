import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { hookEvents, tickets } from '../db/schema';
import type { HookEvent } from '../types/hook';

export const hookRepo = {
  async append(event: string, payload: Record<string, unknown> | null): Promise<void> {
    await db.insert(hookEvents).values({ event, payload });
  },

  async getRecent(limit = 100, projectId?: string | null): Promise<HookEvent[]> {
    if (projectId) {
      // Hook payloads carry the affected ticket id under `id`. Join through tickets to scope by project.
      const rows = await db
        .select({
          id: hookEvents.id,
          event: hookEvents.event,
          payload: hookEvents.payload,
          createdAt: hookEvents.createdAt,
        })
        .from(hookEvents)
        .innerJoin(tickets, sql`${tickets.id} = ${hookEvents.payload}->>'id'`)
        .where(eq(tickets.projectId, projectId))
        .orderBy(desc(hookEvents.createdAt))
        .limit(limit);
      return rows as unknown as HookEvent[];
    }

    const result = await db
      .select()
      .from(hookEvents)
      .orderBy(desc(hookEvents.createdAt))
      .limit(limit);
    return result as unknown as HookEvent[];
  },
};
