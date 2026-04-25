import { Router } from 'express';
import { activityService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.get('/ticket/:ticketId', async (req, res) => {
  try {
    const { actorType, actionType } = req.query as { actorType?: string; actionType?: string };
    const activities = await activityService.getForTicket(req.params.ticketId, {
      actorType: actorType as any,
      actionType,
    });
    sendJSON(res, activities);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/project/:projectId', async (req, res) => {
  try {
    const activities = await activityService.getForProject(req.params.projectId);
    sendJSON(res, activities);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/:id/revert', async (req, res) => {
  try {
    await activityService.revert(parseInt(req.params.id));
    sendJSON(res, { reverted: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

router.get('/export/:ticketId', async (req, res) => {
  try {
    const activities = await activityService.getForTicket(req.params.ticketId);
    sendJSON(res, activities);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/export/project/:projectId', async (req, res) => {
  try {
    const activities = await activityService.getForProject(req.params.projectId);
    sendJSON(res, activities);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
