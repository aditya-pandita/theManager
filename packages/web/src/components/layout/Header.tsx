import { ProgressBar } from '../shared/ProgressBar';
import { ProjectSwitcher } from './ProjectSwitcher';
import { useAuthStore } from '../../stores/auth-store';
import type { Ticket } from '../../types';

interface HeaderProps {
  tickets: Ticket[];
  onProjectChange: (id: string | null) => void;
  onNewProject: () => void;
}

export function Header({ tickets, onProjectChange, onNewProject }: HeaderProps) {
  const { user, workspace, logout } = useAuthStore();
  const total = tickets.length;
  const done = tickets.filter((t) => t.status === 'done').length;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <div style={{ borderBottom: '1px solid #1e2330', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #A855F7, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
          DC
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>{workspace?.name ?? 'Decidr Code'}</div>
          <div style={{ fontSize: '11px', color: '#6B7280' }}>Decisions, made visible</div>
        </div>
        <ProjectSwitcher onProjectChange={onProjectChange} onNewProject={onNewProject} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ fontSize: '11px', color: '#6B7280' }}>
          <span style={{ color: '#10B981', fontWeight: 600 }}>{done}</span>/{total} completed
        </div>
        <ProgressBar value={done} max={total} width={100} color="#10B981" />
        {/* User avatar + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: user?.avatarColor ?? '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
            {initials}
          </div>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>{user?.name?.split(' ')[0]}</span>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #1e2330', borderRadius: '6px', color: '#64748b', fontSize: '11px', padding: '4px 8px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
