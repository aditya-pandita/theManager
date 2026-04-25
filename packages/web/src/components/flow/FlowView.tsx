import { useState } from 'react';

type FlowType = 'architecture' | 'dataflow' | 'lifecycle' | 'reasoning';

const NODES = {
  architecture: [
    { id: 'core', label: 'core', x: 200, y: 100 },
    { id: 'server', label: 'server', x: 80, y: 200 },
    { id: 'mcp', label: 'mcp', x: 200, y: 200 },
    { id: 'web', label: 'web', x: 320, y: 200 },
    { id: 'file-bridge', label: 'file-bridge', x: 200, y: 280 },
  ],
  dataflow: [
    { id: 'ui', label: 'User Action', x: 200, y: 60 },
    { id: 'store', label: 'Zustand Store', x: 200, y: 140 },
    { id: 'api', label: 'REST API', x: 200, y: 220 },
    { id: 'service', label: 'Service', x: 200, y: 300 },
    { id: 'repo', label: 'Repository', x: 200, y: 380 },
    { id: 'db', label: 'PostgreSQL', x: 200, y: 460 },
  ],
  lifecycle: [
    { id: 'backlog', label: 'Backlog', x: 80, y: 120 },
    { id: 'todo', label: 'Todo', x: 200, y: 120 },
    { id: 'in_progress', label: 'In Progress', x: 320, y: 120 },
    { id: 'review', label: 'Review', x: 440, y: 120 },
    { id: 'done', label: 'Done', x: 560, y: 120 },
  ],
  reasoning: [
    { id: 'ticket', label: 'Ticket', x: 200, y: 80 },
    { id: 'agent', label: 'Agent Router', x: 200, y: 160 },
    { id: 'claude', label: 'Claude API', x: 200, y: 240 },
    { id: 'tree', label: 'Reasoning Tree', x: 200, y: 320 },
    { id: 'diff', label: 'Diff', x: 200, y: 400 },
  ],
};

const EDGES: Record<FlowType, [string, string][]> = {
  architecture: [
    ['server', 'core'],
    ['mcp', 'core'],
    ['web', 'server'],
    ['file-bridge', 'core'],
  ],
  dataflow: [
    ['ui', 'store'],
    ['store', 'api'],
    ['api', 'service'],
    ['service', 'repo'],
    ['repo', 'db'],
  ],
  lifecycle: [
    ['backlog', 'todo'],
    ['todo', 'in_progress'],
    ['in_progress', 'review'],
    ['review', 'done'],
  ],
  reasoning: [
    ['ticket', 'agent'],
    ['agent', 'claude'],
    ['claude', 'tree'],
    ['claude', 'diff'],
  ],
};

export function FlowView() {
  const [flow, setFlow] = useState<FlowType>('architecture');
  const nodes = NODES[flow];
  const edges = EDGES[flow];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['architecture', 'dataflow', 'lifecycle', 'reasoning'] as FlowType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFlow(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${flow === f ? '#3B82F6' : '#1e2330'}`,
              background: flow === f ? '#172554' : 'transparent',
              color: flow === f ? '#93c5fd' : '#6B7280',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {f.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      <div style={{ background: '#0c0e14', border: '1px solid #1e2330', borderRadius: '12px', padding: '24px', overflow: 'auto' }}>
        <svg width="640" height="520" style={{ display: 'block', margin: '0 auto' }}>
          {edges.map(([from, to], i) => {
            const n1 = nodes.find((n) => n.id === from)!;
            const n2 = nodes.find((n) => n.id === to)!;
            const midX = (n1.x + n2.x) / 2;
            const midY = (n1.y + n2.y) / 2;
            return (
              <g key={i}>
                <line x1={n1.x + 60} y1={n1.y + 20} x2={midX + 10} y2={midY} stroke="#3B82F6" strokeWidth="1.5" opacity={0.6} />
                <line x1={midX + 10} y1={midY} x2={n2.x + 60} y2={n2.y + 20} stroke="#3B82F6" strokeWidth="1.5" opacity={0.6} />
                <polygon points={`${n2.x + 60},${n2.y + 20} ${n2.x + 55},${n2.y + 10} ${n2.x + 55},${n2.y + 30}`} fill="#3B82F6" opacity={0.8} />
              </g>
            );
          })}
          {nodes.map((n) => (
            <g key={n.id}>
              <rect x={n.x} y={n.y} width="120" height="40" rx="8" fill="#1e2330" stroke="#3B82F6" strokeWidth="1.5" />
              <text x={n.x + 60} y={n.y + 25} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
