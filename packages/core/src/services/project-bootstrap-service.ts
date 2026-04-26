import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ticketService } from './ticket-service';
import { safeJsonParse } from '../agents/base-agent';
import { GEMMA_MODEL } from '../agents/registry';
import type { Priority } from '../types/ticket';

export const projectBootstrapService = {
  initFolder(folderPath: string, projectId: string, projectName: string): void {
    // Create the project root folder and the decidr/ metadata dir.
    // Subdirectories (src/, components/, etc.) are created by the Planner agent
    // based on the actual project type — not hardcoded here.
    const decidrDir = path.join(folderPath, 'decidr');
    fs.mkdirSync(path.join(decidrDir, 'planning'), { recursive: true });
    fs.mkdirSync(path.join(decidrDir, 'docs'), { recursive: true });
    fs.writeFileSync(
      path.join(decidrDir, 'project.json'),
      JSON.stringify({ projectId, projectName, createdAt: new Date().toISOString() }, null, 2),
      'utf-8'
    );
  },

  async parseDocument(text: string): Promise<{
    tickets: Array<{ title: string; description: string; priority: Priority; tags: string[] }>;
  }> {
    dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: true });
    const apiKey = process.env.GEMINI_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_KEY not set');

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: GEMMA_MODEL,
      systemInstruction: `You are a software project analyst. Extract all features, requirements, and tasks from the provided document and convert them into a list of development tickets.

Each ticket should be:
- Focused on ONE feature or requirement
- Have a clear, actionable title
- Have a description that explains what needs to be built
- Tagged appropriately (use: feature, bug, refactor, docs, test, infra, perf, style)
- Prioritized: critical (must-have for launch), high (important), medium (standard), low (nice-to-have)

Return ONLY valid JSON:
{
  "tickets": [
    {
      "title": "short actionable title",
      "description": "what needs to be implemented and why",
      "priority": "critical" | "high" | "medium" | "low",
      "tags": ["feature"]
    }
  ]
}`,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 12288,
      },
    });

    const result = await model.generateContent(
      `Extract development tickets from this document:\n\n${text.slice(0, 8000)}`
    );

    const candidate = result.response.candidates?.[0];
    const parts: Array<{ text?: string; thought?: boolean }> = (candidate?.content?.parts ?? []) as any;
    const answerParts = parts.filter((p) => p && typeof p.text === 'string' && !p.thought);
    const rawText = answerParts.length > 0
      ? answerParts.map((p) => p.text).join('')
      : result.response.text();

    const parsed = safeJsonParse(rawText);
    return { tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [] };
  },

  async bootstrapFromDocument(
    projectId: string,
    documentText: string
  ): Promise<string[]> {
    const { tickets } = await this.parseDocument(documentText);
    const createdIds: string[] = [];

    for (const t of tickets) {
      const ticket = await ticketService.createTicket({
        title: t.title,
        description: t.description,
        priority: t.priority ?? 'medium',
        tags: t.tags ?? ['feature'],
        projectId,
      });
      createdIds.push(ticket.id);
    }

    return createdIds;
  },
};
