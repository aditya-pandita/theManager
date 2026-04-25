import { create } from 'zustand';
import type { Priority } from '../types';

type ActiveView = 'board' | 'hooks' | 'stats' | 'flows';
type DetailTab = 'diff' | 'reasoning' | 'comments' | 'history' | 'media';

interface UiStore {
  activeView: ActiveView;
  searchQuery: string;
  filterPriority: Priority | null;
  selectedTicketId: string | null;
  isCreateModalOpen: boolean;
  activeDetailTab: DetailTab;
  setActiveView: (view: ActiveView) => void;
  setSearchQuery: (q: string) => void;
  setFilterPriority: (p: Priority | null) => void;
  setSelectedTicketId: (id: string | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  setActiveDetailTab: (tab: DetailTab) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeView: 'board',
  searchQuery: '',
  filterPriority: null,
  selectedTicketId: null,
  isCreateModalOpen: false,
  activeDetailTab: 'diff',
  setActiveView: (activeView) => set({ activeView }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  setSelectedTicketId: (selectedTicketId) => set({ selectedTicketId }),
  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setActiveDetailTab: (activeDetailTab) => set({ activeDetailTab }),
}));
