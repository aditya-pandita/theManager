import { ProgressBar } from '../shared/ProgressBar';
import { ProjectSwitcher } from './ProjectSwitcher';
import type { Ticket } from '../../types';

interface HeaderProps {
  tickets: Ticket[];
  onProjectChange: (id: string | null) => void;
}

export function Header({ tickets, onProjectChange }: HeaderProps) {
  const total = tickets.length;
  const done = tickets.filter((t) => t.status === 'done').length;

  return (
    <div style={{ borderBottom: '1px solid #1e2330', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #A855F7, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 700, color: '#fff',
        }}>
          DC
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>Decidr Code</div>
          <div style={{ fontSize: '11px', color: '#6B7280' }}>Decisions, made visible</div>
        </div>
        <ProjectSwitcher onProjectChange={onProjectChange} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '11px', color: '#6B7280' }}>
          <span style={{ color: '#10B981', fontWeight: 600 }}>{done}</span>/{total} completed
        </div>
        <ProgressBar value={done} max={total} width={100} color="#10B981" />
      </div>
    </div>
  );
}
