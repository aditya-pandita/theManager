interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  const isClaude = name === 'Claude';
  const initial = name[0]?.toUpperCase() ?? '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '8px', flexShrink: 0,
      background: isClaude
        ? 'linear-gradient(135deg, #A855F7, #3B82F6)'
        : 'linear-gradient(135deg, #F59E0B, #EF4444)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: '12px', fontWeight: 700,
    }}>
      {initial}
    </div>
  );
}
