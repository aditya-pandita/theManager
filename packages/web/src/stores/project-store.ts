import { create } from 'zustand';
import { api } from '../api/client';
import type { Project } from '../types';

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (input: { name: string; description?: string; color?: string; folderPath?: string }) => Promise<Project>;
  setActiveProject: (id: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  loading: false,

  async fetchProjects() {
    set({ loading: true });
    try {
      const projects = await api.get<Project[]>('/api/projects');
      set({ projects, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  async createProject(input) {
    const project = await api.post<Project>('/api/projects', input);
    set((s) => ({ projects: [...s.projects, project] }));
    return project;
  },

  setActiveProject(id) {
    set({ activeProjectId: id });
    // Notify ticket store to re-fetch with new project filter
    get(); // trigger reactivity
  },
}));
