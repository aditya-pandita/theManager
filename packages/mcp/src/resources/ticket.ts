import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp';
import { ticketService } from '@decidr-code/core';

export function registerTicketResource(server: McpServer): void {
  const template = new ResourceTemplate('decidr-code://ticket/{id}', {
    list: undefined,
  });

  server.resource('ticket', template, async (uri, variables) => {
    const id = Array.isArray(variables.id) ? variables.id[0] : (variables.id as string);
    const ticket = await ticketService.getTicketDetail(id);
    const text = ticket ? JSON.stringify(ticket, null, 2) : `Ticket ${id} not found`;
    return {
      contents: [{ uri: uri.href, text, mimeType: 'application/json' }],
    };
  });
}
