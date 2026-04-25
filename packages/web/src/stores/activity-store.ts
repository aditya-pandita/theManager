import { create } from 'zustand';
import { api } from '../api/client';

interface ActivityStore {
  activities: any[];
  fetchForTicket: (ticketId: string) => Promise<void>;
  fetchForProject: (projectId: string) => Promise<void>;
  revert: (activityId: number) => Promise<void>;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],

  async fetchForTicket(ticketId) {
    try {
      const activities = await api.get<any[]>(`/api/activity/ticket/${ticketId}`);
      set({ activities });
    } catch {}
  },

  async fetchForProject(projectId) {
    try {
      const activities = await api.get<any[]>(`/api/activity/project/${projectId}`);
      set({ activities });
    } catch {}
  },

  async revert(activityId) {
    await api.post(`/api/activity/${activityId}/revert`, {});
  },
}));
