import { useState } from 'react';
import { TicketHeader } from './TicketHeader';
import { TabBar } from './TabBar';
import { DiffView } from './DiffView';
import { ProcessButton } from './ProcessButton';
import { CommentList } from './CommentList';
import { CommentInput } from './CommentInput';
import { UserStoryTab } from './UserStoryTab';
import { ReasoningTab } from '../reasoning/ReasoningTab';
import { PipelinePanel } from '../agents/PipelinePanel';
import { TestResultsPanel } from '../testing/TestResultsPanel';
import { ChatPanel } from '../chat/ChatPanel';
import { ActivityFeed } from '../activity/ActivityFeed';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/auth-store';
import type { Ticket, Status } from '../../types';

type TabId = 'story' | 'diff' | 'reasoning' | 'comments' | 'pipeline' | 'tests' | 'chat' | 'activity';

export function TicketDetail({ ticket, onClose, onMove, onRefresh }: { ticket: Ticket; onClose: () => void; onMove: (id: string, status: Status) => void; onRefresh: () => void }) {
  const [tab, setTab] = useState<TabId>('story');
  const { user } = useAuthStore();

  const handleSendComment = async (text: string) => {
    await api.post(`/api/tickets/${ticket.id}/comments`, { author: user?.name ?? 'User', text });
    onRefresh();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px', width: '860px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}
      >
        <TicketHeader ticket={ticket} onClose={onClose} onMove={(id, s) => { onMove(id, s); onClose(); }} onRefresh={onRefresh} />
        <TabBar activeTab={tab} onTabChange={(t) => { const next = t as TabId; if (next === 'reasoning' && tab !== 'reasoning') onRefresh(); setTab(next); }} commentCount={ticket.comments?.length ?? 0} />
        <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
          {tab === 'story'    && <UserStoryTab ticketId={ticket.id} initial={ticket.userStory} />}
          {tab === 'pipeline' && <PipelinePanel ticketId={ticket.id} onPipelineComplete={() => { onRefresh(); setTab('reasoning'); }} />}
          {tab === 'chat'     && <ChatPanel ticketId={ticket.id} />}
          {tab === 'tests'    && <TestResultsPanel ticketId={ticket.id} />}
          {tab === 'activity' && <ActivityFeed ticketId={ticket.id} />}
          {tab === 'diff' && <div><DiffView diff={ticket.diff} /><ProcessButton ticketId={ticket.id} onProcessed={() => { onRefresh(); setTab('reasoning'); }} /></div>}
          {tab === 'reasoning' && <ReasoningTab reasoning={ticket.reasoning ?? null} />}
          {tab === 'comments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <CommentList comments={ticket.comments ?? []} />
              <CommentInput onSend={handleSendComment} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
