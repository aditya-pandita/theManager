import type { GitBranch } from '../../types';

interface Props {
  branch: GitBranch;
}

const statusColors: Record<string, string> = {
  open: '#10B981',
  merged: '#6366f1',
  stale: '#F59E0B',
  deleted: '#6B7280',
};

export function BranchCard({ branch }: Props) {
  const color = statusColors[branch.status] ?? '#6B7280';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: '#0c0e14',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        marginBottom: '8px',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <code
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          color: '#e2e8f0',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {branch.branchName}
      </code>
      <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'capitalize' }}>
        {branch.status}
      </span>
      {(branch.aheadCount > 0 || branch.behindCount > 0) && (
        <span style={{ fontSize: '10px', color: '#6366f1' }}>
          ↑{branch.aheadCount} ↓{branch.behindCount}
        </span>
      )}
      {branch.storyId && (
        <span style={{ fontSize: '10px', background: '#1e1b4b', color: '#a5b4fc', padding: '2px 6px', borderRadius: '4px' }}>
          {branch.storyId}
        </span>
      )}
    </div>
  );
}
