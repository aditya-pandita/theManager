import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import Anthropic from '@anthropic-ai/sdk';
import { ticketService, reasoningService, changelogRepo } from '@decidr-code/core';
import type { NewReasoning } from '@decidr-code/core';

const schema = z.object({
  ticketId: z.string().describe('Ticket ID to process with Claude'),
});

const SYSTEM_PROMPT = `You are a senior engineer. Analyze the given ticket and return ONLY valid JSON:
{
  "summary": "one-sentence decision summary",
  "confidence": 0.0-1.0,
  "timeMs": number,
  "tree": { "id": "r1", "label": "...", "type": "problem", "children": [...] },
  "logs": [{ "step": 1, "phase": "Intake", "action": "...", "reasoning": "...", "durationMs": 100 }]
}
Node types: problem, investigation, discovery, root_cause, decision, chosen, rejected, ruled_out`;

export function registerProcessTicket(server: McpServer): void {
  server.tool('process-ticket', 'Analyze a ticket with Claude and generate a reasoning tree', schema.shape, async (args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { content: [{ type: 'text', text: 'Error: ANTHROPIC_API_KEY not configured.' }] };

    const ticket = await ticketService.getTicketDetail(args.ticketId);
    if (!ticket) return { content: [{ type: 'text', text: `Ticket ${args.ticketId} not found.` }] };

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify({ id: ticket.id, title: ticket.title, description: ticket.description, priority: ticket.priority }) }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const parsed = JSON.parse(text) as NewReasoning;
    const saved = await reasoningService.saveReasoning(args.ticketId, parsed);
    await changelogRepo.append(args.ticketId, 'Claude generated reasoning via MCP', 'Claude');

    return { content: [{ type: 'text', text: `Reasoning saved. Confidence: ${Math.round(saved.confidence * 100)}%\n${saved.summary}` }] };
  });
}

