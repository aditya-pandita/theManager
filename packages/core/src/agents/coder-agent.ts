import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class CoderAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Implement the ticket. Generate code files as diffs. Follow the architecture design.',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description, priority: ticket.priority, tags: ticket.tags },
      plan: contextStore['plan'] ?? null,
      design: contextStore['design'] ?? null,
      testResults: contextStore['test_results'] ?? null,
      review: contextStore['review'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON: { "summary": string, "confidence": number, "reasoning": { "id":"r1","label":"...","type":"decision","children":[] }, "data": { "files": [{ "path": string, "content": string }], "commitMessage": string } }',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'coder',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Implementation', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? {},
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
