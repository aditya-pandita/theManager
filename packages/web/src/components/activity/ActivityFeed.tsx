import { useEffect } from 'react';
import { useActivityStore } from '../../stores/activity-store';

const ACTOR_COLOR: Record<string, string> = {
  user: '#3b82f6', agent: '#a855f7', system: '#64748b', hook: '#f59e0b', mcp: '#06b6d4',
};

const ACTION_ICON: Record<string, string> = {
  ticket_created: '✨', ticket_moved: '→', ticket_edited: '✏️', ticket_deleted: '🗑️',
  agent_started: '▶', agent_completed: '✓', agent_failed: '✗', agent_rejected: '↩',
  tests_run: '🧪', tests_generated: '🧪', branch_linked: '🌿', commit_detected: '📦',
  merge_detected: '🔀', prompt_sent: '💬', prompt_responded: '🤖', hook_fired: '⚡',
  pipeline_started: '🚀', pipeline_completed: '🏁', pipeline_paused: '⏸', pipeline_resumed: '▶',
  reverted: '↩',
};

export function ActivityFeed({ ticketId }: { ticketId: string }) {
  const { activities, fetchForTicket } = useActivityStore();

  useEffect(() => {
    fetchForTicket(ticketId);
  }, [ticketId]);

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {activities.length === 0 && (
        <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No activity yet.</p>
      )}
      {activities.map((a) => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 8px', borderRadius: '6px', background: '#1e253344' }}>
          <span style={{ fontSize: '14px', flexShrink: 0 }}>{ACTION_ICON[a.actionType] ?? '•'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '9999px', background: `${ACTOR_COLOR[a.actorType] ?? '#64748b'}22`, color: ACTOR_COLOR[a.actorType] ?? '#64748b', flexShrink: 0 }}>
                {a.actorName ?? a.actorType}
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '12px', textTransform: 'replace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.actionType.replace(/_/g, ' ')}
              </span>
              <span style={{ color: '#475569', fontSize: '11px', marginLeft: 'auto', flexShrink: 0 }}>
                {new Date(a.createdAt).toLocaleTimeString()}
              </span>
            </div>
            {a.tokensUsed && (
              <span style={{ color: '#64748b', fontSize: '10px' }}>{a.tokensUsed.toLocaleString()} tokens</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
