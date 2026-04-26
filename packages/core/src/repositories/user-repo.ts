import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users } from '../db/schema';
import type { User } from '../types/auth';

export const userRepo = {
  async create(email: string, name: string, passwordHash: string, avatarColor?: string): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({ email, name, passwordHash, avatarColor: avatarColor ?? '#3B82F6' })
      .returning();
    return row as unknown as User;
  },

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return (row as unknown as User & { passwordHash: string }) ?? null;
  },

  async findById(id: number): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return (row as unknown as User) ?? null;
  },

  async updateAvatarColor(id: number, avatarColor: string): Promise<User> {
    const [row] = await db
      .update(users)
      .set({ avatarColor })
      .where(eq(users.id, id))
      .returning();
    return row as unknown as User;
  },
};
