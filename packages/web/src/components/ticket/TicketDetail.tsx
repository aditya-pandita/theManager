import { useState } from 'react';
import { TicketHeader } from './TicketHeader';
import { TabBar } from './TabBar';
import { DiffView } from './DiffView';
import { ProcessButton } from './ProcessButton';
import { CommentList } from './CommentList';
import { CommentInput } from './CommentInput';
import { HistoryTimeline } from './HistoryTimeline';
import { MediaDrop } from './MediaDrop';
import { UserStoryTab } from './UserStoryTab';
import { ReasoningTab } from '../reasoning/ReasoningTab';
import { api } from '../../api/client';
import type { Ticket, Status } from '../../types';

type TabId = 'story' | 'diff' | 'reasoning' | 'comments' | 'history' | 'media';

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onMove: (id: string, status: Status) => void;
  onRefresh: () => void;
}

export function TicketDetail({ ticket, onClose, onMove, onRefresh }: TicketDetailProps) {
  const [tab, setTab] = useState<TabId>('story');

  const handleSendComment = async (text: string) => {
    await api.post(`/api/tickets/${ticket.id}/comments`, { author: 'Aditya', text });
    onRefresh();
  };

  const handleProcessed = () => {
    onRefresh();
    setTab('reasoning');
  };

  const handleMove = (id: string, status: Status) => {
    onMove(id, status);
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#13161d', border: '1px solid #1e2330', borderRadius: '16px', width: '780px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
      >
        <TicketHeader ticket={ticket} onClose={onClose} onMove={handleMove} />
        <TabBar activeTab={tab} onTabChange={(t) => setTab(t as TabId)} commentCount={ticket.comments?.length ?? 0} />

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {tab === 'story' && <UserStoryTab ticketId={ticket.id} initial={ticket.userStory} />}
          {tab === 'diff' && (
            <div>
              <DiffView diff={ticket.diff} />
              <ProcessButton ticketId={ticket.id} onProcessed={handleProcessed} />
            </div>
          )}
          {tab === 'reasoning' && <ReasoningTab reasoning={ticket.reasoning ?? null} />}
          {tab === 'comments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <CommentList comments={ticket.comments ?? []} />
              <CommentInput onSend={handleSendComment} />
            </div>
          )}
          {tab === 'history' && <HistoryTimeline changelog={ticket.changelog ?? []} />}
          {tab === 'media' && <MediaDrop />}
        </div>
      </div>
    </div>
  );
}
