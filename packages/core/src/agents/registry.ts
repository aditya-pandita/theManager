import type { AgentConfig, AgentName } from '../types/agent';
import { BaseAgent } from './base-agent';
import { PlannerAgent } from './planner-agent';
import { ArchitectAgent } from './architect-agent';
import { CoderAgent } from './coder-agent';
import { ReviewerAgent } from './reviewer-agent';
import { TesterAgent } from './tester-agent';
import { DebuggerAgent } from './debugger-agent';
import { DocsAgent } from './docs-agent';

const DEFAULT_CONFIGS: Record<AgentName, AgentConfig> = {
  planner: {
    name: 'planner', displayName: 'Planner',
    model: 'gemini-2.0-flash', systemPromptPath: 'planner.md',
    toolAllowlist: ['create-ticket', 'list-tickets'],
    maxTokens: 4096, maxRetries: 3, retryBackoffMs: 2000, timeoutMs: 60000,
  },
  architect: {
    name: 'architect', displayName: 'Architect',
    model: 'gemini-2.0-flash', systemPromptPath: 'architect.md',
    toolAllowlist: ['list-tickets', 'get-reasoning'],
    maxTokens: 4096, maxRetries: 3, retryBackoffMs: 2000, timeoutMs: 60000,
  },
  coder: {
    name: 'coder', displayName: 'Coder',
    model: 'gemini-2.0-flash', systemPromptPath: 'coder.md',
    toolAllowlist: ['create-branch', 'get-git-history'],
    maxTokens: 8192, maxRetries: 3, retryBackoffMs: 2000, timeoutMs: 120000,
  },
  reviewer: {
    name: 'reviewer', displayName: 'Reviewer',
    model: 'gemini-2.0-flash', systemPromptPath: 'reviewer.md',
    toolAllowlist: ['add-comment', 'get-reasoning'],
    maxTokens: 4096, maxRetries: 2, retryBackoffMs: 2000, timeoutMs: 60000,
  },
  tester: {
    name: 'tester', displayName: 'Tester',
    model: 'gemini-2.0-flash', systemPromptPath: 'tester.md',
    toolAllowlist: ['create-ticket', 'get-reasoning'],
    maxTokens: 4096, maxRetries: 2, retryBackoffMs: 2000, timeoutMs: 90000,
  },
  debugger: {
    name: 'debugger', displayName: 'Debugger',
    model: 'gemini-2.0-flash', systemPromptPath: 'debugger.md',
    toolAllowlist: ['get-reasoning', 'get-git-history'],
    maxTokens: 4096, maxRetries: 3, retryBackoffMs: 3000, timeoutMs: 90000,
  },
  docs: {
    name: 'docs', displayName: 'Docs',
    model: 'gemini-2.0-flash', systemPromptPath: 'docs.md',
    toolAllowlist: ['get-reasoning'],
    maxTokens: 2048, maxRetries: 2, retryBackoffMs: 1000, timeoutMs: 30000,
  },
};

function createAgent(config: AgentConfig): BaseAgent {
  switch (config.name) {
    case 'planner':   return new PlannerAgent(config);
    case 'architect': return new ArchitectAgent(config);
    case 'coder':     return new CoderAgent(config);
    case 'reviewer':  return new ReviewerAgent(config);
    case 'tester':    return new TesterAgent(config);
    case 'debugger':  return new DebuggerAgent(config);
    case 'docs':      return new DocsAgent(config);
  }
}

const agents = new Map<AgentName, BaseAgent>();
const configs = new Map<AgentName, AgentConfig>();

for (const [name, cfg] of Object.entries(DEFAULT_CONFIGS)) {
  const n = name as AgentName;
  configs.set(n, cfg);
  agents.set(n, createAgent(cfg));
}

export const agentRegistry = {
  get(name: AgentName): BaseAgent {
    const agent = agents.get(name);
    if (!agent) throw new Error(`Agent "${name}" not registered`);
    return agent;
  },

  getConfig(name: AgentName): AgentConfig {
    return configs.get(name)!;
  },

  updateConfig(name: AgentName, overrides: Partial<AgentConfig>): AgentConfig {
    const existing = configs.get(name)!;
    const updated = { ...existing, ...overrides };
    configs.set(name, updated);
    agents.set(name, createAgent(updated));
    return updated;
  },

  listAll(): AgentConfig[] {
    return Array.from(configs.values());
  },
};
