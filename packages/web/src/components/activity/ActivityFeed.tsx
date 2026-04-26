import { useEffect } from 'react';
import { useActivityStore } from '../../stores/activity-store';

const ACTOR_PILL: Record<string, { bg: string; color: string }> = {
  user:   { bg: '#eff6ff', color: '#2563eb' },
  agent:  { bg: '#f5f3ff', color: '#7c3aed' },
  system: { bg: '#f8fafc', color: '#64748b' },
  hook:   { bg: '#fffbeb', color: '#d97706' },
  mcp:    { bg: '#ecfeff', color: '#0891b2' },
};

const ACTION_DOT: Record<string, string> = {
  ticket_created: '#22c55e', ticket_moved: '#3b82f6', ticket_deleted: '#ef4444',
  agent_completed: '#22c55e', agent_failed: '#ef4444', agent_started: '#3b82f6',
  tests_run: '#0891b2', pipeline_started: '#6366f1', pipeline_completed: '#22c55e',
  prompt_sent: '#64748b', prompt_responded: '#7c3aed',
};

export function ActivityFeed({ ticketId }: { ticketId: string }) {
  const { activities, fetchForTicket } = useActivityStore();
  useEffect(() => { fetchForTicket(ticketId); }, [ticketId]);

  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {activities.length === 0 && (
        <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No activity yet.</div>
      )}
      {activities.map((a, i) => {
        const dot = ACTION_DOT[a.actionType] ?? '#94a3b8';
        const pill = ACTOR_PILL[a.actorType] ?? { bg: '#f1f5f9', color: '#64748b' };
        return (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', borderBottom: i < activities.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', background: pill.bg, color: pill.color }}>
                  {a.actorName ?? a.actorType}
                </span>
                <span style={{ color: '#374151', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.actionType.replace(/_/g, ' ')}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: 'auto', flexShrink: 0 }}>
                  {new Date(a.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {a.tokensUsed && <span style={{ color: '#94a3b8', fontSize: '10px' }}>{a.tokensUsed.toLocaleString()} tokens</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
