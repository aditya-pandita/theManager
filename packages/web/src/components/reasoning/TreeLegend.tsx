import { NODE_STYLES } from '../../constants';

const LEGEND_ITEMS = [
  { type: 'problem',       label: 'Problem' },
  { type: 'investigation', label: 'Investigation' },
  { type: 'discovery',     label: 'Discovery' },
  { type: 'root_cause',    label: 'Root Cause' },
  { type: 'decision',      label: 'Decision Point' },
  { type: 'chosen',        label: 'Chosen' },
  { type: 'rejected',      label: 'Rejected' },
];

export function TreeLegend() {
  return (
    <div style={{ marginTop: '20px', padding: '12px 16px', background: '#0c0e14', borderRadius: '8px', border: '1px solid #1e2330' }}>
      <div style={{ color: '#4B5563', fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>LEGEND</div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {LEGEND_ITEMS.map((item) => {
          const s = NODE_STYLES[item.type];
          return (
            <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: s.color }} />
              <span style={{ fontSize: '10px', color: '#6B7280' }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
