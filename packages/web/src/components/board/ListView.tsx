import { PRIORITY, COLUMNS } from '../../constants';
import { useMemberStore } from '../../stores/member-store';
import { Icons } from '../shared/Icons';
import type { Ticket } from '../../types';

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  bug:      { bg: '#fef2f2', color: '#dc2626' },
  feature:  { bg: '#eff6ff', color: '#2563eb' },
  refactor: { bg: '#f5f3ff', color: '#7c3aed' },
  docs:     { bg: '#fffbeb', color: '#d97706' },
  test:     { bg: '#ecfeff', color: '#0891b2' },
};

const STATUS_DOT: Record<string, string> = {
  backlog:     '#6b7280',
  todo:        '#f59e0b',
  in_progress: '#3b82f6',
  review:      '#a855f7',
  done:        '#22c55e',
};

const STATUS_LABEL: Record<string, string> = {
  backlog:     'Backlog',
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  done:        'Done',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

interface ListViewProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export function ListView({ tickets, onTicketClick }: ListViewProps) {
  const { members } = useMemberStore();

  if (tickets.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#94a3b8', fontSize: '14px', gap: '10px' }}>
        <span style={{ color: '#cbd5e1' }}><svg width="40" height="40" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="10" height="10" rx="1"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="5" y1="9" x2="7" y2="9"/></svg></span>
        No tickets found
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 165px)', overflowY: 'auto', background: '#f8fafc', padding: '16px 28px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 120px 100px 120px 140px 36px', gap: '0', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
          {['Ticket', 'Status', 'Priority', 'Tags', 'Assigned', ''].map((h) => (
            <div key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {tickets.map((ticket, i) => {
          const pri = PRIORITY[ticket.priority];
          const dot = STATUS_DOT[ticket.status] ?? '#94a3b8';
          const statusLabel = STATUS_LABEL[ticket.status] ?? ticket.status;
          const assignedMember = (ticket as any).assignedTo
            ? members.find((m) => m.user.id === (ticket as any).assignedTo)
            : null;

          return (
            <div
              key={ticket.id}
              onClick={() => onTicketClick(ticket)}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 120px 100px 120px 140px 36px',
                gap: '0', padding: '13px 20px', alignItems: 'center', cursor: 'pointer',
                borderBottom: i < tickets.length - 1 ? '1px solid #f1f5f9' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Title + ID */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>
                  {ticket.title}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>{ticket.id}</div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#374151' }}>{statusLabel}</span>
              </div>

              {/* Priority */}
              <div>
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px',
                  background: ticket.priority === 'critical' ? '#fef2f2' : ticket.priority === 'high' ? '#fff7ed' : ticket.priority === 'medium' ? '#fffbeb' : '#f8fafc',
                  color: ticket.priority === 'critical' ? '#dc2626' : ticket.priority === 'high' ? '#ea580c' : ticket.priority === 'medium' ? '#d97706' : '#64748b',
                }}>
                  {pri.label.charAt(0) + pri.label.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {ticket.tags.slice(0, 2).map((t) => {
                  const tc = TAG_COLORS[t] ?? { bg: '#f1f5f9', color: '#64748b' };
                  return (
                    <span key={t} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: tc.bg, color: tc.color, fontWeight: 500 }}>{t}</span>
                  );
                })}
                {ticket.tags.length > 2 && <span style={{ fontSize: '10px', color: '#94a3b8' }}>+{ticket.tags.length - 2}</span>}
              </div>

              {/* Assigned */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                {assignedMember ? (
                  <>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: assignedMember.user.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px', fontWeight: 700, flexShrink: 0 }}>
                      {initials(assignedMember.user.name)}
                    </div>
                    <span style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assignedMember.user.name.split(' ')[0]}</span>
                  </>
                ) : (
                  <span style={{ fontSize: '12px', color: '#d1d5db' }}>Unassigned</span>
                )}
              </div>

              {/* Arrow */}
              <div style={{ color: '#d1d5db', fontSize: '14px', textAlign: 'right' }}>›</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
