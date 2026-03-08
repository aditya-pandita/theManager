import { useState } from 'react';
import { NODE_STYLES } from '../../constants';
import { Icons } from '../shared/Icons';
import type { TreeNode as TreeNodeType } from '../../types';

interface TreeNodeProps {
  node: TreeNodeType;
  depth?: number;
}

export function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const style = NODE_STYLES[node.type] ?? NODE_STYLES.investigation;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (hasChildren) setExpanded(!expanded);
    else if (node.detail) setShowDetail(!showDetail);
  };

  return (
    <div style={{ marginLeft: depth > 0 ? 28 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        {depth > 0 && (
          <div style={{ width: '28px', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', left: '0', top: '0', bottom: '50%', width: '1px', background: '#1e2330' }} />
            <div style={{ position: 'absolute', left: '0', top: '50%', width: '14px', height: '1px', background: '#1e2330' }} />
          </div>
        )}
        <div style={{ flex: 1, marginBottom: '6px' }}>
          <div
            onClick={handleClick}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: style.bg, border: `1px solid ${style.border}`, borderRadius: '8px', cursor: hasChildren || node.detail ? 'pointer' : 'default', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { if (hasChildren || node.detail) e.currentTarget.style.borderColor = style.color + '60'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = style.border; }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: style.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: style.color, fontSize: '10px', fontWeight: 700 }}>
              {node.type === 'chosen' ? <Icons.Check /> : node.type === 'rejected' || node.type === 'ruled_out' ? <Icons.Ban /> : hasChildren ? (expanded ? <Icons.ChevDown /> : <Icons.ChevRight />) : style.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: style.color, fontSize: '12px', fontWeight: 600, lineHeight: '1.3' }}>{node.label}</div>
              <span style={{ fontSize: '9px', color: style.color + '80', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                {node.type.replace('_', ' ')}
              </span>
            </div>
            {node.detail && !hasChildren && (
              <div style={{ color: style.color + '60', fontSize: '10px', flexShrink: 0, transition: 'transform 0.15s', transform: showDetail ? 'rotate(0)' : 'rotate(-90deg)' }}>
                <Icons.ChevDown />
              </div>
            )}
          </div>
          {node.detail && (showDetail || (hasChildren && expanded)) && (
            <div style={{ margin: '4px 0 4px 28px', padding: '8px 12px', fontSize: '11px', lineHeight: '1.5', color: '#94a3b8', background: '#0c0e14', borderRadius: '6px', border: '1px solid #1e233080', borderLeft: `2px solid ${style.color}40` }}>
              {node.detail}
            </div>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <div style={{ position: 'relative' }}>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
