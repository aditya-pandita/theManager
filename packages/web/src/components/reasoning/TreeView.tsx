import { TreeNode } from './TreeNode';
import { TreeLegend } from './TreeLegend';
import type { TreeNode as TreeNodeType } from '../../types';

interface TreeViewProps {
  tree: TreeNodeType;
}

export function TreeView({ tree }: TreeViewProps) {
  return (
    <div style={{ padding: '4px 0' }}>
      <TreeNode node={tree} />
      <TreeLegend />
    </div>
  );
}
