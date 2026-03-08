import { reasoningRepo } from '../repositories/reasoning-repo';
import type { Reasoning, NewReasoning, TreeNode } from '../types/reasoning';

function validateTree(node: unknown): node is TreeNode {
  if (!node || typeof node !== 'object') return false;
  const n = node as Record<string, unknown>;
  return typeof n.id === 'string' && typeof n.label === 'string' && typeof n.type === 'string';
}

export const reasoningService = {
  async saveReasoning(ticketId: string, input: NewReasoning): Promise<Reasoning> {
    if (!validateTree(input.tree)) {
      throw new Error('Invalid reasoning tree structure');
    }
    if (input.confidence < 0 || input.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
    return reasoningRepo.upsert(ticketId, input);
  },

  async getReasoning(ticketId: string): Promise<Reasoning | null> {
    return reasoningRepo.findByTicket(ticketId);
  },
};
