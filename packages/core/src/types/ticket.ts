export type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Tag = 'bug' | 'feature' | 'refactor' | 'perf' | 'docs' | 'test' | 'style' | 'infra';

export interface Project {
  id: string;
  workspaceId: string | null;
  name: string;
  description: string | null;
  color: string;
  folderPath: string | null;
  gitRepoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewProject {
  id?: string;
  workspaceId?: string;
  name: string;
  description?: string;
  color?: string;
  folderPath?: string;
  gitRepoUrl?: string;
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
  workspaceId: string | null;
  assignedTo: number | null;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  project?: Project | null;
  assignedUser?: import('./auth').User | null;
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
  workspaceId?: string;
  assignedTo?: number;
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
