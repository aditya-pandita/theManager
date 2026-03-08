export type NodeType =
  | 'problem'
  | 'investigation'
  | 'discovery'
  | 'root_cause'
  | 'decision'
  | 'chosen'
  | 'rejected'
  | 'ruled_out';

export type Phase =
  | 'Intake'
  | 'Scan'
  | 'Research'
  | 'Analysis'
  | 'Architecture'
  | 'Alternatives'
  | 'Implementation'
  | 'Edge cases'
  | 'Validation';

export interface TreeNode {
  id: string;
  label: string;
  type: NodeType;
  detail?: string;
  children?: TreeNode[];
}

export interface LogEntry {
  step: number;
  phase: Phase;
  action: string;
  reasoning: string;
  durationMs: number;
}

export interface Reasoning {
  id: number;
  ticketId: string;
  summary: string;
  confidence: number;
  timeMs: number;
  tree: TreeNode;
  logs: LogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NewReasoning {
  summary: string;
  confidence: number;
  timeMs: number;
  tree: TreeNode;
  logs: LogEntry[];
}
