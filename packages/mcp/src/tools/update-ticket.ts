import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ticketService } from '@decidr-code/core';

const schema = z.object({
  id: z.string().describe('Ticket ID (e.g. DC-A3F9X)'),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  tags: z.array(z.string()).optional(),
});

export function registerUpdateTicket(server: McpServer): void {
  server.tool('update-ticket', 'Update fields on an existing ticket', schema.shape, async (args) => {
    const { id, ...changes } = args;
    const ticket = await ticketService.updateTicket(id, changes);
    return { content: [{ type: 'text', text: JSON.stringify(ticket, null, 2) }] };
  });
}

