import { useProjectStore } from '../../stores/project-store';
import { useAuthStore } from '../../stores/auth-store';
import { Icons } from '../shared/Icons';

type View = 'board' | 'hooks' | 'stats' | 'flows' | 'team';

const NAV: Array<{ id: View; label: string; icon: React.ReactNode }> = [
  { id: 'board',  label: 'Board',     icon: <Icons.Board /> },
  { id: 'team',   label: 'Team',      icon: <Icons.Team /> },
  { id: 'stats',  label: 'Reports',   icon: <Icons.Stats /> },
  { id: 'flows',  label: 'Flows',     icon: <Icons.Flow /> },
  { id: 'hooks',  label: 'Hooks Log', icon: <Icons.Zap /> },
];

export function Sidebar({ activeView, onViewChange, onNewProject, hookCount }: { activeView: View; onViewChange: (v: View) => void; onNewProject: () => void; hookCount: number }) {
  const { projects, activeProjectId, setActiveProject } = useProjectStore();
  const { workspace, logout } = useAuthStore();

  return (
    <div style={{ width: 220, flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      {/* Logo */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 800 }}>DC</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspace?.name ?? 'Decidr Code'}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>AI Dev Platform</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', padding: '0 8px', marginBottom: '4px', textTransform: 'uppercase' }}>Menu</div>
        {NAV.map(({ id, label, icon }) => {
          const active = activeView === id;
          return (
            <button key={id} onClick={() => onViewChange(id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: active ? '#eff6ff' : 'transparent', color: active ? '#2563eb' : '#64748b', fontSize: '13px', fontWeight: active ? 600 : 500, marginBottom: '1px', textAlign: 'left' }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ flexShrink: 0 }}>{icon}</span>
              {label}
              {id === 'hooks' && hookCount > 0 && <span style={{ marginLeft: 'auto', background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '9999px' }}>{hookCount}</span>}
            </button>
          );
        })}

        {/* Projects */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Projects</span>
            <button onClick={onNewProject} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', padding: '2px' }}><Icons.Plus /></button>
          </div>
          {projects.length === 0 && <div style={{ padding: '6px 10px', color: '#cbd5e1', fontSize: '12px' }}>No projects yet</div>}
          {projects.map((p) => {
            const active = activeProjectId === p.id;
            return (
              <button key={p.id} onClick={() => setActiveProject(p.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: active ? '#eff6ff' : 'transparent', color: active ? '#2563eb' : '#64748b', fontSize: '12px', fontWeight: active ? 600 : 400, marginBottom: '1px', textAlign: 'left' }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px' }}>
        <button onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <Icons.SignOut /> Sign out
        </button>
      </div>
    </div>
  );
}
