import fs from 'fs';
import path from 'path';
import { ticketService } from '@decidr-code/core';
import type { Reasoning } from '@decidr-code/core';

export async function writeBoardState(decidrDir: string): Promise<void> {
  const board = await ticketService.getBoard();
  const boardPath = path.join(decidrDir, 'board.json');
  fs.mkdirSync(decidrDir, { recursive: true });
  fs.writeFileSync(boardPath, JSON.stringify(board, null, 2), 'utf-8');
}

export function writeProcessingResult(
  decidrDir: string,
  ticketId: string,
  reasoning: Reasoning
): void {
  const outboxDir = path.join(decidrDir, 'outbox');
  fs.mkdirSync(outboxDir, { recursive: true });
  const outPath = path.join(outboxDir, `${ticketId}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ ticketId, reasoning }, null, 2), 'utf-8');
}

// writeAgentOutput — kept in sync with writeAgentOutputInline in orchestrator.ts
// Code/test files go at project root paths; planning artifacts go in decidr/planning/
export function writeAgentOutput(
  folderPath: string,
  ticketId: string,
  agentName: string,
  data: Record<string, unknown>
): void {
  const decidrDir = path.join(folderPath, 'decidr');

  if (agentName === 'planner') {
    const struct = data.projectStructure as { directories?: string[]; rootFiles?: Array<{ path: string; content: string }> } | undefined;
    if (struct) {
      for (const dir of (struct.directories ?? [])) {
        fs.mkdirSync(path.join(folderPath, dir), { recursive: true });
      }
      for (const f of (struct.rootFiles ?? [])) {
        if (!f?.path || f.content == null) continue;
        const dest = path.join(folderPath, f.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }
    const planDir = path.join(decidrDir, 'planning');
    fs.mkdirSync(planDir, { recursive: true });
    fs.writeFileSync(path.join(planDir, `${ticketId}-tasks.json`), JSON.stringify(data.tasks ?? data, null, 2), 'utf-8');

  } else if (agentName === 'architect') {
    const scaffoldFiles = data.scaffoldFiles as Array<{ path: string; content: string }> | undefined;
    if (Array.isArray(scaffoldFiles)) {
      for (const f of scaffoldFiles) {
        if (!f?.path || f.content == null) continue;
        const dest = path.join(folderPath, f.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }
    const planDir = path.join(decidrDir, 'planning');
    fs.mkdirSync(planDir, { recursive: true });
    const note = (data.designNote as string) ?? JSON.stringify(data, null, 2);
    fs.writeFileSync(path.join(planDir, `${ticketId}-design.md`), note, 'utf-8');

  } else if (agentName === 'coder') {
    const files = data.files as Array<{ path: string; content: string }> | undefined;
    if (Array.isArray(files)) {
      for (const f of files) {
        if (!f?.path || f.content == null) continue;
        const cleanPath = f.path.replace(/^decidr\/(?:code\/)?(?:[^/]+\/)?/, '');
        const dest = path.join(folderPath, cleanPath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }

  } else if (agentName === 'tester') {
    const files = data.testFiles as Array<{ path: string; content: string }> | undefined;
    if (Array.isArray(files)) {
      for (const f of files) {
        if (!f?.path || f.content == null) continue;
        const cleanPath = f.path.replace(/^decidr\/(?:tests\/)?(?:[^/]+\/)?/, '');
        const dest = path.join(folderPath, cleanPath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }

  } else if (agentName === 'docs') {
    const entry = data.changelogEntry as string | undefined;
    if (entry) {
      const docsDir = path.join(decidrDir, 'docs');
      fs.mkdirSync(docsDir, { recursive: true });
      fs.writeFileSync(path.join(docsDir, `${ticketId}-changelog.md`), entry, 'utf-8');
    }
    const updatedFiles = data.updatedFiles as Array<{ path: string; content: string }> | undefined;
    if (Array.isArray(updatedFiles)) {
      for (const f of updatedFiles) {
        if (!f?.path || f.content == null) continue;
        const dest = path.join(folderPath, f.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf-8');
      }
    }

  } else if (agentName === 'reviewer') {
    const planDir = path.join(decidrDir, 'planning');
    fs.mkdirSync(planDir, { recursive: true });
    fs.writeFileSync(path.join(planDir, `${ticketId}-review.json`), JSON.stringify(data, null, 2), 'utf-8');
  }
}
