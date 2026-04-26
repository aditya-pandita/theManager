import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class ReviewerAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    return JSON.stringify({
      task: 'Review the generated code for correctness, security, style, and design fit.',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description, userStory: ticket.userStory ?? null },
      codeFiles: contextStore['code_files'] ?? null,
      design: contextStore['design'] ?? null,
      testResults: contextStore['test_results'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON: { "summary": string, "confidence": number, "reasoning": { "id":"r1","label":"...","type":"decision","children":[] }, "data": { "overallScore": number (0-100), "fileReviews": [{ "path": string, "score": number, "issues": [{ "severity": "critical"|"major"|"minor"|"suggestion", "line": number, "issue": string, "fix": string }] }], "inlineComments": [{ "file": string, "line": number, "comment": string }] } }',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'reviewer',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Review', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? (parsed.overallScore != null ? { overallScore: parsed.overallScore, fileReviews: parsed.fileReviews, inlineComments: parsed.inlineComments } : {}),
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
