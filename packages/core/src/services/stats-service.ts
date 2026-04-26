import { ticketRepo } from '../repositories/ticket-repo';
import type { StatsResult } from '../types/ticket';

export const statsService = {
  async getDashboard(projectId?: string | null): Promise<StatsResult> {
    return ticketRepo.getStats(projectId ?? undefined);
  },
};
