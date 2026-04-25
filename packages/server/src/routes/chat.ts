import { Router } from 'express';
import { chatService, chatMessageRepo } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router({ mergeParams: true });

router.get('/:id/chat', async (req, res) => {
  try {
    const messages = await chatService.getHistory(req.params.id);
    sendJSON(res, messages);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:id/chat/:threadId', async (req, res) => {
  try {
    const messages = await chatService.getThread(req.params.threadId);
    sendJSON(res, messages);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/:id/chat', async (req, res) => {
  try {
    const { content, threadId } = req.body as { content: string; threadId?: string };
    if (!content) return sendError(res, 'content is required', 400);
    const message = await chatService.send(req.params.id, content, threadId);
    sendJSON(res, message, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/:id/chat/replay/:messageId', async (req, res) => {
  try {
    const original = await chatService.getById(parseInt(req.params.messageId));
    if (!original || original.role !== 'user') return sendError(res, 'Message not found', 404);
    const message = await chatService.send(req.params.id, original.content, original.threadId ?? undefined);
    sendJSON(res, message, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:id/chat/templates', (req, res) => {
  sendJSON(res, [
    { label: 'Plan this ticket', command: '@planner break this down into tasks' },
    { label: 'Design the solution', command: '@architect propose a design for this' },
    { label: 'Implement it', command: '@coder implement this ticket' },
    { label: 'Run tests', command: '/run-tests' },
    { label: 'Review code', command: '/review' },
    { label: 'Explain decisions', command: '/explain' },
    { label: 'Debug failures', command: '@debugger analyze the failing tests' },
    { label: 'Update docs', command: '@docs update documentation for these changes' },
  ]);
});

export default router;
