import { useEffect, useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { NavTabs } from './components/layout/NavTabs';
import { Toolbar } from './components/layout/Toolbar';
import { Board } from './components/board/Board';
import { TicketDetail } from './components/ticket/TicketDetail';
import { CreateModal } from './components/create/CreateModal';
import { HooksPanel } from './components/hooks/HooksPanel';
import { StatsPanel } from './components/stats/StatsPanel';
import { FlowView } from './components/flow/FlowView';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { TeamPanel } from './components/team/TeamPanel';
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

  const refreshTickets = useCallback(() => {
    fetchTickets(activeProjectId);
  }, [activeProjectId, fetchTickets]);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects().then(() => setHasInitialized(true));
      fetchTickets(activeProjectId);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedTicketId) {
      const t = tickets.find((t) => t.id === selectedTicketId) ?? null;
      setSelectedTicket(t);
    } else {
      setSelectedTicket(null);
    }
  }, [selectedTicketId, tickets]);

  const handleTicketClick = (ticket: Ticket) => setSelectedTicketId(ticket.id);
  const handleClose = () => setSelectedTicketId(null);

  const handleMove = (id: string, status: Status) => {
    moveTicket(id, status);
    setSelectedTicketId(null);
  };

  const handleCreate = async (input: { title: string; description: string; priority: Priority; tags: string[] }) => {
    await addTicket(input);
  };

  // Auth check in progress
  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#475569', fontSize: '14px' }}>Loading…</div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) return <AuthScreen />;

  // Show onboarding when no projects exist OR user clicked New Project
  if ((hasInitialized && projects.length === 0) || showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          setShowOnboarding(false);
          fetchProjects();
          fetchTickets(null);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c10', color: '#e2e8f0', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <Header tickets={tickets} onProjectChange={(id) => fetchTickets(id)} onNewProject={() => setShowOnboarding(true)} />
      <NavTabs activeView={activeView} onViewChange={setActiveView} hookCount={hooks.length} />

      {activeView === 'board' && (
        <>
          <Toolbar search={searchQuery} filterPriority={filterPriority} filterTag={filterTag} onSearch={setSearchQuery} onFilter={setFilterPriority} onFilterTag={setFilterTag} onNewTicket={() => setCreateModalOpen(true)} onImportDone={refreshTickets} />
          <Board tickets={tickets} searchQuery={searchQuery} filterPriority={filterPriority} filterTag={filterTag} onTicketClick={handleTicketClick} />
        </>
      )}

      {activeView === 'hooks' && <HooksPanel />}
      {activeView === 'stats' && <StatsPanel />}
      {activeView === 'flows' && <FlowView />}
      {activeView === 'team'  && <TeamPanel />}

      {isCreateModalOpen && (
        <CreateModal onClose={() => setCreateModalOpen(false)} onCreate={handleCreate} />
      )}

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={handleClose}
          onMove={handleMove}
          onRefresh={refreshTickets}
        />
      )}
    </div>
  );
}
