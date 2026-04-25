import { ticketService } from './ticket-service';
import { statsService } from './stats-service';
import type { Ticket } from '../types/ticket';

export interface ExportOptions {
  format: 'markdown' | 'html';
  projectId?: string;
  ticketIds?: string[];
}

function indentTree(node: { label?: string; children?: unknown[] }, depth: number): string {
  const prefix = '  '.repeat(depth);
  const line = `${prefix}- ${node.label ?? 'node'}`;
  const children = (node.children as { label?: string; children?: unknown[] }[]) ?? [];
  if (children.length === 0) return line;
  return [line, ...children.map((c) => indentTree(c, depth + 1))].join('\n');
}

export async function generateMarkdown(options: ExportOptions): Promise<string> {
  const tickets = options.ticketIds
    ? await Promise.all(options.ticketIds.map((id) => ticketService.getTicketDetail(id))).then((t) => t.filter(Boolean) as Ticket[])
    : await ticketService.listTickets({ projectId: options.projectId });
  const stats = await statsService.getStats();

  const lines: string[] = [
    '# Decidr Code — Project Export',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Total tickets: ${stats.total}`,
    `- With reasoning: ${stats.withReasoning}`,
    `- Avg confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`,
    '',
    '## Tickets',
    '',
  ];

  for (const t of tickets) {
    lines.push(`### ${t.id} — ${t.title}`);
    lines.push('');
    lines.push(`- **Status**: ${t.status} | **Priority**: ${t.priority}`);
    if (t.description) lines.push(`- **Description**: ${t.description}`);
    if (t.tags?.length) lines.push(`- **Tags**: ${t.tags.join(', ')}`);
    lines.push('');

    if (t.reasoning) {
      lines.push('#### Reasoning');
      lines.push('');
      lines.push(t.reasoning.summary);
      lines.push('');
      lines.push('**Decision tree:**');
      lines.push('```');
      lines.push(indentTree(t.reasoning.tree as { label?: string; children?: unknown[] }, 0));
      lines.push('```');
      lines.push('');
    }

    if (t.diff) {
      lines.push('#### Diff');
      lines.push('');
      lines.push('```diff');
      lines.push(`--- ${t.diff.filePath}`);
      lines.push(`+++ ${t.diff.filePath}`);
      lines.push(t.diff.afterCode.slice(0, 500) + (t.diff.afterCode.length > 500 ? '...' : ''));
      lines.push('```');
      lines.push('');
    }

    if (t.gitBranches?.length || t.gitCommits?.length) {
      lines.push('#### Git');
      lines.push('');
      for (const b of t.gitBranches ?? []) lines.push(`- Branch: ${b.branchName} [${b.status}]`);
      for (const c of (t.gitCommits ?? []).slice(0, 10)) lines.push(`- ${c.abbrevHash} ${c.message}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

export async function generateHtml(options: ExportOptions): Promise<string> {
  const md = await generateMarkdown(options);
  const escaped = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>\n');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Decidr Code Export</title></head><body><pre>${escaped}</pre></body></html>`;
}
