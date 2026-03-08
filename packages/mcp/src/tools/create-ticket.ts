import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ticketService } from '@decidr-code/core';

const schema = z.object({
  title: z.string().describe('Ticket title'),
  description: z.string().optional().describe('Detailed description'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  tags: z.array(z.string()).optional().describe('Labels like bug, feature, refactor'),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).default('backlog'),
  projectId: z.string().optional().describe('Project ID to assign the ticket to (e.g. PROJ-924DE3)'),
});

export function registerCreateTicket(server: McpServer): void {
  server.tool('create-ticket', 'Create a new ticket on the Decidr Code board', schema.shape, async (args) => {
    const ticket = await ticketService.createTicket(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(ticket, null, 2) }],
    };
  });
}

