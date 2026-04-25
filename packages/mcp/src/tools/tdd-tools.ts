import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { testService } from '@decidr-code/core';

export function registerTddTools(server: McpServer) {
  server.tool(
    'run-tests',
    { ticketId: z.string() },
    async ({ ticketId }) => {
      const result = await testService.run(ticketId, 'agent');
      return { content: [{ type: 'text', text: `Tests: ${result.passed}/${result.totalTests} passed. Failed: ${result.failed}` }] };
    }
  );

  server.tool(
    'generate-tests',
    { ticketId: z.string() },
    async ({ ticketId }) => {
      return { content: [{ type: 'text', text: `Use run-pipeline with ticketType=test to generate tests for ${ticketId}` }] };
    }
  );

  server.tool(
    'get-coverage',
    { ticketId: z.string() },
    async ({ ticketId }) => {
      const result = await testService.getLatest(ticketId);
      if (!result) return { content: [{ type: 'text', text: 'No test results found' }] };
      return { content: [{ type: 'text', text: `Coverage: ${result.coveragePercent ?? 'n/a'}% (delta: ${result.coverageDelta ?? 'n/a'}%)` }] };
    }
  );

  server.tool(
    'get-coverage-delta',
    { ticketId: z.string() },
    async ({ ticketId }) => {
      const result = await testService.getLatest(ticketId);
      return { content: [{ type: 'text', text: JSON.stringify({ coverageDelta: result?.coverageDelta ?? null }) }] };
    }
  );

  server.tool(
    'configure-tdd',
    { config: z.record(z.unknown()) },
    async ({ config }) => {
      const updated = testService.saveConfig(config as any);
      return { content: [{ type: 'text', text: `TDD config updated: ${JSON.stringify(updated)}` }] };
    }
  );

  server.tool(
    'get-flaky-tests',
    {},
    async () => {
      const flaky = await testService.getFlaky();
      return { content: [{ type: 'text', text: `Flaky tests: ${flaky.length}\n${JSON.stringify(flaky.slice(0,5), null, 2)}` }] };
    }
  );
}
