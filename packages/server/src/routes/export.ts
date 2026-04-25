import { Router } from 'express';
import { generateMarkdown, generateHtml } from '@decidr-code/core';
import { sendError } from '../utils/http';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const format = (req.query.format as string) || 'markdown';
    const projectId = req.query.projectId as string | undefined;
    const ticketIds = req.query.ticketIds as string | undefined;
    const ids = ticketIds ? ticketIds.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

    const options = { format: format as 'markdown' | 'html', projectId, ticketIds: ids };

    if (format === 'html') {
      const html = await generateHtml(options);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="decidr-export.html"');
      return res.send(html);
    }

    const md = await generateMarkdown(options);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="decidr-export.md"');
    return res.send(md);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
});

export default router;
