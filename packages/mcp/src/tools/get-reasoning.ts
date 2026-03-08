import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { reasoningService } from '@decidr-code/core';

const schema = z.object({
  ticketId: z.string().describe('Ticket ID to get reasoning for'),
});

export function registerGetReasoning(server: McpServer): void {
  server.tool('get-reasoning', 'Get the decision tree and reasoning for a ticket', schema.shape, async (args) => {
    const r = await reasoningService.getReasoning(args.ticketId);
    if (!r) return { content: [{ type: 'text', text: 'No reasoning found for this ticket.' }] };
    return { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] };
  });
}

