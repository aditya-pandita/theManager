import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection';
import { gitBranches } from '../db/schema';

export interface GitBranch {
  id: number;
  ticketId: string;
  storyId: string | null;
  branchName: string;
  baseBranch: string;
  status: 'open' | 'merged' | 'stale' | 'deleted';
  aheadCount: number;
  behindCount: number;
  createdAt: Date;
  mergedAt: Date | null;
  mergedBy: string | null;
}

export interface NewGitBranch {
  ticketId: string;
  storyId?: string;
  branchName: string;
  baseBranch?: string;
  status?: GitBranch['status'];
}

export const gitBranchRepo = {
  async create(input: NewGitBranch): Promise<GitBranch> {
    const [row] = await db
      .insert(gitBranches)
      .values({
        ticketId: input.ticketId,
        storyId: input.storyId ?? null,
        branchName: input.branchName,
        baseBranch: input.baseBranch ?? 'main',
        status: input.status ?? 'open',
      })
      .returning();
    return row as unknown as GitBranch;
  },

  async findByTicket(ticketId: string): Promise<GitBranch[]> {
    const rows = await db.select().from(gitBranches).where(eq(gitBranches.ticketId, ticketId));
    return rows as unknown as GitBranch[];
  },

  async findByBranchName(branchName: string): Promise<GitBranch | null> {
    const [row] = await db.select().from(gitBranches).where(eq(gitBranches.branchName, branchName));
    return (row as unknown as GitBranch) ?? null;
  },

  async updateStatus(
    id: number,
    status: GitBranch['status'],
    mergedAt?: Date,
    mergedBy?: string
  ): Promise<GitBranch> {
    const [row] = await db
      .update(gitBranches)
      .set({ status, mergedAt: mergedAt ?? null, mergedBy: mergedBy ?? null })
      .where(eq(gitBranches.id, id))
      .returning();
    return row as unknown as GitBranch;
  },

  async updateCounts(id: number, aheadCount: number, behindCount: number): Promise<GitBranch> {
    const [row] = await db
      .update(gitBranches)
      .set({ aheadCount, behindCount })
      .where(eq(gitBranches.id, id))
      .returning();
    return row as unknown as GitBranch;
  },
};
