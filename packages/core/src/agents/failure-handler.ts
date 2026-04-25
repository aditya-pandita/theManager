import type { BaseAgent } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

function parseRetryDelayMs(msg: string): number | null {
  // Gemini 429 responses include both "Please retry in 26.2s" and "\"retryDelay\":\"26s\""
  const m1 = msg.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
  if (m1) return Math.ceil(parseFloat(m1[1]) * 1000);
  const m2 = msg.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i);
  if (m2) return Math.ceil(parseFloat(m2[1]) * 1000);
  return null;
}

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
          // If the API tells us how long to wait (e.g. 429 rate-limit), honor that.
          const apiDelay = parseRetryDelayMs(lastError.message);
          const linear  = config.retryBackoffMs * (attempt + 1);
          const wait    = apiDelay ? Math.max(apiDelay + 1000, linear) : linear;
          console.error(`[${agent.name}] waiting ${wait}ms before retry`);
          await new Promise((r) => setTimeout(r, wait));
        }
      }
    }
    throw lastError!;
  },
};
