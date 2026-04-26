import { useAuthStore } from '../../stores/auth-store';
import { useProjectStore } from '../../stores/project-store';
import type { Ticket } from '../../types';

interface TopBarProps {
  tickets: Ticket[];
  onProjectChange: (id: string | null) => void;
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function TopBar({ tickets, onProjectChange }: TopBarProps) {
  const { user } = useAuthStore();
  const { projects, activeProjectId } = useProjectStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const done = tickets.filter((t) => t.status === 'done').length;

  return (
    <div style={{
      height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: '16px', flexShrink: 0,
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
          {activeProject?.name ?? 'All Projects'}
        </h1>
      </div>

      {/* Progress pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '5px 12px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>{done}/{tickets.length} done</span>
      </div>

      {/* User avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: user?.avatarColor ?? '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
          {user ? initials(user.name) : '?'}
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{user?.name?.split(' ')[0] ?? 'User'}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Owner</div>
        </div>
      </div>
    </div>
  );
}
