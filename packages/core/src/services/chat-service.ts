import { chatMessageRepo } from '../repositories/chat-message-repo';
import { activityService } from '../activity/activity-service';
import { routePrompt } from '../prompting/prompt-router';
import { parseSlashCommand } from '../prompting/slash-commands';
import { assembleContext, resolveFileReference } from '../prompting/context-assembler';
import { agentRegistry } from '../agents/registry';
import { contextStore } from '../agents/context-store';
import { testService } from './test-service';
import { gitService } from './git-service';
import { ticketRepo } from '../repositories/ticket-repo';
import type { ChatMessage } from '../types/activity';
import type { AgentName } from '../types/agent';
import { randomBytes } from 'crypto';

export const chatService = {
  async send(ticketId: string, content: string, threadId?: string): Promise<ChatMessage> {
    const thread = threadId ?? randomBytes(4).toString('hex');

    // Save user message
    await chatMessageRepo.create({ ticketId, threadId: thread, role: 'user', content });
    activityService.log({ ticketId, actorType: 'user', actionType: 'prompt_sent', payload: { content: content.slice(0, 100) } }).catch(() => {});

    // Resolve file references
    const { text: resolvedText, files } = resolveFileReference(content);

    // Check slash commands first
    const slash = parseSlashCommand(resolvedText);

    let responseContent = '';
    let agentName: AgentName = 'coder';
    let tokensUsed = 0;
    let actionsTaken: unknown[] = [];

    if (slash) {
      if (slash.action === 'run_tests') {
        const result = await testService.run(ticketId, 'user');
        responseContent = `Tests run: ${result.passed}/${result.totalTests} passed. Coverage: ${result.coveragePercent ?? 'n/a'}%`;
        agentName = 'tester';
        actionsTaken = [{ action: 'run_tests', result }];
      } else if (slash.action === 'create_branch') {
        const ticket = await ticketRepo.findById(ticketId);
        const name = content.replace('/create-branch', '').trim() || 'feature';
        if (ticket) {
          const branch = await gitService.createBranchForTicket(ticketId, name);
          responseContent = `Branch created: ${branch?.branchName ?? 'failed'}`;
          actionsTaken = [{ action: 'create_branch', branch }];
        }
      } else if (slash.agent) {
        agentName = slash.agent;
        const result = await runAgentForChat(ticketId, agentName, resolvedText, files);
        responseContent = result.summary;
        tokensUsed = result.tokensUsed;
      } else {
        responseContent = `Unknown slash command: ${resolvedText.split(' ')[0]}`;
      }
    } else {
      // Route by intent
      agentName = routePrompt(resolvedText);
      const result = await runAgentForChat(ticketId, agentName, resolvedText, files);
      responseContent = result.summary;
      tokensUsed = result.tokensUsed;
    }

    const agentMessage = await chatMessageRepo.create({
      ticketId, threadId: thread, role: 'agent', agentName,
      content: responseContent, actionsTaken, tokensUsed,
    });

    activityService.log({ ticketId, actorType: 'agent', actorName: agentName, actionType: 'prompt_responded', payload: { threadId: thread }, tokensUsed }).catch(() => {});
    return agentMessage;
  },

  async getHistory(ticketId: string): Promise<ChatMessage[]> {
    return chatMessageRepo.findByTicket(ticketId);
  },

  async getThread(threadId: string): Promise<ChatMessage[]> {
    return chatMessageRepo.findByThread(threadId);
  },

  async getById(id: number): Promise<ChatMessage | null> {
    return chatMessageRepo.findById(id);
  },
};

async function runAgentForChat(ticketId: string, agentName: AgentName, prompt: string, files: Array<{ path: string; content: string }>): Promise<{ summary: string; tokensUsed: number }> {
  const ticket = await ticketRepo.findById(ticketId);
  if (!ticket) return { summary: 'Ticket not found', tokensUsed: 0 };

  const ctx = await contextStore.getAll(ticketId);
  const agentCtxWithFiles = { ...ctx, chatPrompt: prompt, referencedFiles: files };

  try {
    const agent = agentRegistry.get(agentName);
    const config = agentRegistry.getConfig(agentName);
    const output = await agent.run({ ticket, contextStore: agentCtxWithFiles });
    await contextStore.set(ticketId, agentName, output.data, agentName);
    return { summary: JSON.stringify(output.data).slice(0, 500), tokensUsed: output.tokensInput + output.tokensOutput };
  } catch (err) {
    return { summary: `Agent error: ${(err as Error).message}`, tokensUsed: 0 };
  }
}
