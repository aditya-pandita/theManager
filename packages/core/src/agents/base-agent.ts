import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

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

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: this.config.model,
      systemInstruction: this.systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: this.config.maxTokens,
      },
    });

    const startTime = Date.now();
    const userPrompt = this.buildPrompt(input);
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const rawText = response.text();
    const usage = response.usageMetadata;

    const output = this.parseResponse(rawText, input.ticket.id);
    output.tokensInput  = usage?.promptTokenCount    ?? 0;
    output.tokensOutput = usage?.candidatesTokenCount ?? 0;
    output.durationMs   = Date.now() - startTime;
    return output;
  }
}
