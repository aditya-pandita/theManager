import { gitBranchRepo } from '../repositories/git-branch-repo';
import { gitCommitRepo } from '../repositories/git-commit-repo';
import { ticketRepo } from '../repositories/ticket-repo';
import { changelogRepo } from '../repositories/changelog-repo';
import { activityService } from '../activity/activity-service';
import type { GitBranch, NewGitBranch } from '../repositories/git-branch-repo';
import type { GitCommit, NewGitCommit } from '../repositories/git-commit-repo';

const TICKET_PATTERN = /^DC-([A-Z0-9]+)(?:\/(?:US-(\d+)\/)?)?/i;

export function parseTicketFromBranch(branchName: string): { ticketId: string; storyId?: string } | null {
  const match = branchName.match(TICKET_PATTERN);
  if (!match) return null;
  const ticketId = `DC-${match[1].toUpperCase()}`;
  const storyId = match[2] ? `US-${match[2].padStart(3, '0')}` : undefined;
  return { ticketId, storyId };
}

export function parseTicketFromCommitMessage(message: string): string | null {
  const match = message.match(/\b(DC-[A-Z0-9]+)\b/i);
  return match ? match[1].toUpperCase() : null;
}

export const gitService = {
  async reportBranch(branchName: string): Promise<{ branch: GitBranch; ticketId: string } | null> {
    const parsed = parseTicketFromBranch(branchName);
    if (!parsed) return null;

    const ticket = await ticketRepo.findById(parsed.ticketId);
    if (!ticket) return null;

    const existing = await gitBranchRepo.findByBranchName(branchName);
    if (existing) return { branch: existing, ticketId: parsed.ticketId };

    const branch = await gitBranchRepo.create({
      ticketId: parsed.ticketId,
      storyId: parsed.storyId,
      branchName,
      status: 'open',
    });

    await changelogRepo.append(parsed.ticketId, `Branch linked: ${branchName}`, 'Git');
    activityService.log({ ticketId: parsed.ticketId, actorType: 'system', actionType: 'branch_linked', payload: { branchName } }).catch(() => {});
    return { branch, ticketId: parsed.ticketId };
  },

  async reportCommit(payload: {
    branch?: string;
    hash: string;
    abbrevHash?: string;
    message: string;
    author: string;
    authorEmail?: string;
    files?: string[];
    committedAt?: string | Date;
  }): Promise<{ commit: GitCommit; ticketId: string } | null> {
    if (await gitCommitRepo.exists(payload.hash)) return null;

    let ticketId: string | null = null;
    let branchId: number | null = null;

    if (payload.branch) {
      const parsed = parseTicketFromBranch(payload.branch);
      if (parsed) {
        ticketId = parsed.ticketId;
        const branch = await gitBranchRepo.findByBranchName(payload.branch);
        if (branch) branchId = branch.id;
      }
    }
    if (!ticketId) {
      ticketId = parseTicketFromCommitMessage(payload.message);
    }
    if (!ticketId) return null;

    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) return null;

    const committedAt = payload.committedAt
      ? typeof payload.committedAt === 'string'
        ? new Date(payload.committedAt)
        : payload.committedAt
      : new Date();

    const commit: NewGitCommit = {
      ticketId,
      branchId: branchId ?? undefined,
      hash: payload.hash,
      abbrevHash: payload.abbrevHash ?? payload.hash.slice(0, 7),
      message: payload.message,
      authorName: payload.author,
      authorEmail: payload.authorEmail,
      filesModified: payload.files ?? [],
      committedAt,
    };

    const created = await gitCommitRepo.create(commit);
    activityService.log({ ticketId, actorType: 'system', actionType: 'commit_detected', payload: { hash: payload.hash, message: payload.message } }).catch(() => {});
    return { commit: created, ticketId };
  },

  async reportMerge(payload: { branch: string; mergedBy?: string }): Promise<boolean> {
    const branch = await gitBranchRepo.findByBranchName(payload.branch);
    if (!branch) return false;

    await gitBranchRepo.updateStatus(branch.id, 'merged', new Date(), payload.mergedBy);
    await changelogRepo.append(branch.ticketId, `Branch merged: ${payload.branch}`, payload.mergedBy ?? 'Git');
    activityService.log({ ticketId: branch.ticketId, actorType: 'system', actionType: 'merge_detected', payload: { branch: payload.branch, mergedBy: payload.mergedBy } }).catch(() => {});
    return true;
  },

  async getTicketGitData(ticketId: string): Promise<{
    branches: GitBranch[];
    commits: GitCommit[];
  }> {
    const branches = await gitBranchRepo.findByTicket(ticketId);
    const commits = await gitCommitRepo.findByTicket(ticketId);
    return { branches, commits };
  },

  async createBranchForTicket(ticketId: string, name: string): Promise<GitBranch | null> {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) return null;

    const branchName = `${ticketId}/${name.replace(/[/\\]/g, '-')}`;
    const existing = await gitBranchRepo.findByBranchName(branchName);
    if (existing) return existing;

    return gitBranchRepo.create({ ticketId, branchName, status: 'open' });
  },

  async linkBranch(ticketId: string, branchName: string): Promise<GitBranch | null> {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) return null;

    const existing = await gitBranchRepo.findByBranchName(branchName);
    if (existing) return existing;

    const parsed = parseTicketFromBranch(branchName);
    return gitBranchRepo.create({
      ticketId,
      storyId: parsed?.storyId,
      branchName,
      status: 'open',
    });
  },
};
