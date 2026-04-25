import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { chatMessages } from '../db/schema';
import type { ChatMessage, NewChatMessage } from '../types/activity';

export const chatMessageRepo = {
  async create(input: NewChatMessage): Promise<ChatMessage> {
    const [row] = await db
      .insert(chatMessages)
      .values(input)
      .returning();
    return row as unknown as ChatMessage;
  },

  async findByTicket(ticketId: string): Promise<ChatMessage[]> {
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.ticketId, ticketId))
      .orderBy(chatMessages.createdAt);
    return rows as unknown as ChatMessage[];
  },

  async findByThread(threadId: string): Promise<ChatMessage[]> {
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(chatMessages.createdAt);
    return rows as unknown as ChatMessage[];
  },

  async findById(id: number): Promise<ChatMessage | null> {
    const [row] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, id))
      .limit(1);
    return (row as unknown as ChatMessage) ?? null;
  },
};
