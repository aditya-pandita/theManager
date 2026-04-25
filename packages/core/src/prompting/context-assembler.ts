import { ticketRepo } from '../repositories/ticket-repo';
import { commentRepo } from '../repositories/comment-repo';
import { activityRepo } from '../repositories/activity-repo';
import { chatMessageRepo } from '../repositories/chat-message-repo';
import { agentContextRepo } from '../repositories/agent-context-repo';
import { testResultRepo } from '../repositories/test-result-repo';
import fs from 'fs';

export async function assembleContext(ticketId: string, threadId?: string): Promise<Record<string, unknown>> {
  const [ticket, comments, recentActivity, agentContext, latestTest] = await Promise.all([
    ticketRepo.findById(ticketId),
    commentRepo.findByTicket(ticketId),
    activityRepo.findByTicket(ticketId),
    agentContextRepo.getAll(ticketId),
    testResultRepo.findLatestByTicket(ticketId),
  ]);

  const recentChat = threadId
    ? await chatMessageRepo.findByThread(threadId)
    : await chatMessageRepo.findByTicket(ticketId);

  return {
    ticketFields: ticket ? {
      id: ticket.id, title: ticket.title, description: ticket.description,
      status: ticket.status, priority: ticket.priority, tags: ticket.tags,
    } : null,
    userStory:     (ticket as any)?.userStory ?? null,
    latestDiff:    (ticket as any)?.diff ?? null,
    reasoningTree: (ticket as any)?.reasoning ?? null,
    recentComments: comments.slice(-10),
    gitState: {
      branches: (ticket as any)?.gitBranches ?? [],
      commits:  (ticket as any)?.gitCommits?.slice(-5) ?? [],
    },
    agentContext,
    testResults:    latestTest,
    recentActivity: recentActivity.slice(0, 20),
    recentChat:     recentChat.slice(-10),
  };
}

export function resolveFileReference(text: string): { text: string; files: Array<{ path: string; content: string }> } {
  const files: Array<{ path: string; content: string }> = [];
  const resolved = text.replace(/#([\w./\-]+)/g, (_, filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      files.push({ path: filePath, content });
      return `[file: ${filePath}]`;
    } catch { return `[file not found: ${filePath}]`; }
  });
  return { text: resolved, files };
}
