import type { ChangelogEntry } from '../../types';

interface HistoryTimelineProps {
  changelog: ChangelogEntry[];
}

export function HistoryTimeline({ changelog }: HistoryTimelineProps) {
  if (changelog.length === 0) {
    return <div style={{ color: '#4B5563', textAlign: 'center', padding: '30px', fontStyle: 'italic' }}>No history yet.</div>;
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '24px' }}>
      <div style={{ position: 'absolute', left: '7px', top: '4px', bottom: '4px', width: '2px', background: '#1e2330' }} />
      {changelog.map((e, i) => {
        const author = e.by ?? e.author ?? 'system';
        const ts = e.ts ?? e.createdAt;
        const isClaude = author === 'Claude';
        return (
          <div key={i} style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: isClaude ? '#A855F7' : '#F59E0B', border: '2px solid #13161d' }} />
            <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{e.action}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <span style={{ color: isClaude ? '#c084fc' : '#fbbf24', fontSize: '10px', fontWeight: 600 }}>{author}</span>
              {ts && <span style={{ color: '#4B5563', fontSize: '10px' }}>{new Date(ts).toLocaleString()}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
