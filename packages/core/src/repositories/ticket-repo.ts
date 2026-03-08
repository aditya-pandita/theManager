import { eq, ilike, and, count, avg, sum } from 'drizzle-orm';
import { db } from '../db/connection';
import { tickets, diffs, reasoning } from '../db/schema';
import type { Ticket, NewTicket, Status, Priority, StatsResult } from '../types/ticket';
import { generateId } from '../utils/id';
import { now } from '../utils/timestamp';

type TicketFilters = {
  status?: Status;
  priority?: Priority;
  search?: string;
  projectId?: string | null;
};

export const ticketRepo = {
  async create(input: NewTicket): Promise<Ticket> {
    const id = generateId();
    const [ticket] = await db
      .insert(tickets)
      .values({
        id,
        projectId: input.projectId ?? null,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? 'backlog',
        priority: input.priority ?? 'medium',
        tags: input.tags ?? [],
      })
      .returning();

    if (input.diff) {
      await db.insert(diffs).values({
        ticketId: id,
        filePath: input.diff.filePath,
        beforeCode: input.diff.beforeCode,
        afterCode: input.diff.afterCode,
      });
    }

    return ticket as unknown as Ticket;
  },

  async update(id: string, changes: Partial<Pick<Ticket, 'title' | 'description' | 'status' | 'priority' | 'tags'>>): Promise<Ticket> {
    const [updated] = await db
      .update(tickets)
      .set({ ...changes, updatedAt: now() })
      .where(eq(tickets.id, id))
      .returning();
    return updated as unknown as Ticket;
  },

  async delete(id: string): Promise<void> {
    await db.delete(tickets).where(eq(tickets.id, id));
  },

  async findById(id: string): Promise<Ticket | null> {
    const result = await db.query.tickets.findFirst({
      where: eq(tickets.id, id),
      with: { project: true, diff: true, reasoning: true, userStory: true, comments: true, changelog: true },
    });
    return (result as unknown as Ticket) ?? null;
  },

  async findAll(filters?: TicketFilters): Promise<Ticket[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(tickets.status, filters.status));
    if (filters?.priority) conditions.push(eq(tickets.priority, filters.priority));
    if (filters?.search) conditions.push(ilike(tickets.title, `%${filters.search}%`));
    if (filters?.projectId !== undefined) {
      conditions.push(
        filters.projectId === null
          ? eq(tickets.projectId, null as unknown as string)
          : eq(tickets.projectId, filters.projectId)
      );
    }

    const result = await db.query.tickets.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: { project: true, diff: true, reasoning: true, userStory: true, comments: true, changelog: true },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    return result as unknown as Ticket[];
  },

  async getStats(): Promise<StatsResult> {
    const all = await db.select().from(tickets);
    const [reasoningCount] = await db.select({ count: count() }).from(reasoning);
    const [conf] = await db
      .select({ avg: avg(reasoning.confidence), sum: sum(reasoning.timeMs) })
      .from(reasoning);

    const byStatus = all.reduce((acc, t) => {
      acc[t.status as Status] = (acc[t.status as Status] ?? 0) + 1;
      return acc;
    }, {} as Partial<Record<Status, number>>);

    const byPriority = all.reduce((acc, t) => {
      acc[t.priority as Priority] = (acc[t.priority as Priority] ?? 0) + 1;
      return acc;
    }, {} as Partial<Record<Priority, number>>);

    return {
      total: all.length,
      byStatus,
      byPriority,
      withReasoning: Number(reasoningCount?.count ?? 0),
      avgConfidence: Number(conf?.avg ?? 0),
      totalReasoningTime: Number(conf?.sum ?? 0),
    };
  },
};
