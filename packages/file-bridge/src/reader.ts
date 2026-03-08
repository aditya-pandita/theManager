import fs from 'fs';
import path from 'path';
import type { NewTicket } from '@decidr-code/core';

export function readInboxFile(filePath: string): NewTicket | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as Record<string, unknown>;

    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Missing required field: title');
    }

    return {
      title: data.title,
      description: typeof data.description === 'string' ? data.description : undefined,
      priority: (data.priority as NewTicket['priority']) ?? 'medium',
      status: (data.status as NewTicket['status']) ?? 'backlog',
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    };
  } catch (err) {
    console.error(`[file-bridge] Failed to read ${filePath}:`, (err as Error).message);
    return null;
  }
}

export function moveToErrors(filePath: string, errorsDir: string): void {
  const errFile = path.join(errorsDir, path.basename(filePath));
  fs.mkdirSync(errorsDir, { recursive: true });
  fs.renameSync(filePath, errFile);
}
