import type { NodeType } from '../types/reasoning';

export const NODE_TYPE_STYLES: Record<
  NodeType,
  { color: string; bg: string; border: string; icon: string | null }
> = {
  problem:       { color: '#F59E0B', bg: '#422006', border: '#F59E0B30', icon: '?' },
  investigation: { color: '#3B82F6', bg: '#172554', border: '#3B82F630', icon: 'S' },
  discovery:     { color: '#06B6D4', bg: '#083344', border: '#06B6D430', icon: '!' },
  root_cause:    { color: '#EF4444', bg: '#451215', border: '#EF444430', icon: 'X' },
  decision:      { color: '#A855F7', bg: '#2e1065', border: '#A855F730', icon: 'D' },
  chosen:        { color: '#10B981', bg: '#052e16', border: '#10B98130', icon: null },
  rejected:      { color: '#6B7280', bg: '#1f2937', border: '#6B728030', icon: null },
  ruled_out:     { color: '#6B7280', bg: '#1f2937', border: '#6B728030', icon: null },
};
