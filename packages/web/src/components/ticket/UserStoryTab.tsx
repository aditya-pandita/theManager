import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { useProjectStore } from '../../stores/project-store';
import type { UserStory } from '../../types';

interface Props {
  ticketId: string;
  initial?: UserStory | null;
}

interface ProjectFilesResult {
  folderPath: string | null;
  gitRepoUrl: string | null;
  files: string[];
  truncated: boolean;
  hint?: string;
}

const fieldStyle = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
  padding: '10px 14px', color: '#1e293b', fontSize: '13px', outline: 'none',
  width: '100%', resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: '1.5',
};

const labelStyle = { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px', display: 'block' };

export function UserStoryTab({ ticketId, initial }: Props) {
  const [role, setRole] = useState(initial?.role ?? '');
  const [want, setWant] = useState(initial?.want ?? '');
  const [benefit, setBenefit] = useState(initial?.benefit ?? '');
  const [ac, setAc] = useState(initial?.acceptanceCriteria ?? '');
  const [files, setFiles] = useState<string[]>(initial?.files ?? []);
  const [newFile, setNewFile] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [filesResult, setFilesResult] = useState<ProjectFilesResult | null>(null);
  const lastFetchedQuery = useRef('');
  const datalistId = `files-${ticketId}`;

  // Load existing story if not pre-loaded.
  useEffect(() => {
    if (!initial) {
      api.get<UserStory>(`/api/tickets/${ticketId}/user-story`).then((s) => {
        if (s && (s.role || s.want)) {
          setRole(s.role ?? '');
          setWant(s.want ?? '');
          setBenefit(s.benefit ?? '');
          setAc(s.acceptanceCriteria ?? '');
          setFiles(s.files ?? []);
        }
      }).catch(() => {});
    }
  }, [ticketId, initial]);

  // Debounced file suggestions: refetch when the user has paused typing.
  useEffect(() => {
    if (!activeProjectId) return;
    const q = newFile.trim();
    if (q === lastFetchedQuery.current) return;

    const handle = setTimeout(() => {
      lastFetchedQuery.current = q;
      api.get<ProjectFilesResult>(`/api/projects/${activeProjectId}/files?q=${encodeURIComponent(q)}`)
        .then((res) => setFilesResult(res))
        .catch(() => {});
    }, 200);

    return () => clearTimeout(handle);
  }, [activeProjectId, newFile]);

  async function save() {
    setSaving(true);
    try {
      await api.put(`/api/tickets/${ticketId}/user-story`, { role, want, benefit, acceptanceCriteria: ac, files });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function addFile() {
    const f = newFile.trim();
    if (f && !files.includes(f)) { setFiles([...files, f]); }
    setNewFile('');
  }

  const formatted = role || want || benefit
    ? `As ${role || 'a user'}, I want ${want || '...'} so that ${benefit || '...'}`
    : '';

  const hint = filesResult?.hint;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {formatted && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>User Story</div>
          <div style={{ color: '#1e293b', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>"{formatted}"</div>
        </div>
      )}

      <div>
        <label style={labelStyle}>As a… (role)</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="developer, product manager, end user…"
          style={{ ...fieldStyle, resize: 'none' as unknown as 'vertical' }}
        />
      </div>

      <div>
        <label style={labelStyle}>I want… (feature / action)</label>
        <textarea
          rows={2}
          value={want}
          onChange={(e) => setWant(e.target.value)}
          placeholder="to be able to import tickets from a CSV so I can migrate existing backlogs…"
          style={fieldStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>So that… (benefit / outcome)</label>
        <textarea
          rows={2}
          value={benefit}
          onChange={(e) => setBenefit(e.target.value)}
          placeholder="I don't have to manually re-enter 200 items…"
          style={fieldStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Acceptance Criteria</label>
        <textarea
          rows={5}
          value={ac}
          onChange={(e) => setAc(e.target.value)}
          placeholder={"- Given I have a valid CSV file\n- When I click Import CSV\n- Then all rows appear on the board\n- And skipped rows are counted in the result"}
          style={fieldStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Referenced Files</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#1d4ed8', flex: 1 }}>{f}</span>
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: '0 2px' }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            value={newFile}
            onChange={(e) => setNewFile(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addFile(); }}
            placeholder="src/components/Toolbar.tsx"
            list={filesResult?.files?.length ? datalistId : undefined}
            style={{ ...fieldStyle, flex: 1, resize: 'none' as unknown as 'vertical' }}
          />
          {filesResult?.files?.length ? (
            <datalist id={datalistId}>
              {filesResult.files.slice(0, 100).map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          ) : null}
          <button onClick={addFile} style={{ padding: '8px 14px', background: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 600 }}>
            + Add
          </button>
        </div>
        {hint && (
          <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 11 }}>
            {hint}
          </div>
        )}
        {!hint && filesResult && filesResult.folderPath && (
          <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 11 }}>
            Suggestions from <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{filesResult.folderPath}</span>
            {filesResult.truncated ? ' (truncated)' : ''}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: '9px 24px', background: saved ? '#16a34a' : '#2563eb', border: 'none', borderRadius: '8px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Story'}
        </button>
      </div>
    </div>
  );
}
