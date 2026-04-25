import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { testResults } from '../db/schema';
import type { TestResult, NewTestResult } from '../types/testing';

export const testResultRepo = {
  async create(input: NewTestResult): Promise<TestResult> {
    const [row] = await db
      .insert(testResults)
      .values(input)
      .returning();
    return row as unknown as TestResult;
  },

  async findLatestByTicket(ticketId: string): Promise<TestResult | null> {
    const [row] = await db
      .select()
      .from(testResults)
      .where(eq(testResults.ticketId, ticketId))
      .orderBy(desc(testResults.createdAt))
      .limit(1);
    return (row as unknown as TestResult) ?? null;
  },

  async findAllByTicket(ticketId: string): Promise<TestResult[]> {
    const rows = await db
      .select()
      .from(testResults)
      .where(eq(testResults.ticketId, ticketId))
      .orderBy(desc(testResults.createdAt));
    return rows as unknown as TestResult[];
  },

  async findFlaky(): Promise<TestResult[]> {
    const rows = await db
      .select()
      .from(testResults)
      .where(eq(testResults.isFlaky, true))
      .orderBy(desc(testResults.flakyCount));
    return rows as unknown as TestResult[];
  },
};
