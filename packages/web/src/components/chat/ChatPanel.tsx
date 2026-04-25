import { useEffect, useRef, useState } from 'react';
import { api } from '../../api/client';

const AGENT_COLOR: Record<string, string> = {
  planner: '#a855f7', architect: '#3b82f6', coder: '#22c55e',
  reviewer: '#f59e0b', tester: '#06b6d4', debugger: '#ef4444', docs: '#64748b',
};

export function ChatPanel({ ticketId }: { ticketId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/api/tickets/${ticketId}/chat`).then(setMessages).catch(() => {});
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 && (
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
            Type a message or use @agent, /command
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'agent' && msg.agentName && (
              <span style={{ fontSize: '10px', color: AGENT_COLOR[msg.agentName] ?? '#64748b', marginBottom: '2px', textTransform: 'capitalize' }}>
                @{msg.agentName}
              </span>
            )}
            <div style={{
              maxWidth: '80%', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', lineHeight: '1.5',
              background: msg.role === 'user' ? '#3b82f622' : '#1e2533',
              color: '#e2e8f0',
              border: `1px solid ${msg.role === 'user' ? '#3b82f644' : '#334155'}`,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ background: '#1e2533', border: '1px solid #334155', borderRadius: '10px', padding: '8px 12px', color: '#64748b', fontSize: '13px' }}>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #1e2533', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Message agents... (@coder, /run-tests, #src/file.ts)"
          style={{ flex: 1, background: '#0d1117', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px' }}
        />
        <button onClick={send} disabled={sending || !input.trim()} style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', padding: '8px 14px', cursor: 'pointer', opacity: (!input.trim() || sending) ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}
