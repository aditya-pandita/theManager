import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection';
import { workspaces, workspaceMembers, users } from '../db/schema';
import type { Workspace, WorkspaceMember } from '../types/auth';

export const workspaceRepo = {
  async create(id: string, name: string, slug: string, ownerId: number): Promise<Workspace> {
    const [row] = await db
      .insert(workspaces)
      .values({ id, name, slug, ownerId })
      .returning();
    return row as unknown as Workspace;
  },

  async findById(id: string): Promise<Workspace | null> {
    const [row] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);
    return (row as unknown as Workspace) ?? null;
  },

  async findBySlug(slug: string): Promise<Workspace | null> {
    const [row] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);
    return (row as unknown as Workspace) ?? null;
  },

  async addMember(workspaceId: string, userId: number, role: string = 'member'): Promise<WorkspaceMember> {
    const [row] = await db
      .insert(workspaceMembers)
      .values({ workspaceId, userId, role })
      .returning();
    return row as unknown as WorkspaceMember;
  },

  async getMember(workspaceId: string, userId: number): Promise<WorkspaceMember | null> {
    const [row] = await db
      .select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
      .limit(1);
    return (row as unknown as WorkspaceMember) ?? null;
  },

  async getMembers(workspaceId: string): Promise<Array<WorkspaceMember & { user: { id: number; name: string; email: string; avatarColor: string } }>> {
    const rows = await db
      .select({
        id:          workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId:      workspaceMembers.userId,
        role:        workspaceMembers.role,
        joinedAt:    workspaceMembers.joinedAt,
        user: {
          id:          users.id,
          name:        users.name,
          email:       users.email,
          avatarColor: users.avatarColor,
        },
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));
    return rows as any;
  },

  async removeMember(workspaceId: string, userId: number): Promise<void> {
    await db
      .delete(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));
  },

  async updateMemberRole(workspaceId: string, userId: number, role: string): Promise<WorkspaceMember> {
    const [row] = await db
      .update(workspaceMembers)
      .set({ role })
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
      .returning();
    return row as unknown as WorkspaceMember;
  },
};
