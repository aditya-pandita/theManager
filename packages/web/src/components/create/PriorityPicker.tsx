import { PRIORITY } from '../../constants';
import { useThemeStore } from '../../stores/theme-store';
import type { Priority } from '../../types';

interface PriorityPickerProps {
  value: Priority;
  onChange: (p: Priority) => void;
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  const theme = useThemeStore((s) => s.theme);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {(Object.entries(PRIORITY) as Array<[Priority, typeof PRIORITY[Priority]]>).map(([k, v]) => {
        const selected = value === k;
        const accentColor = theme === 'light' ? v.colorLight : v.color;
        const accentBg    = theme === 'light' ? v.bgLight    : v.bg;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            style={{
              flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em', transition: 'all 0.15s',
              border: `1px solid ${selected ? accentColor : 'var(--border)'}`,
              background: selected ? accentBg : 'transparent',
              color: selected ? accentColor : 'var(--text-muted)',
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
