import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { gitService } from '@decidr-code/core';

const schema = z.object({
  ticketId: z.string().describe('Ticket ID (e.g. DC-042)'),
  name: z.string().describe('Branch name suffix (e.g. fix-auth-bug) — creates DC-XXX/name'),
});

export function registerCreateBranch(server: McpServer): void {
  server.tool('create-branch', 'Create a properly named branch for a ticket (DC-XXX/name)', schema.shape, async (args) => {
    const branch = await gitService.createBranchForTicket(args.ticketId, args.name);
    if (!branch) return { content: [{ type: 'text', text: `Ticket ${args.ticketId} not found.` }] };
    return {
      content: [
        {
          type: 'text',
          text: `Branch created: ${branch.branchName}\n\nRun: git checkout -b ${branch.branchName}`,
        },
      ],
    };
  });
}
