import { Router } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ticketService, reasoningService, changelogRepo } from '@decidr-code/core';
import type { NewReasoning } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const ENV_PATH = path.resolve(__dirname, '../../../../.env');

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
Phase values (for logs): Intake, Scan, Research, Analysis, Architecture, Alternatives, Implementation, Edge cases, Validation
Return ONLY valid JSON, no markdown.`;

router.post('/', async (req, res) => {
  const { ticketId } = req.body as { ticketId: string };
  if (!ticketId) return sendError(res, 'ticketId is required', 400);

  // Re-read .env on every request so key rotations during dev pick up without a server restart
  dotenv.config({ path: ENV_PATH, override: true });
  const apiKey = process.env.GEMINI_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) return sendError(res, 'GEMINI_KEY not set', 503);

  try {
    const ticket = await ticketService.getTicketDetail(ticketId);
    if (!ticket) return sendError(res, 'Ticket not found', 404);

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
      },
    });

    const start = Date.now();
    const result = await model.generateContent(
      `Ticket: ${JSON.stringify(
        {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          tags: ticket.tags,
        },
        null,
        2
      )}`
    );
    const text = result.response.text();
    const parsed = JSON.parse(text) as NewReasoning;
    parsed.timeMs = parsed.timeMs || Date.now() - start;

    const saved = await reasoningService.saveReasoning(ticketId, parsed);
    await changelogRepo.append(ticketId, 'Gemini generated reasoning', 'Gemini');

    sendJSON(res, { reasoning: saved });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
