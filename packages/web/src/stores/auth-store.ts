import { create } from 'zustand';
import { api } from '../api/client';

interface User { id: number; email: string; name: string; avatarColor: string; }
interface Workspace { id: string; name: string; slug: string; }
interface Member { id: number; workspaceId: string; userId: number; role: string; }

interface AuthStore {
  user:            User | null;
  workspace:       Workspace | null;
  member:          Member | null;
  token:           string | null;
  isAuthenticated: boolean;
  checking:        boolean;
  login:           (email: string, password: string) => Promise<void>;
  register:        (companyName: string, name: string, email: string, password: string) => Promise<void>;
  acceptInvite:    (token: string, name: string, password: string) => Promise<void>;
  logout:          () => void;
  fetchMe:         () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:            null,
  workspace:       null,
  member:          null,
  token:           localStorage.getItem('decidr_token'),
  isAuthenticated: false,
  checking:        true,

  async login(email, password) {
    const data = await api.post<any>('/api/auth/login', { email, password });
    localStorage.setItem('decidr_token', data.token);
    set({ user: data.user, workspace: data.workspace, member: data.member, token: data.token, isAuthenticated: true });
  },

  async register(companyName, yourName, email, password) {
    const data = await api.post<any>('/api/auth/register', { companyName, yourName, email, password });
    localStorage.setItem('decidr_token', data.token);
    set({ user: data.user, workspace: data.workspace, token: data.token, isAuthenticated: true });
  },

  async acceptInvite(token, name, password) {
    const data = await api.post<any>('/api/auth/accept-invite', { token, name, password });
    localStorage.setItem('decidr_token', data.token);
    set({ user: data.user, workspace: data.workspace, token: data.token, isAuthenticated: true });
  },

  logout() {
    localStorage.removeItem('decidr_token');
    set({ user: null, workspace: null, member: null, token: null, isAuthenticated: false });
  },

  async fetchMe() {
    const token = localStorage.getItem('decidr_token');
    if (!token) { set({ checking: false }); return; }
    try {
      const data = await api.get<any>('/api/auth/me');
      set({ user: data.user, workspace: data.workspace, member: data.member, isAuthenticated: true, checking: false });
    } catch {
      localStorage.removeItem('decidr_token');
      set({ user: null, workspace: null, token: null, isAuthenticated: false, checking: false });
    }
  },
}));
