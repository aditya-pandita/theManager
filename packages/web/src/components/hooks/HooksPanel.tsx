import { useEffect } from 'react';
import { useHookStore } from '../../stores/hook-store';
import { useProjectStore } from '../../stores/project-store';

const EVENT_COLORS: Record<string, { color: string; bg: string }> = {
  TicketCreated: { color: '#047857', bg: '#d1fae5' },
  TicketMoved:   { color: '#1d4ed8', bg: '#dbeafe' },
  TicketDeleted: { color: '#b91c1c', bg: '#fee2e2' },
  PostSave:      { color: '#b45309', bg: '#fef3c7' },
  SessionStart:  { color: '#7e22ce', bg: '#f3e8ff' },
};

export function HooksPanel() {
  const { hooks, startPolling } = useHookStore();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  useEffect(() => {
    const stop = startPolling(activeProjectId);
    return stop;
  }, [activeProjectId]);

  return (
    <div style={{ padding: '24px 28px' }}>
      <h2 style={{ color: '#1e293b', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Hook Events</h2>
      {hooks.length === 0 && (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', fontStyle: 'italic' }}>No hook events yet. Events appear here as Gemma and you interact with tickets.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {hooks.map((h) => {
          const style = EVENT_COLORS[h.event] ?? { color: '#64748b', bg: '#f1f5f9' };
          return (
            <div key={h.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: style.color, background: style.bg, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em', flexShrink: 0, marginTop: '1px' }}>
                {h.event}
              </span>
              <div style={{ flex: 1, color: '#475569', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>
                {h.payload ? JSON.stringify(h.payload) : '{}'}
              </div>
              <span style={{ color: '#94a3b8', fontSize: '10px', flexShrink: 0 }}>
                {new Date(h.createdAt).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
