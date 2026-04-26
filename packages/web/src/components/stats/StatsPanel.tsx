import { useEffect, useState } from 'react';
import { StatCard } from './StatCard';
import { api } from '../../api/client';
import { useProjectStore } from '../../stores/project-store';
import type { StatsData } from '../../types';

export function StatsPanel() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = activeProjectId ? `?projectId=${activeProjectId}` : '';
    api.get<StatsData>(`/api/stats${qs}`).then((s) => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, [activeProjectId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading stats...</div>;
  if (!stats) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Failed to load stats.</div>;

  const inProgress = stats.byStatus?.in_progress ?? 0;
  const done = stats.byStatus?.done ?? 0;
  const avgConf = stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : '—';
  const totalTime = stats.totalReasoningTime ? `${(stats.totalReasoningTime / 1000).toFixed(1)}s` : '0s';

  return (
    <div style={{ padding: '24px 28px' }}>
      <h2 style={{ color: '#1e293b', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Project Stats</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard label="TOTAL TICKETS" value={stats.total} color="#1e293b" />
        <StatCard label="COMPLETED" value={done} color="#10B981" />
        <StatCard label="IN PROGRESS" value={inProgress} color="#3B82F6" />
        <StatCard label="WITH REASONING" value={stats.withReasoning} color="#A855F7" />
        <StatCard label="AVG CONFIDENCE" value={avgConf} color={stats.avgConfidence >= 0.8 ? '#10B981' : '#F59E0B'} />
        <StatCard label="TOTAL REASONING TIME" value={totalTime} color="#3B82F6" />
      </div>
    </div>
  );
}
