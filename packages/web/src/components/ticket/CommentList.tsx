import { Avatar } from '../shared/Avatar';
import type { Comment } from '../../types';

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px', fontStyle: 'italic' }}>No comments yet. Start the conversation.</div>;
  }

  return (
    <>
      {comments.map((c, i) => {
        const author = c.by ?? c.author ?? 'Unknown';
        const ts = c.ts ?? c.createdAt;
        return (
          <div key={i} style={{ display: 'flex', gap: '12px' }}>
            <Avatar name={author} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#1e293b', fontSize: '12px', fontWeight: 600 }}>{author}</span>
                {ts && <span style={{ color: '#94a3b8', fontSize: '10px' }}>{new Date(ts).toLocaleString()}</span>}
              </div>
              <div style={{ color: '#1e293b', fontSize: '13px', lineHeight: '1.5', background: '#fff', borderRadius: '8px', padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                {c.text}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
