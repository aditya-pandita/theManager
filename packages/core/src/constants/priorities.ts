import type { Priority } from '../types/ticket';

export const PRIORITIES: Array<{
  id: Priority;
  label: string;
  color: string;
  bg: string;
}> = [
  { id: 'critical', label: 'CRITICAL', color: '#EF4444', bg: '#451215' },
  { id: 'high', label: 'HIGH', color: '#F97316', bg: '#451a03' },
  { id: 'medium', label: 'MEDIUM', color: '#F59E0B', bg: '#422006' },
  { id: 'low', label: 'LOW', color: '#6B7280', bg: '#1f2937' },
];

export const PRIORITY_MAP = Object.fromEntries(
  PRIORITIES.map((p) => [p.id, p])
) as Record<Priority, (typeof PRIORITIES)[number]>;
