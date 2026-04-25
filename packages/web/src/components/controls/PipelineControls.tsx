import { useState } from 'react';
import { usePipelineStore } from '../../stores/pipeline-store';

export function PipelineControls({ ticketId }: { ticketId: string }) {
  const { pipelineState, isPaused, isLocked, runPipeline, pausePipeline, resumePipeline, skipAgent, lockTicket } = usePipelineStore();
  const [feedback, setFeedback] = useState('');
  const [showReject, setShowReject] = useState(false);

  const isRunning = pipelineState === 'running';
  const isIdle = pipelineState === 'idle' || pipelineState === 'completed';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {isIdle && !isLocked && (
        <button onClick={() => runPipeline(ticketId)} style={btn('#3b82f6')}>
          ▶ Run Pipeline
        </button>
      )}
      {isRunning && !isPaused && (
        <button onClick={() => pausePipeline(ticketId)} style={btn('#f59e0b')}>
          ⏸ Pause
        </button>
      )}
      {isPaused && (
        <button onClick={() => resumePipeline(ticketId)} style={btn('#22c55e')}>
          ▶ Resume
        </button>
      )}
      {isRunning && (
        <button onClick={() => skipAgent(ticketId)} style={btn('#64748b')}>
          ⏭ Skip Agent
        </button>
      )}
      <button onClick={() => lockTicket(ticketId, !isLocked)} style={btn(isLocked ? '#ef4444' : '#64748b')}>
        {isLocked ? '🔓 Unlock' : '🔒 Lock'}
      </button>
      <button onClick={() => setShowReject(!showReject)} style={btn('#f59e0b')}>
        ✗ Reject
      </button>

      {showReject && (
        <div style={{ width: '100%', display: 'flex', gap: '6px', marginTop: '4px' }}>
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback for agent..."
            style={{ flex: 1, background: '#0d1117', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '12px' }}
          />
          <button onClick={() => { setShowReject(false); setFeedback(''); }} style={btn('#64748b', true)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function btn(color: string, small = false) {
  return {
    background: `${color}22`, border: `1px solid ${color}44`, borderRadius: '6px',
    color: color, fontSize: small ? '11px' : '12px', fontWeight: 600,
    padding: small ? '4px 8px' : '5px 10px', cursor: 'pointer',
  } as React.CSSProperties;
}
