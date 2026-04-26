const s = (w = 14, h = 14, stroke = 1.5) => ({
  width: w, height: h, viewBox: `0 0 ${w} ${h}`,
  fill: 'none' as const, stroke: 'currentColor', strokeWidth: stroke,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

const sf = (w = 14, h = 14) => ({
  width: w, height: h, viewBox: `0 0 ${w} ${h}`, fill: 'currentColor',
});

export const Icons = {
  // ── Nav ──────────────────────────────────────────────────────
  Board: () => <svg {...s()}><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>,
  List: () => <svg {...s()}><line x1="4" y1="3.5" x2="13" y2="3.5"/><line x1="4" y1="7" x2="13" y2="7"/><line x1="4" y1="10.5" x2="13" y2="10.5"/><circle cx="1.5" cy="3.5" r="1" fill="currentColor" stroke="none"/><circle cx="1.5" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="1.5" cy="10.5" r="1" fill="currentColor" stroke="none"/></svg>,
  Team: () => <svg {...s()}><circle cx="5" cy="4.5" r="2"/><path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="10.5" cy="5" r="1.5"/><path d="M9 12c0-1.7 1-3 2.5-3.5"/></svg>,
  Stats: () => <svg {...s()}><rect x="1" y="8" width="3" height="5"/><rect x="5.5" y="5" width="3" height="8"/><rect x="10" y="2" width="3" height="11"/></svg>,
  Flow: () => <svg {...s()}><circle cx="3" cy="3" r="2"/><circle cx="11" cy="3" r="2"/><circle cx="7" cy="11" r="2"/><path d="M5 3h4"/><path d="M4.5 5L7 9"/><path d="M9.5 5L7 9"/></svg>,
  Zap: () => <svg {...s()}><path d="M8 1L3 8h4l-1 5 6-7H8l1-5z"/></svg>,

  // ── Ticket header ─────────────────────────────────────────────
  Plus: () => <svg {...s(14,14,2)}><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>,
  X: () => <svg {...s(14,14,2)}><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>,
  Arrow: ({ dir }: { dir: 'left' | 'right' }) => <svg {...s(12,12,2)} style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }}><path d="M4 2 L8 6 L4 10"/></svg>,
  ChevDown: () => <svg {...s(10,10,1.5)}><path d="M2 3.5L5 6.5L8 3.5"/></svg>,
  ChevRight: () => <svg {...s(10,10,1.5)}><path d="M3.5 2L6.5 5L3.5 8"/></svg>,
  Check: () => <svg {...s(10,10,2)}><path d="M2 5L4 7L8 3"/></svg>,
  Ban: () => <svg {...s(10,10,1.5)}><circle cx="5" cy="5" r="4"/><line x1="2.2" y1="2.2" x2="7.8" y2="7.8"/></svg>,

  // ── Tabs ─────────────────────────────────────────────────────
  User: () => <svg {...s()}><circle cx="7" cy="4.5" r="2.5"/><path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>,
  Pipeline: () => <svg {...s()}><circle cx="3" cy="7" r="2"/><circle cx="11" cy="7" r="2"/><circle cx="7" cy="2" r="2"/><circle cx="7" cy="12" r="2"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="7" y1="4" x2="7" y2="10"/></svg>,
  Chat: () => <svg {...s()}><path d="M2 2h10v7H5L2 12V2z"/></svg>,
  Brain: () => <svg {...s()}><path d="M7 13V7"/><path d="M7 7C7 4.5 5 2.5 3.5 2.5C2 2.5 1 3.5 1 5C1 6 1.5 6.5 1.5 6.5"/><path d="M1.5 6.5C1 7 1 8 1.5 9C2 10 3.5 10.5 5 10"/><path d="M7 7C7 4.5 9 2.5 10.5 2.5C12 2.5 13 3.5 13 5C13 6 12.5 6.5 12.5 6.5"/><path d="M12.5 6.5C13 7 13 8 12.5 9C12 10 10.5 10.5 9 10"/></svg>,
  Code: () => <svg {...s()}><path d="M5 3L2 7L5 11"/><path d="M9 3L12 7L9 11"/></svg>,
  Test: () => <svg {...s()}><path d="M5 1v5L2 13h10L9 6V1"/><line x1="5" y1="1" x2="9" y2="1"/></svg>,
  Activity: () => <svg {...s()}><polyline points="1,7 4,7 6,2 8,12 10,5 12,7 13,7"/></svg>,
  Comment: () => <svg {...s()}><path d="M2 2h10v8H5L2 13V2z"/><line x1="5" y1="6" x2="9" y2="6"/><line x1="5" y1="4" x2="9" y2="4"/></svg>,
  Diff: () => <svg {...s()}><line x1="7" y1="2" x2="7" y2="12"/><line x1="4" y1="5" x2="10" y2="5"/><line x1="4" y1="9" x2="10" y2="9"/></svg>,

  // ── Actions / status ─────────────────────────────────────────
  Play: () => <svg {...sf()}><path d="M3 2l10 6-10 6z"/></svg>,
  Pause: () => <svg {...sf()}><rect x="2" y="2" width="4" height="10"/><rect x="8" y="2" width="4" height="10"/></svg>,
  Skip: () => <svg {...sf()}><path d="M2 2l8 5-8 5z"/><rect x="11" y="2" width="2" height="10"/></svg>,
  Lock: () => <svg {...s()}><rect x="3" y="7" width="8" height="6" rx="1"/><path d="M5 7V5a2 2 0 014 0v2"/></svg>,
  Unlock: () => <svg {...s()}><rect x="3" y="7" width="8" height="6" rx="1"/><path d="M5 7V5a2 2 0 014 0"/></svg>,
  Reject: () => <svg {...s(14,14,2)}><circle cx="7" cy="7" r="5"/><line x1="9" y1="5" x2="5" y2="9"/><line x1="5" y1="5" x2="9" y2="9"/></svg>,
  Send: () => <svg {...sf(16,16)}><path d="M2 2l12 6-12 6V9l8-1-8-1V2z"/></svg>,
  Sparkle: () => <svg {...sf()}><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z"/></svg>,

  // ── Project / nav ─────────────────────────────────────────────
  Folder: () => <svg {...s()}><path d="M1 4h5l2 2h5v7H1z"/></svg>,
  Git: () => <svg {...s()}><circle cx="4" cy="4" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="10" cy="4" r="2"/><line x1="4" y1="6" x2="4" y2="11"/><path d="M4 11c0 0 2 2 5 0"/><line x1="10" y1="6" x2="10" y2="8"/></svg>,
  Search: () => <svg {...s()}><circle cx="6" cy="6" r="4"/><line x1="9" y1="9" x2="13" y2="13"/></svg>,
  Export: () => <svg {...s()}><path d="M9 3l3 3-3 3"/><line x1="12" y1="6" x2="5" y2="6"/><path d="M5 2H2v10h10v-3"/></svg>,
  Import: () => <svg {...s()}><path d="M5 11l3 3 3-3"/><line x1="8" y1="14" x2="8" y2="7"/><path d="M13 7V2H3v5"/></svg>,
  SignOut: () => <svg {...s()}><path d="M9 2H2v10h7"/><path d="M11 9l3-3-3-3"/><line x1="14" y1="6" x2="6" y2="6"/></svg>,
  Settings: () => <svg {...s()}><circle cx="7" cy="7" r="2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.5 1.5M9.5 9.5L11 11M3 11l1.5-1.5M9.5 4.5L11 3"/></svg>,
  BarChart: () => <svg {...s()}><rect x="1" y="8" width="3" height="5"/><rect x="5.5" y="5" width="3" height="8"/><rect x="10" y="2" width="3" height="11"/></svg>,
  Image: () => <svg {...s()}><rect x="1" y="2" width="12" height="10" rx="1"/><circle cx="4.5" cy="5.5" r="1.5"/><path d="M1 10l3-3 2 2 3-4 4 5"/></svg>,
  History: () => <svg {...s()}><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 2"/></svg>,

  // ── Agent types ───────────────────────────────────────────────
  AgentPlanner:   () => <svg {...s()}><rect x="2" y="2" width="10" height="10" rx="1"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="5" y1="9" x2="7" y2="9"/></svg>,
  AgentArchitect: () => <svg {...s()}><path d="M7 1l6 4v8H1V5z"/><rect x="5" y="8" width="4" height="5"/></svg>,
  AgentCoder:     () => <svg {...s()}><path d="M5 3L2 7L5 11"/><path d="M9 3L12 7L9 11"/></svg>,
  AgentReviewer:  () => <svg {...s()}><circle cx="7" cy="7" r="5"/><path d="M5 7l2 2 3-3"/></svg>,
  AgentTester:    () => <svg {...s()}><path d="M5 1v5L2 13h10L9 6V1"/><line x1="5" y1="1" x2="9" y2="1"/></svg>,
  AgentDebugger:  () => <svg {...s()}><circle cx="7" cy="7" r="4"/><line x1="7" y1="3" x2="7" y2="7"/><circle cx="7" cy="10" r="0.75" fill="currentColor" stroke="none"/></svg>,
  AgentDocs:      () => <svg {...s()}><path d="M3 1h8l2 2v10H3z"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="5" y1="9" x2="7" y2="9"/></svg>,
};
