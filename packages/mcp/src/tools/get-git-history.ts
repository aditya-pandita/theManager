import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { gitService } from '@decidr-code/core';

const schema = z.object({
  ticketId: z.string().describe('Ticket ID (e.g. DC-042)'),
});

export function registerGetGitHistory(server: McpServer): void {
  server.tool('get-git-history', 'Get git branch and commit history for a ticket', schema.shape, async (args) => {
    const { branches, commits } = await gitService.getTicketGitData(args.ticketId);
    const branchLines = branches.map((b) => `  ${b.branchName} [${b.status}] ↑${b.aheadCount} ↓${b.behindCount}`);
    const commitLines = commits.slice(0, 20).map((c) => `  ${c.abbrevHash} ${c.message} (${c.authorName})`);
    const text = [
      'Branches:',
      branchLines.length ? branchLines.join('\n') : '  (none)',
      '',
      'Commits:',
      commitLines.length ? commitLines.join('\n') : '  (none)',
    ].join('\n');
    return { content: [{ type: 'text', text }] };
  });
}
