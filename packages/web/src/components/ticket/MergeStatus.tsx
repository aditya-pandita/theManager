interface Props {
  hasOpenBranches: boolean;
  hasMergedBranches: boolean;
}

export function MergeStatus({ hasOpenBranches, hasMergedBranches }: Props) {
  if (!hasOpenBranches && !hasMergedBranches) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: hasOpenBranches ? '#172554' : '#14532d',
        border: `1px solid ${hasOpenBranches ? '#1d4ed8' : '#166534'}`,
        borderRadius: '8px',
        marginBottom: '12px',
        fontSize: '12px',
        color: hasOpenBranches ? '#93c5fd' : '#86efac',
      }}
    >
      {hasOpenBranches ? (
        <>Branches open — merge to main to complete</>
      ) : (
        <>All branches merged</>
      )}
    </div>
  );
}
