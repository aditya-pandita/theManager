import { Column } from './Column';
import { COLUMNS } from '../../constants';
import type { Ticket, Priority } from '../../types';

interface BoardProps {
  tickets: Ticket[];
  searchQuery: string;
  filterPriority: Priority | null;
  filterTag?: string | null;
  onTicketClick: (ticket: Ticket) => void;
}

export function Board({ tickets, searchQuery, filterPriority, filterTag, onTicketClick }: BoardProps) {
  const filtered = tickets.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterTag && !t.tags.includes(filterTag)) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 165px)', overflow: 'hidden', background: '#f8fafc' }}>
      {COLUMNS.map((col, i) => (
        <Column
          key={col.id}
          id={col.id}
          label={col.label}
          color={col.color}
          tickets={filtered.filter((t) => t.status === col.id)}
          onTicketClick={onTicketClick}
          isLast={i === COLUMNS.length - 1}
        />
      ))}
    </div>
  );
}
