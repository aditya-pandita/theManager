import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { ticketService, reasoningService, changelogRepo } from '@decidr-code/core';
import type { NewReasoning } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();
const SYSTEM_PROMPT = `You are a senior engineer analyzing a code ticket. Your job is to:
1. Understand the problem or task
2. Investigate possible causes or approaches
3. Make a clear decision with reasoning
4. Return a structured JSON object matching this schema:
{
  "summary": "one-sentence summary of the decision",
  "confidence": 0.0-1.0,
  "timeMs": estimated_ms_int,
  "tree": { "id": "r1", "label": "...", "type": "problem", "children": [...] },
  "logs": [{ "step": 1, "phase": "Intake", "action": "...", "reasoning": "...", "durationMs": 100 }]
}
Node types: problem, investigation, discovery, root_cause, decision, chosen, rejected, ruled_out
Return ONLY valid JSON, no markdown.`;

router.post('/', async (req, res) => {
  const { ticketId } = req.body as { ticketId: string };
  if (!ticketId) return sendError(res, 'ticketId is required', 400);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return sendError(res, 'ANTHROPIC_API_KEY not set', 503);

  try {
    const ticket = await ticketService.getTicketDetail(ticketId);
    if (!ticket) return sendError(res, 'Ticket not found', 404);

    const client = new Anthropic({ apiKey });
    const start = Date.now();

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Ticket: ${JSON.stringify({ id: ticket.id, title: ticket.title, description: ticket.description, priority: ticket.priority, tags: ticket.tags }, null, 2)}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(text) as NewReasoning;
    parsed.timeMs = parsed.timeMs || Date.now() - start;

    const saved = await reasoningService.saveReasoning(ticketId, parsed);
    await changelogRepo.append(ticketId, 'Claude generated reasoning', 'Claude');

    sendJSON(res, { reasoning: saved });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
