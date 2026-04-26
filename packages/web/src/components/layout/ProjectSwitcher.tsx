import { useState } from 'react';
import { useProjectStore } from '../../stores/project-store';
import type { Project } from '../../types';

interface Props {
  onProjectChange: (id: string | null) => void;
  onNewProject: () => void;
}

export function ProjectSwitcher({ onProjectChange, onNewProject }: Props) {
  const { projects, activeProjectId, setActiveProject } = useProjectStore();
  const [open, setOpen] = useState(false);

  const active = projects.find((p) => p.id === activeProjectId);

  function select(p: Project | null) {
    const id = p?.id ?? null;
    setActiveProject(id);
    onProjectChange(id);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#111318', border: '1px solid #1e2330', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: active?.color ?? '#4B5563', flexShrink: 0 }} />
        {active?.name ?? 'All Projects'}
        <span style={{ color: '#6B7280', fontSize: '10px' }}>▾</span>
      </button>

      {open && (
        <div
          style={{ position: 'absolute', top: '110%', left: 0, minWidth: '220px', zIndex: 200, background: '#13161d', border: '1px solid #1e2330', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}
          onMouseLeave={() => setOpen(false)}
        >
          <button onClick={() => select(null)} style={itemStyle(activeProjectId === null)}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4B5563' }} />
            All Projects
          </button>

          {projects.map((p) => (
            <button key={p.id} onClick={() => select(p)} style={itemStyle(activeProjectId === p.id)}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            </button>
          ))}

          <div style={{ borderTop: '1px solid #1e2330', padding: '6px' }}>
            <button
              onClick={() => { setOpen(false); onNewProject(); }}
              style={{ width: '100%', padding: '8px', background: '#3b82f611', border: '1px solid #3b82f633', borderRadius: '6px', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}
            >
              + New Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function itemStyle(active: boolean) {
  return {
    display: 'flex' as const, alignItems: 'center' as const, gap: '8px',
    width: '100%', padding: '8px 12px', border: 'none', textAlign: 'left' as const,
    background: active ? '#172554' : 'transparent', color: active ? '#93c5fd' : '#e2e8f0',
    cursor: 'pointer' as const, fontSize: '12px',
  };
}
