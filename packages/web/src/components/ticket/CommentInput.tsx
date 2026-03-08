import { useState } from 'react';
import { Icons } from '../shared/Icons';

interface CommentInputProps {
  onSend: (text: string) => Promise<void>;
}

export function CommentInput({ onSend }: CommentInputProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!value.trim() || sending) return;
    setSending(true);
    try {
      await onSend(value.trim());
      setValue('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <input
        style={{ flex: 1, background: '#0c0e14', border: '1px solid #1e2330', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none' }}
        placeholder="Add a comment or instruction..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        disabled={sending}
      />
      <button
        onClick={send}
        disabled={!value.trim() || sending}
        style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: value.trim() ? '#3B82F6' : '#1e2330', color: value.trim() ? '#fff' : '#4B5563', cursor: value.trim() ? 'pointer' : 'default', transition: 'all 0.15s' }}
      >
        <Icons.Send />
      </button>
    </div>
  );
}
