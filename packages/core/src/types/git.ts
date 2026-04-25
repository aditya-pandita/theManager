export interface GitBranch {
  id: number;
  ticketId: string;
  storyId: string | null;
  branchName: string;
  baseBranch: string;
  status: 'open' | 'merged' | 'stale' | 'deleted';
  aheadCount: number;
  behindCount: number;
  createdAt: Date;
  mergedAt: Date | null;
  mergedBy: string | null;
}

export interface GitCommit {
  id: number;
  ticketId: string;
  branchId: number | null;
  hash: string;
  abbrevHash: string;
  message: string;
  authorName: string;
  authorEmail: string | null;
  filesAdded: string[];
  filesModified: string[];
  filesDeleted: string[];
  insertions: number;
  deletions: number;
  committedAt: Date;
  createdAt: Date;
}
