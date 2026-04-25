export type AgentName      = 'planner' | 'architect' | 'coder' | 'reviewer' | 'tester' | 'debugger' | 'docs';
export type AgentRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'rejected' | 'skipped';
export type PipelineState  = 'idle' | 'running' | 'paused' | 'blocked' | 'completed' | 'awaiting_approval';
export type TicketType     = 'bug' | 'feature' | 'refactor' | 'docs' | 'test';

export interface AgentConfig {
  name:             AgentName;
  displayName:      string;
  model:            string;
  systemPromptPath: string;
  toolAllowlist:    string[];
  maxTokens:        number;
  maxRetries:       number;
  retryBackoffMs:   number;
  timeoutMs:        number;
}

export interface AgentInput {
  ticket:        import('./ticket').Ticket;
  contextStore:  Record<string, unknown>;
  userFeedback?: string;
}

export interface AgentOutput {
  agent:        AgentName;
  ticketId:     string;
  reasoning:    import('./reasoning').TreeNode;
  confidence:   number;
  data:         Record<string, unknown>;
  tokensInput:  number;
  tokensOutput: number;
  durationMs:   number;
}

export interface AgentRun {
  id:           number;
  ticketId:     string;
  projectId:    string | null;
  agent:        AgentName;
  status:       AgentRunStatus;
  input:        unknown;
  output:       unknown;
  reasoning:    unknown;
  errorMessage: string | null;
  retryCount:   number;
  model:        string;
  tokensInput:  number | null;
  tokensOutput: number | null;
  costUsd:      number | null;
  durationMs:   number | null;
  startedAt:    Date;
  completedAt:  Date | null;
}

export interface NewAgentRun {
  ticketId:   string;
  projectId?: string;
  agent:      AgentName;
  status?:    AgentRunStatus;
  input?:     unknown;
  model?:     string;
}

export interface PipelineConfig {
  checkpointsEnabled: {
    afterPlanner:   boolean;
    afterArchitect: boolean;
    afterCoder:     boolean;
    afterTester:    boolean;
    afterReviewer:  boolean;
    beforeMerge:    boolean;
  };
  skippedAgents:       AgentName[];
  maxConcurrentAgents: number;
}

export interface AgentContextEntry {
  id:        number;
  ticketId:  string;
  key:       string;
  value:     unknown;
  agent:     AgentName;
  version:   number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineCheckpoint {
  id:         number;
  ticketId:   string;
  agent:      AgentName;
  status:     'pending' | 'approved' | 'rejected';
  output:     unknown;
  feedback:   string | null;
  createdAt:  Date;
  resolvedAt: Date | null;
}
