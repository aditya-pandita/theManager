import { useState } from 'react';
import { Icons } from '../shared/Icons';
import { api } from '../../api/client';

interface ProcessButtonProps {
  ticketId: string;
  onProcessed: () => void;
}

export function ProcessButton({ ticketId, onProcessed }: ProcessButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    setProcessing(true);
    setError(null);
    try {
      await api.post('/api/process', { ticketId });
      onProcessed();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div style={{ marginTop: '16px', padding: '16px', borderRadius: '10px', border: '1px solid #A855F730', background: '#A855F708', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #A855F7', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: '#c084fc', fontSize: '13px' }}>Gemma is analyzing and generating changes...</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {error && <div style={{ marginBottom: '8px', padding: '8px 12px', borderRadius: '6px', background: '#451215', color: '#f87171', fontSize: '12px' }}>{error}</div>}
      <button
        onClick={handleProcess}
        style={{
          width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #A855F730',
          background: 'linear-gradient(135deg, #A855F710, #3B82F610)', color: '#c084fc', cursor: 'pointer',
          fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #A855F720, #3B82F620)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #A855F710, #3B82F610)')}
      >
        <Icons.Sparkle /> Ask Gemma to Process
      </button>
    </div>
  );
}
