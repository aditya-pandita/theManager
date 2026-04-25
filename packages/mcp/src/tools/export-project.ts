import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { generateMarkdown } from '@decidr-code/core';

const schema = z.object({
  format: z.enum(['markdown', 'html']).default('markdown'),
  projectId: z.string().optional().describe('Filter by project ID'),
});

export function registerExportProject(server: McpServer): void {
  server.tool('export-project', 'Generate project document (Markdown or HTML)', schema.shape, async (args) => {
    const md = await generateMarkdown({
      format: args.format,
      projectId: args.projectId,
    });
    return {
      content: [
        {
          type: 'text',
          text: args.format === 'markdown' ? md : `HTML export available via GET /api/export?format=html`,
        },
      ],
    };
  });
}
