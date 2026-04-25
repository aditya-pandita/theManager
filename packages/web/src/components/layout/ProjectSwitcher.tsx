import { useState } from 'react';
import { useProjectStore } from '../../stores/project-store';
import type { Project } from '../../types';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

async function pickFolder(): Promise<string | null> {
  if (!isTauri()) return null;
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({ directory: true, multiple: false, title: 'Choose project folder' });
    return typeof selected === 'string' ? selected : null;
  } catch {
    return null;
  }
}

interface Props {
  onProjectChange: (id: string | null) => void;
}

const inputStyle: React.CSSProperties = {
  background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '6px',
  padding: '6px 10px', color: 'var(--text)', fontSize: '12px', outline: 'none', width: '100%',
};

export function ProjectSwitcher({ onProjectChange }: Props) {
  const { projects, activeProjectId, createProject, setActiveProject } = useProjectStore();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newFolder, setNewFolder] = useState('');
  const [browsingFolder, setBrowsingFolder] = useState(false);

  const active = projects.find((p) => p.id === activeProjectId);

  async function handleBrowse() {
    setBrowsingFolder(true);
    const folder = await pickFolder();
    if (folder) setNewFolder(folder);
    setBrowsingFolder(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    const project = await createProject({
      name: newName.trim(),
      color: newColor,
      folderPath: newFolder.trim() || undefined,
    });
    setActiveProject(project.id);
    onProjectChange(project.id);
    setNewName('');
    setNewFolder('');
    setCreating(false);
    setOpen(false);
  }

  function select(p: Project | null) {
    const id = p?.id ?? null;
    setActiveProject(id);
    onProjectChange(id);
    setOpen(false);
  }

  function cancelCreate() {
    setCreating(false);
    setNewName('');
    setNewFolder('');
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
          background: 'var(--button-bg)', border: '1px solid var(--border)', borderRadius: '8px',
          color: 'var(--text)', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3B82F6')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: active?.color ?? 'var(--text-faint)', flexShrink: 0 }} />
        {active?.name ?? 'All Projects'}
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, minWidth: '260px', zIndex: 200,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden',
        }}>
          {/* All projects option */}
          <button onClick={() => select(null)} style={menuItemStyle(activeProjectId === null)}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-faint)' }} />
            <span style={{ flex: 1 }}>All Projects</span>
          </button>

          {projects.map((p) => (
            <button key={p.id} onClick={() => select(p)} style={menuItemStyle(activeProjectId === p.id)}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              {p.folderPath && (
                <span title={p.folderPath} style={{ fontSize: '10px', color: 'var(--text-faint)', marginLeft: 4 }}>
                  📁
                </span>
              )}
            </button>
          ))}

          <div style={{ borderTop: '1px solid var(--border)', padding: '8px' }}>
            {creating ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                {/* Name */}
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') cancelCreate(); }}
                  placeholder="Project name…"
                  style={inputStyle}
                />

                {/* Folder path */}
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Project Folder (optional)
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      value={newFolder}
                      onChange={(e) => setNewFolder(e.target.value)}
                      placeholder={isTauri() ? 'Click Browse or type a path…' : 'e.g. C:\\Projects\\my-app'}
                      style={{ ...inputStyle, flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}
                    />
                    {isTauri() && (
                      <button
                        onClick={handleBrowse}
                        disabled={browsingFolder}
                        title="Browse for folder"
                        style={{
                          padding: '5px 10px', background: '#172554', border: '1px solid #1d4ed8',
                          borderRadius: '6px', color: '#93c5fd', cursor: browsingFolder ? 'not-allowed' : 'pointer',
                          fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                      >
                        {browsingFolder ? '…' : '📂'}
                      </button>
                    )}
                  </div>
                  {newFolder && (
                    <div style={{ marginTop: '4px', fontSize: '10px', color: '#6366f1', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {newFolder}
                    </div>
                  )}
                </div>

                {/* Colour picker */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: newColor === c ? '2px solid var(--text)' : '2px solid transparent', cursor: 'pointer' }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleCreate}
                    style={{ flex: 1, padding: '6px', background: '#2563EB', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                  >
                    Create Project
                  </button>
                  <button
                    onClick={cancelCreate}
                    style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                style={{ width: '100%', padding: '7px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', textAlign: 'center' }}
              >
                + New Project
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function menuItemStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '8px',
    width: '100%', padding: '8px 12px', border: 'none', textAlign: 'left',
    background: active ? '#172554' : 'transparent',
    color: active ? '#93c5fd' : 'var(--text)',
    cursor: 'pointer', fontSize: '12px', transition: 'background 0.1s',
  };
}
