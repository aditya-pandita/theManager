import { create } from 'zustand';
import type { Priority } from '../types';

type ActiveView = 'board' | 'hooks' | 'stats' | 'flows' | 'team';
type DetailTab = 'diff' | 'reasoning' | 'comments' | 'history' | 'media';

interface UiStore {
  activeView: ActiveView;
  searchQuery: string;
  filterPriority: Priority | null;
  filterTag: string | null;
  selectedTicketId: string | null;
  isCreateModalOpen: boolean;
  activeDetailTab: DetailTab;
  setActiveView: (view: ActiveView) => void;
  setSearchQuery: (q: string) => void;
  setFilterPriority: (p: Priority | null) => void;
  setFilterTag: (tag: string | null) => void;
  setSelectedTicketId: (id: string | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  setActiveDetailTab: (tab: DetailTab) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeView: 'board',
  searchQuery: '',
  filterPriority: null,
  filterTag: null,
  selectedTicketId: null,
  isCreateModalOpen: false,
  activeDetailTab: 'diff',
  setActiveView: (activeView) => set({ activeView }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  setFilterTag: (filterTag) => set({ filterTag }),
  setSelectedTicketId: (selectedTicketId) => set({ selectedTicketId }),
  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setActiveDetailTab: (activeDetailTab) => set({ activeDetailTab }),
}));
