import { Icons } from '../shared/Icons';

type TabId = 'story' | 'diff' | 'reasoning' | 'comments' | 'pipeline' | 'tests' | 'chat' | 'activity';

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'story',     label: 'Story',    icon: <Icons.User /> },
  { id: 'pipeline',  label: 'Pipeline', icon: <Icons.Pipeline /> },
  { id: 'chat',      label: 'Chat',     icon: <Icons.Chat /> },
  { id: 'reasoning', label: 'Reasoning',icon: <Icons.Brain /> },
  { id: 'diff',      label: 'Diff',     icon: <Icons.Diff /> },
  { id: 'tests',     label: 'Tests',    icon: <Icons.Test /> },
  { id: 'activity',  label: 'Activity', icon: <Icons.Activity /> },
  { id: 'comments',  label: 'Comments', icon: <Icons.Comment /> },
];

export function TabBar({ activeTab, onTabChange, commentCount }: { activeTab: TabId; onTabChange: (t: TabId) => void; commentCount: number }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 24px', background: '#fff', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
      {TABS.map((t) => {
        const active = activeTab === t.id;
        const label = t.id === 'comments' ? `Comments (${commentCount})` : t.label;
        return (
          <button key={t.id} onClick={() => onTabChange(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '11px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: active ? 600 : 500, whiteSpace: 'nowrap', color: active ? '#2563eb' : '#64748b', borderBottom: active ? '2px solid #2563eb' : '2px solid transparent', transition: 'all 0.15s' }}>
            {t.icon} {label}
          </button>
        );
      })}
    </div>
  );
}
