export type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Diff {
  id?: number;
  ticketId?: string;
  file?: string;
  filePath?: string;
  beforeCode?: string;
  afterCode?: string;
  before?: string;
  after?: string;
}

export interface Comment {
  id?: number;
  by?: string;
  author?: string;
  text: string;
  ts?: string;
  createdAt?: string;
}

export interface ChangelogEntry {
  id?: number;
  action: string;
  by?: string;
  author?: string;
  ts?: string;
  createdAt?: string;
}

export interface TreeNode {
  id: string;
  label: string;
  type: string;
  detail?: string;
  children?: TreeNode[];
}

export interface LogEntry {
  step: number;
  phase: string;
  action: string;
  reasoning: string;
  durationMs: number;
}

export interface Reasoning {
  id?: number;
  summary: string;
  confidence: number;
  timeMs: number;
  tree: TreeNode;
  logs: LogEntry[];
}

export interface GitBranch {
  id: number;
  ticketId: string;
  storyId?: string | null;
  branchName: string;
  baseBranch: string;
  status: 'open' | 'merged' | 'stale' | 'deleted';
  aheadCount: number;
  behindCount: number;
  mergedAt?: string | null;
  mergedBy?: string | null;
}

export interface GitCommit {
  id: number;
  ticketId: string;
  branchId?: number | null;
  hash: string;
  abbrevHash: string;
  message: string;
  authorName: string;
  authorEmail?: string | null;
  filesAdded?: string[];
  filesModified?: string[];
  filesDeleted?: string[];
  insertions: number;
  deletions: number;
  committedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  folderPath?: string | null;
  createdAt?: string;
}

export interface UserStory {
  id?: number;
  ticketId?: string;
  role: string;
  want: string;
  benefit: string;
  acceptanceCriteria: string;
  files: string[];
}

export interface Ticket {
  id: string;
  projectId?: string | null;
  project?: Project | null;
  title: string;
  description?: string | null;
  status: Status;
  priority: Priority;
  tags: string[];
  diff?: Diff | null;
  reasoning?: Reasoning | null;
  userStory?: UserStory | null;
  gitBranches?: GitBranch[];
  gitCommits?: GitCommit[];
  comments: Comment[];
  changelog: ChangelogEntry[];
  media?: unknown[];
  created?: string;
  createdAt?: string;
}

export interface StatsData {
  total: number;
  byStatus: Partial<Record<Status, number>>;
  byPriority: Partial<Record<Priority, number>>;
  withReasoning: number;
  avgConfidence: number;
  totalReasoningTime: number;
}

export interface HookEvent {
  id: number;
  event: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}
