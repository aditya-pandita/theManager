import { Icons } from '../shared/Icons';

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  running:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  completed: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  failed:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  skipped:   { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  rejected:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  queued:    { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
};

const AGENT_ICON: Record<string, React.ReactNode> = {
  planner:   <Icons.AgentPlanner />,
  architect: <Icons.AgentArchitect />,
  coder:     <Icons.AgentCoder />,
  reviewer:  <Icons.AgentReviewer />,
  tester:    <Icons.AgentTester />,
  debugger:  <Icons.AgentDebugger />,
  docs:      <Icons.AgentDocs />,
};

export function AgentCard({ run }: { run: any }) {
  const ss = STATUS_STYLE[run.status] ?? STATUS_STYLE.queued;
  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#64748b', flexShrink: 0 }}>{AGENT_ICON[run.agent] ?? <Icons.Pipeline />}</span>
        <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' }}>{run.agent}</span>
        <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
          {run.status}
        </span>
      </div>
      {run.durationMs != null && (
        <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '11px' }}>
          {(run.durationMs / 1000).toFixed(1)}s
          {run.tokensInput ? ` · ${(run.tokensInput + run.tokensOutput).toLocaleString()} tokens` : ''}
        </div>
      )}
      {run.errorMessage && (
        <div style={{ marginTop: '8px', padding: '6px 10px', background: '#fef2f2', borderRadius: '6px', color: '#dc2626', fontSize: '11px', border: '1px solid #fecaca' }}>
          {run.errorMessage}
        </div>
      )}
    </div>
  );
}
