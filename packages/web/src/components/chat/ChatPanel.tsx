import { useEffect, useRef, useState } from 'react';
import { api } from '../../api/client';
import { Icons } from '../shared/Icons';

const AGENT_BADGE: Record<string, { bg: string; color: string }> = {
  planner:   { bg: '#f5f3ff', color: '#7c3aed' },
  architect: { bg: '#eff6ff', color: '#2563eb' },
  coder:     { bg: '#f0fdf4', color: '#16a34a' },
  reviewer:  { bg: '#fffbeb', color: '#d97706' },
  tester:    { bg: '#ecfeff', color: '#0891b2' },
  debugger:  { bg: '#fef2f2', color: '#dc2626' },
  docs:      { bg: '#f8fafc', color: '#64748b' },
};

export function ChatPanel({ ticketId }: { ticketId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { api.get(`/api/tickets/${ticketId}/chat`).then(setMessages).catch(() => {}); }, [ticketId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input;
    setInput('');
    setMessages((m) => [...m, { id: Date.now(), role: 'user', content: text }]);
    try {
      const resp = await api.post(`/api/tickets/${ticketId}/chat`, { content: text });
      setMessages((m) => [...m, resp]);
    } catch (err) {
      setMessages((m) => [...m, { id: Date.now() + 1, role: 'agent', agentName: 'system', content: 'Error: ' + (err as Error).message }]);
    } finally { setSending(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '32px 0' }}>
            <div style={{ marginBottom: '8px', color: '#cbd5e1', display: 'flex', justifyContent: 'center' }}><Icons.Chat /></div>
            Type a message or use @agent, /command
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'agent' && msg.agentName && (
              <span style={{ fontSize: '10px', fontWeight: 600, marginBottom: '3px', padding: '2px 8px', borderRadius: '9999px', ...( AGENT_BADGE[msg.agentName] ?? { bg: '#f1f5f9', color: '#64748b' } ), background: (AGENT_BADGE[msg.agentName] ?? { bg: '#f1f5f9' }).bg }}>
                @{msg.agentName}
              </span>
            )}
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.55,
              background: msg.role === 'user' ? '#2563eb' : '#f8fafc',
              color: msg.role === 'user' ? '#fff' : '#1e293b',
              border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex' }}>
            <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', color: '#94a3b8', fontSize: '13px' }}>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', background: '#fff' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Message agents… (@coder, /run-tests, #src/file.ts)"
          style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 14px', color: '#1e293b', fontSize: '13px', outline: 'none' }}
        />
        <button onClick={send} disabled={sending || !input.trim()} style={{ background: '#2563eb', border: 'none', borderRadius: '8px', color: '#fff', padding: '9px 14px', cursor: 'pointer', opacity: (!input.trim() || sending) ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
          <Icons.Send />
        </button>
      </div>
    </div>
  );
}
