import { ticketRepo } from '../repositories/ticket-repo';
import type { Ticket, Status } from '../types/ticket';

export interface FlowNode {
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

export interface FlowEdge {
  from: string;
  to: string;
  weight?: number;
  label?: string;
}

export interface FlowDiagram {
  hasData: boolean;
  emptyMessage?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowsResponse {
  hasTickets: boolean;
  hasReasoning: boolean;
  ticketCount: number;
  reasoningCount: number;
  architecture: FlowDiagram;
  dataflow: FlowDiagram;
  lifecycle: FlowDiagram;
  reasoning: FlowDiagram;
}

const CANVAS_W = 640;
const CANVAS_H = 520;
const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2;

function placeOnCircle(count: number, radius: number, cx = CX, cy = CY): Array<{ x: number; y: number }> {
  if (count === 0) return [];
  if (count === 1) return [{ x: cx, y: cy }];
  const out: Array<{ x: number; y: number }> = [];
  // Start at top (-π/2) and go clockwise.
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
    out.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  }
  return out;
}

function topFolder(filePath: string): string {
  // packages/web/src/foo.ts → packages/web; src/foo.ts → src; foo.ts → foo.ts
  const parts = filePath.split('/').filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  return parts[0] ?? filePath;
}

function confidenceColor(c: number): string {
  if (c >= 0.8) return '#10b981'; // green
  if (c >= 0.5) return '#f59e0b'; // amber
  return '#ef4444';                // red
}

function buildArchitecture(tickets: Ticket[]): FlowDiagram {
  const tagCounts = new Map<string, number>();
  // folder -> set of tags whose tickets touch that folder
  const folderToTags = new Map<string, Set<string>>();
  // edge key (sorted "a::b") -> set of folders that produced this connection
  const edgeFolders = new Map<string, Set<string>>();

  for (const t of tickets) {
    const tags = (t.tags ?? []).filter(Boolean);
    for (const tag of tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);

    const folders = new Set<string>();
    if (t.diff?.filePath) folders.add(topFolder(t.diff.filePath));
    for (const f of t.userStory?.files ?? []) folders.add(topFolder(f));

    for (const folder of folders) {
      const set = folderToTags.get(folder) ?? new Set<string>();
      for (const tag of tags) set.add(tag);
      folderToTags.set(folder, set);
    }
  }

  if (tagCounts.size === 0) {
    return {
      hasData: false,
      emptyMessage: 'Add tags to your tickets to see the architecture diagram.',
      nodes: [],
      edges: [],
    };
  }

  // Connect two tags whenever they share at least one folder.
  for (const [folder, tagSet] of folderToTags) {
    const tagList = [...tagSet].sort();
    for (let i = 0; i < tagList.length; i++) {
      for (let j = i + 1; j < tagList.length; j++) {
        const key = `${tagList[i]}::${tagList[j]}`;
        const set = edgeFolders.get(key) ?? new Set<string>();
        set.add(folder);
        edgeFolders.set(key, set);
      }
    }
  }

  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
  const positions = placeOnCircle(sortedTags.length, sortedTags.length === 1 ? 0 : 170);
  const nodes: FlowNode[] = sortedTags.map(([tag, count], i) => {
    const w = Math.min(140, 70 + count * 8);
    const h = 40;
    return {
      id: tag,
      label: tag,
      x: positions[i].x - w / 2,
      y: positions[i].y - h / 2,
      w,
      h,
      count,
    };
  });

  const edges: FlowEdge[] = [...edgeFolders.entries()].map(([key, folderSet]) => {
    const [from, to] = key.split('::');
    return { from, to, weight: folderSet.size };
  });

  return { hasData: true, nodes, edges };
}

function buildDataflow(tickets: Ticket[]): FlowDiagram {
  const folderCounts = new Map<string, number>();
  const cooccur = new Map<string, number>();
  for (const t of tickets) {
    const files = new Set<string>();
    if (t.diff?.filePath) files.add(topFolder(t.diff.filePath));
    for (const f of t.userStory?.files ?? []) files.add(topFolder(f));
    const folders = [...files].filter(Boolean);
    for (const f of folders) folderCounts.set(f, (folderCounts.get(f) ?? 0) + 1);
    for (let i = 0; i < folders.length; i++) {
      for (let j = i + 1; j < folders.length; j++) {
        const [a, b] = [folders[i], folders[j]].sort();
        const key = `${a}::${b}`;
        cooccur.set(key, (cooccur.get(key) ?? 0) + 1);
      }
    }
  }

  if (folderCounts.size === 0) {
    return {
      hasData: false,
      emptyMessage: 'Attach files to your tickets (via diffs or user stories) to see the dataflow diagram.',
      nodes: [],
      edges: [],
    };
  }

  const sorted = [...folderCounts.entries()].sort((a, b) => b[1] - a[1]);
  const positions = placeOnCircle(sorted.length, sorted.length === 1 ? 0 : 170);
  const nodes: FlowNode[] = sorted.map(([folder, count], i) => {
    const w = Math.min(160, 80 + count * 8);
    const h = 40;
    return {
      id: folder,
      label: folder,
      x: positions[i].x - w / 2,
      y: positions[i].y - h / 2,
      w,
      h,
      count,
    };
  });
  const edges: FlowEdge[] = [...cooccur.entries()].map(([key, weight]) => {
    const [from, to] = key.split('::');
    return { from, to, weight };
  });
  return { hasData: true, nodes, edges };
}

function buildLifecycle(tickets: Ticket[], reasoningCount: number): FlowDiagram {
  if (reasoningCount === 0) {
    return {
      hasData: false,
      emptyMessage: 'Lifecycle becomes available once at least one ticket has reasoning attached.',
      nodes: [],
      edges: [],
    };
  }

  const counts = {
    Created: tickets.length,
    Reasoned: reasoningCount,
    'In Progress': tickets.filter((t) => t.status === ('in_progress' as Status)).length,
    Review: tickets.filter((t) => t.status === ('review' as Status)).length,
    Done: tickets.filter((t) => t.status === ('done' as Status)).length,
  } as Record<string, number>;

  const stages = Object.keys(counts);
  const w = 110;
  const h = 60;
  const gap = (CANVAS_W - stages.length * w) / (stages.length + 1);
  const y = CY - h / 2;

  const nodes: FlowNode[] = stages.map((stage, i) => ({
    id: stage,
    label: stage,
    x: gap + i * (w + gap),
    y,
    w,
    h,
    count: counts[stage],
  }));
  const edges: FlowEdge[] = [];
  for (let i = 0; i < stages.length - 1; i++) {
    edges.push({
      from: stages[i],
      to: stages[i + 1],
      label: `${counts[stages[i + 1]]}/${counts[stages[i]]}`,
    });
  }
  return { hasData: true, nodes, edges };
}

function buildReasoning(tickets: Ticket[]): FlowDiagram {
  const reasoned = tickets.filter((t) => !!t.reasoning);
  if (reasoned.length === 0) {
    return {
      hasData: false,
      emptyMessage: 'Reasoning view becomes available once at least one ticket has reasoning attached.',
      nodes: [],
      edges: [],
    };
  }

  const projectNodeW = 110;
  const projectNodeH = 50;
  const nodes: FlowNode[] = [
    {
      id: '__project__',
      label: 'Project',
      x: CX - projectNodeW / 2,
      y: CY - projectNodeH / 2,
      w: projectNodeW,
      h: projectNodeH,
      color: '#2563eb',
    },
  ];
  const edges: FlowEdge[] = [];

  const radius = Math.min(200, 80 + reasoned.length * 12);
  const positions = placeOnCircle(reasoned.length, radius);
  reasoned.forEach((t, i) => {
    const c = t.reasoning!.confidence;
    const w = 120;
    const h = 40;
    const id = `t_${t.id}`;
    nodes.push({
      id,
      label: t.title.length > 22 ? t.title.slice(0, 21) + '…' : t.title,
      x: positions[i].x - w / 2,
      y: positions[i].y - h / 2,
      w,
      h,
      color: confidenceColor(c),
      meta: {
        ticketId: t.id,
        title: t.title,
        confidence: c,
        summary: t.reasoning!.summary,
      },
    });
    edges.push({ from: '__project__', to: id, weight: c });
  });

  return { hasData: true, nodes, edges };
}

export const flowService = {
  async getFlows(projectId?: string | null): Promise<FlowsResponse> {
    const tickets = projectId
      ? await ticketRepo.findAll({ projectId })
      : await ticketRepo.findAll();
    const reasoningCount = tickets.filter((t) => !!t.reasoning).length;

    return {
      hasTickets: tickets.length > 0,
      hasReasoning: reasoningCount > 0,
      ticketCount: tickets.length,
      reasoningCount,
      architecture: buildArchitecture(tickets),
      dataflow: buildDataflow(tickets),
      lifecycle: buildLifecycle(tickets, reasoningCount),
      reasoning: buildReasoning(tickets),
    };
  },
};
