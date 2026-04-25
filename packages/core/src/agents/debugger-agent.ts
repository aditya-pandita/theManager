import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class DebuggerAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Analyze the failing tests and bug reports. Identify root cause and produce a fix.',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description },
      testResults: contextStore['test_results'] ?? null,
      codeFiles: contextStore['code_files'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON: { "summary": string, "confidence": number, "reasoning": { "id":"r1","label":"...","type":"root_cause","children":[] }, "data": { "rootCause": string, "fixFiles": [{ "path": string, "original": string, "fixed": string }], "commitMessage": string, "regressionRisk": "low"|"medium"|"high" } }',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'debugger',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Debug', type: 'root_cause' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? {},
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
