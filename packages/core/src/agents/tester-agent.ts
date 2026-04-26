import { BaseAgent, safeJsonParse } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export class TesterAgent extends BaseAgent {
  constructor(config: AgentConfig) { super(config); }

  buildPrompt(input: AgentInput): string {
    const { ticket, contextStore, userFeedback } = input;
    const story = (ticket as any).userStory;
    return JSON.stringify({
      task: 'Generate a comprehensive test suite for this ticket. Tests should initially fail (Red phase).',
      ticket: { id: ticket.id, title: ticket.title, description: ticket.description },
      acceptanceCriteria: story?.acceptanceCriteria ?? '',
      codeFiles: contextStore['code_files'] ?? null,
      userFeedback: userFeedback ?? null,
      instructions: 'Return JSON: { "summary": string, "confidence": number, "reasoning": { "id":"r1","label":"...","type":"decision","children":[] }, "data": { "testFiles": [{ "path": string, "content": string }], "results": { "total": number, "passed": number, "failed": number, "coverageDelta": number }, "bugsCreated": [{ "title": string, "severity": "critical"|"high"|"medium"|"low", "description": string }] } }',
    });
  }

  parseResponse(raw: string, ticketId: string): AgentOutput {
    const parsed = safeJsonParse(raw);
    return {
      agent: 'tester',
      ticketId,
      reasoning: parsed.reasoning ?? { id: 'r1', label: 'Testing', type: 'decision' },
      confidence: parsed.confidence ?? 0.8,
      data: parsed.data ?? (parsed.testFiles ? { testFiles: parsed.testFiles, results: parsed.results, bugsCreated: parsed.bugsCreated } : {}),
      tokensInput: 0,
      tokensOutput: 0,
      durationMs: 0,
    };
  }
}
