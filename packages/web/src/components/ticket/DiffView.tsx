import { Icons } from '../shared/Icons';
import type { Diff } from '../../types';

interface DiffViewProps {
  diff?: Diff | null;
}

export function DiffView({ diff }: DiffViewProps) {
  if (!diff) {
    return <div style={{ color: '#6B7280', padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>No code changes yet</div>;
  }

  const filePath = diff.filePath ?? diff.file ?? 'unknown';
  const before = diff.beforeCode ?? diff.before ?? '';
  const after = diff.afterCode ?? diff.after ?? '';
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '12px', lineHeight: '1.7', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <div style={{ background: '#0f172a', padding: '8px 14px', color: '#94a3b8', fontSize: '11px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icons.Code /> {filePath}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ borderRight: '1px solid #1e293b' }}>
          <div style={{ background: '#1c1017', padding: '4px 14px', color: '#f87171', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>BEFORE</div>
          <div style={{ padding: '10px 14px', background: '#0c0c0c' }}>
            {beforeLines.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: '#4a3030', minWidth: '20px', textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
                <span style={{ color: '#fca5a5' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ background: '#0c1f17', padding: '4px 14px', color: '#4ade80', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>AFTER</div>
          <div style={{ padding: '10px 14px', background: '#0c0c0c' }}>
            {afterLines.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: '#1a3a2a', minWidth: '20px', textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
                <span style={{ color: '#86efac' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
