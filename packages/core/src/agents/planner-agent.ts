import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class PlannerAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Decompose this ticket into an ordered task list with acceptance criteria.',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description, priority: ticket.priority, tags: ticket.tags },
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON: { "summary": string, "confidence": number (0-1), "reasoning": { "id":"r1","label":"...","type":"problem","children":[] }, "data": { "tasks": [{ "title": string, "description": string, "acceptanceCriteria": string[], "dependencies": string[], "complexity": number }] } }',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'planner',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Plan', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? {},
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
