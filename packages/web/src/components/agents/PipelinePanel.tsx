import { useEffect } from 'react';
import { usePipelineStore } from '../../stores/pipeline-store';
import { AgentCard } from './AgentCard';
import { ApplyPanel } from './ApplyPanel';
import { PipelineControls } from '../controls/PipelineControls';

const CHAIN_LABELS: Record<string, string> = {
  planner: 'Planner', architect: 'Architect', coder: 'Coder',
  reviewer: 'Reviewer', tester: 'Tester', debugger: 'Debugger', docs: 'Docs',
};

const STATE_COLOR: Record<string, string> = {
  idle: '#64748b', running: '#3b82f6', paused: '#f59e0b',
  blocked: '#ef4444', completed: '#22c55e', awaiting_approval: '#a855f7',
};

export function PipelinePanel({ ticketId }: { ticketId: string }) {
  const { pipelineState, currentAgent, agentRuns, fetchAgentRuns, connectSSE, disconnectSSE } = usePipelineStore();

  useEffect(() => {
    fetchAgentRuns(ticketId);
    connectSSE(ticketId);
    return () => disconnectSSE();
  }, [ticketId]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* State banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#1e2533', borderRadius: '8px' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATE_COLOR[pipelineState] ?? '#64748b', display: 'inline-block' }} />
        <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>
          Pipeline: {pipelineState.replace('_', ' ').toUpperCase()}
        </span>
        {currentAgent && (
          <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '12px' }}>
            Current: {CHAIN_LABELS[currentAgent] ?? currentAgent}
          </span>
        )}
      </div>

      <PipelineControls ticketId={ticketId} />

      {/* Agent run timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {agentRuns.length === 0 && (
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
            No agent runs yet. Click "Run Pipeline" to start.
          </p>
        )}
        {agentRuns.map((run) => (
          <AgentCard key={run.id} run={run} />
        ))}
      </div>

      <ApplyPanel
        ticketId={ticketId}
        hasCoderRun={agentRuns.some((r) => r.agent === 'coder' && r.status === 'completed')}
      />
    </div>
  );
}
