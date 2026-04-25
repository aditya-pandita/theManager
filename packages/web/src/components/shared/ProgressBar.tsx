interface ProgressBarProps {
  value: number;
  max: number;
  width?: number;
  color?: string;
}

export function ProgressBar({ value, max, width = 100, color = '#10B981' }: ProgressBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ width, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: '2px', transition: 'width 0.3s' }} />
    </div>
  );
}
