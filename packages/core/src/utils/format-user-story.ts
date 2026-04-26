import type { UserStory } from '../types/ticket';

export function formatUserStory(story: UserStory | null | undefined): string | null {
  if (!story) return null;
  const role = (story.role ?? '').trim();
  const want = (story.want ?? '').trim();
  const benefit = (story.benefit ?? '').trim();
  const ac = (story.acceptanceCriteria ?? '').trim();
  const files = (story.files ?? []).filter(Boolean);

  if (!role && !want && !benefit && !ac && files.length === 0) return null;

  const lines: string[] = [];
  if (role || want || benefit) {
    lines.push(`As ${role || 'a user'}, I want ${want || '...'} so that ${benefit || '...'}.`);
  }
  if (ac) {
    lines.push('');
    lines.push('Acceptance Criteria:');
    lines.push(ac);
  }
  if (files.length > 0) {
    lines.push('');
    lines.push('Referenced Files:');
    for (const f of files) lines.push(`- ${f}`);
  }
  return lines.join('\n');
}
