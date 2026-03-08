import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

export function registerReviewDiffPrompt(server: McpServer): void {
  server.prompt('review-diff', 'Review a code diff for correctness, security, and performance', {
    before: z.string().describe('Original code'),
    after: z.string().describe('Modified code'),
    context: z.string().optional().describe('Ticket context'),
  }, async (args) => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Review this code change:\n\nBEFORE:\n\`\`\`\n${args.before}\n\`\`\`\n\nAFTER:\n\`\`\`\n${args.after}\n\`\`\`\n\nContext: ${args.context ?? 'None'}\n\nCheck for: correctness, security issues, performance, edge cases.`,
          },
        },
      ],
    };
  });
}

