import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { commentRepo } from '@decidr-code/core';

const schema = z.object({
  ticketId: z.string().describe('Ticket ID'),
  author: z.string().describe('Author name'),
  text: z.string().describe('Comment text'),
});

export function registerAddComment(server: McpServer): void {
  server.tool('add-comment', 'Add a comment to a ticket', schema.shape, async (args) => {
    const comment = await commentRepo.create(args.ticketId, args.author, args.text);
    return { content: [{ type: 'text', text: JSON.stringify(comment, null, 2) }] };
  });
}

