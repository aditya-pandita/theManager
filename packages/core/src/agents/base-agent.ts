import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export function safeJsonParse(raw: string): any {
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new Error('Empty agent response');
  }

  // Strategy 1: direct parse
  try { return JSON.parse(raw); } catch {}

  // Strategy 2: strip markdown fences (```json ... ``` or ``` ... ```)
  const stripped = raw
    .replace(/^[\s﻿]*```(?:json|JSON)?\s*\n?/i, '')
    .replace(/\n?```[\s﻿]*$/i, '')
    .trim();
  try { return JSON.parse(stripped); } catch {}

  // Strategy 3: drop trailing commas before } or ]
  const noTrailingCommas = stripped.replace(/,(\s*[}\]])/g, '$1');
  try { return JSON.parse(noTrailingCommas); } catch {}

  // Strategy 4: extract the largest balanced { ... } object via brace counting
  const start = stripped.indexOf('{');
  if (start >= 0) {
    let depth = 0;
    let inStr = false;
    let escape = false;
    for (let i = start; i < stripped.length; i++) {
      const c = stripped[i];
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          const candidate = stripped.slice(start, i + 1);
          try { return JSON.parse(candidate); } catch {}
          try { return JSON.parse(candidate.replace(/,(\s*[}\]])/g, '$1')); } catch {}
          break;
        }
      }
    }
  }

  // All strategies failed — dump raw response to disk for debugging and throw
  try {
    const dumpPath = `/tmp/decidr-failed-response-${Date.now()}.txt`;
    fs.writeFileSync(dumpPath, raw);
    console.error(`[safeJsonParse] failed — raw response dumped to ${dumpPath}`);
  } catch {}
  console.error('[safeJsonParse] raw response (first 1500 chars):\n' + raw.slice(0, 1500));
  throw new Error(
    `Failed to parse agent JSON response (length ${raw.length}). First 300 chars: ${raw.slice(0, 300).replace(/\n/g, '\\n')}`
  );
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected systemPrompt: string;

  constructor(config: AgentConfig) {
    this.config = config;
    const promptPath = path.join(process.cwd(), 'agents', config.systemPromptPath);
    this.systemPrompt = fs.existsSync(promptPath)
      ? fs.readFileSync(promptPath, 'utf-8')
      : `You are the ${config.displayName} agent. ${config.name} role.`;
  }

  get name(): string { return this.config.name; }
  get displayName(): string { return this.config.displayName; }

  abstract buildPrompt(input: AgentInput): string;
  abstract parseResponse(raw: string, ticketId: string): AgentOutput;

  async run(input: AgentInput): Promise<AgentOutput> {
    // Re-read .env on each call — same pattern as process.ts
    dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: true });

    const apiKey = process.env.GEMINI_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_KEY not set');

    const isGemma = this.config.model.toLowerCase().startsWith('gemma');

    // Gemini 2.5 supports `thinkingConfig` to disable thinking tokens.
    // Gemma 4 has thinking tokens but rejects `thinkingConfig` (400 INVALID_ARGUMENT).
    // For Gemma we leave thinking on and just give it a larger maxOutputTokens budget.
    const generationConfig: any = {
      responseMimeType: 'application/json',
      maxOutputTokens: this.config.maxTokens,
    };
    if (!isGemma) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: this.config.model,
      systemInstruction: this.systemPrompt,
      generationConfig,
    });

    const startTime = Date.now();
    const userPrompt = this.buildPrompt(input);
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const usage = response.usageMetadata;

    // Both Gemini-2.5 (when thinking is allowed) and Gemma 4 return responses with
    // multiple parts where some have `thought: true`. The SDK's response.text()
    // may include those thinking parts. We extract only the non-thought parts so
    // the JSON parser sees just the model's actual answer.
    const candidate = response.candidates?.[0];
    const parts: Array<{ text?: string; thought?: boolean }> = (candidate?.content?.parts ?? []) as any;
    const answerParts = parts.filter((p) => p && typeof p.text === 'string' && !p.thought);
    const rawText = answerParts.length > 0
      ? answerParts.map((p) => p.text).join('')
      : response.text(); // fallback if no parts found

    const output = this.parseResponse(rawText, input.ticket.id);
    output.tokensInput  = usage?.promptTokenCount    ?? 0;
    output.tokensOutput = usage?.candidatesTokenCount ?? 0;
    output.durationMs   = Date.now() - startTime;
    return output;
  }
}
