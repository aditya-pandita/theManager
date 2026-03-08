import { PRIORITY } from '../../constants';
import { Icons } from '../shared/Icons';
import { Tag } from '../shared/Tag';
import type { Ticket } from '../../types';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const pri = PRIORITY[ticket.priority];
  return (
    <div
      onClick={onClick}
      style={{
        background: '#111318', border: '1px solid #1e2330', borderRadius: '10px', padding: '14px',
        cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: `3px solid ${pri.color}`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#161a24'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#111318'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#6B7280', letterSpacing: '0.05em' }}>{ticket.id}</span>
        <span style={{ fontSize: '9px', fontWeight: 700, color: pri.color, background: pri.bg, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
          {pri.label}
        </span>
      </div>
      <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '10px', lineHeight: '1.4' }}>{ticket.title}</div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {ticket.tags.map((t) => <Tag key={t} label={t} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {ticket.diff && <span style={{ color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}><Icons.Code /> diff</span>}
          {ticket.reasoning && <span style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}><Icons.Brain /> why</span>}
          {(ticket.comments?.length ?? 0) > 0 && <span style={{ color: '#A855F7', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}><Icons.Chat /> {ticket.comments!.length}</span>}
        </div>
        <span style={{ fontSize: '10px', color: '#4B5563' }}>{ticket.changelog?.length ?? 0} events</span>
      </div>
    </div>
  );
}
