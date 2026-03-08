interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, color = '#e2e8f0', sub }: StatCardProps) {
  return (
    <div style={{ background: '#0c0e14', border: '1px solid #1e2330', borderRadius: '12px', padding: '20px' }}>
      <div style={{ color: '#6B7280', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</div>
      <div style={{ color, fontSize: '28px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: '#4B5563', fontSize: '11px', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}
