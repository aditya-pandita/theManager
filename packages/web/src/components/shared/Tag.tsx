interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  return (
    <span
      style={{
        fontSize: '10px',
        color: 'var(--tag-text)',
        background: 'var(--tag-bg)',
        padding: '2px 8px',
        borderRadius: '4px',
        border: '1px solid var(--tag-border)',
      }}
    >
      {label}
    </span>
  );
}
