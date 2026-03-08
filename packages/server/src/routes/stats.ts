import { Router } from 'express';
import { statsService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const stats = await statsService.getDashboard();
    sendJSON(res, stats);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
