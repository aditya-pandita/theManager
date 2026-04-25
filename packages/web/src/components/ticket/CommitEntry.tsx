import { useState } from 'react';
import type { GitCommit } from '../../types';

interface Props {
  commit: GitCommit;
}

export function CommitEntry({ commit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const files = [
    ...(commit.filesAdded ?? []),
    ...(commit.filesModified ?? []),
    ...(commit.filesDeleted ?? []),
  ].filter(Boolean);

  return (
    <div
      style={{
        background: '#0c0e14',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '8px',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}
        onClick={() => setExpanded((e) => !e)}
      >
        <code
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: '#6366f1',
            background: '#1e1b4b',
            padding: '2px 6px',
            borderRadius: '4px',
            flexShrink: 0,
          }}
        >
          {commit.abbrevHash}
        </code>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.4 }}>{commit.message}</div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
            {commit.authorName}
            {commit.committedAt && (
              <> · {new Date(commit.committedAt).toLocaleString()}</>
            )}
          </div>
          {(commit.insertions > 0 || commit.deletions > 0) && (
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              <span style={{ color: '#10B981' }}>+{commit.insertions}</span>
              <span style={{ color: '#EF4444', marginLeft: '6px' }}>-{commit.deletions}</span>
            </div>
          )}
        </div>
        <span style={{ color: '#6B7280', fontSize: '10px' }}>{expanded ? '▾' : '▸'}</span>
      </div>
      {expanded && files.length > 0 && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #1e2330' }}>
          <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase' }}>
            Files changed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {files.map((f, i) => (
              <code key={i} style={{ fontFamily: 'monospace', fontSize: '11px', color: '#93c5fd' }}>
                {f}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
