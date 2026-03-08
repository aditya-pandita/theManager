import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ticketService } from '@decidr-code/core';
import type { Status } from '@decidr-code/core';

const schema = z.object({
  id: z.string().describe('Ticket ID'),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).describe('Target column'),
});

export function registerMoveTicket(server: McpServer): void {
  server.tool('move-ticket', 'Move a ticket to a different kanban column', schema.shape, async (args) => {
    const ticket = await ticketService.moveTicket(args.id, args.status as Status);
    return { content: [{ type: 'text', text: JSON.stringify(ticket, null, 2) }] };
  });
}

