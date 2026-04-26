import { Router } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ticketService, reasoningService, changelogRepo, GEMMA_MODEL, safeJsonParse } from '@decidr-code/core';
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
      model: GEMMA_MODEL,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 12288,
      },
    });

    const userPrompt = `Ticket: ${JSON.stringify(
      {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        tags: ticket.tags,
      },
      null,
      2
    )}`;

    // Gemma 4 frequently spends the entire token budget on "thinking" and emits no answer text.
    // Retry once if the first call comes back empty; ~1/3 of calls succeed cold so two tries gets us above 80%.
    async function callGemma(): Promise<{ text: string }> {
      const result = await model.generateContent(userPrompt);
      const candidate = result.response.candidates?.[0];
      const parts: Array<{ text?: string; thought?: boolean }> = (candidate?.content?.parts ?? []) as any;
      const answerParts = parts.filter((p) => p && typeof p.text === 'string' && !p.thought);
      const allParts   = parts.filter((p) => p && typeof p.text === 'string');
      let t = answerParts.length > 0
        ? answerParts.map((p) => p.text).join('')
        : allParts.map((p) => p.text).join('');
      if (!t) t = result.response.text();
      if (!t) {
        console.error('[process] Gemma returned no text. finishReason=', candidate?.finishReason);
      }
      return { text: t };
    }

    const start = Date.now();
    let { text } = await callGemma();
    let parsed: NewReasoning | null = null;

    function isUseful(p: NewReasoning | null): p is NewReasoning {
      if (!p || typeof p !== 'object') return false;
      const hasSummary = typeof p.summary === 'string' && p.summary.trim().length > 0;
      const hasTree = !!(p.tree && typeof p.tree === 'object');
      return hasSummary || hasTree;
    }

    try { parsed = safeJsonParse(text) as NewReasoning; } catch { parsed = null; }

    if (!isUseful(parsed)) {
      console.error('[process] first Gemma attempt was empty; retrying once.');
      ({ text } = await callGemma());
      try { parsed = safeJsonParse(text) as NewReasoning; } catch { parsed = null; }
    }

    if (!isUseful(parsed)) {
      console.error('[process] Gemma returned empty content twice. Raw head:', text.slice(0, 300));
      parsed = {
        summary: 'Gemma did not return structured reasoning this time. Click "Ask Gemma to Process" again — the model is flaky on cold calls.',
        confidence: 0.3,
        timeMs: 0,
        tree: { id: 'r1', label: 'No response from Gemma', type: 'decision', children: [] },
        logs: [],
      };
    }
    parsed.timeMs = Date.now() - start;

    const saved = await reasoningService.saveReasoning(ticketId, parsed);
    await changelogRepo.append(ticketId, 'Gemma generated reasoning', 'Gemma');

    sendJSON(res, { reasoning: saved });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
