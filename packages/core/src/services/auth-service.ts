import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepo } from '../repositories/user-repo';
import { workspaceRepo } from '../repositories/workspace-repo';
import { inviteRepo } from '../repositories/invite-repo';
import { generateId } from '../utils/id';
import type { User, Workspace, WorkspaceMember, AuthToken, Invite } from '../types/auth';

const AVATAR_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

function getJwtSecret(): string {
  dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: true });
  return process.env.JWT_SECRET ?? 'decidr-dev-secret-change-in-production';
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function generateToken(payload: AuthToken): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '30d' });
}

export const authService = {
  async registerWorkspace(
    companyName: string,
    yourName: string,
    email: string,
    password: string
  ): Promise<{ user: User; workspace: Workspace; token: string }> {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new Error('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    const avatarColor = randomColor();
    const user = await userRepo.create(email, yourName, passwordHash, avatarColor);

    const baseSlug = slugify(companyName);
    let slug = baseSlug;
    let attempt = 0;
    while (await workspaceRepo.findBySlug(slug)) {
      slug = `${baseSlug}-${++attempt}`;
    }

    const workspaceId = `WS-${generateId().slice(3)}`;
    const workspace = await workspaceRepo.create(workspaceId, companyName, slug, user.id);
    await workspaceRepo.addMember(workspaceId, user.id, 'owner');

    const token = generateToken({ userId: user.id, workspaceId, role: 'owner' });
    return { user, workspace, token };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; workspace: Workspace; member: WorkspaceMember; token: string }> {
    const userWithHash = await userRepo.findByEmail(email);
    if (!userWithHash) throw new Error('Invalid email or password');

    const valid = await bcrypt.compare(password, (userWithHash as any).passwordHash ?? '');
    if (!valid) throw new Error('Invalid email or password');

    // Find their workspace membership
    const memberships = await workspaceRepo.getMembers('');  // placeholder
    // Get first workspace they belong to
    const { db } = await import('../db/connection');
    const { workspaceMembers } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');
    const [membership] = await db.select().from(workspaceMembers).where(eq(workspaceMembers.userId, userWithHash.id)).limit(1);
    if (!membership) throw new Error('No workspace found for this account');

    const workspace = await workspaceRepo.findById(membership.workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const token = generateToken({ userId: userWithHash.id, workspaceId: workspace.id, role: membership.role as any });
    const { passwordHash: _, ...user } = userWithHash as any;
    return { user, workspace, member: membership as unknown as WorkspaceMember, token };
  },

  async inviteMember(
    workspaceId: string,
    email: string,
    role: string,
    invitedById: number
  ): Promise<{ invite: Invite; inviteUrl: string }> {
    const token = generateId() + generateId();
    const invite = await inviteRepo.create(workspaceId, email, role, invitedById, token);
    const baseUrl = process.env.APP_URL ?? 'http://localhost:5173';
    const inviteUrl = `${baseUrl}/invite/${token}`;
    return { invite, inviteUrl };
  },

  async acceptInvite(
    token: string,
    name: string,
    password: string
  ): Promise<{ user: User; workspace: Workspace; token: string }> {
    const invite = await inviteRepo.findByToken(token);
    if (!invite) throw new Error('Invalid invite link');
    if (invite.usedAt) throw new Error('This invite has already been used');
    if (new Date() > invite.expiresAt) throw new Error('Invite link has expired');

    const existing = await userRepo.findByEmail(invite.email);
    if (existing) throw new Error('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepo.create(invite.email, name, passwordHash, randomColor());
    await workspaceRepo.addMember(invite.workspaceId, user.id, invite.role);
    await inviteRepo.markUsed(invite.id);

    const workspace = await workspaceRepo.findById(invite.workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const jwtToken = generateToken({ userId: user.id, workspaceId: invite.workspaceId, role: invite.role as any });
    return { user, workspace, token: jwtToken };
  },

  verifyToken(token: string): AuthToken {
    return jwt.verify(token, getJwtSecret()) as AuthToken;
  },

  async getMe(userId: number, workspaceId: string): Promise<{ user: User; workspace: Workspace; member: WorkspaceMember } | null> {
    const user = await userRepo.findById(userId);
    if (!user) return null;
    const workspace = await workspaceRepo.findById(workspaceId);
    if (!workspace) return null;
    const member = await workspaceRepo.getMember(workspaceId, userId);
    if (!member) return null;
    return { user, workspace, member };
  },
};
