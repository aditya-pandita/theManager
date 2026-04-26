import { Router } from 'express';
import { flowService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const projectId = (req.query.projectId as string | undefined) ?? null;
    const flows = await flowService.getFlows(projectId);
    sendJSON(res, flows);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
