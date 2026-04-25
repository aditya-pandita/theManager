import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class ArchitectAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Propose the file structure, design patterns, and affected components for this ticket.',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description, priority: ticket.priority, tags: ticket.tags },
      plan: contextStore['plan'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON: { "summary": string, "confidence": number, "reasoning": { "id":"r1","label":"...","type":"decision","children":[] }, "data": { "designNote": string, "fileStructure": string[], "affectedComponents": string[], "patterns": string[] } }',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'architect',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Architecture', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? {},
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
