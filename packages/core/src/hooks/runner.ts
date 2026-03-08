import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { hookRepo } from '../repositories/hook-repo';

export async function fireHook(
  event: string,
  payload: Record<string, unknown>,
  hooksDir: string = './hooks'
): Promise<void> {
  // Log to DB (non-blocking)
  hookRepo.append(event, payload).catch((err) =>
    console.error(`[hooks] DB log failed for ${event}:`, err)
  );

  // Execute bash script if it exists
  const scriptPath = path.resolve(hooksDir, `${event}.sh`);
  if (!fs.existsSync(scriptPath)) return;

  const payloadStr = JSON.stringify(payload);
  execFile('bash', [scriptPath, payloadStr], { timeout: 5000 }, (err) => {
    if (err) console.error(`[hooks] Script ${event}.sh failed:`, err.message);
  });
}
