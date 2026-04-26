import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class CoderAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Implement complete working code files at their real project paths (relative to project root, not inside decidr/).',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description, priority: ticket.priority, tags: ticket.tags, userStory: ticket.userStory ?? null },
      plan: contextStore['plan'] ?? null,
      design: contextStore['design'] ?? null,
      projectStructure: contextStore['projectStructure'] ?? null,
      testResults: contextStore['test_results'] ?? null,
      review: contextStore['review'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON with files array where each path is relative to project root (e.g. src/components/Login.tsx). Full complete content only. See system prompt for schema.',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'coder',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Implementation', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? (parsed.files ? { files: parsed.files, commitMessage: parsed.commitMessage } : {}),
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
