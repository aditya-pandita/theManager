import { Router } from 'express';
import { pipelineService, agentRunRepo, checkpointRepo } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.post('/run/:ticketId', async (req, res) => {
  try {
    const { ticketType } = req.body as { ticketType?: string };
    await pipelineService.run(req.params.ticketId, ticketType);
    sendJSON(res, { started: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/run-agent/:ticketId', async (req, res) => {
  try {
    const { agent } = req.body as { agent: string };
    if (!agent) return sendError(res, 'agent is required', 400);
    await pipelineService.runAgent(req.params.ticketId, agent as any);
    sendJSON(res, { started: true, agent });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/pause/:ticketId', async (req, res) => {
  try {
    await pipelineService.pause(req.params.ticketId);
    sendJSON(res, { paused: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/resume/:ticketId', async (req, res) => {
  try {
    await pipelineService.resume(req.params.ticketId);
    sendJSON(res, { resumed: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/reject/:ticketId', async (req, res) => {
  try {
    const { feedback } = req.body as { feedback: string };
    await pipelineService.reject(req.params.ticketId, feedback ?? '');
    sendJSON(res, { rejected: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/skip/:ticketId', async (req, res) => {
  try {
    await pipelineService.skip(req.params.ticketId);
    sendJSON(res, { skipped: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/approve/:ticketId', async (req, res) => {
  try {
    await pipelineService.approve(req.params.ticketId);
    sendJSON(res, { approved: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/status/:ticketId', async (req, res) => {
  try {
    const status = await pipelineService.getStatus(req.params.ticketId);
    sendJSON(res, status);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/checkpoints/:ticketId', async (req, res) => {
  try {
    const checkpoints = await checkpointRepo.findPendingByTicket(req.params.ticketId);
    sendJSON(res, checkpoints);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/timeline/:ticketId', async (req, res) => {
  try {
    const runs = await agentRunRepo.findByTicket(req.params.ticketId);
    sendJSON(res, runs);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

// SSE — real-time pipeline events
router.get('/events/:ticketId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
  };

  pipelineService.subscribe(req.params.ticketId, send);
  req.on('close', () => pipelineService.unsubscribe(req.params.ticketId, send));
});

export default router;
