import { reasoningRepo } from '../repositories/reasoning-repo';
import type { Reasoning, NewReasoning, TreeNode, NodeType } from '../types/reasoning';

const VALID_TYPES: NodeType[] = [
  'problem', 'investigation', 'discovery', 'root_cause',
  'decision', 'chosen', 'rejected', 'ruled_out',
];

function isValidType(t: unknown): t is NodeType {
  return typeof t === 'string' && (VALID_TYPES as string[]).includes(t);
}

function normalizeTree(raw: unknown, fallbackLabel: string, idPrefix = 'r'): TreeNode {
  // Garbage input → synthesize a single decision node from the summary so the user still sees the gist.
  if (!raw || typeof raw !== 'object') {
    return { id: `${idPrefix}1`, label: fallbackLabel || 'Reasoning', type: 'decision', children: [] };
  }
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' && r.id ? r.id : `${idPrefix}1`;
  const label = typeof r.label === 'string' && r.label ? r.label : fallbackLabel || 'Reasoning';
  const type: NodeType = isValidType(r.type) ? r.type : 'decision';
  const detail = typeof r.detail === 'string' ? r.detail : undefined;

  let children: TreeNode[] | undefined;
  if (Array.isArray(r.children)) {
    children = r.children
      .map((c, i) => normalizeTree(c, label, `${id}-${i + 1}`))
      .filter(Boolean);
  } else {
    children = [];
  }

  return { id, label, type, detail, children };
}

function normalizeReasoning(input: NewReasoning): NewReasoning {
  const summary = (input?.summary && String(input.summary).trim()) || 'No summary provided';
  const rawConfidence = Number(input?.confidence);
  const confidence = Number.isFinite(rawConfidence) ? Math.min(1, Math.max(0, rawConfidence)) : 0.5;
  const timeMs = Number.isFinite(Number(input?.timeMs)) ? Number(input.timeMs) : 0;
  const tree = normalizeTree(input?.tree, summary);
  const logs = Array.isArray(input?.logs) ? input.logs : [];
  return { summary, confidence, timeMs, tree, logs };
}

export const reasoningService = {
  async saveReasoning(ticketId: string, input: NewReasoning): Promise<Reasoning> {
    const normalized = normalizeReasoning(input);
    return reasoningRepo.upsert(ticketId, normalized);
  },

  async getReasoning(ticketId: string): Promise<Reasoning | null> {
    return reasoningRepo.findByTicket(ticketId);
  },
};
