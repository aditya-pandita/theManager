import { Router } from 'express';
import { projectService, projectBootstrapService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

// POST /api/bootstrap/project
// Creates project in DB + initializes decidr/ folder structure on disk
router.post('/project', async (req, res) => {
  const { name, description, color, folderPath, gitRepoUrl } = req.body as {
    name: string;
    description?: string;
    color?: string;
    folderPath: string;
    gitRepoUrl?: string;
  };

  if (!name?.trim())       return sendError(res, 'Project name is required', 400);
  if (!folderPath?.trim()) return sendError(res, 'Folder path is required', 400);

  let project: Awaited<ReturnType<typeof projectService.createProject>> | null = null;

  try {
    project = await projectService.createProject({ name, description, color, folderPath, gitRepoUrl });
    projectBootstrapService.initFolder(folderPath, project.id, project.name);
    sendJSON(res, project, 201);
  } catch (err: unknown) {
    // If folder init failed after project was created, delete the orphan project
    if (project) {
      try { await projectService.deleteProject(project.id); } catch {}
    }
    sendError(res, (err as Error).message);
  }
});

// POST /api/bootstrap/document
// Parses PRD/SRS document and creates tickets (no pipeline auto-start)
router.post('/document', async (req, res) => {
  const { projectId, document } = req.body as { projectId: string; document: string };

  if (!projectId?.trim()) return sendError(res, 'projectId is required', 400);
  if (!document?.trim())  return sendError(res, 'document is required', 400);

  try {
    const ticketIds = await projectBootstrapService.bootstrapFromDocument(projectId, document);
    sendJSON(res, { tickets: ticketIds }, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
