import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { projectService } from '@decidr-code/core';

const schema = z.object({});

export function registerListProjects(server: McpServer): void {
  server.tool('list-projects', 'List all projects on the board', schema.shape, async () => {
    const projects = await projectService.listProjects();
    if (!projects.length) return { content: [{ type: 'text', text: 'No projects yet. Use create-ticket with a projectId, or create one in the UI.' }] };
    const lines = projects.map(
      (p) => `${p.id}  ${p.name}${p.folderPath ? `  📁 ${p.folderPath}` : ''}`
    );
    return { content: [{ type: 'text', text: lines.join('\n') }] };
  });
}
