import { useState } from 'react';
import { SummaryBar } from './SummaryBar';
import { TreeView } from './TreeView';
import { LogList } from './LogList';
import { Icons } from '../shared/Icons';
import type { Reasoning } from '../../types';

interface ReasoningTabProps {
  reasoning: Reasoning | null;
}

export function ReasoningTab({ reasoning }: ReasoningTabProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'logs'>('tree');

  if (!reasoning) {
    return (
      <div style={{ color: '#4B5563', textAlign: 'center', padding: '40px', fontStyle: 'italic' }}>
        <div style={{ marginBottom: '8px' }}><Icons.Brain /></div>
        No reasoning data yet. Click "Ask Claude to Process" in the Diff tab to generate reasoning.
      </div>
    );
  }

  const views = [
    { id: 'tree', label: 'Decision Tree', icon: <Icons.Brain /> },
    { id: 'logs', label: 'Step-by-Step Logs', icon: <Icons.History /> },
  ] as const;

  return (
    <div>
      <SummaryBar reasoning={reasoning} />
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#0c0e14', borderRadius: '8px', padding: '3px', border: '1px solid #1e2330' }}>
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setViewMode(v.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
              background: viewMode === v.id ? '#1e2330' : 'transparent',
              color: viewMode === v.id ? '#e2e8f0' : '#6B7280', transition: 'all 0.15s',
            }}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>
      {viewMode === 'tree' ? <TreeView tree={reasoning.tree} /> : <LogList logs={reasoning.logs} />}
    </div>
  );
}
