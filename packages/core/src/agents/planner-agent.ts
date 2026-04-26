import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class PlannerAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Decompose this ticket into tasks AND design the project file structure if this is a new project.',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description, priority: ticket.priority, tags: ticket.tags, userStory: ticket.userStory ?? null },
      existingProjectStructure: contextStore['projectStructure'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON with projectStructure (directories + rootFiles with REAL content) and tasks array. See system prompt for exact schema.',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'planner',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Plan', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? (parsed.tasks ? { tasks: parsed.tasks, projectStructure: parsed.projectStructure } : {}),
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
