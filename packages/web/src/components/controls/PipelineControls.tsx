import { useState } from 'react';
import { usePipelineStore } from '../../stores/pipeline-store';
import { Icons } from '../shared/Icons';

export function PipelineControls({ ticketId }: { ticketId: string }) {
  const { pipelineState, isPaused, isLocked, runPipeline, pausePipeline, resumePipeline, skipAgent, lockTicket } = usePipelineStore();
  const [showReject, setShowReject] = useState(false);
  const [feedback, setFeedback] = useState('');

  const isRunning = pipelineState === 'running';
  const isIdle    = pipelineState === 'idle' || pipelineState === 'completed';

  const Btn = ({ icon, label, onClick, variant = 'secondary', disabled = false }: { icon: React.ReactNode; label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'warning' | 'danger'; disabled?: boolean }) => {
    const v = {
      primary:   { background: '#2563eb', color: '#fff',     border: 'none' },
      secondary: { background: '#fff',    color: '#64748b',  border: '1px solid #e2e8f0' },
      warning:   { background: '#fffbeb', color: '#d97706',  border: '1px solid #fde68a' },
      danger:    { background: '#fef2f2', color: '#dc2626',  border: '1px solid #fecaca' },
    }[variant];
    return (
      <button onClick={onClick} disabled={disabled} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, ...v }}>
        {icon} {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
      {isIdle && !isLocked && <Btn icon={<Icons.Play />} label="Run Pipeline" onClick={() => runPipeline(ticketId)} variant="primary" />}
      {isRunning && !isPaused && <Btn icon={<Icons.Pause />} label="Pause" onClick={() => pausePipeline(ticketId)} variant="warning" />}
      {isPaused && <Btn icon={<Icons.Play />} label="Resume" onClick={() => resumePipeline(ticketId)} variant="primary" />}
      {isRunning && <Btn icon={<Icons.Skip />} label="Skip Agent" onClick={() => skipAgent(ticketId)} variant="secondary" />}
      <Btn icon={isLocked ? <Icons.Unlock /> : <Icons.Lock />} label={isLocked ? 'Unlock' : 'Lock'} onClick={() => lockTicket(ticketId, !isLocked)} variant={isLocked ? 'danger' : 'secondary'} />
      <Btn icon={<Icons.Reject />} label="Reject" onClick={() => setShowReject(!showReject)} variant="warning" />
      {showReject && (
        <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
          <input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback for agent..." style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 12px', color: '#1e293b', fontSize: '12px', outline: 'none' }} />
          <button onClick={() => { setShowReject(false); setFeedback(''); }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
