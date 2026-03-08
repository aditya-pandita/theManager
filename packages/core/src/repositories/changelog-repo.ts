import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { changelog } from '../db/schema';
import type { ChangelogEntry } from '../types/ticket';

export const changelogRepo = {
  async append(ticketId: string, action: string, author: string): Promise<void> {
    await db.insert(changelog).values({ ticketId, action, author });
  },

  async findByTicket(ticketId: string): Promise<ChangelogEntry[]> {
    const result = await db
      .select()
      .from(changelog)
      .where(eq(changelog.ticketId, ticketId))
      .orderBy(changelog.createdAt);
    return result as unknown as ChangelogEntry[];
  },
};
