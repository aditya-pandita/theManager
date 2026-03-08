import { useEffect, useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { NavTabs } from './components/layout/NavTabs';
import { Toolbar } from './components/layout/Toolbar';
import { Board } from './components/board/Board';
import { TicketDetail } from './components/ticket/TicketDetail';
import { CreateModal } from './components/create/CreateModal';
import { HooksPanel } from './components/hooks/HooksPanel';
import { StatsPanel } from './components/stats/StatsPanel';
import { useTicketStore } from './stores/ticket-store';
import { useUiStore } from './stores/ui-store';
import { useHookStore } from './stores/hook-store';
import { useProjectStore } from './stores/project-store';
import type { Ticket, Status, Priority } from './types';

export default function App() {
  const { tickets, fetchTickets, addTicket, moveTicket } = useTicketStore();
  const { activeView, searchQuery, filterPriority, selectedTicketId, isCreateModalOpen, setActiveView, setSearchQuery, setFilterPriority, setSelectedTicketId, setCreateModalOpen } = useUiStore();
  const { hooks } = useHookStore();
  const { activeProjectId, fetchProjects } = useProjectStore();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const refreshTickets = useCallback(() => {
    fetchTickets(activeProjectId);
  }, [activeProjectId, fetchTickets]);

  useEffect(() => {
    fetchProjects();
    fetchTickets(activeProjectId);
  }, []);

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

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c10', color: '#e2e8f0', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <Header tickets={tickets} onProjectChange={(id) => fetchTickets(id)} />
      <NavTabs activeView={activeView} onViewChange={setActiveView} hookCount={hooks.length} />

      {activeView === 'board' && (
        <>
          <Toolbar search={searchQuery} filterPriority={filterPriority} onSearch={setSearchQuery} onFilter={setFilterPriority} onNewTicket={() => setCreateModalOpen(true)} onImportDone={refreshTickets} />
          <Board tickets={tickets} searchQuery={searchQuery} filterPriority={filterPriority} onTicketClick={handleTicketClick} />
        </>
      )}

      {activeView === 'hooks' && <HooksPanel />}
      {activeView === 'stats' && <StatsPanel />}

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
