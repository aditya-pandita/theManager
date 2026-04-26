import { TicketCard } from './TicketCard';
import type { Ticket } from '../../types';

interface ColumnProps {
  id: string;
  label: string;
  color: string;
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  isLast?: boolean;
}

export function Column({ label, color, tickets, onTicketClick, isLast }: ColumnProps) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: isLast ? 'none' : '1px solid #e2e8f0' }}>
      {/* Column header */}
      <div style={{ padding: '14px 16px 10px', background: '#fff', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', letterSpacing: '0.02em' }}>
            {label.charAt(0) + label.slice(1).toLowerCase().replace('_', ' ')}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '9999px' }}>
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc' }}>
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket)} />
        ))}
        {tickets.length === 0 && (
          <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: '12px', paddingTop: '24px' }}>
            No tickets
          </div>
        )}
      </div>
    </div>
  );
}
