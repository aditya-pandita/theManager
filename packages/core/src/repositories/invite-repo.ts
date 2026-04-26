import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { invites } from '../db/schema';
import { now } from '../utils/timestamp';
import type { Invite } from '../types/auth';

export const inviteRepo = {
  async create(workspaceId: string, email: string, role: string, invitedBy: number, token: string): Promise<Invite> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const [row] = await db
      .insert(invites)
      .values({ workspaceId, email, role, invitedBy, token, expiresAt })
      .returning();
    return row as unknown as Invite;
  },

  async findByToken(token: string): Promise<Invite | null> {
    const [row] = await db
      .select()
      .from(invites)
      .where(eq(invites.token, token))
      .limit(1);
    return (row as unknown as Invite) ?? null;
  },

  async markUsed(id: number): Promise<void> {
    await db
      .update(invites)
      .set({ usedAt: now() })
      .where(eq(invites.id, id));
  },

  async findByWorkspace(workspaceId: string): Promise<Invite[]> {
    const rows = await db
      .select()
      .from(invites)
      .where(eq(invites.workspaceId, workspaceId));
    return rows as unknown as Invite[];
  },
};
