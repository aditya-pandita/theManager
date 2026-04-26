import { useState } from 'react';
import { PriorityPicker } from './PriorityPicker';
import { TagPicker } from './TagPicker';
import { CodeAttach } from './CodeAttach';
import { Icons } from '../shared/Icons';
import { useProjectStore } from '../../stores/project-store';
import type { Priority } from '../../types';

interface CreateModalProps {
  onClose: () => void;
  onCreate: (input: { title: string; description: string; priority: Priority; tags: string[]; projectId: string | null; diff?: { filePath: string; beforeCode: string; afterCode: string } }) => Promise<void>;
}

const inp: React.CSSProperties = {
  width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
  padding: '10px 14px', color: '#1e293b', fontSize: '13px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  color: '#64748b', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
  marginBottom: '6px', display: 'block', textTransform: 'uppercase',
};

export function CreateModal({ onClose, onCreate }: CreateModalProps) {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [projectId, setProjectId] = useState<string | null>(activeProjectId ?? projects[0]?.id ?? null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [filePath, setFilePath] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedProject = projects.find((p) => p.id === projectId);

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), description: desc.trim(), priority, tags, projectId, diff: filePath && code ? { filePath, beforeCode: code, afterCode: '' } : undefined });
      onClose();
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#2563eb', display: 'flex' }}><Icons.Plus /></span> New Ticket
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '2px' }}><Icons.X /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
          <div>
            <label style={lbl}>Project</label>
            <div style={{ position: 'relative' }}>
              {selectedProject && (
                <span aria-hidden style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: selectedProject.color, pointerEvents: 'none' }} />
              )}
              <select
                value={projectId ?? ''}
                onChange={(e) => setProjectId(e.target.value || null)}
                style={{ ...inp, paddingLeft: selectedProject ? 30 : 14, appearance: 'none', cursor: 'pointer' }}
              >
                {projects.length === 0 && <option value="">(no projects)</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Title</label>
            <input style={inp} placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
          </div>
          <div>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} placeholder="Describe the task or instructions for the AI agents..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Priority</label>
            <PriorityPicker value={priority} onChange={setPriority} />
          </div>
          <div>
            <label style={lbl}>Tags</label>
            <TagPicker selected={tags} onChange={setTags} />
          </div>
          <CodeAttach filePath={filePath} code={code} onFilePathChange={setFilePath} onCodeChange={setCode} />
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#fff' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || submitting}
            style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: title.trim() && !submitting ? '#2563eb' : '#e2e8f0', color: title.trim() && !submitting ? '#fff' : '#94a3b8', cursor: title.trim() ? 'pointer' : 'default', fontSize: '13px', fontWeight: 600 }}
          >
            {submitting ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
