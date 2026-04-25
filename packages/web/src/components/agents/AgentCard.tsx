const STATUS_COLOR: Record<string, string> = {
  running: '#3b82f6', completed: '#22c55e', failed: '#ef4444',
  skipped: '#64748b', rejected: '#f59e0b', queued: '#a855f7',
};

const AGENT_EMOJI: Record<string, string> = {
  planner: '📋', architect: '🏗️', coder: '💻',
  reviewer: '👀', tester: '🧪', debugger: '🔍', docs: '📝',
};

export function AgentCard({ run }: { run: any }) {
  return (
    <div style={{ background: '#1e2533', borderRadius: '8px', padding: '12px', border: `1px solid ${STATUS_COLOR[run.status] ?? '#334155'}22` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>{AGENT_EMOJI[run.agent] ?? '🤖'}</span>
        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' }}>{run.agent}</span>
        <span style={{
          marginLeft: 'auto', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
          background: `${STATUS_COLOR[run.status] ?? '#64748b'}22`,
          color: STATUS_COLOR[run.status] ?? '#64748b',
        }}>
          {run.status}
        </span>
      </div>

      {run.durationMs && (
        <div style={{ marginTop: '6px', color: '#64748b', fontSize: '11px' }}>
          {(run.durationMs / 1000).toFixed(1)}s
          {run.tokensInput ? ` · ${(run.tokensInput + run.tokensOutput).toLocaleString()} tokens` : ''}
        </div>
      )}

      {run.errorMessage && (
        <div style={{ marginTop: '8px', padding: '6px 8px', background: '#ef444411', borderRadius: '4px', color: '#fca5a5', fontSize: '11px' }}>
          {run.errorMessage}
        </div>
      )}
    </div>
  );
}
