import { useEffect, useState, useCallback } from 'react';
import { Board } from './components/board/Board';
import { ListView } from './components/board/ListView';
import { TicketDetail } from './components/ticket/TicketDetail';
import { CreateModal } from './components/create/CreateModal';
import { HooksPanel } from './components/hooks/HooksPanel';
import { StatsPanel } from './components/stats/StatsPanel';
import { FlowView } from './components/flow/FlowView';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { TeamPanel } from './components/team/TeamPanel';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BoardHeader } from './components/layout/BoardHeader';
import { useTicketStore } from './stores/ticket-store';
import { useUiStore } from './stores/ui-store';
import { useHookStore } from './stores/hook-store';
import { useProjectStore } from './stores/project-store';
import { useAuthStore } from './stores/auth-store';
import type { Ticket, Status, Priority } from './types';

export default function App() {
  const { tickets, fetchTickets, addTicket, moveTicket } = useTicketStore();
  const { activeView, searchQuery, filterPriority, filterTag, selectedTicketId, isCreateModalOpen, setActiveView, setSearchQuery, setFilterPriority, setFilterTag, setSelectedTicketId, setCreateModalOpen } = useUiStore();
  const { hooks } = useHookStore();
  const { projects, activeProjectId, fetchProjects } = useProjectStore();
  const { isAuthenticated, checking, fetchMe } = useAuthStore();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const refreshTickets = useCallback(() => { fetchTickets(activeProjectId); }, [activeProjectId, fetchTickets]);

  useEffect(() => { fetchMe(); }, []);

  // Fetch the project list once after the user authenticates.
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects().then(() => setHasInitialized(true));
    }
  }, [isAuthenticated]);

  // Refetch the board's tickets whenever the selected project changes.
  // Without this, clicking a project in the Sidebar updates the highlight
  // but the board keeps showing the previously-fetched ticket list (which
  // was the bug: Portfolio view was showing all 47 tickets including F1).
  useEffect(() => {
    if (isAuthenticated) fetchTickets(activeProjectId);
  }, [isAuthenticated, activeProjectId]);

  useEffect(() => {
    if (selectedTicketId) setSelectedTicket(tickets.find((t) => t.id === selectedTicketId) ?? null);
    else setSelectedTicket(null);
  }, [selectedTicketId, tickets]);

  const handleTicketClick = (t: Ticket) => setSelectedTicketId(t.id);
  const handleClose = () => setSelectedTicketId(null);
  const handleMove = (id: string, status: Status) => { moveTicket(id, status); setSelectedTicketId(null); };
  const handleCreate = async (input: { title: string; description: string; priority: Priority; tags: string[]; projectId: string | null }) => {
    await addTicket({ ...input, projectId: input.projectId ?? undefined });
    // Refetch the board if the new ticket landed in the currently-active project so it shows immediately.
    if (input.projectId === activeProjectId) fetchTickets(activeProjectId);
  };

  if (checking) {
    return <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#94a3b8' }}>Loading…</div></div>;
  }

  if (!isAuthenticated) return <AuthScreen />;

  if ((hasInitialized && projects.length === 0) || showOnboarding) {
    return <OnboardingScreen onComplete={() => { setShowOnboarding(false); fetchProjects(); fetchTickets(null); }} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter','DM Sans',system-ui,sans-serif", color: '#1e293b' }}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} onNewProject={() => setShowOnboarding(true)} hookCount={hooks.length} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar tickets={tickets} onProjectChange={(id) => fetchTickets(id)} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeView === 'board' && (
            <>
              <BoardHeader search={searchQuery} filterPriority={filterPriority} filterTag={filterTag} viewMode={viewMode} onViewModeChange={setViewMode} onSearch={setSearchQuery} onFilter={setFilterPriority} onFilterTag={setFilterTag} onNewTicket={() => setCreateModalOpen(true)} onImportDone={refreshTickets} ticketCount={tickets.length} />
              {viewMode === 'board'
                ? <Board tickets={tickets} searchQuery={searchQuery} filterPriority={filterPriority} filterTag={filterTag} onTicketClick={handleTicketClick} />
                : <ListView tickets={tickets.filter(t => { if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false; if (filterPriority && t.priority !== filterPriority) return false; if (filterTag && !t.tags.includes(filterTag)) return false; return true; })} onTicketClick={handleTicketClick} />
              }
            </>
          )}
          {activeView === 'hooks' && <div style={{ padding: '28px' }}><HooksPanel /></div>}
          {activeView === 'stats' && <div style={{ padding: '28px' }}><StatsPanel /></div>}
          {activeView === 'flows' && <div style={{ padding: '28px' }}><FlowView /></div>}
          {activeView === 'team'  && <div style={{ padding: '28px' }}><TeamPanel /></div>}
        </div>
      </div>
      {isCreateModalOpen && <CreateModal onClose={() => setCreateModalOpen(false)} onCreate={handleCreate} />}
      {selectedTicket && <TicketDetail ticket={selectedTicket} onClose={handleClose} onMove={handleMove} onRefresh={refreshTickets} />}
    </div>
  );
}
