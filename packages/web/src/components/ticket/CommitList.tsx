import { CommitEntry } from './CommitEntry';
import type { GitCommit } from '../../types';

interface Props {
  commits: GitCommit[];
}

export function CommitList({ commits }: Props) {
  if (!commits.length) {
    return (
      <div style={{ color: '#6B7280', fontSize: '12px', padding: '20px', textAlign: 'center' }}>
        No commits linked yet. Create a branch matching <code style={{ color: '#6366f1' }}>DC-XXX/name</code> or add DC-XXX to commit messages.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {commits.map((c) => (
        <CommitEntry key={c.id} commit={c} />
      ))}
    </div>
  );
}
