import { create } from 'zustand';
import { api } from '../api/client';
import type { Ticket, Status } from '../types';

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  fetchTickets: (projectId?: string | null) => Promise<void>;
  addTicket: (input: Partial<Ticket> & { projectId?: string }) => Promise<Ticket>;
  updateTicket: (id: string, changes: Partial<Ticket>) => Promise<void>;
  moveTicket: (id: string, status: Status) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  loading: false,
  error: null,

  async fetchTickets(projectId?: string | null) {
    set({ loading: true, error: null });
    try {
      const qs = projectId ? `?projectId=${projectId}` : '';
      const tickets = await api.get<Ticket[]>(`/api/tickets${qs}`);
      set({ tickets, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  async addTicket(input) {
    const ticket = await api.post<Ticket>('/api/tickets', input);
    set((s) => ({ tickets: [ticket, ...s.tickets] }));
    return ticket;
  },

  async updateTicket(id, changes) {
    const updated = await api.put<Ticket>(`/api/tickets/${id}`, changes);
    // Merge: the server returns a flat row without relations — preserve existing ones
    set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...updated } : t)) }));
  },

  async moveTicket(id, status) {
    const updated = await api.put<Ticket>(`/api/tickets/${id}`, { status });
    // Merge: keep comments/changelog/diff/reasoning from existing ticket
    set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...updated } : t)) }));
  },

  async deleteTicket(id) {
    await api.delete(`/api/tickets/${id}`);
    set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) }));
  },
}));
