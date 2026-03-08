import * as fs from 'fs';
import * as path from 'path';

const API_URL = process.env.DECIDR_API_URL ?? 'http://localhost:3117';

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/** Fallback: read board state from .decidr/board.json if server is unreachable */
export function readBoardFile(workspaceRoot: string): unknown | null {
  const boardPath = path.join(workspaceRoot, '.decidr', 'board.json');
  if (!fs.existsSync(boardPath)) return null;
  try { return JSON.parse(fs.readFileSync(boardPath, 'utf-8')); } catch { return null; }
}
