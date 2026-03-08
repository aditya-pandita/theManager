import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { projects } from '../db/schema';
import type { Project, NewProject } from '../types/ticket';
import { generateId } from '../utils/id';
import { now } from '../utils/timestamp';

export const projectRepo = {
  async create(input: NewProject): Promise<Project> {
    const id = input.id ?? `PROJ-${generateId().slice(3)}`;
    const [project] = await db
      .insert(projects)
      .values({
        id,
        name: input.name,
        description: input.description ?? null,
        color: input.color ?? '#3B82F6',
        folderPath: input.folderPath ?? null,
      })
      .returning();
    return project as unknown as Project;
  },

  async findAll(): Promise<Project[]> {
    const result = await db.select().from(projects).orderBy(projects.createdAt);
    return result as unknown as Project[];
  },

  async findById(id: string): Promise<Project | null> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return (result[0] as unknown as Project) ?? null;
  },

  async update(id: string, changes: Partial<Pick<Project, 'name' | 'description' | 'color' | 'folderPath'>>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...changes, updatedAt: now() })
      .where(eq(projects.id, id))
      .returning();
    return updated as unknown as Project;
  },

  async delete(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  },
};
