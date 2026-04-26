import { Router } from 'express';
import { projectFilesService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    const projectId = (req.params as { id: string }).id;
    const q = (req.query.q as string | undefined) ?? '';
    const result = await projectFilesService.list(projectId, q);
    sendJSON(res, result);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
