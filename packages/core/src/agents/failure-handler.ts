import type { BaseAgent } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export const failureHandler = {
  async run(agent: BaseAgent, input: AgentInput, config: AgentConfig): Promise<AgentOutput> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await agent.run(input);
      } catch (err) {
        lastError = err as Error;
        console.error(`[${agent.name}] attempt ${attempt + 1} failed:`, lastError.message);
        if (attempt < config.maxRetries) {
          await new Promise((r) => setTimeout(r, config.retryBackoffMs * (attempt + 1)));
        }
      }
    }
    throw lastError!;
  },
};
