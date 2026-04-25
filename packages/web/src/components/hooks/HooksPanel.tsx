import { useEffect } from 'react';
import { useHookStore } from '../../stores/hook-store';
import { useThemeStore } from '../../stores/theme-store';

const EVENT_COLORS: Record<string, { color: string; bg: string; bgLight: string }> = {
  TicketCreated: { color: '#10B981', bg: '#052e16', bgLight: '#dcfce7' },
  TicketMoved:   { color: '#3B82F6', bg: '#172554', bgLight: '#dbeafe' },
  TicketDeleted: { color: '#EF4444', bg: '#451215', bgLight: '#fee2e2' },
  PostSave:      { color: '#F59E0B', bg: '#422006', bgLight: '#fef3c7' },
  SessionStart:  { color: '#A855F7', bg: '#2e1065', bgLight: '#f3e8ff' },
};

export function HooksPanel() {
  const { hooks, startPolling } = useHookStore();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const stop = startPolling();
    return stop;
  }, []);

  return (
    <div style={{ padding: '24px 28px' }}>
      <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Hook Events</h2>
      {hooks.length === 0 && (
        <div style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '40px', fontStyle: 'italic' }}>
          No hook events yet. Events appear here as Claude and you interact with tickets.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {hooks.map((h) => {
          const style = EVENT_COLORS[h.event] ?? { color: '#64748b', bg: '#1a1f2e', bgLight: '#f1f5f9' };
          const pillBg = theme === 'light' ? style.bgLight : style.bg;
          return (
            <div
              key={h.id}
              style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '12px 14px',
                background: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: '9px', fontWeight: 700, color: style.color, background: pillBg,
                  padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em', flexShrink: 0, marginTop: '1px',
                }}
              >
                {h.event}
              </span>
              <div
                style={{
                  flex: 1,
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  wordBreak: 'break-all',
                }}
              >
                {h.payload ? JSON.stringify(h.payload) : '{}'}
              </div>
              <span style={{ color: 'var(--text-faint)', fontSize: '10px', flexShrink: 0 }}>
                {new Date(h.createdAt).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
