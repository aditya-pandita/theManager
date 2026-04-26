import { create } from 'zustand';
import { api } from '../api/client';

export interface WorkspaceMember {
  id: number;
  workspaceId: string;
  userId: number;
  role: string;
  joinedAt: string;
  user: { id: number; name: string; email: string; avatarColor: string };
}

interface MemberStore {
  members: WorkspaceMember[];
  loading: boolean;
  fetchMembers: () => Promise<void>;
}

export const useMemberStore = create<MemberStore>((set) => ({
  members: [],
  loading: false,

  async fetchMembers() {
    set({ loading: true });
    try {
      const members = await api.get<WorkspaceMember[]>('/api/workspace/members');
      set({ members, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
