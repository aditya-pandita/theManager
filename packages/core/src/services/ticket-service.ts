import { ticketRepo } from '../repositories/ticket-repo';
import { changelogRepo } from '../repositories/changelog-repo';
import { fireHook } from '../hooks/runner';
import { EVENTS } from '../hooks/events';
import { COLUMNS } from '../constants/columns';
import { activityService } from '../activity/activity-service';
import type { Ticket, NewTicket, Status, Priority } from '../types/ticket';

const HOOKS_DIR = process.env.HOOKS_DIR ?? './hooks';

export const ticketService = {
  async createTicket(input: NewTicket): Promise<Ticket> {
    const ticket = await ticketRepo.create(input);
    await changelogRepo.append(ticket.id, 'Created ticket', 'system');
    await fireHook(EVENTS.TICKET_CREATED, { id: ticket.id, title: ticket.title }, HOOKS_DIR);
    activityService.log({ ticketId: ticket.id, projectId: ticket.projectId ?? undefined, actorType: 'system', actionType: 'ticket_created', payload: { title: ticket.title } }).catch(() => {});
    return ticket;
  },

  async updateTicket(
    id: string,
    changes: Partial<Pick<Ticket, 'title' | 'description' | 'status' | 'priority' | 'tags'>>
  ): Promise<Ticket> {
    const ticket = await ticketRepo.update(id, changes);
    await changelogRepo.append(id, `Updated: ${Object.keys(changes).join(', ')}`, 'system');
    if (changes.status) {
      const colLabel = COLUMNS.find((c) => c.id === changes.status)?.label ?? changes.status;
      await fireHook(EVENTS.TICKET_MOVED, { id, status: changes.status, label: colLabel }, HOOKS_DIR);
      activityService.log({ ticketId: id, actorType: 'system', actionType: 'ticket_moved', payload: { status: changes.status } }).catch(() => {});
    } else {
      activityService.log({ ticketId: id, actorType: 'system', actionType: 'ticket_edited', payload: { fields: Object.keys(changes) } }).catch(() => {});
    }
    await fireHook(EVENTS.POST_SAVE, { id }, HOOKS_DIR);
    return ticket;
  },

  async moveTicket(id: string, newStatus: Status): Promise<Ticket> {
    const colLabel = COLUMNS.find((c) => c.id === newStatus)?.label ?? newStatus;
    const ticket = await ticketRepo.update(id, { status: newStatus });
    await changelogRepo.append(id, `Moved to ${colLabel}`, 'system');
    await fireHook(EVENTS.TICKET_MOVED, { id, status: newStatus, label: colLabel }, HOOKS_DIR);
    activityService.log({ ticketId: id, actorType: 'system', actionType: 'ticket_moved', payload: { status: newStatus, label: colLabel } }).catch(() => {});
    return ticket;
  },

  async deleteTicket(id: string): Promise<void> {
    await ticketRepo.delete(id);
    await fireHook(EVENTS.TICKET_DELETED, { id }, HOOKS_DIR);
    activityService.log({ ticketId: id, actorType: 'system', actionType: 'ticket_deleted', payload: { id } }).catch(() => {});
  },

  async getBoard(): Promise<Record<Status, Ticket[]>> {
    const all = await ticketRepo.findAll();
    return all.reduce(
      (board, ticket) => {
        const col = ticket.status as Status;
        if (!board[col]) board[col] = [];
        board[col].push(ticket);
        return board;
      },
      {} as Record<Status, Ticket[]>
    );
  },

  async getTicketDetail(id: string): Promise<Ticket | null> {
    return ticketRepo.findById(id);
  },

  async listTickets(filters?: { status?: Status; priority?: Priority; search?: string; projectId?: string }): Promise<Ticket[]> {
    return ticketRepo.findAll(filters);
  },
};
