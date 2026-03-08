import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ticketService } from '@decidr-code/core';

export function registerAnalyzeTicketPrompt(server: McpServer): void {
  server.prompt('analyze-ticket', 'Generate a system prompt for analyzing a Decidr Code ticket', { ticketId: z.string() }, async (args) => {
    const ticket = await ticketService.getTicketDetail(args.ticketId);
    const ticketJson = ticket ? JSON.stringify(ticket, null, 2) : `Ticket ${args.ticketId} not found`;
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Analyze this ticket and provide a decision tree with reasoning:\n\n${ticketJson}`,
          },
        },
      ],
    };
  });
}

