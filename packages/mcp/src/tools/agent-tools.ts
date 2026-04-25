import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { pipelineService, agentRegistry, agentRunRepo } from '@decidr-code/core';

export function registerAgentTools(server: McpServer) {
  server.tool(
    'run-pipeline',
    { ticketId: z.string(), ticketType: z.string().optional() },
    async ({ ticketId, ticketType }) => {
      await pipelineService.run(ticketId, ticketType);
      return { content: [{ type: 'text', text: `Pipeline started for ${ticketId}` }] };
    }
  );

  server.tool(
    'run-agent',
    { ticketId: z.string(), agent: z.enum(['planner','architect','coder','reviewer','tester','debugger','docs']) },
    async ({ ticketId, agent }) => {
      await pipelineService.runAgent(ticketId, agent);
      return { content: [{ type: 'text', text: `Agent ${agent} completed for ${ticketId}` }] };
    }
  );

  server.tool(
    'pause-pipeline',
    { ticketId: z.string() },
    async ({ ticketId }) => {
      await pipelineService.pause(ticketId);
      return { content: [{ type: 'text', text: `Pipeline paused for ${ticketId}` }] };
    }
  );

  server.tool(
    'resume-pipeline',
    { ticketId: z.string() },
    async ({ ticketId }) => {
      await pipelineService.resume(ticketId);
      return { content: [{ type: 'text', text: `Pipeline resumed for ${ticketId}` }] };
    }
  );

  server.tool(
    'approve-checkpoint',
    { ticketId: z.string() },
    async ({ ticketId }) => {
      await pipelineService.approve(ticketId);
      return { content: [{ type: 'text', text: `Checkpoint approved for ${ticketId}` }] };
    }
  );

  server.tool(
    'reject-checkpoint',
    { ticketId: z.string(), feedback: z.string() },
    async ({ ticketId, feedback }) => {
      await pipelineService.reject(ticketId, feedback);
      return { content: [{ type: 'text', text: `Checkpoint rejected for ${ticketId}` }] };
    }
  );

  server.tool(
    'get-pipeline-status',
    { ticketId: z.string() },
    async ({ ticketId }) => {
      const status = await pipelineService.getStatus(ticketId);
      return { content: [{ type: 'text', text: JSON.stringify(status, null, 2) }] };
    }
  );

  server.tool(
    'get-agent-metrics',
    {},
    async () => {
      const metrics = await agentRunRepo.getMetrics();
      return { content: [{ type: 'text', text: JSON.stringify(metrics, null, 2) }] };
    }
  );
}
