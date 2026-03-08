import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

import { registerCreateTicket } from './tools/create-ticket';
import { registerUpdateTicket } from './tools/update-ticket';
import { registerMoveTicket } from './tools/move-ticket';
import { registerAddComment } from './tools/add-comment';
import { registerProcessTicket } from './tools/process-ticket';
import { registerListTickets } from './tools/list-tickets';
import { registerGetReasoning } from './tools/get-reasoning';
import { registerListProjects } from './tools/list-projects';
import { registerBoardResource } from './resources/board';
import { registerTicketResource } from './resources/ticket';
import { registerStatsResource } from './resources/stats';
import { registerAnalyzeTicketPrompt } from './prompts/analyze-ticket';
import { registerReviewDiffPrompt } from './prompts/review-diff';

const server = new McpServer({
  name: 'decidr-code',
  version: '1.0.0',
});

// Tools
registerCreateTicket(server);
registerUpdateTicket(server);
registerMoveTicket(server);
registerAddComment(server);
registerProcessTicket(server);
registerListTickets(server);
registerGetReasoning(server);
registerListProjects(server);

// Resources
registerBoardResource(server);
registerTicketResource(server);
registerStatsResource(server);

// Prompts
registerAnalyzeTicketPrompt(server);
registerReviewDiffPrompt(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[mcp] Decidr Code MCP server running on stdio');
}

main().catch((err) => {
  console.error('[mcp] Fatal:', err);
  process.exit(1);
});

