import type { Reasoning } from '../../types';

interface SummaryBarProps {
  reasoning: Reasoning;
}

export function SummaryBar({ reasoning }: SummaryBarProps) {
  const confidenceColor =
    reasoning.confidence >= 0.9 ? '#10B981' : reasoning.confidence >= 0.7 ? '#F59E0B' : '#EF4444';
  const timeLabel = reasoning.timeMs < 1000 ? `${reasoning.timeMs}ms` : `${(reasoning.timeMs / 1000).toFixed(1)}s`;

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 16px', marginBottom: '16px', background: '#0c0e14', borderRadius: '10px', border: '1px solid #1e2330' }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '4px' }}>REASONING SUMMARY</div>
        <div style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.4' }}>{reasoning.summary}</div>
      </div>
      <div style={{ textAlign: 'center', padding: '0 12px', borderLeft: '1px solid #1e2330' }}>
        <div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 600, letterSpacing: '0.06em' }}>CONFIDENCE</div>
        <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: confidenceColor }}>
          {Math.round(reasoning.confidence * 100)}%
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '0 12px', borderLeft: '1px solid #1e2330' }}>
        <div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 600, letterSpacing: '0.06em' }}>TIME</div>
        <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#3B82F6' }}>{timeLabel}</div>
      </div>
    </div>
  );
}
