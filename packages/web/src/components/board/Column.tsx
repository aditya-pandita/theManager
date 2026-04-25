import { TicketCard } from './TicketCard';
import { EmptyState } from '../shared/EmptyState';
import type { Ticket } from '../../types';

interface ColumnProps {
  id: string;
  label: string;
  color: string;
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export function Column({ label, color, tickets, onTicketClick }: ColumnProps) {
  return (
    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 14px', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: color }} />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--section-label)' }}>{label}</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 600, color, background: `${color}15`, padding: '2px 8px', borderRadius: '10px', minWidth: '20px', textAlign: 'center' }}>
          {tickets.length}
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 6px', overflow: 'auto' }}>
        {tickets.map((ticket, i) => (
          <div key={ticket.id} style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
            <TicketCard ticket={ticket} onClick={() => onTicketClick(ticket)} />
          </div>
        ))}
        {tickets.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}
