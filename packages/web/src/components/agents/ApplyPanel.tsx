import { useState } from 'react';
import { api } from '../../api/client';

interface ApplyResult {
  workspace: { rootDir: string; isProjectLinked: boolean; isGit: boolean };
  branch?: string;
  written: Array<{ path: string; bytes: number; previouslyExisted: boolean }>;
  rejected: Array<{ path: string; reason: string }>;
  commitHash?: string;
  commitMessage?: string;
  dryRun: boolean;
  error?: string;
}

export function ApplyPanel({ ticketId, hasCoderRun }: { ticketId: string; hasCoderRun: boolean }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!hasCoderRun) return null;

  const apply = async (dryRun: boolean) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post<ApplyResult>(`/api/pipeline/apply/${ticketId}`, { dryRun });
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: '12px', background: '#0d1117', border: '1px solid #1e2330', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>📝 Apply Coder Output</span>
        <span style={{ color: '#64748b', fontSize: '11px' }}>
          Write the Coder agent's files to disk (sandbox by default; project workspace if linked).
        </span>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => apply(true)}
          disabled={busy}
          style={btnStyle('#64748b', busy)}
        >
          {busy ? '...' : '👁  Preview (dry run)'}
        </button>
        <button
          onClick={() => apply(false)}
          disabled={busy}
          style={btnStyle('#22c55e', busy)}
        >
          {busy ? 'Applying...' : '✓  Apply for real'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#fca5a5', fontSize: '12px', padding: '6px 10px', background: '#450a0a44', border: '1px solid #ef444466', borderRadius: '6px' }}>
          ⚠ {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          {result.error ? (
            <div style={{ color: '#fca5a5' }}>⚠ {result.error}</div>
          ) : (
            <>
              <div style={{ color: '#94a3b8' }}>
                Workspace: <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{result.workspace.rootDir}</span>
                {' '}({result.workspace.isProjectLinked ? 'project-linked' : 'sandbox'}{result.workspace.isGit ? ', git' : ''})
              </div>
              {result.branch && (
                <div style={{ color: '#94a3b8' }}>
                  Branch: <span style={{ color: '#a5b4fc', fontFamily: 'monospace' }}>{result.branch}</span>
                </div>
              )}
              {result.commitHash && (
                <div style={{ color: '#94a3b8' }}>
                  Commit: <span style={{ color: '#86efac', fontFamily: 'monospace' }}>{result.commitHash.slice(0, 7)}</span>{' '}
                  <span style={{ color: '#64748b' }}>{result.commitMessage}</span>
                </div>
              )}
              {result.dryRun && (
                <div style={{ color: '#fcd34d' }}>↳ Dry run — nothing written. Click "Apply for real" to commit.</div>
              )}
              {result.written.length > 0 && (
                <details open style={{ color: '#94a3b8' }}>
                  <summary style={{ cursor: 'pointer', color: '#22c55e' }}>
                    {result.written.length} file{result.written.length === 1 ? '' : 's'} {result.dryRun ? 'planned' : 'written'}
                  </summary>
                  <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                    {result.written.map((w) => (
                      <li key={w.path} style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>
                        {w.path} <span style={{ color: '#64748b' }}>({w.bytes}B{w.previouslyExisted ? ', overwrote' : ', new'})</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {result.rejected.length > 0 && (
                <details style={{ color: '#94a3b8' }}>
                  <summary style={{ cursor: 'pointer', color: '#fcd34d' }}>
                    {result.rejected.length} file{result.rejected.length === 1 ? '' : 's'} rejected (safety check)
                  </summary>
                  <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                    {result.rejected.map((r) => (
                      <li key={r.path} style={{ fontFamily: 'monospace', color: '#fca5a5' }}>
                        {r.path} — {r.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function btnStyle(color: string, disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? '#1e293b' : `${color}22`,
    border: `1px solid ${color}44`,
    borderRadius: '6px',
    color: disabled ? '#475569' : color,
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
