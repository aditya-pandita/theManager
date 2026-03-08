interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No tickets' }: EmptyStateProps) {
  return (
    <div style={{ padding: '30px 10px', textAlign: 'center', color: '#2a2f3e', fontSize: '12px', fontStyle: 'italic' }}>
      {message}
    </div>
  );
}
