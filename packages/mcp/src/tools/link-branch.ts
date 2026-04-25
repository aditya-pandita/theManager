import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { gitService } from '@decidr-code/core';

const schema = z.object({
  ticketId: z.string().describe('Ticket ID (e.g. DC-042)'),
  branchName: z.string().describe('Branch name to link (e.g. DC-042/fix-auth-bug)'),
});

export function registerLinkBranch(server: McpServer): void {
  server.tool('link-branch', 'Link a git branch to a ticket', schema.shape, async (args) => {
    const branch = await gitService.linkBranch(args.ticketId, args.branchName);
    if (!branch) return { content: [{ type: 'text', text: `Ticket ${args.ticketId} not found or branch already linked.` }] };
    return { content: [{ type: 'text', text: `Linked ${args.branchName} to ${args.ticketId}.` }] };
  });
}
