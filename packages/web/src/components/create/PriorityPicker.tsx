import type { Priority } from '../../types';

const OPTS: Array<{ value: Priority; label: string; bg: string; color: string; border: string }> = [
  { value: 'critical', label: 'Critical', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  { value: 'high',     label: 'High',     bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  { value: 'medium',   label: 'Medium',   bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  { value: 'low',      label: 'Low',      bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
];

export function PriorityPicker({ value, onChange }: { value: Priority; onChange: (p: Priority) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {OPTS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            border: `1px solid ${value === o.value ? o.border : '#e2e8f0'}`,
            background: value === o.value ? o.bg : '#fff',
            color: value === o.value ? o.color : '#94a3b8',
            transition: 'all 0.15s',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
