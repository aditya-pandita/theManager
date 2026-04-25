import { eq, desc, and, gte, lte, ilike } from 'drizzle-orm';
import { db } from '../db/connection';
import { activities } from '../db/schema';
import type { Activity, NewActivity, ActivityFilters } from '../types/activity';

export const activityRepo = {
  async create(input: NewActivity): Promise<Activity> {
    const [row] = await db
      .insert(activities)
      .values(input)
      .returning();
    return row as unknown as Activity;
  },

  async findByTicket(ticketId: string, filters?: ActivityFilters): Promise<Activity[]> {
    const conditions = [eq(activities.ticketId, ticketId)];
    if (filters?.actorType)  conditions.push(eq(activities.actorType, filters.actorType));
    if (filters?.actionType) conditions.push(eq(activities.actionType, filters.actionType));
    if (filters?.after)      conditions.push(gte(activities.createdAt, filters.after));
    if (filters?.before)     conditions.push(lte(activities.createdAt, filters.before));

    const rows = await db
      .select()
      .from(activities)
      .where(and(...conditions))
      .orderBy(desc(activities.createdAt));
    return rows as unknown as Activity[];
  },

  async findByProject(projectId: string, filters?: ActivityFilters): Promise<Activity[]> {
    const conditions = [eq(activities.projectId, projectId)];
    if (filters?.actorType)  conditions.push(eq(activities.actorType, filters.actorType));
    if (filters?.actionType) conditions.push(eq(activities.actionType, filters.actionType));
    if (filters?.after)      conditions.push(gte(activities.createdAt, filters.after));
    if (filters?.before)     conditions.push(lte(activities.createdAt, filters.before));

    const rows = await db
      .select()
      .from(activities)
      .where(and(...conditions))
      .orderBy(desc(activities.createdAt));
    return rows as unknown as Activity[];
  },

  async findById(id: number): Promise<Activity | null> {
    const [row] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .limit(1);
    return (row as unknown as Activity) ?? null;
  },
};
