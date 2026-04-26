interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, color = '#1e293b', sub }: StatCardProps) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
      <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</div>
      <div style={{ color, fontSize: '28px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}
