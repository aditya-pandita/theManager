interface BadgeProps {
  label: string;
  color: string;
  bg: string;
  size?: 'sm' | 'xs';
}

export function Badge({ label, color, bg, size = 'sm' }: BadgeProps) {
  const padding = size === 'xs' ? '2px 6px' : '3px 8px';
  const fontSize = size === 'xs' ? '9px' : '10px';
  return (
    <span style={{ fontSize, fontWeight: 700, color, background: bg, padding, borderRadius: '4px', letterSpacing: '0.05em' }}>
      {label}
    </span>
  );
}
