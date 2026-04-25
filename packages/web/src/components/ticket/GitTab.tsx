import { useState } from 'react';
import { api } from '../../api/client';
import { BranchCard } from './BranchCard';
import { CommitList } from './CommitList';
import { MergeStatus } from './MergeStatus';
import type { GitBranch, GitCommit } from '../../types';

interface Props {
  ticketId: string;
  branches?: GitBranch[];
  commits?: GitCommit[];
  onRefresh?: () => void;
}

export function GitTab({ ticketId, branches = [], commits = [], onRefresh }: Props) {
  const [linking, setLinking] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');

  const hasOpenBranches = branches.some((b) => b.status === 'open');
  const hasMergedBranches = branches.some((b) => b.status === 'merged');

  async function handleLink() {
    if (!branchName.trim()) return;
    setLinking(true);
    try {
      await api.post(`/api/tickets/${ticketId}/git/branch`, { branchName: branchName.trim() });
      setBranchName('');
      onRefresh?.();
    } finally {
      setLinking(false);
    }
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      await api.post(`/api/tickets/${ticketId}/git/branch`, { name: createName.trim() });
      setCreateName('');
      onRefresh?.();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <MergeStatus hasOpenBranches={hasOpenBranches} hasMergedBranches={hasMergedBranches} />

      {/* Branches */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Branches
        </div>
        {branches.length > 0 ? (
          branches.map((b) => <BranchCard key={b.id} branch={b} />)
        ) : (
          <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '12px' }}>
            No branches linked. Use naming <code style={{ color: '#6366f1' }}>DC-XXX/feature-name</code> or link manually.
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <input
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLink()}
            placeholder="Link existing branch…"
            style={{
              flex: 1,
              minWidth: '180px',
              background: '#0c0e14',
              border: '1px solid #1e2330',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#e2e8f0',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          />
          <button
            onClick={handleLink}
            disabled={linking || !branchName.trim()}
            style={{
              padding: '6px 14px',
              background: '#172554',
              border: '1px solid #1d4ed8',
              borderRadius: '6px',
              color: '#93c5fd',
              cursor: linking ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            {linking ? '…' : 'Link'}
          </button>

          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Create branch name…"
            style={{
              flex: 1,
              minWidth: '160px',
              background: '#0c0e14',
              border: '1px solid #1e2330',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#e2e8f0',
              fontSize: '12px',
            }}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !createName.trim()}
            style={{
              padding: '6px 14px',
              background: '#14532d',
              border: '1px solid #166534',
              borderRadius: '6px',
              color: '#86efac',
              cursor: creating ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            {creating ? '…' : 'Create'}
          </button>
        </div>
      </div>

      {/* Commits */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Commits
        </div>
        <CommitList commits={commits} />
      </div>
    </div>
  );
}
