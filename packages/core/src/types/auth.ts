export interface User {
  id: number;
  email: string;
  name: string;
  avatarColor: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: number;
  createdAt: Date;
}

export interface WorkspaceMember {
  id: number;
  workspaceId: string;
  userId: number;
  role: 'owner' | 'manager' | 'member';
  joinedAt: Date;
  user?: User;
}

export interface Invite {
  id: number;
  workspaceId: string;
  email: string;
  role: 'owner' | 'manager' | 'member';
  token: string;
  invitedBy: number;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface AuthToken {
  userId: number;
  workspaceId: string;
  role: 'owner' | 'manager' | 'member';
}
