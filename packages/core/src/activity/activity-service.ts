import { activityRepo } from '../repositories/activity-repo';
import type { Activity, NewActivity, ActivityFilters } from '../types/activity';

export const activityService = {
  async log(entry: NewActivity): Promise<Activity> {
    return activityRepo.create(entry);
  },

  async getForTicket(ticketId: string, filters?: ActivityFilters): Promise<Activity[]> {
    return activityRepo.findByTicket(ticketId, filters);
  },

  async getForProject(projectId: string, filters?: ActivityFilters): Promise<Activity[]> {
    return activityRepo.findByProject(projectId, filters);
  },

  async revert(activityId: number): Promise<void> {
    const activity = await activityRepo.findById(activityId);
    if (!activity) throw new Error('Activity not found');
    if (activity.isImmutable) throw new Error('Activity is immutable and cannot be reverted');

    await activityRepo.create({
      ticketId:     activity.ticketId ?? undefined,
      projectId:    activity.projectId ?? undefined,
      actorType:    'user',
      actionType:   'reverted',
      payload:      { revertedActivityId: activityId },
      afterSnapshot: activity.beforeSnapshot,
    });
  },
};
