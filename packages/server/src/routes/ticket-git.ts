import { Router, Request } from 'express';
import { gitService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request<{ id: string }>, res) => {
  try {
    const data = await gitService.getTicketGitData(req.params.id);
    sendJSON(res, data);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/branch', async (req: Request<{ id: string }>, res) => {
  try {
    const { name, branchName } = req.body as { name?: string; branchName?: string };
    if (branchName) {
      const branch = await gitService.linkBranch(req.params.id, branchName);
      if (!branch) return sendError(res, 'Ticket not found or branch already linked', 400);
      sendJSON(res, branch, 201);
    } else if (name) {
      const branch = await gitService.createBranchForTicket(req.params.id, name);
      if (!branch) return sendError(res, 'Ticket not found', 400);
      sendJSON(res, branch, 201);
    } else {
      return sendError(res, 'name or branchName required', 400);
    }
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

export default router;
