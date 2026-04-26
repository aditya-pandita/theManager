import { useEffect, useRef, useState } from 'react';
import { useMemberStore } from '../../stores/member-store';
import { api } from '../../api/client';

interface Props {
  ticketId: string;
  assignedTo: number | null;
  onAssigned: () => void;
}

function initials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function highlight(text: string, query: string): JSX.Element {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#3b82f633', color: '#93c5fd', borderRadius: '2px' }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function AssigneeSelector({ ticketId, assignedTo, onAssigned }: Props) {
  const { members, fetchMembers } = useMemberStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMembers(); }, []);

  const assignedMember = members.find((m) => m.user.id === assignedTo);

  const filtered = query
    ? members.filter((m) =>
        m.user.name.toLowerCase().includes(query.toLowerCase()) ||
        m.user.email.toLowerCase().includes(query.toLowerCase())
      )
    : members;

  const allOptions = [null, ...filtered]; // null = unassign

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  async function assign(userId: number | null) {
    await api.put(`/api/tickets/${ticketId}`, { assignedTo: userId });
    onAssigned();
    setOpen(false);
    setQuery('');
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx((i) => Math.min(i + 1, allOptions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter')     { const opt = allOptions[focusIdx]; assign(opt ? opt.user.id : null); }
    if (e.key === 'Escape')    { setOpen(false); setQuery(''); }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', color: '#374151', fontSize: '12px' }}
      >
        {assignedMember ? (
          <>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: assignedMember.user.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px', fontWeight: 700 }}>
              {initials(assignedMember.user.name)}
            </div>
            <span>{assignedMember.user.name}</span>
          </>
        ) : (
          <>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>?</div>
            <span style={{ color: '#94a3b8' }}>Unassigned</span>
          </>
        )}
        <span style={{ color: '#475569', fontSize: '9px' }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{ position: 'absolute', top: '110%', left: 0, width: '260px', zIndex: 300, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}
        >
          {/* Search */}
          <div style={{ padding: '8px' }}>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setFocusIdx(0); }}
              onKeyDown={onKey}
              placeholder="Search team members…"
              style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '7px 10px', color: '#1e293b', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {/* Unassign option */}
            <button
              onClick={() => assign(null)}
              style={{ ...rowStyle(focusIdx === 0) }}
              onMouseEnter={() => setFocusIdx(0)}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e2533', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px', flexShrink: 0 }}>✕</div>
              <span style={{ color: '#64748b' }}>Unassign</span>
            </button>

            {filtered.length === 0 && query && (
              <div style={{ padding: '10px 12px', color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>No members match "{query}"</div>
            )}

            {filtered.map((m, i) => (
              <button
                key={m.id}
                onClick={() => assign(m.user.id)}
                style={{ ...rowStyle(focusIdx === i + 1), borderTop: '1px solid #1a2030' }}
                onMouseEnter={() => setFocusIdx(i + 1)}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.user.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                  {initials(m.user.name)}
                </div>
                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ color: '#1e293b', fontSize: '12px', fontWeight: 600 }}>{highlight(m.user.name, query)}</div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{highlight(m.user.email, query)}</div>
                </div>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '9999px', background: m.role === 'owner' ? '#eff6ff' : '#f1f5f9', color: m.role === 'owner' ? '#2563eb' : '#64748b', flexShrink: 0 }}>
                  {m.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function rowStyle(focused: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px',
    border: 'none', background: focused ? '#f8fafc' : 'transparent', cursor: 'pointer', textAlign: 'left',
  };
}
