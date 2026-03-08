interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  return (
    <span style={{ fontSize: '10px', color: '#94a3b8', background: '#1a1f2e', padding: '2px 8px', borderRadius: '4px', border: '1px solid #252b3b' }}>
      {label}
    </span>
  );
}
