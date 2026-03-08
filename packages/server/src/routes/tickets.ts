import { Router } from 'express';
import { ticketService } from '@decidr-code/core';
import type { Status, Priority } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, priority, search, projectId } = req.query as {
      status?: Status;
      priority?: Priority;
      search?: string;
      projectId?: string;
    };
    const tickets = await ticketService.listTickets({ status, priority, search, projectId });
    sendJSON(res, tickets);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await ticketService.getTicketDetail(req.params.id);
    if (!ticket) return sendError(res, 'Ticket not found', 404);
    sendJSON(res, ticket);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/', async (req, res) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    sendJSON(res, ticket, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body);
    sendJSON(res, ticket);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ticketService.deleteTicket(req.params.id);
    sendJSON(res, { success: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
