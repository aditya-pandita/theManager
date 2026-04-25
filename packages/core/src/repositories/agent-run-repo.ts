import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { agentRuns } from '../db/schema';
import { now } from '../utils/timestamp';
import type { AgentRun, NewAgentRun } from '../types/agent';

export const agentRunRepo = {
  async create(input: NewAgentRun): Promise<AgentRun> {
    const [row] = await db
      .insert(agentRuns)
      .values(input)
      .returning();
    return row as unknown as AgentRun;
  },

  async complete(
    id: number,
    output: object,
    tokensInput: number,
    tokensOutput: number,
    durationMs: number
  ): Promise<AgentRun> {
    const [row] = await db
      .update(agentRuns)
      .set({ status: 'completed', output, tokensInput, tokensOutput, durationMs, completedAt: now() })
      .where(eq(agentRuns.id, id))
      .returning();
    return row as unknown as AgentRun;
  },

  async fail(id: number, errorMessage: string, retryCount: number): Promise<AgentRun> {
    const [row] = await db
      .update(agentRuns)
      .set({ status: 'failed', errorMessage, retryCount, completedAt: now() })
      .where(eq(agentRuns.id, id))
      .returning();
    return row as unknown as AgentRun;
  },

  async skip(id: number): Promise<AgentRun> {
    const [row] = await db
      .update(agentRuns)
      .set({ status: 'skipped', completedAt: now() })
      .where(eq(agentRuns.id, id))
      .returning();
    return row as unknown as AgentRun;
  },

  async findByTicket(ticketId: string): Promise<AgentRun[]> {
    const rows = await db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.ticketId, ticketId))
      .orderBy(desc(agentRuns.startedAt));
    return rows as unknown as AgentRun[];
  },

  async findById(id: number): Promise<AgentRun | null> {
    const [row] = await db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.id, id))
      .limit(1);
    return (row as unknown as AgentRun) ?? null;
  },

  async getMetrics(): Promise<Record<string, { runs: number; successes: number; failures: number; avgDurationMs: number }>> {
    const rows = await db.select().from(agentRuns);
    const map: Record<string, { runs: number; successes: number; failures: number; totalDuration: number }> = {};
    for (const row of rows) {
      if (!map[row.agent]) map[row.agent] = { runs: 0, successes: 0, failures: 0, totalDuration: 0 };
      map[row.agent].runs++;
      if (row.status === 'completed') map[row.agent].successes++;
      if (row.status === 'failed') map[row.agent].failures++;
      map[row.agent].totalDuration += row.durationMs ?? 0;
    }
    return Object.fromEntries(
      Object.entries(map).map(([agent, m]) => [
        agent,
        { runs: m.runs, successes: m.successes, failures: m.failures, avgDurationMs: m.runs ? Math.round(m.totalDuration / m.runs) : 0 },
      ])
    );
  },
};
