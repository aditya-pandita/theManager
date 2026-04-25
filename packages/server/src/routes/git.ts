import { Router, Request } from 'express';
import { gitService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.post('/branch', async (req, res) => {
  try {
    const { branch } = req.body as { branch: string };
    if (!branch) return sendError(res, 'branch required', 400);
    const result = await gitService.reportBranch(branch);
    if (!result) return sendError(res, 'Could not parse ticket from branch name', 400);
    sendJSON(res, result, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

router.post('/commit', async (req, res) => {
  try {
    const payload = req.body as {
      branch?: string;
      hash: string;
      abbrevHash?: string;
      message: string;
      author: string;
      authorEmail?: string;
      files?: string[];
      committedAt?: string;
    };
    if (!payload.hash || !payload.message || !payload.author) {
      return sendError(res, 'hash, message, author required', 400);
    }
    const result = await gitService.reportCommit(payload);
    if (!result) return sendJSON(res, { skipped: true, reason: 'already exists or no ticket match' });
    sendJSON(res, result, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

router.post('/merge', async (req, res) => {
  try {
    const { branch, mergedBy } = req.body as { branch: string; mergedBy?: string };
    if (!branch) return sendError(res, 'branch required', 400);
    const ok = await gitService.reportMerge({ branch, mergedBy });
    sendJSON(res, { success: ok });
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

export default router;
