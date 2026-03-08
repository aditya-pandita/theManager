import { PRIORITY } from '../../constants';
import type { Priority } from '../../types';

interface PriorityPickerProps {
  value: Priority;
  onChange: (p: Priority) => void;
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {(Object.entries(PRIORITY) as Array<[Priority, typeof PRIORITY[Priority]]>).map(([k, v]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          style={{
            flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em', transition: 'all 0.15s',
            border: `1px solid ${value === k ? v.color : '#1e2330'}`,
            background: value === k ? v.bg : 'transparent',
            color: value === k ? v.color : '#6B7280',
          }}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
