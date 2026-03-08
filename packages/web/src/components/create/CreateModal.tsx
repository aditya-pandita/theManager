import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { PriorityPicker } from './PriorityPicker';
import { TagPicker } from './TagPicker';
import { CodeAttach } from './CodeAttach';
import { Icons } from '../shared/Icons';
import type { Priority } from '../../types';

interface CreateModalProps {
  onClose: () => void;
  onCreate: (input: { title: string; description: string; priority: Priority; tags: string[]; diff?: { filePath: string; beforeCode: string; afterCode: string } }) => Promise<void>;
}

const labelStyle: React.CSSProperties = { color: '#94a3b8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c0e14', border: '1px solid #1e2330', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

export function CreateModal({ onClose, onCreate }: CreateModalProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [filePath, setFilePath] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: desc.trim(),
        priority,
        tags,
        diff: filePath && code ? { filePath, beforeCode: code, afterCode: '' } : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} width={540}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2330', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#3B82F6' }}><Icons.Plus /></span> New Ticket
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px' }}><Icons.X /></button>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>TITLE</label>
          <input style={inputStyle} placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div>
          <label style={labelStyle}>DESCRIPTION</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Describe the task or instructions for Claude..." value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>PRIORITY</label>
          <PriorityPicker value={priority} onChange={setPriority} />
        </div>
        <div>
          <label style={labelStyle}>TAGS</label>
          <TagPicker selected={tags} onChange={setTags} />
        </div>
        <CodeAttach filePath={filePath} code={code} onFilePathChange={setFilePath} onCodeChange={setCode} />
      </div>
      <div style={{ padding: '16px 24px', borderTop: '1px solid #1e2330', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1e2330', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
        <button
          onClick={handleCreate}
          disabled={!title.trim() || submitting}
          style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: title.trim() ? 'pointer' : 'default', fontSize: '13px', fontWeight: 600, background: title.trim() ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : '#1e2330', color: title.trim() ? '#fff' : '#4B5563', transition: 'all 0.2s' }}
        >
          {submitting ? 'Creating...' : 'Create Ticket'}
        </button>
      </div>
    </Modal>
  );
}
