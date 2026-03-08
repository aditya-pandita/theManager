import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { comments } from '../db/schema';
import type { Comment } from '../types/ticket';

export const commentRepo = {
  async create(ticketId: string, author: string, text: string): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({ ticketId, author, text })
      .returning();
    return comment as unknown as Comment;
  },

  async findByTicket(ticketId: string): Promise<Comment[]> {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.ticketId, ticketId))
      .orderBy(comments.createdAt);
    return result as unknown as Comment[];
  },
};
