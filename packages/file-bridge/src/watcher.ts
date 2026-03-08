import fs from 'fs';
import path from 'path';
import { ticketService } from '@decidr-code/core';
import { readInboxFile, moveToErrors } from './reader';
import { writeBoardState } from './writer';

const DEBOUNCE_MS = 300;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function watchInbox(decidrDir: string): void {
  const inboxDir = path.join(decidrDir, 'inbox');
  const errorsDir = path.join(decidrDir, 'errors');

  fs.mkdirSync(inboxDir, { recursive: true });
  fs.mkdirSync(errorsDir, { recursive: true });

  console.log(`[file-bridge] Watching ${inboxDir}`);

  fs.watch(inboxDir, (event, filename) => {
    if (!filename || !filename.endsWith('.json')) return;

    const filePath = path.join(inboxDir, filename);

    // Debounce: wait for file write to complete
    const existing = timers.get(filePath);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      timers.delete(filePath);

      if (!fs.existsSync(filePath)) return;

      const input = readInboxFile(filePath);
      if (!input) {
        moveToErrors(filePath, errorsDir);
        return;
      }

      try {
        const ticket = await ticketService.createTicket(input);
        fs.unlinkSync(filePath);
        await writeBoardState(decidrDir);
        console.log(`[file-bridge] Created ticket ${ticket.id} from ${filename}`);
      } catch (err) {
        console.error('[file-bridge] Failed to create ticket:', (err as Error).message);
        moveToErrors(filePath, errorsDir);
      }
    }, DEBOUNCE_MS);

    timers.set(filePath, timer);
  });
}
