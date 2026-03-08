import 'dotenv/config';
import { runMigrations } from '@decidr-code/core';
import { startFileBridge } from '@decidr-code/file-bridge';

async function main(): Promise<void> {
  console.log('[sidecar] Starting Decidr Code sidecar...');

  // Run DB migrations
  try {
    await runMigrations();
  } catch (err) {
    console.warn('[sidecar] Migrations failed (DB may not be available yet):', (err as Error).message);
  }

  // Start the REST API server (by importing it, the listen() call fires)
  await import('@decidr-code/server');

  // Start file bridge watcher
  await startFileBridge();

  console.log('[sidecar] Sidecar ready on :3117');
}

main().catch((err) => {
  console.error('[sidecar] Fatal error:', err);
  process.exit(1);
});
