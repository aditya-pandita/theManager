import { projectRepo } from '../repositories/project-repo';
import type { Project, NewProject } from '../types/ticket';

export const projectService = {
  async createProject(input: NewProject): Promise<Project> {
    return projectRepo.create(input);
  },

  async listProjects(): Promise<Project[]> {
    return projectRepo.findAll();
  },

  async getProject(id: string): Promise<Project | null> {
    return projectRepo.findById(id);
  },

  async updateProject(
    id: string,
    changes: Partial<Pick<Project, 'name' | 'description' | 'color'>>
  ): Promise<Project> {
    return projectRepo.update(id, changes);
  },

  async deleteProject(id: string): Promise<void> {
    return projectRepo.delete(id);
  },
};
