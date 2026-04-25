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

function isAbortError(err: any): boolean {
  if (!err) return false;
  if (err.name === 'AbortError') return true;
  const msg = String(err.message ?? err).toLowerCase();
  return msg.includes('abort') || msg.includes('aborted');
}

export const failureHandler = {
  async run(agent: BaseAgent, input: AgentInput, config: AgentConfig, signal?: AbortSignal): Promise<AgentOutput> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await agent.run(input, signal);
      } catch (err) {
        lastError = err as Error;

        // User-initiated cancellation — don't retry, propagate up so the
        // orchestrator can mark the run as skipped/cancelled cleanly.
        if (isAbortError(err) || signal?.aborted) {
          throw err;
        }

        console.error(`[${agent.name}] attempt ${attempt + 1} failed:`, lastError.message);
        if (attempt < config.maxRetries) {
          // If the API tells us how long to wait (e.g. 429 rate-limit), honor that.
          const apiDelay = parseRetryDelayMs(lastError.message);
          const linear  = config.retryBackoffMs * (attempt + 1);
          const wait    = apiDelay ? Math.max(apiDelay + 1000, linear) : linear;
          console.error(`[${agent.name}] waiting ${wait}ms before retry`);
          await new Promise<void>((resolve, reject) => {
            const t = setTimeout(resolve, wait);
            // If aborted while waiting between retries, bail out immediately.
            signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
          });
        }
      }
    }
    throw lastError!;
  },
};
