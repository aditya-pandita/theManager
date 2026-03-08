import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { gitCommits } from '../db/schema';

export interface GitCommit {
  id: number;
  ticketId: string;
  branchId: number | null;
  hash: string;
  abbrevHash: string;
  message: string;
  authorName: string;
  authorEmail: string | null;
  filesAdded: string[];
  filesModified: string[];
  filesDeleted: string[];
  insertions: number;
  deletions: number;
  committedAt: Date;
  createdAt: Date;
}

export interface NewGitCommit {
  ticketId: string;
  branchId?: number;
  hash: string;
  abbrevHash: string;
  message: string;
  authorName: string;
  authorEmail?: string;
  filesAdded?: string[];
  filesModified?: string[];
  filesDeleted?: string[];
  insertions?: number;
  deletions?: number;
  committedAt: Date;
}

export const gitCommitRepo = {
  async create(input: NewGitCommit): Promise<GitCommit> {
    const [row] = await db
      .insert(gitCommits)
      .values({
        ticketId: input.ticketId,
        branchId: input.branchId ?? null,
        hash: input.hash,
        abbrevHash: input.abbrevHash,
        message: input.message,
        authorName: input.authorName,
        authorEmail: input.authorEmail ?? null,
        filesAdded: input.filesAdded ?? [],
        filesModified: input.filesModified ?? [],
        filesDeleted: input.filesDeleted ?? [],
        insertions: input.insertions ?? 0,
        deletions: input.deletions ?? 0,
        committedAt: input.committedAt,
      })
      .returning();
    return row as unknown as GitCommit;
  },

  async findByTicket(ticketId: string): Promise<GitCommit[]> {
    const rows = await db
      .select()
      .from(gitCommits)
      .where(eq(gitCommits.ticketId, ticketId))
      .orderBy(desc(gitCommits.committedAt));
    return rows as unknown as GitCommit[];
  },

  async findByHash(hash: string): Promise<GitCommit | null> {
    const [row] = await db.select().from(gitCommits).where(eq(gitCommits.hash, hash));
    return (row as unknown as GitCommit) ?? null;
  },

  async exists(hash: string): Promise<boolean> {
    const [row] = await db.select().from(gitCommits).where(eq(gitCommits.hash, hash));
    return !!row;
  },
};
