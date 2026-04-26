import { Icons } from '../shared/Icons';
import type { ReactElement } from 'react';

type TabId = 'story' | 'diff' | 'reasoning' | 'comments' | 'pipeline' | 'tests' | 'chat' | 'activity';

interface Tab {
  id: TabId;
  icon: ReactElement;
  label: string;
}

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  commentCount: number;
}

export function TabBar({ activeTab, onTabChange, commentCount }: TabBarProps) {
  const tabs: Tab[] = [
    { id: 'story',     icon: <Icons.User />,    label: 'Story' },
    { id: 'pipeline',  icon: <Icons.Brain />,   label: 'Pipeline' },
    { id: 'chat',      icon: <Icons.Chat />,    label: 'Chat' },
    { id: 'reasoning', icon: <Icons.Brain />,   label: 'Reasoning' },
    { id: 'diff',      icon: <Icons.Code />,    label: 'Diff' },
    { id: 'tests',     icon: <Icons.Code />,    label: 'Tests' },
    { id: 'activity',  icon: <Icons.History />, label: 'Activity' },
    { id: 'comments',  icon: <Icons.Chat />,    label: `Comments (${commentCount})` },
  ];

  return (
    <div className="tab-bar" style={{ display: 'flex', borderBottom: '1px solid #1e2330', padding: '0 24px', overflowX: 'auto', scrollbarWidth: 'none' }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', border: 'none',
            background: 'transparent', color: activeTab === t.id ? '#e2e8f0' : '#6B7280',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            borderBottom: activeTab === t.id ? '2px solid #3B82F6' : '2px solid transparent',
            transition: 'all 0.15s',
          }}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}
