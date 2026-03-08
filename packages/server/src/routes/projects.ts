import { Router } from 'express';
import { projectService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    sendJSON(res, await projectService.listProjects());
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/', async (req, res) => {
  try {
    const project = await projectService.createProject(req.body);
    sendJSON(res, project, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await projectService.getProject(req.params.id);
    if (!project) return sendError(res, 'Project not found', 404);
    sendJSON(res, project);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    sendJSON(res, project);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    sendJSON(res, { success: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
