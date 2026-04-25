import { create } from 'zustand';
import { api } from '../api/client';

interface PipelineStore {
  pipelineState: string;
  currentAgent: string | null;
  isPaused: boolean;
  isLocked: boolean;
  agentRuns: any[];
  pendingCheckpoints: any[];
  sseSource: EventSource | null;
  fetchAgentRuns: (ticketId: string) => Promise<void>;
  runPipeline: (ticketId: string, ticketType?: string) => Promise<void>;
  pausePipeline: (ticketId: string) => Promise<void>;
  resumePipeline: (ticketId: string) => Promise<void>;
  skipAgent: (ticketId: string) => Promise<void>;
  approveCheckpoint: (ticketId: string) => Promise<void>;
  rejectCheckpoint: (ticketId: string, feedback: string) => Promise<void>;
  lockTicket: (ticketId: string, locked: boolean) => Promise<void>;
  connectSSE: (ticketId: string) => void;
  disconnectSSE: () => void;
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  pipelineState: 'idle',
  currentAgent: null,
  isPaused: false,
  isLocked: false,
  agentRuns: [],
  pendingCheckpoints: [],
  sseSource: null,

  async fetchAgentRuns(ticketId) {
    try {
      const [runs, status] = await Promise.all([
        api.get<any[]>(`/api/pipeline/timeline/${ticketId}`),
        api.get<any>(`/api/pipeline/status/${ticketId}`),
      ]);
      set({ agentRuns: runs, pipelineState: status.pipelineState ?? 'idle', currentAgent: status.currentAgent ?? null, isPaused: status.isPaused ?? false, isLocked: status.isLocked ?? false });
    } catch {}
  },

  async runPipeline(ticketId, ticketType) {
    await api.post(`/api/pipeline/run/${ticketId}`, { ticketType });
    set({ pipelineState: 'running' });
  },

  async pausePipeline(ticketId) {
    await api.post(`/api/pipeline/pause/${ticketId}`, {});
    set({ isPaused: true, pipelineState: 'paused' });
  },

  async resumePipeline(ticketId) {
    await api.post(`/api/pipeline/resume/${ticketId}`, {});
    set({ isPaused: false, pipelineState: 'running' });
  },

  async skipAgent(ticketId) {
    await api.post(`/api/pipeline/skip/${ticketId}`, {});
  },

  async approveCheckpoint(ticketId) {
    await api.post(`/api/pipeline/approve/${ticketId}`, {});
  },

  async rejectCheckpoint(ticketId, feedback) {
    await api.post(`/api/pipeline/reject/${ticketId}`, { feedback });
  },

  async lockTicket(ticketId, locked) {
    await api.put(`/api/tickets/${ticketId}/lock`, { locked });
    set({ isLocked: locked });
  },

  connectSSE(ticketId) {
    get().disconnectSSE();
    const source = new EventSource(`/api/pipeline/events/${ticketId}`);
    source.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === 'agent:completed' || event.type === 'agent:started' || event.type === 'agent:failed') {
          get().fetchAgentRuns(ticketId);
        }
        if (event.type?.startsWith('pipeline:')) {
          set({ pipelineState: event.type.replace('pipeline:', '') });
        }
        if (event.agent) set({ currentAgent: event.agent });
      } catch {}
    };
    set({ sseSource: source });
  },

  disconnectSSE() {
    get().sseSource?.close();
    set({ sseSource: null });
  },
}));
