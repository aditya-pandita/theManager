import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Icons } from '../shared/Icons';

export function TestResultsPanel({ ticketId }: { ticketId: string }) {
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => { api.get(`/api/tests/${ticketId}`).then(setResult).catch(() => {}); }, [ticketId]);

  const runTests = async () => {
    setRunning(true);
    try { const r = await api.post(`/api/tests/${ticketId}/run`, {}); setResult(r); }
    finally { setRunning(false); }
  };

  const passRate = result ? Math.round((result.passed / Math.max(result.totalTests, 1)) * 100) : null;

  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Test Results</span>
        <button onClick={runTests} disabled={running} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#2563eb', fontSize: '12px', fontWeight: 600, padding: '6px 14px', cursor: 'pointer' }}>
          {running ? 'Running…' : <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Icons.Play /> Run Tests</span>}
        </button>
      </div>

      {result ? (
        <>
          {/* Pass bar */}
          <div style={{ background: '#f1f5f9', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${passRate}%`, height: '100%', background: passRate === 100 ? '#22c55e' : passRate! > 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.4s', borderRadius: '9999px' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ {result.passed} passed</span>
            <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ {result.failed} failed</span>
            <span style={{ color: '#94a3b8' }}>{result.skipped} skipped</span>
            {result.coveragePercent != null && (
              <span style={{ color: result.coverageDelta < 0 ? '#dc2626' : '#16a34a', marginLeft: 'auto', fontWeight: 600 }}>
                {result.coveragePercent}% coverage
                {result.coverageDelta != null && ` (${result.coverageDelta > 0 ? '+' : ''}${result.coverageDelta}%)`}
              </span>
            )}
          </div>

          {result.failures?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {result.failures.slice(0, 5).map((f: any, i: number) => (
                <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>{f.testName}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace' }}>{f.error?.slice(0, 200)}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ color: '#94a3b8', fontSize: '11px' }}>
            Framework: {result.framework} · {result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : ''}
            {result.isFlaky && <span style={{ color: '#d97706', marginLeft: '8px' }}>Flaky ({result.flakyCount}x)</span>}
          </div>
        </>
      ) : (
        <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '28px 0' }}>
          No test results yet. Click Run Tests to start.
        </div>
      )}
    </div>
  );
}
