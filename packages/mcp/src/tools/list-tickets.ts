import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ticketService } from '@decidr-code/core';

const schema = z.object({
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  search: z.string().optional().describe('Search in ticket titles'),
  projectId: z.string().optional().describe('Filter by project ID (e.g. PROJ-924DE3)'),
});

export function registerListTickets(server: McpServer): void {
  server.tool('list-tickets', 'List and filter tickets on the board', schema.shape, async (args) => {
    const tickets = await ticketService.listTickets(args);
    const summary = tickets.map((t) => `${t.id} [${t.status}/${t.priority}] ${t.title}`).join('\n');
    return { content: [{ type: 'text', text: summary || 'No tickets found.' }] };
  });
}

