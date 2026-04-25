import { agentContextRepo } from '../repositories/agent-context-repo';
import type { AgentName } from '../types/agent';

export const contextStore = {
  async get(ticketId: string, key: string): Promise<unknown> {
    const entry = await agentContextRepo.get(ticketId, key);
    return entry?.value ?? null;
  },

  async set(ticketId: string, key: string, value: unknown, agent: AgentName): Promise<void> {
    await agentContextRepo.set(ticketId, key, value, agent);
  },

  async getAll(ticketId: string): Promise<Record<string, unknown>> {
    return agentContextRepo.getAll(ticketId);
  },

  async clear(ticketId: string): Promise<void> {
    await agentContextRepo.deleteAll(ticketId);
  },
};
