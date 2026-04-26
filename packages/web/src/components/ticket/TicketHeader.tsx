import { COLUMNS, PRIORITY } from '../../constants';
import { AssigneeSelector } from './AssigneeSelector';
import { Icons } from '../shared/Icons';
import type { Ticket, Status } from '../../types';

const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  backlog:     { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  todo:        { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  in_progress: { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  review:      { bg: '#faf5ff', color: '#7c3aed', dot: '#a855f7' },
  done:        { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
};

const PRIORITY_PILL: Record<string, { bg: string; color: string }> = {
  critical: { bg: '#fef2f2', color: '#dc2626' },
  high:     { bg: '#fff7ed', color: '#ea580c' },
  medium:   { bg: '#fffbeb', color: '#d97706' },
  low:      { bg: '#f8fafc', color: '#64748b' },
};

export function TicketHeader({ ticket, onClose, onMove, onRefresh }: { ticket: Ticket; onClose: () => void; onMove: (id: string, status: Status) => void; onRefresh: () => void }) {
  const colIdx = COLUMNS.findIndex((c) => c.id === ticket.status);
  const sc = STATUS_COLORS[ticket.status] ?? STATUS_COLORS.backlog;
  const pp = PRIORITY_PILL[ticket.priority];
  const pri = PRIORITY[ticket.priority];

  return (
    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e2e8f0', background: '#fff', borderRadius: '16px 16px 0 0' }}>
      {/* ID + close */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8', letterSpacing: '0.05em' }}>{ticket.id}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '6px' }}><Icons.X /></button>
      </div>

      {/* Title */}
      <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 700, color: '#1e293b', lineHeight: 1.35 }}>{ticket.title}</h2>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Priority */}
        {pp && (
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: pp.bg, color: pp.color }}>
            {pri.label.charAt(0) + pri.label.slice(1).toLowerCase()}
          </span>
        )}

        {/* Status */}
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
          {ticket.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>

        {/* Tags */}
        {(ticket.tags ?? []).map((t) => (
          <span key={t} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', fontWeight: 500 }}>{t}</span>
        ))}

        {/* Assignee */}
        <AssigneeSelector ticketId={ticket.id} assignedTo={(ticket as any).assignedTo ?? null} onAssigned={onRefresh} />

        {/* Move buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          {colIdx > 0 && (
            <button onClick={() => onMove(ticket.id, COLUMNS[colIdx - 1].id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '11px', fontWeight: 500 }}>
              <Icons.Arrow dir="left" /> {COLUMNS[colIdx - 1].label.charAt(0) + COLUMNS[colIdx - 1].label.slice(1).toLowerCase()}
            </button>
          )}
          {colIdx < COLUMNS.length - 1 && (
            <button onClick={() => onMove(ticket.id, COLUMNS[colIdx + 1].id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 14px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
              {COLUMNS[colIdx + 1].label.charAt(0) + COLUMNS[colIdx + 1].label.slice(1).toLowerCase()} <Icons.Arrow dir="right" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
