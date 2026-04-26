import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class ArchitectAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Design the technical solution and generate scaffold files at their real project paths.',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description, priority: ticket.priority, tags: ticket.tags },
      plan: contextStore['plan'] ?? null,
      projectStructure: contextStore['projectStructure'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON with scaffoldFiles (path relative to project root, real content). See system prompt for exact schema.',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'architect',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Architecture', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? (parsed.scaffoldFiles || parsed.designNote ? { scaffoldFiles: parsed.scaffoldFiles, designNote: parsed.designNote, affectedComponents: parsed.affectedComponents, patterns: parsed.patterns } : {}),
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
