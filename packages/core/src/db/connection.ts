import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://decidr_code:decidr_code_dev@localhost:5434/decidr_code';

const client = postgres(DATABASE_URL);
export const db = drizzle(client, { schema });
