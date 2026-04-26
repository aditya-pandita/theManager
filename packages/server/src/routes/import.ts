import { Router } from 'express';
import { ticketService } from '@decidr-code/core';
import type { Priority, Status } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

// ---------------------------------------------------------------------------
// CSV parser — handles quoted fields and trailing commas
// ---------------------------------------------------------------------------
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map((h) => h.trim());

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ---------------------------------------------------------------------------
// Field mappers
// ---------------------------------------------------------------------------
const PRIORITY_MAP: Record<string, Priority> = {
  highest: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
  lowest: 'low',
};

const STATUS_MAP: Record<string, Status> = {
  backlog: 'backlog',
  todo: 'todo',
  'to do': 'todo',
  'in progress': 'in_progress',
  in_progress: 'in_progress',
  review: 'review',
  'in review': 'review',
  done: 'done',
  closed: 'done',
  resolved: 'done',
};

function mapPriority(raw: string): Priority {
  return PRIORITY_MAP[raw.toLowerCase()] ?? 'medium';
}

function mapStatus(raw: string): Status {
  return STATUS_MAP[raw.toLowerCase()] ?? 'backlog';
}

function mapTags(labels: string, issueType: string): string[] {
  const tags: string[] = [];
  // Include issue type as a tag (epic/story/task/bug/etc.)
  if (issueType) tags.push(issueType.toLowerCase());
  // Include all comma-separated labels
  if (labels) {
    labels.split(',').forEach((l) => {
      const tag = l.trim().toLowerCase();
      if (tag) tags.push(tag);
    });
  }
  return [...new Set(tags)]; // deduplicate
}

// ---------------------------------------------------------------------------
// POST /api/import/csv
// Accept: raw CSV as text/plain body, or JSON { csv: "..." }
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    let csvText: string;

    if (typeof req.body === 'string') {
      csvText = req.body;
    } else if (req.body?.csv) {
      csvText = req.body.csv;
    } else {
      return sendError(res, 'Send CSV as text/plain body or JSON { csv: "..." }', 400);
    }

    // Read the active project from query (?projectId=PROJ-XXX) so the imported
    // tickets land inside the user's currently-selected project. Falls back to
    // null (orphan tickets, visible only under "All Projects") if not provided.
    const projectIdRaw = (req.query.projectId as string | undefined)?.trim();
    const projectId = projectIdRaw && projectIdRaw.length > 0 ? projectIdRaw : null;

    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return sendError(res, 'No data rows found in CSV', 400);
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const title = (row['Summary'] ?? row['Title'] ?? row['title'] ?? '').trim();
      if (!title) { skipped++; continue; }

      const issueType = row['Issue Type'] ?? row['Type'] ?? '';
      const priority = mapPriority(row['Priority'] ?? '');
      const status = mapStatus(row['Status'] ?? '');
      const tags = mapTags(row['Labels'] ?? row['Tags'] ?? '', issueType);

      // Build description from multiple fields when present
      const descParts: string[] = [];
      if (row['Description']) descParts.push(row['Description']);
      if (row['Acceptance Criteria']) descParts.push(`**Acceptance Criteria:**\n${row['Acceptance Criteria']}`);
      if (row['Story Points']) descParts.push(`**Story Points:** ${row['Story Points']}`);
      if (row['Sprint']) descParts.push(`**Sprint:** ${row['Sprint']}`);
      if (row['Issue ID']) descParts.push(`**Original ID:** ${row['Issue ID']}`);

      try {
        await ticketService.createTicket({
          title,
          description: descParts.join('\n\n') || undefined,
          priority,
          status,
          tags,
          projectId,
        });
        imported++;
      } catch (err: unknown) {
        errors.push(`"${title}": ${(err as Error).message}`);
        skipped++;
      }
    }

    sendJSON(res, { imported, skipped, total: rows.length, errors, projectId }, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
