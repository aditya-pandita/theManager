import { COLUMNS, PRIORITY } from '../../constants';
import { Icons } from '../shared/Icons';
import { Tag } from '../shared/Tag';
import type { Ticket, Status } from '../../types';

interface TicketHeaderProps {
  ticket: Ticket;
  onClose: () => void;
  onMove: (id: string, status: Status) => void;
}

export function TicketHeader({ ticket, onClose, onMove }: TicketHeaderProps) {
  const colIdx = COLUMNS.findIndex((c) => c.id === ticket.status);
  const currentCol = COLUMNS[colIdx];
  const pri = PRIORITY[ticket.priority];

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2330' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#6B7280', letterSpacing: '0.05em' }}>{ticket.id}</span>
          <h2 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700, margin: '4px 0 0' }}>{ticket.title}</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px' }}><Icons.X /></button>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: pri.color, background: pri.bg, padding: '3px 8px', borderRadius: '4px' }}>{pri.label}</span>
        <span style={{ fontSize: '11px', color: currentCol?.color, background: `${currentCol?.color}15`, border: `1px solid ${currentCol?.color}30`, padding: '3px 10px', borderRadius: '4px', fontWeight: 600 }}>
          {currentCol?.label}
        </span>
        {(ticket.tags ?? []).map((t) => <Tag key={t} label={t} />)}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {colIdx > 0 && (
            <button onClick={() => onMove(ticket.id, COLUMNS[colIdx - 1].id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #1e2330', background: '#0c0e14', color: '#94a3b8', cursor: 'pointer', fontSize: '10px' }}>
              <Icons.Arrow dir="left" /> {COLUMNS[colIdx - 1].label}
            </button>
          )}
          {colIdx < COLUMNS.length - 1 && (
            <button onClick={() => onMove(ticket.id, COLUMNS[colIdx + 1].id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: `1px solid ${COLUMNS[colIdx + 1].color}40`, background: `${COLUMNS[colIdx + 1].color}10`, color: COLUMNS[colIdx + 1].color, cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}>
              {COLUMNS[colIdx + 1].label} <Icons.Arrow dir="right" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
