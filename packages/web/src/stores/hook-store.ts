import { create } from 'zustand';
import { api } from '../api/client';
import type { HookEvent } from '../types';

interface HookStore {
  hooks: HookEvent[];
  fetchHooks: (projectId?: string | null) => Promise<void>;
  startPolling: (projectId?: string | null) => () => void;
}

export const useHookStore = create<HookStore>((set) => ({
  hooks: [],

  async fetchHooks(projectId) {
    try {
      const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const hooks = await api.get<HookEvent[]>(`/api/hooks${qs}`);
      set({ hooks });
    } catch {
      // silently ignore
    }
  },

  startPolling(projectId) {
    const store = useHookStore.getState();
    store.fetchHooks(projectId);
    const interval = setInterval(() => useHookStore.getState().fetchHooks(projectId), 5000);
    return () => clearInterval(interval);
  },
}));
