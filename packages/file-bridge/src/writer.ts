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
