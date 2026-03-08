import { Router, Request } from 'express';
import { commentRepo } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request<{ id: string }>, res) => {
  try {
    const comments = await commentRepo.findByTicket(req.params.id);
    sendJSON(res, comments);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/', async (req: Request<{ id: string }>, res) => {
  try {
    const { author, text } = req.body as { author: string; text: string };
    if (!author || !text) return sendError(res, 'author and text are required', 400);
    const comment = await commentRepo.create(req.params.id, author, text);
    sendJSON(res, comment, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

export default router;
