import type { AgentName } from '../types/agent';

export interface SlashCommand {
  agent:       AgentName | null;
  action:      string;
  description: string;
}

export const SLASH_COMMANDS: Record<string, SlashCommand> = {
  '/run-tests':      { agent: 'tester',   action: 'run_tests',      description: 'Run test suite for this ticket' },
  '/generate-tests': { agent: 'tester',   action: 'generate_tests', description: 'Generate tests from acceptance criteria' },
  '/refactor':       { agent: 'coder',    action: 'refactor',       description: 'Refactor implementation with test guardrails' },
  '/explain':        { agent: 'reviewer', action: 'explain',        description: 'Explain reasoning behind decisions' },
  '/review':         { agent: 'reviewer', action: 'review',         description: 'Run full code review' },
  '/split-ticket':   { agent: 'planner',  action: 'split',          description: 'Split ticket into subtasks' },
  '/create-branch':  { agent: null,       action: 'create_branch',  description: 'Create a linked branch' },
  '/coverage':       { agent: 'tester',   action: 'show_coverage',  description: 'Show coverage delta for this ticket' },
};

export function parseSlashCommand(text: string): SlashCommand | null {
  const cmd = text.trim().split(' ')[0].toLowerCase();
  return SLASH_COMMANDS[cmd] ?? null;
}
