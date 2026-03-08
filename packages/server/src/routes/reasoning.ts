import { Router, Request } from 'express';
import { reasoningService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request<{ id: string }>, res) => {
  try {
    const r = await reasoningService.getReasoning(req.params.id);
    if (!r) return sendError(res, 'No reasoning found', 404);
    sendJSON(res, r);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.put('/', async (req: Request<{ id: string }>, res) => {
  try {
    const r = await reasoningService.saveReasoning(req.params.id, req.body);
    sendJSON(res, r);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

export default router;
