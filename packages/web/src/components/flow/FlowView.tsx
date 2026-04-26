import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useProjectStore } from '../../stores/project-store';

type FlowType = 'architecture' | 'dataflow' | 'lifecycle' | 'reasoning';

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  count?: number;
  color?: string;
  meta?: Record<string, unknown>;
}

interface FlowEdge {
  from: string;
  to: string;
  weight?: number;
  label?: string;
}

interface FlowDiagram {
  hasData: boolean;
  emptyMessage?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowsResponse {
  hasTickets: boolean;
  hasReasoning: boolean;
  ticketCount: number;
  reasoningCount: number;
  architecture: FlowDiagram;
  dataflow: FlowDiagram;
  lifecycle: FlowDiagram;
  reasoning: FlowDiagram;
}

const TABS: Array<{ id: FlowType; label: string; needsReasoning?: boolean }> = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'dataflow',     label: 'Dataflow' },
  { id: 'lifecycle',    label: 'Lifecycle',    needsReasoning: true },
  { id: 'reasoning',    label: 'Reasoning',    needsReasoning: true },
];

function nodeCenter(n: FlowNode) {
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

function FlowCanvas({ diagram }: { diagram: FlowDiagram }) {
  const [hovered, setHovered] = useState<FlowNode | null>(null);

  if (!diagram.hasData) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '13px' }}>{diagram.emptyMessage}</div>
      </div>
    );
  }

  const nodeById = new Map(diagram.nodes.map((n) => [n.id, n]));

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', overflow: 'auto', position: 'relative' }}>
      <svg width="640" height="520" style={{ display: 'block', margin: '0 auto' }}>
        <defs>
          <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {diagram.edges.map((e, i) => {
          const a = nodeById.get(e.from);
          const b = nodeById.get(e.to);
          if (!a || !b) return null;
          const ca = nodeCenter(a);
          const cb = nodeCenter(b);
          const mid = { x: (ca.x + cb.x) / 2, y: (ca.y + cb.y) / 2 };
          return (
            <g key={i}>
              <line
                x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                stroke="#cbd5e1" strokeWidth={Math.min(3, 1 + (e.weight ?? 0))}
                opacity={0.85}
                markerEnd="url(#flow-arrow)"
              />
              {e.label && (
                <g>
                  <rect x={mid.x - 16} y={mid.y - 9} width={32} height={18} rx={4} fill="#fff" stroke="#e2e8f0" />
                  <text x={mid.x} y={mid.y + 3} textAnchor="middle" fontSize="10" fontWeight={600} fill="#64748b">{e.label}</text>
                </g>
              )}
            </g>
          );
        })}

        {diagram.nodes.map((n) => {
          const fill = n.color ? `${n.color}1a` : '#eff6ff';
          const stroke = n.color ?? '#3B82F6';
          const textColor = n.color ?? '#1e293b';
          return (
            <g key={n.id}
               style={{ cursor: n.meta ? 'pointer' : 'default' }}
               onMouseEnter={() => n.meta && setHovered(n)}
               onMouseLeave={() => setHovered(null)}
            >
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8} fill={fill} stroke={stroke} strokeWidth="1.5" />
              <text x={n.x + n.w / 2} y={n.y + n.h / 2 + (n.count !== undefined ? -2 : 4)} textAnchor="middle" fill={textColor} fontSize="12" fontWeight="600">
                {n.label}
              </text>
              {n.count !== undefined && (
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 12} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                  {n.count} {n.count === 1 ? 'ticket' : 'tickets'}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hovered?.meta && (
        <div style={{ position: 'absolute', top: 12, right: 12, maxWidth: 280, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{(hovered.meta.title as string) ?? hovered.label}</div>
          {typeof hovered.meta.confidence === 'number' && (
            <div style={{ fontSize: 11, color: hovered.color ?? '#64748b', fontWeight: 600, marginBottom: 4 }}>
              Confidence: {Math.round((hovered.meta.confidence as number) * 100)}%
            </div>
          )}
          {typeof hovered.meta.summary === 'string' && hovered.meta.summary.length > 0 && (
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{hovered.meta.summary}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function FlowView() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [data, setData] = useState<FlowsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [flow, setFlow] = useState<FlowType>('architecture');

  useEffect(() => {
    setLoading(true);
    const qs = activeProjectId ? `?projectId=${encodeURIComponent(activeProjectId)}` : '';
    api.get<FlowsResponse>(`/api/flows${qs}`)
      .then((res) => { setData(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeProjectId]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading flows…</div>;
  }
  if (!data) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Failed to load flows.</div>;
  }

  if (!data.hasTickets) {
    return (
      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ color: '#1e293b', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>No flow data yet</div>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>Create some tickets in this project to see its flows.</div>
        </div>
      </div>
    );
  }

  const activeDiagram = data[flow];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {TABS.map((t) => {
          const isLocked = t.needsReasoning && !data.hasReasoning;
          const isActive = flow === t.id;
          return (
            <button
              key={t.id}
              onClick={() => !isLocked && setFlow(t.id)}
              title={isLocked ? 'Available once tickets have reasoning attached.' : undefined}
              disabled={isLocked}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${isActive ? '#3B82F6' : '#e2e8f0'}`,
                background: isActive ? '#eff6ff' : '#fff',
                color: isLocked ? '#cbd5e1' : isActive ? '#2563eb' : '#64748b',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {t.label}
              {isLocked && <span style={{ fontSize: 10 }}>🔒</span>}
            </button>
          );
        })}
      </div>

      <FlowCanvas diagram={activeDiagram} />

      <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 11 }}>
        {data.ticketCount} ticket{data.ticketCount === 1 ? '' : 's'} · {data.reasoningCount} with reasoning
      </div>
    </div>
  );
}
