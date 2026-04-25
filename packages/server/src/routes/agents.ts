import { Router } from 'express';
import { agentRegistry, agentRunRepo } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.get('/', (_req, res) => {
  try {
    sendJSON(res, agentRegistry.listAll());
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/metrics', async (_req, res) => {
  try {
    const metrics = await agentRunRepo.getMetrics();
    const allRuns = await Promise.all(
      ['planner','architect','coder','reviewer','tester','debugger','docs'].map(async (a) => {
        const m = metrics[a] ?? { runs: 0, successes: 0, failures: 0, avgDurationMs: 0 };
        return [a, { ...m, retryRate: m.runs > 0 ? m.failures / m.runs : 0 }];
      })
    );
    sendJSON(res, { agents: Object.fromEntries(allRuns) });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:name/config', (req, res) => {
  try {
    const config = agentRegistry.getConfig(req.params.name as any);
    sendJSON(res, config);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 404);
  }
});

router.put('/:name/config', (req, res) => {
  try {
    const updated = agentRegistry.updateConfig(req.params.name as any, req.body);
    sendJSON(res, updated);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

export default router;
