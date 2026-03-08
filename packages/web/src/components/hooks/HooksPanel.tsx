import { useEffect } from 'react';
import { useHookStore } from '../../stores/hook-store';

const EVENT_COLORS: Record<string, { color: string; bg: string }> = {
  TicketCreated: { color: '#10B981', bg: '#052e16' },
  TicketMoved:   { color: '#3B82F6', bg: '#172554' },
  TicketDeleted: { color: '#EF4444', bg: '#451215' },
  PostSave:      { color: '#F59E0B', bg: '#422006' },
  SessionStart:  { color: '#A855F7', bg: '#2e1065' },
};

export function HooksPanel() {
  const { hooks, startPolling } = useHookStore();

  useEffect(() => {
    const stop = startPolling();
    return stop;
  }, []);

  return (
    <div style={{ padding: '24px 28px' }}>
      <h2 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Hook Events</h2>
      {hooks.length === 0 && (
        <div style={{ color: '#4B5563', textAlign: 'center', padding: '40px', fontStyle: 'italic' }}>No hook events yet. Events appear here as Claude and you interact with tickets.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {hooks.map((h) => {
          const style = EVENT_COLORS[h.event] ?? { color: '#94a3b8', bg: '#1a1f2e' };
          return (
            <div key={h.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#0c0e14', borderRadius: '8px', border: '1px solid #1e2330' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: style.color, background: style.bg, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em', flexShrink: 0, marginTop: '1px' }}>
                {h.event}
              </span>
              <div style={{ flex: 1, color: '#94a3b8', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>
                {h.payload ? JSON.stringify(h.payload) : '{}'}
              </div>
              <span style={{ color: '#4B5563', fontSize: '10px', flexShrink: 0 }}>
                {new Date(h.createdAt).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
