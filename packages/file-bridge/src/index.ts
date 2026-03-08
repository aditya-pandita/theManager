import 'dotenv/config';
import { watchInbox } from './watcher';
import { writeBoardState } from './writer';

const DECIDR_DIR = process.env.DECIDR_DIR ?? './.decidr';

export async function startFileBridge(): Promise<void> {
  // Write initial board state
  await writeBoardState(DECIDR_DIR).catch((err) =>
    console.warn('[file-bridge] Initial board write failed:', (err as Error).message)
  );

  // Start inbox watcher
  watchInbox(DECIDR_DIR);
}

if (require.main === module) {
  startFileBridge().catch((err) => {
    console.error('[file-bridge] Fatal:', err);
    process.exit(1);
  });
}
