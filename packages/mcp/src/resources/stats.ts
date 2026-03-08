import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { statsService } from '@decidr-code/core';

export function registerStatsResource(server: McpServer): void {
  server.resource('stats', 'decidr-code://stats', async (uri) => {
    const stats = await statsService.getDashboard();
    return {
      contents: [{ uri: uri.href, text: JSON.stringify(stats, null, 2), mimeType: 'application/json' }],
    };
  });
}

