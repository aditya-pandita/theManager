import { Router, Request } from 'express';
import { userStoryRepo } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request<{ id: string }>, res) => {
  try {
    const story = await userStoryRepo.findByTicket(req.params.id);
    sendJSON(res, story ?? {});
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.put('/', async (req: Request<{ id: string }>, res) => {
  try {
    const story = await userStoryRepo.upsert(req.params.id, req.body);
    sendJSON(res, story);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

export default router;
