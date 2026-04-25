import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export function TestResultsPanel({ ticketId }: { ticketId: string }) {
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.get(`/api/tests/${ticketId}`).then(setResult).catch(() => {});
  }, [ticketId]);

  const runTests = async () => {
    setRunning(true);
    try {
      const r = await api.post(`/api/tests/${ticketId}/run`, {});
      setResult(r);
    } finally {
      setRunning(false);
    }
  };

  const passRate = result ? Math.round((result.passed / Math.max(result.totalTests, 1)) * 100) : null;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '13px' }}>Test Results</span>
        <button onClick={runTests} disabled={running} style={{ background: '#3b82f622', border: '1px solid #3b82f644', borderRadius: '6px', color: '#3b82f6', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>
          {running ? 'Running…' : '▶ Run Tests'}
        </button>
      </div>

      {result ? (
        <>
          {/* Pass bar */}
          <div style={{ background: '#0d1117', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${passRate}%`, height: '100%', background: passRate === 100 ? '#22c55e' : passRate! > 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.3s' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ color: '#22c55e' }}>✓ {result.passed} passed</span>
            <span style={{ color: '#ef4444' }}>✗ {result.failed} failed</span>
            <span style={{ color: '#64748b' }}>{result.skipped} skipped</span>
            {result.coveragePercent != null && (
              <span style={{ color: result.coverageDelta != null && result.coverageDelta < 0 ? '#ef4444' : '#22c55e', marginLeft: 'auto' }}>
                {result.coveragePercent}% coverage
                {result.coverageDelta != null && ` (${result.coverageDelta > 0 ? '+' : ''}${result.coverageDelta}%)`}
              </span>
            )}
          </div>

          {result.failures?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {result.failures.slice(0, 5).map((f: any, i: number) => (
                <div key={i} style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: '6px', padding: '8px 10px' }}>
                  <div style={{ color: '#fca5a5', fontSize: '12px', fontWeight: 600 }}>{f.testName}</div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace' }}>{f.error?.slice(0, 200)}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ color: '#64748b', fontSize: '11px' }}>
            Framework: {result.framework} · {result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : ''}
            {result.isFlaky && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>⚠ Flaky ({result.flakyCount}x)</span>}
          </div>
        </>
      ) : (
        <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
          No test results yet.
        </p>
      )}
    </div>
  );
}
