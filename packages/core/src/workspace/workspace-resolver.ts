import path from 'path';
import fs from 'fs';
import { ticketRepo } from '../repositories/ticket-repo';
import { projectRepo } from '../repositories/project-repo';

export interface Workspace {
  ticketId: string;
  rootDir: string;          // absolute path where files will be written
  isGit: boolean;           // true if rootDir contains .git
  isProjectLinked: boolean; // false when we fell back to sandbox
  projectName?: string;
}

const SANDBOX_ROOT = path.join('/tmp', 'decidr-output');

/**
 * Resolve a ticket to the directory where its Coder output should land.
 * Prefers the linked project's folderPath. Falls back to a per-ticket sandbox
 * under /tmp/decidr-output/<ticketId>/ that is auto-created.
 */
export async function resolveWorkspace(ticketId: string): Promise<Workspace> {
  const ticket = await ticketRepo.findById(ticketId);
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

  if (ticket.projectId) {
    const project = await projectRepo.findById(ticket.projectId);
    if (project?.folderPath && fs.existsSync(project.folderPath)) {
      const isGit = fs.existsSync(path.join(project.folderPath, '.git'));
      return {
        ticketId,
        rootDir: project.folderPath,
        isGit,
        isProjectLinked: true,
        projectName: project.name,
      };
    }
  }

  // Sandbox fallback — created on demand, ticket-scoped so reruns don't collide
  const sandbox = path.join(SANDBOX_ROOT, ticketId);
  fs.mkdirSync(sandbox, { recursive: true });
  const isGit = fs.existsSync(path.join(sandbox, '.git'));
  return { ticketId, rootDir: sandbox, isGit, isProjectLinked: false };
}

/**
 * Convert a ticket title to a git-branch-friendly slug.
 * "Add inline edit for ticket title" → "add-inline-edit-for-ticket-title"
 */
export function ticketSlug(title: string): string {
  // Strip trailing dashes AFTER slicing so a 40th-char cut doesn't leave one dangling.
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40)
      .replace(/^-+|-+$/g, '') || 'untitled'
  );
}
