import { Router } from 'express';
import { testService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.get('/config', (_req, res) => {
  try {
    sendJSON(res, testService.getConfig());
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.put('/config', (req, res) => {
  try {
    const updated = testService.saveConfig(req.body);
    sendJSON(res, updated);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

router.get('/flaky', async (_req, res) => {
  try {
    const flaky = await testService.getFlaky();
    sendJSON(res, flaky);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:ticketId', async (req, res) => {
  try {
    const result = await testService.getLatest(req.params.ticketId);
    if (!result) return sendError(res, 'No test results found', 404);
    sendJSON(res, result);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:ticketId/history', async (req, res) => {
  try {
    const results = await testService.getHistory(req.params.ticketId);
    sendJSON(res, results);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/:ticketId/run', async (req, res) => {
  try {
    const result = await testService.run(req.params.ticketId, 'user');
    sendJSON(res, result);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:ticketId/coverage', async (req, res) => {
  try {
    const result = await testService.getLatest(req.params.ticketId);
    sendJSON(res, { coveragePercent: result?.coveragePercent ?? null, coverageDetail: result?.coverageDetail ?? null });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:ticketId/coverage/delta', async (req, res) => {
  try {
    const result = await testService.getLatest(req.params.ticketId);
    sendJSON(res, { coverageDelta: result?.coverageDelta ?? null });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:ticketId/files', async (req, res) => {
  try {
    const files = await testService.getFiles(req.params.ticketId);
    sendJSON(res, files);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
