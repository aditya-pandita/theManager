import { create } from 'zustand';
import { api } from '../api/client';
import type { HookEvent } from '../types';

interface HookStore {
  hooks: HookEvent[];
  fetchHooks: () => Promise<void>;
  startPolling: () => () => void;
}

export const useHookStore = create<HookStore>((set) => ({
  hooks: [],

  async fetchHooks() {
    try {
      const hooks = await api.get<HookEvent[]>('/api/hooks');
      set({ hooks });
    } catch {
      // silently ignore
    }
  },

  startPolling() {
    const store = useHookStore.getState();
    store.fetchHooks();
    const interval = setInterval(() => useHookStore.getState().fetchHooks(), 5000);
    return () => clearInterval(interval);
  },
}));
