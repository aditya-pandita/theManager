import fs from 'fs';
import path from 'path';
import { projectRepo } from '../repositories/project-repo';

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
  '.c', '.cc', '.cpp', '.h', '.hpp',
  '.md', '.json', '.yaml', '.yml', '.toml',
  '.css', '.scss', '.html', '.svelte', '.vue',
  '.sql', '.sh',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', '.turbo', 'dist', 'build', 'out',
  '.cache', '.parcel-cache', 'coverage', '.nuxt', '.svelte-kit',
  '__pycache__', '.venv', 'venv', '.idea', '.vscode',
]);

const MAX_RESULTS = 1000;
const MAX_DEPTH = 12;

export interface ProjectFilesResult {
  folderPath: string | null;
  gitRepoUrl: string | null;
  files: string[];
  truncated: boolean;
  hint?: string;
}

function listFiles(rootDir: string, query: string): { files: string[]; truncated: boolean } {
  const out: string[] = [];
  const q = query.toLowerCase();
  let truncated = false;

  function walk(dir: string, depth: number): void {
    if (depth > MAX_DEPTH) return;
    if (out.length >= MAX_RESULTS) { truncated = true; return; }

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (out.length >= MAX_RESULTS) { truncated = true; return; }
      if (entry.name.startsWith('.') && entry.name !== '.env.example') {
        // Skip dotfiles & dotdirs to keep results clean.
        if (entry.isDirectory()) continue;
        if (entry.name !== '.gitignore' && entry.name !== '.env') continue;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (ext && !SOURCE_EXTENSIONS.has(ext)) continue;
      const rel = path.relative(rootDir, full);
      if (q && !rel.toLowerCase().includes(q)) continue;
      out.push(rel);
    }
  }

  walk(rootDir, 0);
  return { files: out, truncated };
}

export const projectFilesService = {
  async list(projectId: string, query: string = ''): Promise<ProjectFilesResult> {
    const project = await projectRepo.findById(projectId);
    if (!project) {
      return { folderPath: null, gitRepoUrl: null, files: [], truncated: false, hint: 'Project not found.' };
    }

    const folderPath = project.folderPath;
    const gitRepoUrl = project.gitRepoUrl;

    if (!folderPath) {
      const hint = gitRepoUrl
        ? 'Clone the repo locally and set folderPath to enable file browsing.'
        : 'Set the project folderPath to enable file browsing.';
      return { folderPath: null, gitRepoUrl, files: [], truncated: false, hint };
    }

    if (!fs.existsSync(folderPath)) {
      return {
        folderPath,
        gitRepoUrl,
        files: [],
        truncated: false,
        hint: `folderPath does not exist on disk: ${folderPath}`,
      };
    }

    const { files, truncated } = listFiles(folderPath, query.trim());
    return { folderPath, gitRepoUrl, files, truncated };
  },
};
