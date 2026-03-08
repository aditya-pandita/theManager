import { useState } from 'react';
import { LogEntry } from './LogEntry';
import type { LogEntry as LogEntryType } from '../../types';

interface LogListProps {
  logs: LogEntryType[];
}

export function LogList({ logs }: LogListProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const totalMs = logs.reduce((sum, l) => sum + l.durationMs, 0);

  const toggle = (i: number) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {logs.map((log, i) => (
        <LogEntry key={i} log={log} expanded={!!expanded[i]} onToggle={() => toggle(i)} totalMs={totalMs} />
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', padding: '10px 14px', color: '#4B5563', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>
        <span>Total: <span style={{ color: '#3B82F6' }}>{totalMs}ms</span> across {logs.length} steps</span>
      </div>
    </div>
  );
}
