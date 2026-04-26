import { Icons } from '../shared/Icons';

type View = 'board' | 'hooks' | 'stats' | 'flows' | 'team';

interface NavTabsProps {
  activeView: View;
  onViewChange: (view: View) => void;
  hookCount?: number;
}

const TABS: Array<{ id: View; label: string; icon: JSX.Element }> = [
  { id: 'board',  label: 'Board',     icon: <Icons.Code /> },
  { id: 'team',   label: 'Team',      icon: <Icons.User /> },
  { id: 'flows',  label: 'Flows',     icon: <Icons.Flow /> },
  { id: 'hooks',  label: 'Hooks Log', icon: <Icons.Zap /> },
  { id: 'stats',  label: 'Stats',     icon: <Icons.BarChart /> },
];

export function NavTabs({ activeView, onViewChange, hookCount = 0 }: NavTabsProps) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #1e233050', padding: '0 28px' }}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 16px', border: 'none', background: 'transparent',
            color: activeView === tab.id ? '#e2e8f0' : '#6B7280',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            borderBottom: activeView === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
            transition: 'all 0.15s',
          }}
        >
          {tab.icon} {tab.label}
          {tab.id === 'hooks' && hookCount > 0 && (
            <span style={{ fontSize: '9px', background: '#172554', color: '#60a5fa', padding: '1px 5px', borderRadius: '8px', fontWeight: 700 }}>
              {hookCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
