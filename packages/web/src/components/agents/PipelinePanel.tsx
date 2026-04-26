import { useEffect } from 'react';
import { usePipelineStore } from '../../stores/pipeline-store';
import { AgentCard } from './AgentCard';
import { PipelineControls } from '../controls/PipelineControls';

const STATE_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  idle:               { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
  running:            { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  paused:             { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  blocked:            { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
  completed:          { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
  awaiting_approval:  { bg: '#f5f3ff', color: '#7c3aed', dot: '#a855f7' },
};

export function PipelinePanel({ ticketId }: { ticketId: string }) {
  const { pipelineState, currentAgent, agentRuns, fetchAgentRuns, connectSSE, disconnectSSE } = usePipelineStore();

  useEffect(() => {
    fetchAgentRuns(ticketId);
    connectSSE(ticketId);
    return () => disconnectSSE();
  }, [ticketId]);

  const ss = STATE_STYLE[pipelineState] ?? STATE_STYLE.idle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: ss.bg, borderRadius: '10px', border: `1px solid ${ss.dot}33` }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: ss.dot, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ color: ss.color, fontSize: '13px', fontWeight: 600 }}>
          Pipeline: {pipelineState.replace('_', ' ')}
        </span>
        {currentAgent && <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '12px' }}>Current: {currentAgent}</span>}
      </div>

      <PipelineControls ticketId={ticketId} />

      {agentRuns.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '32px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#cbd5e1' }}><svg width="32" height="32" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="3" cy="7" r="2"/><circle cx="11" cy="7" r="2"/><circle cx="7" cy="2" r="2"/><circle cx="7" cy="12" r="2"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="7" y1="4" x2="7" y2="10"/></svg></span>
          No agent runs yet. Click Run Pipeline to start.
        </div>
      )}
      {agentRuns.map((run) => <AgentCard key={run.id} run={run} />)}
    </div>
  );
}
