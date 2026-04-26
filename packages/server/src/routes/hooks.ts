import { Router } from 'express';
import { hookRepo } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) ?? '100', 10);
    const projectId = (req.query.projectId as string | undefined) ?? null;
    const events = await hookRepo.getRecent(limit, projectId);
    sendJSON(res, events);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
