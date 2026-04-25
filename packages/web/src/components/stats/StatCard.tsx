interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, color, sub }: StatCardProps) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</div>
      <div style={{ color: color ?? 'var(--text)', fontSize: '28px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: 'var(--text-faint)', fontSize: '11px', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}
