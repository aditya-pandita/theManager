import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import path from 'path';

export async function runMigrations(): Promise<void> {
  const url =
    process.env.DATABASE_URL ??
    'postgresql://decidr_code:decidr_code_dev@localhost:5434/decidr_code';

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  await migrate(db, {
    migrationsFolder: path.join(__dirname, '../../drizzle/migrations'),
  });

  await client.end();
  console.log('[migrate] Migrations complete');
}

if (require.main === module) {
  runMigrations().catch((err) => {
    console.error('[migrate] Failed:', err);
    process.exit(1);
  });
}
