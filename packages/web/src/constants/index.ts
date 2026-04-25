import type { Status, Priority } from '../types';

export const COLUMNS: Array<{ id: Status; label: string; color: string }> = [
  { id: 'backlog', label: 'BACKLOG', color: '#6B7280' },
  { id: 'todo', label: 'TO DO', color: '#F59E0B' },
  { id: 'in_progress', label: 'IN PROGRESS', color: '#3B82F6' },
  { id: 'review', label: 'REVIEW', color: '#A855F7' },
  { id: 'done', label: 'DONE', color: '#10B981' },
];

// Each priority has both a dark-mode and light-mode color pair.
// The text color stays vivid in both themes so HIGH/CRITICAL still read as urgent;
// the background is dark-translucent in dark mode and pastel in light mode for
// good contrast against either app background.
export const PRIORITY: Record<Priority, {
  label: string;
  color: string;
  bg: string;
  colorLight: string;
  bgLight: string;
}> = {
  critical: { label: 'CRITICAL', color: '#EF4444', bg: '#451215', colorLight: '#b91c1c', bgLight: '#fee2e2' },
  high:     { label: 'HIGH',     color: '#F97316', bg: '#451a03', colorLight: '#c2410c', bgLight: '#ffedd5' },
  medium:   { label: 'MEDIUM',   color: '#F59E0B', bg: '#422006', colorLight: '#b45309', bgLight: '#fef3c7' },
  low:      { label: 'LOW',      color: '#6B7280', bg: '#1f2937', colorLight: '#475569', bgLight: '#e2e8f0' },
};

export const TAGS = ['bug', 'feature', 'refactor', 'perf', 'docs', 'test', 'style', 'infra'] as const;

export const NODE_STYLES: Record<string, { color: string; bg: string; border: string; icon: string | null }> = {
  problem:       { color: '#F59E0B', bg: '#422006', border: '#F59E0B30', icon: '?' },
  investigation: { color: '#3B82F6', bg: '#172554', border: '#3B82F630', icon: 'S' },
  discovery:     { color: '#06B6D4', bg: '#083344', border: '#06B6D430', icon: '!' },
  root_cause:    { color: '#EF4444', bg: '#451215', border: '#EF444430', icon: 'X' },
  decision:      { color: '#A855F7', bg: '#2e1065', border: '#A855F730', icon: 'D' },
  chosen:        { color: '#10B981', bg: '#052e16', border: '#10B98130', icon: null },
  rejected:      { color: '#6B7280', bg: '#1f2937', border: '#6B728030', icon: null },
  ruled_out:     { color: '#6B7280', bg: '#1f2937', border: '#6B728030', icon: null },
};
