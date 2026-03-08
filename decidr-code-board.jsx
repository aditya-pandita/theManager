import { useState, useEffect, useRef, useCallback } from "react";

const COLUMNS = [
  { id: "backlog", label: "BACKLOG", color: "#6B7280" },
  { id: "todo", label: "TO DO", color: "#F59E0B" },
  { id: "in_progress", label: "IN PROGRESS", color: "#3B82F6" },
  { id: "review", label: "REVIEW", color: "#A855F7" },
  { id: "done", label: "DONE", color: "#10B981" },
];

const PRIORITY = {
  critical: { label: "CRITICAL", color: "#EF4444", bg: "#451215" },
  high: { label: "HIGH", color: "#F97316", bg: "#451a03" },
  medium: { label: "MEDIUM", color: "#F59E0B", bg: "#422006" },
  low: { label: "LOW", color: "#6B7280", bg: "#1f2937" },
};

const TAGS = ["bug", "feature", "refactor", "perf", "docs", "test", "style", "infra"];

const genId = () => "DC-" + Math.random().toString(36).substr(2, 5).toUpperCase();
const now = () => new Date().toISOString();

const SAMPLE_TICKETS = [
  {
    id: "DC-001",
    title: "Fix auth middleware token validation",
    description: "Token expiry check was using `<` instead of `<=`, causing premature logouts at exact expiry time.",
    status: "done",
    priority: "critical",
    tags: ["bug"],
    diff: {
      file: "src/middleware/auth.ts",
      before: `if (tokenExp < Date.now()) {\n  throw new AuthError('expired');\n}`,
      after: `if (tokenExp <= Date.now()) {\n  throw new AuthError('expired');\n}`,
    },
    changelog: [
      { ts: "2026-03-05T10:00:00Z", action: "Created ticket", by: "Aditya" },
      { ts: "2026-03-05T10:05:00Z", action: "Claude started work", by: "Claude" },
      { ts: "2026-03-05T10:06:00Z", action: "Fixed comparison operator in auth.ts", by: "Claude" },
      { ts: "2026-03-05T10:07:00Z", action: "Moved to DONE", by: "Claude" },
    ],
    comments: [
      { by: "Aditya", text: "Users reporting random logouts — likely token expiry edge case", ts: "2026-03-05T10:00:00Z" },
      { by: "Claude", text: "Found it — off-by-one in the comparison. Fixed and verified with edge case tests.", ts: "2026-03-05T10:06:00Z" },
    ],
    media: [],
    created: "2026-03-05T10:00:00Z",
    reasoning: {
      summary: "Identified boundary condition bug in token expiry comparison — chose minimal surgical fix over broader refactor.",
      confidence: 0.95,
      timeMs: 1200,
      tree: {
        id: "r1", label: "Users reporting random logouts", type: "problem",
        children: [
          {
            id: "r2", label: "Analyze auth middleware", type: "investigation",
            children: [
              {
                id: "r3", label: "Token expiry check found", type: "discovery",
                detail: "Line 42 in auth.ts uses strict less-than for expiry comparison",
                children: [
                  { id: "r4", label: "Off-by-one: < should be <=", type: "root_cause", detail: "When tokenExp exactly equals Date.now(), the token is treated as valid for one more cycle, then fails on the next request — causing intermittent logouts at the boundary." },
                ]
              },
              { id: "r5", label: "Session store checked — OK", type: "ruled_out", detail: "Redis session TTLs are correct and consistent with token lifetimes." },
              { id: "r6", label: "Cookie config checked — OK", type: "ruled_out", detail: "SameSite, Secure, and Path attributes are all correctly set." },
            ]
          },
          {
            id: "r7", label: "Decision: Fix operator vs refactor auth", type: "decision",
            children: [
              { id: "r8", label: "Option A: Change < to <= (chosen)", type: "chosen", detail: "Minimal change, low regression risk, directly fixes the boundary condition. All 47 existing tests still pass." },
              { id: "r9", label: "Option B: Rewrite token validation with buffer", type: "rejected", detail: "Adding a 5-second buffer would mask the root cause and change behavior for all users, not just edge cases. Rejected: scope creep for a single-character fix." },
            ]
          }
        ]
      },
      logs: [
        { step: 1, phase: "Intake", action: "Parsed ticket description and user report", reasoning: "Keywords 'random logouts' + 'token expiry' point to auth middleware timing issue", durationMs: 150 },
        { step: 2, phase: "Scan", action: "Located auth.ts token validation logic", reasoning: "Searched for AuthError('expired') — found single call site at line 42", durationMs: 200 },
        { step: 3, phase: "Analysis", action: "Tested boundary condition: tokenExp === Date.now()", reasoning: "Strict < means exact-match is not caught — token passes validation but expires before next request completes", durationMs: 350 },
        { step: 4, phase: "Alternatives", action: "Evaluated 2 fix approaches", reasoning: "Single operator change vs adding time buffer. Chose surgical fix — lower blast radius, same correctness guarantee", durationMs: 250 },
        { step: 5, phase: "Validation", action: "Ran test suite — 47/47 pass, added edge case test", reasoning: "New test covers tokenExp === Date.now() boundary. Confirms fix works without regressions.", durationMs: 250 },
      ],
    },
  },
  {
    id: "DC-002",
    title: "Add rate limiter to API gateway",
    description: "Implement sliding window rate limiting on all public API endpoints. 100 req/min per API key.",
    status: "in_progress",
    priority: "high",
    tags: ["feature", "infra"],
    diff: {
      file: "src/gateway/rateLimiter.ts",
      before: `// TODO: implement rate limiting\nexport const rateLimiter = (req, res, next) => {\n  next();\n};`,
      after: `import { slidingWindow } from './cache';\n\nexport const rateLimiter = (req, res, next) => {\n  const key = req.headers['x-api-key'];\n  const window = slidingWindow(key, 60_000);\n  if (window.count >= 100) {\n    return res.status(429).json({\n      error: 'Rate limit exceeded',\n      retryAfter: window.resetIn\n    });\n  }\n  window.increment();\n  next();\n};`,
    },
    changelog: [
      { ts: "2026-03-05T14:00:00Z", action: "Created ticket", by: "Aditya" },
      { ts: "2026-03-05T14:10:00Z", action: "Claude picked up ticket", by: "Claude" },
      { ts: "2026-03-05T14:15:00Z", action: "Implemented sliding window rate limiter", by: "Claude" },
    ],
    comments: [
      { by: "Aditya", text: "Use sliding window, not fixed window. 100 req/min per key.", ts: "2026-03-05T14:00:00Z" },
    ],
    media: [],
    created: "2026-03-05T14:00:00Z",
    reasoning: {
      summary: "Chose sliding window over fixed window and token bucket — best fit for API key fairness without memory overhead.",
      confidence: 0.88,
      timeMs: 3400,
      tree: {
        id: "a1", label: "Implement rate limiting (100 req/min)", type: "problem",
        children: [
          {
            id: "a2", label: "Evaluate rate limiting algorithms", type: "decision",
            children: [
              { id: "a3", label: "Fixed window counter", type: "rejected", detail: "Simple but allows burst at window boundaries — user could send 200 requests in 2 seconds spanning the reset point." },
              { id: "a4", label: "Sliding window log (chosen)", type: "chosen", detail: "Tracks per-request timestamps in a rolling 60s window. Fair distribution, no boundary bursts. Memory cost is bounded by max 100 entries per key." },
              { id: "a5", label: "Token bucket", type: "rejected", detail: "Better for variable rate allowance, but overkill here — we want strict 100/min, not burst-then-throttle behavior." },
            ]
          },
          {
            id: "a6", label: "Storage layer decision", type: "decision",
            children: [
              { id: "a7", label: "In-memory Map (chosen for now)", type: "chosen", detail: "Single-instance deployment currently. Added TODO for Redis migration when horizontal scaling is needed." },
              { id: "a8", label: "Redis sorted sets", type: "rejected", detail: "Correct long-term solution but adds infra dependency for current single-server setup." },
            ]
          },
          {
            id: "a9", label: "Response design", type: "investigation",
            children: [
              { id: "a10", label: "429 with Retry-After header", type: "chosen", detail: "Industry standard. Includes retryAfter in both header and JSON body for client flexibility." },
            ]
          },
        ]
      },
      logs: [
        { step: 1, phase: "Intake", action: "Parsed requirements: 100 req/min per API key", reasoning: "Clear spec — need per-key tracking with 60-second window", durationMs: 100 },
        { step: 2, phase: "Research", action: "Evaluated 3 rate limiting algorithms", reasoning: "Fixed window has boundary burst problem, token bucket is overengineered for fixed rate. Sliding window is the right middle ground.", durationMs: 800 },
        { step: 3, phase: "Architecture", action: "Chose in-memory storage with Redis migration path", reasoning: "Current infra is single-instance. Adding Redis dependency for rate limiting alone doesn't justify the operational cost yet.", durationMs: 500 },
        { step: 4, phase: "Implementation", action: "Built slidingWindow utility + middleware", reasoning: "Separated concerns: cache module handles windowing, middleware handles HTTP concerns. Easier to swap storage later.", durationMs: 1500 },
        { step: 5, phase: "Edge cases", action: "Handled missing API key, concurrent requests", reasoning: "Missing key returns 401 not 429. Concurrent increment is safe in single-thread Node.js event loop.", durationMs: 500 },
      ],
    },
  },
  {
    id: "DC-003",
    title: "Refactor user service to repository pattern",
    description: "Decouple data access from business logic in UserService. Extract UserRepository interface.",
    status: "todo",
    priority: "medium",
    tags: ["refactor"],
    diff: null,
    changelog: [
      { ts: "2026-03-06T09:00:00Z", action: "Created ticket", by: "Aditya" },
    ],
    comments: [],
    media: [],
    created: "2026-03-06T09:00:00Z",
    reasoning: null,
  },
];

// ─── ICONS ───
const Icons = {
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="7" y1="2" x2="7" y2="12" /><line x1="2" y1="7" x2="12" y2="7" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="3" x2="11" y2="11" /><line x1="11" y1="3" x2="3" y2="11" />
    </svg>
  ),
  Arrow: ({ dir }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}>
      <path d="M4 2 L8 6 L4 10" />
    </svg>
  ),
  Code: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 3L2 7L5 11" /><path d="M9 3L12 7L9 11" />
    </svg>
  ),
  Chat: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2h10v7H5L2 12V2z" />
    </svg>
  ),
  History: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" /><path d="M7 4v3l2 2" />
    </svg>
  ),
  Image: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="2" width="12" height="10" rx="1" /><circle cx="4.5" cy="5.5" r="1.5" /><path d="M1 10l3-3 2 2 3-4 4 5" />
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2l12 6-12 6V9l8-1-8-1V2z" />
    </svg>
  ),
  Grip: () => (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.3">
      <circle cx="3" cy="3" r="1.2"/><circle cx="7" cy="3" r="1.2"/>
      <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
      <circle cx="3" cy="11" r="1.2"/><circle cx="7" cy="11" r="1.2"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" />
    </svg>
  ),
  Brain: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M7 13V7" /><path d="M7 7C7 4.5 5 2.5 3.5 2.5C2 2.5 1 3.5 1 5C1 6 1.5 6.5 1.5 6.5" />
      <path d="M1.5 6.5C1 7 1 8 1.5 9C2 10 3.5 10.5 5 10" /><path d="M7 7C7 4.5 9 2.5 10.5 2.5C12 2.5 13 3.5 13 5C13 6 12.5 6.5 12.5 6.5" />
      <path d="M12.5 6.5C13 7 13 8 12.5 9C12 10 10.5 10.5 9 10" />
    </svg>
  ),
  ChevDown: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3.5L5 6.5L8 3.5" />
    </svg>
  ),
  ChevRight: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3.5 2L6.5 5L3.5 8" />
    </svg>
  ),
  Check: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 5L4 7L8 3" />
    </svg>
  ),
  Ban: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5" cy="5" r="4" /><line x1="2.2" y1="2.2" x2="7.8" y2="7.8" />
    </svg>
  ),
};

// ─── DIFF VIEWER ───
function DiffViewer({ diff }) {
  if (!diff) return <div style={{ color: "#6B7280", padding: "20px", textAlign: "center", fontStyle: "italic" }}>No code changes yet</div>;
  const beforeLines = diff.before.split("\n");
  const afterLines = diff.after.split("\n");
  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: "12px", lineHeight: "1.7", borderRadius: "8px", overflow: "hidden", border: "1px solid #1e293b" }}>
      <div style={{ background: "#0f172a", padding: "8px 14px", color: "#94a3b8", fontSize: "11px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
        <Icons.Code /> {diff.file}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ borderRight: "1px solid #1e293b" }}>
          <div style={{ background: "#1c1017", padding: "4px 14px", color: "#f87171", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>BEFORE</div>
          <div style={{ padding: "10px 14px", background: "#0c0c0c" }}>
            {beforeLines.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: "12px" }}>
                <span style={{ color: "#4a3030", minWidth: "20px", textAlign: "right", userSelect: "none" }}>{i + 1}</span>
                <span style={{ color: "#fca5a5" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ background: "#0c1f17", padding: "4px 14px", color: "#4ade80", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>AFTER</div>
          <div style={{ padding: "10px 14px", background: "#0c0c0c" }}>
            {afterLines.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: "12px" }}>
                <span style={{ color: "#1a3a2a", minWidth: "20px", textAlign: "right", userSelect: "none" }}>{i + 1}</span>
                <span style={{ color: "#86efac" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TICKET CARD ───
function TicketCard({ ticket, onClick }) {
  const pri = PRIORITY[ticket.priority];
  return (
    <div onClick={onClick} style={{
      background: "#111318", border: "1px solid #1e2330", borderRadius: "10px", padding: "14px",
      cursor: "pointer", transition: "all 0.2s ease",
      borderLeft: `3px solid ${pri.color}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "#161a24"; e.currentTarget.style.borderColor = "#2a3040"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#111318"; e.currentTarget.style.borderColor = "#1e2330"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7280", letterSpacing: "0.05em" }}>{ticket.id}</span>
        <span style={{ fontSize: "9px", fontWeight: 700, color: pri.color, background: pri.bg, padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.05em" }}>
          {pri.label}
        </span>
      </div>
      <div style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600, marginBottom: "10px", lineHeight: "1.4" }}>{ticket.title}</div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
        {ticket.tags.map(t => (
          <span key={t} style={{ fontSize: "10px", color: "#94a3b8", background: "#1a1f2e", padding: "2px 8px", borderRadius: "4px", border: "1px solid #252b3b" }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {ticket.diff && <span style={{ color: "#3B82F6", display: "flex", alignItems: "center", gap: "3px", fontSize: "10px" }}><Icons.Code /> diff</span>}
          {ticket.reasoning && <span style={{ color: "#c084fc", display: "flex", alignItems: "center", gap: "3px", fontSize: "10px" }}><Icons.Brain /> why</span>}
          {ticket.comments.length > 0 && <span style={{ color: "#A855F7", display: "flex", alignItems: "center", gap: "3px", fontSize: "10px" }}><Icons.Chat /> {ticket.comments.length}</span>}
          {ticket.media.length > 0 && <span style={{ color: "#F59E0B", display: "flex", alignItems: "center", gap: "3px", fontSize: "10px" }}><Icons.Image /> {ticket.media.length}</span>}
        </div>
        <span style={{ fontSize: "10px", color: "#4B5563" }}>{ticket.changelog.length} events</span>
      </div>
    </div>
  );
}

// ─── CREATE TICKET MODAL ───
function CreateTicketModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedTags, setSelectedTags] = useState([]);
  const [file, setFile] = useState("");
  const [codeBefore, setCodeBefore] = useState("");

  const toggleTag = t => setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate({
      id: genId(),
      title: title.trim(),
      description: desc.trim(),
      status: "backlog",
      priority,
      tags: selectedTags,
      diff: file && codeBefore ? { file, before: codeBefore, after: "" } : null,
      changelog: [{ ts: now(), action: "Created ticket", by: "Aditya" }],
      comments: desc ? [{ by: "Aditya", text: desc, ts: now() }] : [],
      media: [],
      created: now(),
      reasoning: null,
    });
    onClose();
  };

  const inputStyle = {
    width: "100%", background: "#0c0e14", border: "1px solid #1e2330", borderRadius: "8px",
    padding: "10px 14px", color: "#e2e8f0", fontSize: "13px", outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#13161d", border: "1px solid #1e2330", borderRadius: "16px", width: "540px", maxHeight: "85vh", overflow: "auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e2330", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#e2e8f0", fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#3B82F6" }}><Icons.Plus /></span> New Ticket
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", padding: "4px" }}><Icons.X /></button>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px", display: "block" }}>TITLE</label>
            <input style={inputStyle} placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px", display: "block" }}>DESCRIPTION</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="Describe the task, context, or instructions for Claude..." value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "8px", display: "block" }}>PRIORITY</label>
            <div style={{ display: "flex", gap: "6px" }}>
              {Object.entries(PRIORITY).map(([k, v]) => (
                <button key={k} onClick={() => setPriority(k)} style={{
                  flex: 1, padding: "8px", borderRadius: "6px", border: `1px solid ${priority === k ? v.color : "#1e2330"}`,
                  background: priority === k ? v.bg : "transparent", color: priority === k ? v.color : "#6B7280",
                  cursor: "pointer", fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em", transition: "all 0.15s",
                }}>{v.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "8px", display: "block" }}>TAGS</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {TAGS.map(t => (
                <button key={t} onClick={() => toggleTag(t)} style={{
                  padding: "5px 12px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", transition: "all 0.15s",
                  border: `1px solid ${selectedTags.includes(t) ? "#3B82F6" : "#1e2330"}`,
                  background: selectedTags.includes(t) ? "#172554" : "transparent",
                  color: selectedTags.includes(t) ? "#60a5fa" : "#6B7280",
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1e2330", paddingTop: "16px" }}>
            <label style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Icons.Code /> ATTACH CODE CONTEXT <span style={{ color: "#4B5563", fontWeight: 400 }}>(optional)</span>
            </label>
            <input style={{ ...inputStyle, marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }} placeholder="File path, e.g. src/services/user.ts" value={file} onChange={e => setFile(e.target.value)} />
            <textarea style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", minHeight: "60px" }} placeholder="Paste current code here..." value={codeBefore} onChange={e => setCodeBefore(e.target.value)} />
          </div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1e2330", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #1e2330", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
          <button onClick={handleCreate} style={{
            padding: "10px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            background: title.trim() ? "linear-gradient(135deg, #3B82F6, #2563EB)" : "#1e2330",
            color: title.trim() ? "#fff" : "#4B5563", transition: "all 0.2s",
          }}>Create Ticket</button>
        </div>
      </div>
    </div>
  );
}

// ─── DECISION TREE NODE ───
const NODE_STYLES = {
  problem:       { color: "#F59E0B", bg: "#422006", border: "#F59E0B30", icon: "?" },
  investigation: { color: "#3B82F6", bg: "#172554", border: "#3B82F630", icon: "S" },
  discovery:     { color: "#06B6D4", bg: "#083344", border: "#06B6D430", icon: "!" },
  root_cause:    { color: "#EF4444", bg: "#451215", border: "#EF444430", icon: "X" },
  decision:      { color: "#A855F7", bg: "#2e1065", border: "#A855F730", icon: "D" },
  chosen:        { color: "#10B981", bg: "#052e16", border: "#10B98130", icon: null },
  rejected:      { color: "#6B7280", bg: "#1f2937", border: "#6B728030", icon: null },
  ruled_out:     { color: "#6B7280", bg: "#1f2937", border: "#6B728030", icon: null },
};

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const style = NODE_STYLES[node.type] || NODE_STYLES.investigation;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: depth > 0 ? 28 : 0 }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        {depth > 0 && (
          <div style={{ width: "28px", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", left: "0", top: "0", bottom: "50%", width: "1px", background: "#1e2330" }} />
            <div style={{ position: "absolute", left: "0", top: "50%", width: "14px", height: "1px", background: "#1e2330" }} />
            {/* Continuation line for sibling nodes below */}
          </div>
        )}
        <div style={{ flex: 1, marginBottom: "6px" }}>
          <div
            onClick={() => { if (hasChildren) setExpanded(!expanded); else if (node.detail) setShowDetail(!showDetail); }}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
              background: style.bg, border: `1px solid ${style.border}`, borderRadius: "8px",
              cursor: hasChildren || node.detail ? "pointer" : "default", transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (hasChildren || node.detail) e.currentTarget.style.borderColor = style.color + "60"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = style.border; }}
          >
            {/* Expand/collapse or type indicator */}
            <div style={{
              width: "20px", height: "20px", borderRadius: "6px", background: style.color + "20",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              color: style.color, fontSize: "10px", fontWeight: 700,
            }}>
              {node.type === "chosen" ? <Icons.Check /> : node.type === "rejected" || node.type === "ruled_out" ? <Icons.Ban /> :
                hasChildren ? (expanded ? <Icons.ChevDown /> : <Icons.ChevRight />) : style.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: style.color, fontSize: "12px", fontWeight: 600, lineHeight: "1.3" }}>{node.label}</div>
              {node.type && (
                <span style={{ fontSize: "9px", color: style.color + "80", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                  {node.type.replace("_", " ")}
                </span>
              )}
            </div>
            {node.detail && !hasChildren && (
              <div style={{ color: style.color + "60", fontSize: "10px", flexShrink: 0 }}>
                {showDetail ? <Icons.ChevDown /> : <Icons.ChevRight />}
              </div>
            )}
          </div>
          {/* Inline detail */}
          {node.detail && (showDetail || (hasChildren && expanded)) && (
            <div style={{
              margin: "4px 0 4px 28px", padding: "8px 12px", fontSize: "11px", lineHeight: "1.5",
              color: "#94a3b8", background: "#0c0e14", borderRadius: "6px", border: "1px solid #1e233080",
              borderLeft: `2px solid ${style.color}40`,
            }}>
              {node.detail}
            </div>
          )}
        </div>
      </div>
      {/* Children */}
      {hasChildren && expanded && (
        <div style={{ position: "relative" }}>
          {node.children.map((child, i) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── REASONING TAB ───
function ReasoningTab({ reasoning }) {
  const [logExpanded, setLogExpanded] = useState({});
  const [viewMode, setViewMode] = useState("tree"); // "tree" | "logs"

  if (!reasoning) {
    return (
      <div style={{ color: "#4B5563", textAlign: "center", padding: "40px", fontStyle: "italic" }}>
        <div style={{ marginBottom: "8px" }}><Icons.Brain /></div>
        No reasoning data yet. Click "Ask Claude to Process" in the Diff tab to generate reasoning.
      </div>
    );
  }

  const toggleLog = (i) => setLogExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div>
      {/* Summary bar */}
      <div style={{
        display: "flex", gap: "16px", alignItems: "center", padding: "12px 16px", marginBottom: "16px",
        background: "#0c0e14", borderRadius: "10px", border: "1px solid #1e2330",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#94a3b8", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "4px" }}>REASONING SUMMARY</div>
          <div style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: "1.4" }}>{reasoning.summary}</div>
        </div>
        <div style={{ textAlign: "center", padding: "0 12px", borderLeft: "1px solid #1e2330" }}>
          <div style={{ color: "#94a3b8", fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em" }}>CONFIDENCE</div>
          <div style={{
            fontSize: "18px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            color: reasoning.confidence >= 0.9 ? "#10B981" : reasoning.confidence >= 0.7 ? "#F59E0B" : "#EF4444",
          }}>{Math.round(reasoning.confidence * 100)}%</div>
        </div>
        <div style={{ textAlign: "center", padding: "0 12px", borderLeft: "1px solid #1e2330" }}>
          <div style={{ color: "#94a3b8", fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em" }}>TIME</div>
          <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#3B82F6" }}>
            {reasoning.timeMs < 1000 ? `${reasoning.timeMs}ms` : `${(reasoning.timeMs / 1000).toFixed(1)}s`}
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "#0c0e14", borderRadius: "8px", padding: "3px", border: "1px solid #1e2330" }}>
        {[{ id: "tree", label: "Decision Tree", icon: <Icons.Brain /> }, { id: "logs", label: "Step-by-Step Logs", icon: <Icons.History /> }].map(v => (
          <button key={v.id} onClick={() => setViewMode(v.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600,
            background: viewMode === v.id ? "#1e2330" : "transparent",
            color: viewMode === v.id ? "#e2e8f0" : "#6B7280", transition: "all 0.15s",
          }}>{v.icon} {v.label}</button>
        ))}
      </div>

      {/* Decision Tree View */}
      {viewMode === "tree" && (
        <div style={{ padding: "4px 0" }}>
          <TreeNode node={reasoning.tree} />
          {/* Legend */}
          <div style={{ marginTop: "20px", padding: "12px 16px", background: "#0c0e14", borderRadius: "8px", border: "1px solid #1e2330" }}>
            <div style={{ color: "#4B5563", fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "8px" }}>LEGEND</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { type: "problem", label: "Problem" }, { type: "investigation", label: "Investigation" },
                { type: "discovery", label: "Discovery" }, { type: "root_cause", label: "Root Cause" },
                { type: "decision", label: "Decision Point" }, { type: "chosen", label: "Chosen" },
                { type: "rejected", label: "Rejected" },
              ].map(item => {
                const s = NODE_STYLES[item.type];
                return (
                  <div key={item.type} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: s.color }} />
                    <span style={{ fontSize: "10px", color: "#6B7280" }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Logs View */}
      {viewMode === "logs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {reasoning.logs.map((log, i) => (
            <div key={i} style={{
              background: logExpanded[i] ? "#0f1219" : "#0c0e14", border: "1px solid #1e2330", borderRadius: "8px",
              overflow: "hidden", transition: "all 0.2s",
            }}>
              <div
                onClick={() => toggleLog(i)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#131720"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{
                  width: "24px", height: "24px", borderRadius: "6px", background: "#172554",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#60a5fa", fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                }}>{log.step}</div>
                <div style={{
                  fontSize: "9px", fontWeight: 700, color: "#A855F7", background: "#2e1065",
                  padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.04em", flexShrink: 0,
                }}>{log.phase}</div>
                <div style={{ flex: 1, color: "#e2e8f0", fontSize: "12px", fontWeight: 500 }}>{log.action}</div>
                <div style={{
                  fontSize: "10px", color: "#4B5563", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                }}>{log.durationMs}ms</div>
                <div style={{ color: "#4B5563", flexShrink: 0, transition: "transform 0.15s", transform: logExpanded[i] ? "rotate(0)" : "rotate(-90deg)" }}>
                  <Icons.ChevDown />
                </div>
              </div>
              {logExpanded[i] && (
                <div style={{
                  padding: "0 14px 12px 48px", color: "#94a3b8", fontSize: "12px", lineHeight: "1.6",
                  borderTop: "1px solid #1e233050",
                }}>
                  <div style={{ paddingTop: "10px" }}>
                    <span style={{ color: "#6B7280", fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em" }}>WHY: </span>
                    {log.reasoning}
                  </div>
                  {/* Visual duration bar */}
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "3px", background: "#1e2330", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: "2px",
                        width: `${Math.min((log.durationMs / (reasoning.timeMs || 1)) * 100 * 3, 100)}%`,
                        background: log.durationMs > 500 ? "#F59E0B" : "#3B82F6",
                        transition: "width 0.3s",
                      }} />
                    </div>
                    <span style={{ fontSize: "9px", color: "#4B5563", fontFamily: "'JetBrains Mono', monospace" }}>
                      {((log.durationMs / (reasoning.timeMs || 1)) * 100).toFixed(0)}% of total
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Total time summary */}
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: "16px", padding: "10px 14px",
            color: "#4B5563", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span>Total: <span style={{ color: "#3B82F6" }}>{reasoning.logs.reduce((a, l) => a + l.durationMs, 0)}ms</span> across {reasoning.logs.length} steps</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TICKET DETAIL MODAL ───
function TicketDetail({ ticket, onClose, onUpdate, onMove }) {
  const [tab, setTab] = useState("diff");
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);

  const addComment = () => {
    if (!comment.trim()) return;
    const updated = {
      ...ticket,
      comments: [...ticket.comments, { by: "Aditya", text: comment.trim(), ts: now() }],
      changelog: [...ticket.changelog, { ts: now(), action: `Comment: "${comment.trim().slice(0, 50)}..."`, by: "Aditya" }],
    };
    onUpdate(updated);
    setComment("");
  };

  const simulateClaude = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1800));
    const updated = {
      ...ticket,
      changelog: [
        ...ticket.changelog,
        { ts: now(), action: "Claude analyzed the request", by: "Claude" },
        { ts: now(), action: "Generated reasoning tree and code changes", by: "Claude" },
      ],
      comments: [
        ...ticket.comments,
        { by: "Claude", text: "I've analyzed the request and generated the changes. Check the Reasoning tab for my full decision tree and step-by-step logs.", ts: now() },
      ],
      diff: ticket.diff || {
        file: "src/generated/changes.ts",
        before: "// Original code placeholder\n// Will be replaced with actual context",
        after: "// Claude-generated implementation\n// Based on ticket requirements\nexport const implementation = () => {\n  // Generated solution\n};",
      },
      reasoning: ticket.reasoning || {
        summary: `Analyzed "${ticket.title}" — evaluated approach options and selected optimal implementation path.`,
        confidence: 0.82,
        timeMs: 2100,
        tree: {
          id: "g1", label: ticket.title, type: "problem",
          children: [
            {
              id: "g2", label: "Analyzed requirements and constraints", type: "investigation",
              detail: `Parsed ticket description: "${ticket.description || "No description provided"}"`,
              children: [
                { id: "g3", label: "Identified core requirement", type: "discovery", detail: "Extracted the primary objective and mapped it to implementation patterns." },
              ]
            },
            {
              id: "g4", label: "Implementation approach decision", type: "decision",
              children: [
                { id: "g5", label: "Selected approach: incremental change", type: "chosen", detail: "Minimal modification with clear test coverage. Low regression risk." },
                { id: "g6", label: "Alternative: full rewrite", type: "rejected", detail: "Higher quality ceiling but much larger blast radius. Not justified for this scope." },
              ]
            },
          ]
        },
        logs: [
          { step: 1, phase: "Intake", action: "Parsed ticket requirements", reasoning: "Extracted key constraints and success criteria from description", durationMs: 200 },
          { step: 2, phase: "Analysis", action: "Evaluated implementation options", reasoning: "Compared incremental vs full rewrite approaches against risk/reward", durationMs: 600 },
          { step: 3, phase: "Implementation", action: "Generated code changes", reasoning: "Applied chosen approach with minimal footprint", durationMs: 900 },
          { step: 4, phase: "Validation", action: "Verified changes against requirements", reasoning: "Confirmed all stated requirements are met by the diff", durationMs: 400 },
        ],
      },
    };
    onUpdate(updated);
    setProcessing(false);
  };

  const colIdx = COLUMNS.findIndex(c => c.id === ticket.status);
  const canMoveLeft = colIdx > 0;
  const canMoveRight = colIdx < COLUMNS.length - 1;
  const currentCol = COLUMNS[colIdx];

  const tabs = [
    { id: "diff", icon: <Icons.Code />, label: "Diff" },
    { id: "reasoning", icon: <Icons.Brain />, label: "Reasoning" },
    { id: "comments", icon: <Icons.Chat />, label: `Comments (${ticket.comments.length})` },
    { id: "history", icon: <Icons.History />, label: "History" },
    { id: "media", icon: <Icons.Image />, label: "Media" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#13161d", border: "1px solid #1e2330", borderRadius: "16px", width: "780px", maxHeight: "88vh", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e2330" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#6B7280", letterSpacing: "0.05em" }}>{ticket.id}</span>
              <h2 style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: 700, margin: "4px 0 0" }}>{ticket.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", padding: "4px" }}><Icons.X /></button>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: PRIORITY[ticket.priority].color, background: PRIORITY[ticket.priority].bg, padding: "3px 8px", borderRadius: "4px" }}>
              {PRIORITY[ticket.priority].label}
            </span>
            <span style={{ fontSize: "11px", color: currentCol.color, background: `${currentCol.color}15`, border: `1px solid ${currentCol.color}30`, padding: "3px 10px", borderRadius: "4px", fontWeight: 600 }}>
              {currentCol.label}
            </span>
            {ticket.tags.map(t => (
              <span key={t} style={{ fontSize: "10px", color: "#94a3b8", background: "#1a1f2e", padding: "3px 8px", borderRadius: "4px", border: "1px solid #252b3b" }}>{t}</span>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
              {canMoveLeft && (
                <button onClick={() => onMove(ticket.id, COLUMNS[colIdx - 1].id)} style={{
                  display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px",
                  border: "1px solid #1e2330", background: "#0c0e14", color: "#94a3b8", cursor: "pointer", fontSize: "10px",
                }}><Icons.Arrow dir="left" /> {COLUMNS[colIdx - 1].label}</button>
              )}
              {canMoveRight && (
                <button onClick={() => onMove(ticket.id, COLUMNS[colIdx + 1].id)} style={{
                  display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px",
                  border: `1px solid ${COLUMNS[colIdx + 1].color}40`, background: `${COLUMNS[colIdx + 1].color}10`,
                  color: COLUMNS[colIdx + 1].color, cursor: "pointer", fontSize: "10px", fontWeight: 600,
                }}>{COLUMNS[colIdx + 1].label} <Icons.Arrow dir="right" /></button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #1e2330", padding: "0 24px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "12px 16px", border: "none",
              background: "transparent", color: tab === t.id ? "#e2e8f0" : "#6B7280", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              borderBottom: tab === t.id ? "2px solid #3B82F6" : "2px solid transparent", transition: "all 0.15s",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {tab === "diff" && (
            <div>
              <DiffViewer diff={ticket.diff} />
              {!processing && (
                <button onClick={simulateClaude} style={{
                  marginTop: "16px", width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #A855F730",
                  background: "linear-gradient(135deg, #A855F710, #3B82F610)", color: "#c084fc", cursor: "pointer",
                  fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg, #A855F720, #3B82F620)"}
                  onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg, #A855F710, #3B82F610)"}
                >
                  <Icons.Sparkle /> Ask Claude to Process
                </button>
              )}
              {processing && (
                <div style={{
                  marginTop: "16px", padding: "16px", borderRadius: "10px", border: "1px solid #A855F730",
                  background: "#A855F708", display: "flex", alignItems: "center", gap: "12px",
                }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #A855F7",
                    borderTopColor: "transparent", animation: "spin 1s linear infinite",
                  }} />
                  <span style={{ color: "#c084fc", fontSize: "13px" }}>Claude is analyzing and generating changes...</span>
                </div>
              )}
            </div>
          )}

          {tab === "reasoning" && (
            <ReasoningTab reasoning={ticket.reasoning} />
          )}

          {tab === "comments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {ticket.comments.length === 0 && (
                <div style={{ color: "#4B5563", textAlign: "center", padding: "30px", fontStyle: "italic" }}>No comments yet. Start the conversation.</div>
              )}
              {ticket.comments.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "12px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                    background: c.by === "Claude" ? "linear-gradient(135deg, #A855F7, #3B82F6)" : "linear-gradient(135deg, #F59E0B, #EF4444)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700,
                  }}>{c.by === "Claude" ? "C" : "A"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: 600 }}>{c.by}</span>
                      <span style={{ color: "#4B5563", fontSize: "10px" }}>{new Date(c.ts).toLocaleString()}</span>
                    </div>
                    <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.5", background: "#0c0e14", borderRadius: "8px", padding: "10px 14px", border: "1px solid #1e2330" }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <input
                  style={{
                    flex: 1, background: "#0c0e14", border: "1px solid #1e2330", borderRadius: "8px",
                    padding: "10px 14px", color: "#e2e8f0", fontSize: "13px", outline: "none",
                  }}
                  placeholder="Add a comment or instruction..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addComment()}
                />
                <button onClick={addComment} style={{
                  padding: "10px 16px", borderRadius: "8px", border: "none",
                  background: comment.trim() ? "#3B82F6" : "#1e2330", color: comment.trim() ? "#fff" : "#4B5563",
                  cursor: "pointer", transition: "all 0.15s",
                }}><Icons.Send /></button>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div style={{ position: "relative", paddingLeft: "24px" }}>
              <div style={{ position: "absolute", left: "7px", top: "4px", bottom: "4px", width: "2px", background: "#1e2330" }} />
              {ticket.changelog.map((e, i) => (
                <div key={i} style={{ position: "relative", marginBottom: "16px" }}>
                  <div style={{
                    position: "absolute", left: "-20px", top: "4px", width: "10px", height: "10px", borderRadius: "50%",
                    background: e.by === "Claude" ? "#A855F7" : "#F59E0B", border: "2px solid #13161d",
                  }} />
                  <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                    <span style={{ color: "#e2e8f0", fontSize: "13px" }}>{e.action}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                    <span style={{ color: e.by === "Claude" ? "#c084fc" : "#fbbf24", fontSize: "10px", fontWeight: 600 }}>{e.by}</span>
                    <span style={{ color: "#4B5563", fontSize: "10px" }}>{new Date(e.ts).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "media" && (
            <div>
              <div style={{
                border: "2px dashed #1e2330", borderRadius: "12px", padding: "40px", textAlign: "center",
                color: "#4B5563", transition: "all 0.2s",
              }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#60a5fa"; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = "#1e2330"; e.currentTarget.style.color = "#4B5563"; }}
              >
                <Icons.Image />
                <div style={{ marginTop: "10px", fontSize: "13px" }}>Drop screenshots or GIFs here</div>
                <div style={{ marginTop: "4px", fontSize: "11px" }}>PNG, JPG, GIF up to 10MB</div>
              </div>
              {ticket.media.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
                  {ticket.media.map((m, i) => (
                    <div key={i} style={{ background: "#0c0e14", borderRadius: "8px", padding: "8px", border: "1px solid #1e2330" }}>
                      <div style={{ color: "#94a3b8", fontSize: "11px" }}>{m.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN BOARD ───
export default function DecidrCodeBoard() {
  const [tickets, setTickets] = useState(SAMPLE_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState(null);

  const filteredTickets = tickets.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const updateTicket = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTicket(updated);
  };

  const moveTicket = (id, newStatus) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== id) return t;
      const colLabel = COLUMNS.find(c => c.id === newStatus)?.label;
      return {
        ...t,
        status: newStatus,
        changelog: [...t.changelog, { ts: now(), action: `Moved to ${colLabel}`, by: "Aditya" }],
      };
    }));
    setSelectedTicket(prev => prev ? { ...prev, status: newStatus, changelog: [...prev.changelog, { ts: now(), action: `Moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`, by: "Aditya" }] } : null);
  };

  const createTicket = (ticket) => setTickets(prev => [...prev, ticket]);

  const totalTickets = tickets.length;
  const doneCount = tickets.filter(t => t.status === "done").length;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0c10", color: "#e2e8f0",
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: #1e2330 transparent; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e2330", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #A855F7, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: 700, color: "#fff",
          }}>CJ</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>Decidr Code</div>
            <div style={{ fontSize: "11px", color: "#6B7280" }}>Decisions, made visible</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "11px", color: "#6B7280" }}>
            <span style={{ color: "#10B981", fontWeight: 600 }}>{doneCount}</span>/{totalTickets} completed
          </div>
          <div style={{ width: "100px", height: "4px", background: "#1e2330", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${totalTickets ? (doneCount / totalTickets) * 100 : 0}%`, background: "linear-gradient(90deg, #10B981, #34d399)", borderRadius: "2px", transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "14px 28px", display: "flex", gap: "10px", alignItems: "center", borderBottom: "1px solid #1e233050" }}>
        <input
          style={{
            background: "#111318", border: "1px solid #1e2330", borderRadius: "8px",
            padding: "8px 14px", color: "#e2e8f0", fontSize: "12px", outline: "none", width: "240px",
          }}
          placeholder="Search tickets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: "4px" }}>
          {[null, ...Object.keys(PRIORITY)].map(p => (
            <button key={p || "all"} onClick={() => setFilterPriority(p)} style={{
              padding: "6px 12px", borderRadius: "6px", border: `1px solid ${filterPriority === p ? "#3B82F6" : "#1e2330"}`,
              background: filterPriority === p ? "#172554" : "transparent",
              color: filterPriority === p ? "#60a5fa" : "#6B7280",
              cursor: "pointer", fontSize: "10px", fontWeight: 600, transition: "all 0.15s",
            }}>{p ? PRIORITY[p].label : "ALL"}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowCreate(true)} style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px",
          border: "none", background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff",
          cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.2s",
          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        ><Icons.Plus /> New Ticket</button>
      </div>

      {/* Board */}
      <div style={{ display: "flex", gap: "1px", padding: "20px 28px", height: "calc(100vh - 130px)", overflow: "auto" }}>
        {COLUMNS.map(col => {
          const colTickets = filteredTickets.filter(t => t.status === col.id);
          return (
            <div key={col.id} style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 14px", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: col.color }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>{col.label}</span>
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 600, color: col.color, background: `${col.color}15`,
                  padding: "2px 8px", borderRadius: "10px", minWidth: "20px", textAlign: "center",
                }}>{colTickets.length}</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", padding: "0 6px", overflow: "auto" }}>
                {colTickets.map((ticket, i) => (
                  <div key={ticket.id} style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
                    <TicketCard ticket={ticket} onClick={() => setSelectedTicket(ticket)} />
                  </div>
                ))}
                {colTickets.length === 0 && (
                  <div style={{ padding: "30px 10px", textAlign: "center", color: "#2a2f3e", fontSize: "12px", fontStyle: "italic" }}>No tickets</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreate={createTicket} />}
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={updateTicket}
          onMove={moveTicket}
        />
      )}
    </div>
  );
}
