import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { testFiles } from '../db/schema';
import type { TestFile } from '../types/testing';

export const testFileRepo = {
  async create(input: Omit<TestFile, 'id' | 'createdAt'>): Promise<TestFile> {
    const [row] = await db
      .insert(testFiles)
      .values(input)
      .returning();
    return row as unknown as TestFile;
  },

  async findByTicket(ticketId: string): Promise<TestFile[]> {
    const rows = await db
      .select()
      .from(testFiles)
      .where(eq(testFiles.ticketId, ticketId))
      .orderBy(desc(testFiles.createdAt));
    return rows as unknown as TestFile[];
  },
};
