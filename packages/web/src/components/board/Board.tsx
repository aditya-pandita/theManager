import { Column } from './Column';
import { COLUMNS } from '../../constants';
import type { Ticket, Priority } from '../../types';

interface BoardProps {
  tickets: Ticket[];
  searchQuery: string;
  filterPriority: Priority | null;
  onTicketClick: (ticket: Ticket) => void;
}

export function Board({ tickets, searchQuery, filterPriority, onTicketClick }: BoardProps) {
  const filtered = tickets.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', gap: '1px', padding: '20px 28px', height: 'calc(100vh - 155px)', overflow: 'auto' }}>
      {COLUMNS.map((col) => (
        <Column
          key={col.id}
          id={col.id}
          label={col.label}
          color={col.color}
          tickets={filtered.filter((t) => t.status === col.id)}
          onTicketClick={onTicketClick}
        />
      ))}
    </div>
  );
}
