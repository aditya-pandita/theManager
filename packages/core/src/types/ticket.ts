export type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Tag = 'bug' | 'feature' | 'refactor' | 'perf' | 'docs' | 'test' | 'style' | 'infra';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  folderPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewProject {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  folderPath?: string;
}

export interface UserStory {
  id: number;
  ticketId: string;
  role: string;
  want: string;
  benefit: string;
  acceptanceCriteria: string;
  files: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Diff {
  id: number;
  ticketId: string;
  filePath: string;
  beforeCode: string;
  afterCode: string;
  createdAt: Date;
}

export interface Comment {
  id: number;
  ticketId: string;
  author: string;
  text: string;
  createdAt: Date;
}

export interface ChangelogEntry {
  id: number;
  ticketId: string;
  action: string;
  author: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  project?: Project | null;
  diff?: Diff | null;
  reasoning?: import('./reasoning').Reasoning | null;
  userStory?: UserStory | null;
  gitBranches?: import('./git').GitBranch[];
  gitCommits?: import('./git').GitCommit[];
  comments?: Comment[];
  changelog?: ChangelogEntry[];
}

export interface NewTicket {
  title: string;
  projectId?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string[];
  diff?: { filePath: string; beforeCode: string; afterCode: string };
}

export interface StatsResult {
  total: number;
  byStatus: Partial<Record<Status, number>>;
  byPriority: Partial<Record<Priority, number>>;
  withReasoning: number;
  avgConfidence: number;
  totalReasoningTime: number;
}
