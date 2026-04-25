import { BaseAgent } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class DocsAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Update README, JSDoc comments, and changelog based on the code changes made.',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description },
      codeFiles: contextStore['code_files'] ?? null,
      review: contextStore['review'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON: { "summary": string, "confidence": number, "reasoning": { "id":"r1","label":"...","type":"decision","children":[] }, "data": { "updatedFiles": [{ "path": string, "content": string }], "changelogEntry": string } }',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = JSON.parse(raw);
    return {
      agent: 'docs',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Documentation', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? {},
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
