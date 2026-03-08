import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ticketService } from '@decidr-code/core';

export function registerBoardResource(server: McpServer): void {
  server.resource('board', 'decidr-code://board', async (uri) => {
    const board = await ticketService.getBoard();
    return {
      contents: [{ uri: uri.href, text: JSON.stringify(board, null, 2), mimeType: 'application/json' }],
    };
  });
}

