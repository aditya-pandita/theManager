import type { Status } from '../types/ticket';

export const COLUMNS: Array<{ id: Status; label: string; color: string }> = [
  { id: 'backlog', label: 'BACKLOG', color: '#6B7280' },
  { id: 'todo', label: 'TO DO', color: '#F59E0B' },
  { id: 'in_progress', label: 'IN PROGRESS', color: '#3B82F6' },
  { id: 'review', label: 'REVIEW', color: '#A855F7' },
  { id: 'done', label: 'DONE', color: '#10B981' },
];

export const STATUS_ORDER: Status[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
