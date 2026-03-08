import { Icons } from '../shared/Icons';
import type { LogEntry as LogEntryType } from '../../types';

interface LogEntryProps {
  log: LogEntryType;
  expanded: boolean;
  onToggle: () => void;
  totalMs: number;
}

export function LogEntry({ log, expanded, onToggle, totalMs }: LogEntryProps) {
  const pct = totalMs > 0 ? (log.durationMs / totalMs) * 100 : 0;
  const barColor = log.durationMs > 500 ? '#F59E0B' : '#3B82F6';

  return (
    <div style={{ background: expanded ? '#0f1219' : '#0c0e14', border: '1px solid #1e2330', borderRadius: '8px', overflow: 'hidden', transition: 'all 0.2s' }}>
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#131720')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#172554', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
          {log.step}
        </div>
        <div style={{ fontSize: '9px', fontWeight: 700, color: '#A855F7', background: '#2e1065', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.04em', flexShrink: 0 }}>
          {log.phase}
        </div>
        <div style={{ flex: 1, color: '#e2e8f0', fontSize: '12px', fontWeight: 500 }}>{log.action}</div>
        <div style={{ fontSize: '10px', color: '#4B5563', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{log.durationMs}ms</div>
        <div style={{ color: '#4B5563', flexShrink: 0, transition: 'transform 0.15s', transform: expanded ? 'rotate(0)' : 'rotate(-90deg)' }}>
          <Icons.ChevDown />
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 14px 12px 48px', color: '#94a3b8', fontSize: '12px', lineHeight: '1.6', borderTop: '1px solid #1e233050' }}>
          <div style={{ paddingTop: '10px' }}>
            <span style={{ color: '#6B7280', fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>WHY: </span>
            {log.reasoning}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '3px', background: '#1e2330', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '2px', width: `${Math.min(pct * 3, 100)}%`, background: barColor, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '9px', color: '#4B5563', fontFamily: "'JetBrains Mono', monospace" }}>{pct.toFixed(0)}% of total</span>
          </div>
        </div>
      )}
    </div>
  );
}
