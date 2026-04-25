import type { AgentName } from '../types/agent';

const ROUTING_RULES: Array<{ pattern: RegExp; agent: AgentName }> = [
  { pattern: /^@planner\b/i,                                          agent: 'planner' },
  { pattern: /^@architect\b/i,                                        agent: 'architect' },
  { pattern: /^@coder\b/i,                                            agent: 'coder' },
  { pattern: /^@tester\b/i,                                           agent: 'tester' },
  { pattern: /^@reviewer\b/i,                                         agent: 'reviewer' },
  { pattern: /^@debugger\b/i,                                         agent: 'debugger' },
  { pattern: /^@docs\b/i,                                             agent: 'docs' },
  { pattern: /\b(add|write|generate|create)\s+tests?\b/i,             agent: 'tester' },
  { pattern: /\b(run|execute)\s+tests?\b/i,                           agent: 'tester' },
  { pattern: /\b(fix|debug|broken|crash|error|bug)\b/i,               agent: 'debugger' },
  { pattern: /\b(implement|code|build|scaffold|write code)\b/i,       agent: 'coder' },
  { pattern: /\b(review|check quality|security|audit)\b/i,            agent: 'reviewer' },
  { pattern: /\b(plan|break down|decompose|split|subtask)\b/i,        agent: 'planner' },
  { pattern: /\b(design|architect|structure|pattern|schema)\b/i,      agent: 'architect' },
  { pattern: /\b(document|readme|changelog|jsdoc|update docs)\b/i,    agent: 'docs' },
  { pattern: /\b(why|explain|reasoning|decision|rationale)\b/i,       agent: 'reviewer' },
  { pattern: /\b(rename|refactor|move|extract|clean up)\b/i,          agent: 'coder' },
];

export function routePrompt(text: string): AgentName {
  for (const rule of ROUTING_RULES) {
    if (rule.pattern.test(text)) return rule.agent;
  }
  return 'coder';
}
