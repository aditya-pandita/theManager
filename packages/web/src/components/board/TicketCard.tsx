import { PRIORITY } from '../../constants';
import { useMemberStore } from '../../stores/member-store';
import { Icons } from '../shared/Icons';
import type { Ticket } from '../../types';

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  bug:      { bg: '#fef2f2', color: '#dc2626' },
  feature:  { bg: '#eff6ff', color: '#2563eb' },
  refactor: { bg: '#f5f3ff', color: '#7c3aed' },
  docs:     { bg: '#fffbeb', color: '#d97706' },
  test:     { bg: '#ecfeff', color: '#0891b2' },
};

const PRIORITY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  critical: { bg: '#fef2f2', color: '#dc2626', label: 'Critical' },
  high:     { bg: '#fff7ed', color: '#ea580c', label: 'High' },
  medium:   { bg: '#fffbeb', color: '#d97706', label: 'Medium' },
  low:      { bg: '#f8fafc', color: '#64748b', label: 'Low' },
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const pri = PRIORITY[ticket.priority];
  const pb = PRIORITY_BADGE[ticket.priority];
  const { members } = useMemberStore();
  const assignedMember = (ticket as any).assignedTo
    ? members.find((m) => m.user.id === (ticket as any).assignedTo)
    : null;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
        padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {/* Priority badge + ID row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.05em' }}>{ticket.id}</span>
        {pb && (
          <span style={{ fontSize: '10px', fontWeight: 600, background: pb.bg, color: pb.color, padding: '2px 8px', borderRadius: '20px' }}>
            {pb.label}
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', lineHeight: 1.45, marginBottom: '10px' }}>
        {ticket.title}
      </div>

      {/* Tags */}
      {ticket.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {ticket.tags.map((t) => {
            const ts = TAG_STYLES[t] ?? { bg: '#f1f5f9', color: '#64748b' };
            return (
              <span key={t} style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '20px', background: ts.bg, color: ts.color }}>
                {t}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer — reasoning badge + assignee */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {ticket.reasoning && (
            <span style={{ fontSize: '10px', background: '#f5f3ff', color: '#7c3aed', padding: '2px 7px', borderRadius: '20px', fontWeight: 500 }}>
              ✦ AI reasoning
            </span>
          )}
          {(ticket.comments?.length ?? 0) > 0 && (
            <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Icons.Comment /> {ticket.comments!.length}
            </span>
          )}
        </div>
        {assignedMember ? (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: assignedMember.user.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px', fontWeight: 700 }} title={assignedMember.user.name}>
            {initials(assignedMember.user.name)}
          </div>
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px' }}>?</div>
        )}
      </div>
    </div>
  );
}
