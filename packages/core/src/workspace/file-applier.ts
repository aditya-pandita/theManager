import path from 'path';
import fs from 'fs';

export interface CoderFile {
  path: string;
  content: string;
}

export interface ApplyOptions {
  rootDir: string;
  files: CoderFile[];
  dryRun?: boolean;
}

export interface ApplyResult {
  written: Array<{ path: string; bytes: number; previouslyExisted: boolean }>;
  rejected: Array<{ path: string; reason: string }>;
  dryRun: boolean;
}

// Paths or path segments we refuse to write to even if the model asks for them.
const PATH_DENYLIST = [
  '.git', '.env', '.env.local', '.env.production',
  'node_modules', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.ssh', '.aws', '.gnupg',
];

// Files we refuse to overwrite if they already exist (touchstone files).
const NEVER_OVERWRITE = new Set(['package.json', 'tsconfig.json', '.gitignore']);

function isPathSafe(rootDir: string, relativePath: string): { ok: true } | { ok: false; reason: string } {
  if (typeof relativePath !== 'string' || !relativePath.trim()) {
    return { ok: false, reason: 'Empty path' };
  }
  if (path.isAbsolute(relativePath)) {
    return { ok: false, reason: 'Absolute paths are not allowed' };
  }
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith('..') || normalized.includes(`${path.sep}..${path.sep}`)) {
    return { ok: false, reason: 'Path escapes workspace via ..' };
  }
  const segs = normalized.split(path.sep);
  for (const seg of segs) {
    if (PATH_DENYLIST.includes(seg)) {
      return { ok: false, reason: `Denied path segment: ${seg}` };
    }
  }
  // Resolve and double-check that the absolute path stays under rootDir
  const abs = path.resolve(rootDir, normalized);
  const rootResolved = path.resolve(rootDir);
  if (!abs.startsWith(rootResolved + path.sep) && abs !== rootResolved) {
    return { ok: false, reason: 'Resolved path escapes workspace' };
  }
  return { ok: true };
}

/**
 * Apply Coder agent output (a list of files) to a workspace.
 * Performs path-safety validation, denylist enforcement, and won't overwrite
 * touchstone files. In dryRun mode, returns the planned writes without touching disk.
 */
export function applyFiles(opts: ApplyOptions): ApplyResult {
  const { rootDir, files, dryRun = false } = opts;
  const written: ApplyResult['written'] = [];
  const rejected: ApplyResult['rejected'] = [];

  for (const f of files ?? []) {
    if (typeof f?.path !== 'string' || typeof f?.content !== 'string') {
      rejected.push({ path: String(f?.path ?? '<missing>'), reason: 'Missing path or content' });
      continue;
    }
    const safety = isPathSafe(rootDir, f.path);
    if (!safety.ok) {
      rejected.push({ path: f.path, reason: safety.reason });
      continue;
    }
    const abs = path.resolve(rootDir, path.normalize(f.path));
    const baseName = path.basename(abs);
    const previouslyExisted = fs.existsSync(abs);
    if (previouslyExisted && NEVER_OVERWRITE.has(baseName)) {
      rejected.push({ path: f.path, reason: `Refused to overwrite ${baseName}` });
      continue;
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, f.content, 'utf-8');
    }
    written.push({ path: f.path, bytes: Buffer.byteLength(f.content, 'utf-8'), previouslyExisted });
  }

  return { written, rejected, dryRun };
}
