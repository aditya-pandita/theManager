# Decidr Code — Current Implementation

> Last updated: 2026-04-25
> Status: Active development — fully functional core, board, AI reasoning, git integration, MCP server, file bridge, and export working.

---

## 1. What Is This App

Decidr Code is a **native desktop application** for developers that combines a kanban board with AI-powered decision trees. Every ticket processed through Claude generates a structured reasoning tree showing exactly what was considered, what was chosen, what was rejected, and why — creating a permanent, searchable audit trail of every engineering decision.

**Core value**: Not just tracking what changed in your code, but tracking *why* it changed.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop shell | Tauri (Rust) | v2.10.1 |
| Frontend | React | 18.3.1 |
| Bundler | Vite + Tailwind CSS | 5.2.11 / 3.4.3 |
| State management | Zustand | 4.5.2 |
| Icons | Lucide React | 0.379.0 |
| API server | Express | 4.19.2 |
| Database | PostgreSQL 16 (Docker) | — |
| ORM | Drizzle ORM | 0.31.4 |
| DB client | postgres.js | 3.4.4 |
| AI | Anthropic Claude API | @anthropic-ai/sdk 0.20.9 |
| Editor integration | Model Context Protocol SDK | 1.0.0 |
| Language | TypeScript | 5.4.5 |
| Runtime | Node.js | 18+ |
| Package manager | npm workspaces (monorepo) | — |

---

## 3. Monorepo Structure

```
decidr-code/
├── packages/
│   ├── core/          # Headless engine — no HTTP, no UI
│   ├── server/        # Express REST API on :3117
│   ├── mcp/           # MCP server (stdio) for editor integration
│   ├── web/           # React + Vite frontend on :5173
│   ├── file-bridge/   # .decidr/ folder watcher
│   └── vscode-ext/    # VS Code / Cursor extension
├── src-tauri/         # Tauri v2 native shell (Rust)
├── sidecar/           # Node.js sidecar source (compiled to binary via pkg)
├── hooks/             # Bash hook scripts
├── agents/            # Claude agent definitions
├── docs/              # Interactive documentation site (Vite app)
├── tasks/             # Session tracking (changelog, todo, lessons)
├── docker-compose.yml # PostgreSQL 16 on port 5434
├── package.json       # Workspace root + scripts
└── tsconfig.base.json # Shared TypeScript config
```

**Key design rule**: All business logic lives in `packages/core`. The REST server, MCP server, and file bridge are thin wrappers around the same core engine. No logic is duplicated across layers.

---

## 4. Package-by-Package Breakdown

### 4.1 `packages/core` — Headless Engine

The heart of the app. No HTTP, no React, no UI dependencies. Pure TypeScript functions that talk to PostgreSQL via Drizzle ORM.

#### Directory layout

```
packages/core/src/
├── db/
│   ├── schema.ts       # All 11 table definitions + Drizzle relations
│   ├── connection.ts   # Drizzle client from DATABASE_URL
│   └── migrate.ts      # Run migrations on startup
├── repositories/
│   ├── ticket-repo.ts
│   ├── comment-repo.ts
│   ├── changelog-repo.ts
│   ├── reasoning-repo.ts
│   ├── hook-repo.ts
│   ├── session-repo.ts
│   ├── project-repo.ts
│   ├── user-story-repo.ts
│   ├── git-branch-repo.ts
│   └── git-commit-repo.ts
├── services/
│   ├── ticket-service.ts
│   ├── reasoning-service.ts
│   ├── stats-service.ts
│   ├── git-service.ts
│   ├── project-service.ts
│   └── doc-generator.ts
├── hooks/
│   ├── runner.ts       # Execute bash scripts on events
│   └── events.ts       # Event name constants
├── types/
│   ├── ticket.ts       # Ticket, Diff, Status, Priority, Tag, UserStory, Comment, ChangelogEntry
│   ├── reasoning.ts    # Reasoning, TreeNode, LogEntry, NodeType, Phase
│   ├── hook.ts         # HookEvent
│   ├── git.ts          # GitBranch, GitCommit
│   └── config.ts       # AppConfig
├── constants/
│   ├── columns.ts      # Board column definitions
│   ├── priorities.ts   # Priority levels + colors
│   ├── tags.ts         # Available tags
│   └── node-types.ts   # Decision tree node types + colors
└── utils/
    ├── id.ts           # generateId() → DC-XXXXX format
    └── timestamp.ts    # now()
```

#### Ticket Service (core business logic)

```
createTicket(input)     → create ticket + log "Created ticket" to changelog + fire TicketCreated hook
updateTicket(id, changes) → update + log "Updated: [fields]" + fire TicketMoved if status changed + fire PostSave
moveTicket(id, status)  → update status + log "Moved to [column]" + fire TicketMoved hook
deleteTicket(id)        → delete + fire TicketDeleted hook
getBoard()              → all tickets grouped by status column
getTicketDetail(id)     → full ticket with all relations
listTickets(filters?)   → filtered list by status/priority/search/projectId
```

---

### 4.2 `packages/server` — REST API

Express app running on port **3117**. Mounts 12 route modules. Imports directly from `packages/core`.

#### All Routes

```
/api/tickets                    GET, POST
/api/tickets/:id                GET, PUT, DELETE
/api/tickets/:id/comments       GET, POST
/api/tickets/:id/reasoning      GET, PUT
/api/tickets/:id/user-story     GET, PUT
/api/tickets/:id/git            GET (branches + commits for ticket)
/api/stats                      GET
/api/hooks                      GET
/api/process                    POST (triggers Claude AI processing)
/api/import/csv                 POST
/api/projects                   GET, POST, PUT, DELETE
/api/git/commit                 POST (git hook reports commit)
/api/git/branch                 POST (git hook reports new branch)
/api/git/merge                  POST (git hook reports merge)
/api/export/:projectId          GET (?format=markdown|html)
/health                         GET → { status: "ok" }
```

---

### 4.3 `packages/mcp` — MCP Server

Model Context Protocol server running over **stdio**. Allows any compatible editor (Cursor, Claude Code, Windsurf, VS Code) to interact with the board directly without leaving the editor.

#### 11 Tools

| Tool | What it does |
|------|-------------|
| `create-ticket` | Create a new ticket on the board |
| `update-ticket` | Edit title, description, priority, or tags |
| `move-ticket` | Move ticket to a different column |
| `add-comment` | Add a comment to a ticket |
| `process-ticket` | Run Claude AI reasoning on a ticket |
| `list-tickets` | Query tickets with optional filters |
| `get-reasoning` | Retrieve the decision tree for a ticket |
| `list-projects` | List all projects |
| `link-branch` | Manually link a git branch to a ticket |
| `get-git-history` | Get all commits for a ticket |
| `create-branch` | Create a properly-named branch and link it |
| `export-project` | Generate project document as Markdown or HTML |

#### 3 Resources

| URI | Returns |
|-----|---------|
| `decidr-code://board` | Full board state grouped by column |
| `decidr-code://ticket/{id}` | Full ticket with all relations |
| `decidr-code://stats` | Dashboard metrics |

#### 2 Prompts

| Prompt | Purpose |
|--------|---------|
| `analyze-ticket` | System prompt for ticket analysis |
| `review-diff` | System prompt for diff review |

#### Cursor Configuration

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "decidr": {
      "command": "node",
      "args": ["packages/mcp/dist/index.js"]
    }
  }
}
```

---

### 4.4 `packages/web` — React Frontend

React 18 + Vite app on port **5173**. 45 components across 11 directories. API calls proxy to `:3117`.

#### Views (Nav Tabs)

| Tab | What it shows |
|-----|--------------|
| Board | Kanban with 5 columns |
| Hooks | Live event log |
| Stats | Dashboard metrics |
| Flows | Architecture and data flow diagrams |

#### Component Tree

```
App.tsx
├── layout/
│   ├── Header.tsx          # App title + project switcher
│   ├── NavTabs.tsx         # Board / Hooks / Stats / Flows tabs
│   ├── Toolbar.tsx         # Search, filter, New Ticket, Import buttons
│   └── ProjectSwitcher.tsx # Switch between projects
│
├── board/
│   ├── Board.tsx           # 5-column layout, filters tickets
│   ├── Column.tsx          # Single column with header + cards
│   └── TicketCard.tsx      # Card: ID, title, priority, tags, branch badge
│
├── ticket/
│   ├── TicketDetail.tsx    # Full detail panel (right slide-in)
│   ├── TicketHeader.tsx    # ID, title, priority, status, move controls
│   ├── TabBar.tsx          # Detail tabs: Overview / Reasoning / Git / Story / Diff / History
│   ├── ProcessButton.tsx   # Trigger Claude AI processing
│   ├── DiffView.tsx        # Before/after code with syntax highlight
│   ├── GitTab.tsx          # Branches + commit log
│   ├── BranchCard.tsx      # Branch name, status, ahead/behind
│   ├── CommitList.tsx      # List of commits
│   ├── CommitEntry.tsx     # Single commit: hash, message, author, files
│   ├── MergeStatus.tsx     # Merge state indicator
│   ├── UserStoryTab.tsx    # Role/want/benefit/acceptance criteria form
│   ├── CommentList.tsx     # Threaded comments
│   ├── CommentInput.tsx    # Add comment input
│   ├── HistoryTimeline.tsx # Changelog timeline
│   └── MediaDrop.tsx       # File/media attachment
│
├── reasoning/
│   ├── ReasoningTab.tsx    # Container for the full reasoning view
│   ├── TreeView.tsx        # Renders the full decision tree
│   ├── TreeNode.tsx        # Single node (colored by type)
│   ├── TreeLegend.tsx      # Node type color legend
│   ├── SummaryBar.tsx      # Confidence score + summary text
│   ├── LogList.tsx         # Processing step log list
│   └── LogEntry.tsx        # Single log step with timing
│
├── create/
│   ├── CreateModal.tsx     # New ticket modal
│   ├── PriorityPicker.tsx  # critical/high/medium/low selector
│   ├── TagPicker.tsx       # Multi-tag selector
│   └── CodeAttach.tsx      # Attach code diff to new ticket
│
├── hooks/
│   └── HooksPanel.tsx      # Live hook event log view
│
├── stats/
│   ├── StatsPanel.tsx      # Stats dashboard
│   └── StatCard.tsx        # Individual metric card
│
├── flow/
│   └── FlowView.tsx        # Architecture + data flow diagrams
│
├── export/
│   └── ExportModal.tsx     # Format picker + download trigger
│
└── shared/
    ├── Modal.tsx
    ├── Badge.tsx
    ├── Tag.tsx
    ├── Avatar.tsx
    ├── ProgressBar.tsx
    ├── Icons.tsx
    └── EmptyState.tsx
```

#### Zustand Stores

| Store | What it holds |
|-------|--------------|
| `ticket-store.ts` | tickets[], fetchTickets, addTicket, updateTicket, moveTicket, deleteTicket |
| `ui-store.ts` | activeView, searchQuery, filterPriority, selectedTicketId, isCreateModalOpen |
| `hook-store.ts` | hooks[], fetchHooks |
| `project-store.ts` | projects[], activeProjectId, fetchProjects |

---

### 4.5 `packages/file-bridge` — File Watcher

Editor-agnostic integration using a `.decidr/` folder. No API key, no auth, no SDK needed — any tool that can write a file can create tickets.

```
.decidr/
├── inbox/     ← Drop JSON here to create a ticket
├── outbox/    ← Reasoning results written here
└── board.json ← Current board state (written by bridge)
```

**Drop a file to create a ticket:**

```json
{
  "title": "Fix login timeout",
  "description": "Session expires too early on mobile",
  "priority": "high",
  "tags": ["auth", "mobile"]
}
```

Files:
```
packages/file-bridge/src/
├── index.ts    # Entry point
├── watcher.ts  # Watches .decidr/inbox/ for new JSON files
├── writer.ts   # Writes board.json to .decidr/
└── reader.ts   # Parses inbox files into NewTicket shape
```

---

### 4.6 `packages/vscode-ext` — VS Code / Cursor Extension

Sidebar panel and 3 commands usable directly from VS Code and Cursor.

```
packages/vscode-ext/src/
├── extension.ts                 # Extension entry point
├── sidebar/
│   ├── provider.ts              # Sidebar webview provider
│   └── webview.ts               # Webview HTML
├── commands/
│   ├── create-ticket.ts         # Command: create ticket
│   ├── process-ticket.ts        # Command: process with AI
│   └── list-tickets.ts          # Command: list board
└── utils/
    └── api-client.ts            # REST client pointing at :3117
```

---

## 5. Database Schema (PostgreSQL 16 via Drizzle ORM)

11 tables, all defined in `packages/core/src/db/schema.ts` with full TypeScript type safety.

### Table Overview

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `projects` | Multi-project containers | id (text PK), name, description, color, folder_path |
| `tickets` | Work items — the kanban cards | id (DC-XXXXX), project_id FK, title, description, status, priority, tags[] |
| `diffs` | Before/after code per ticket | ticket_id FK, file_path, before_code, after_code |
| `reasoning` | AI decision trees | ticket_id FK (unique), summary, confidence (0-1), time_ms, tree (jsonb), logs (jsonb) |
| `comments` | Discussion threads | ticket_id FK, author, text |
| `changelog` | Append-only audit trail | ticket_id FK, action, author |
| `hook_events` | Every hook firing logged | event, payload (jsonb) |
| `user_stories` | Structured story per ticket | ticket_id FK (unique), role, want, benefit, acceptance_criteria, files[] |
| `sessions` | Session tracking | started_at, metadata (jsonb) |
| `git_branches` | Branch ↔ ticket links | ticket_id FK, branch_name (unique), status, ahead_count, behind_count |
| `git_commits` | Commits per branch | ticket_id FK, branch_id FK, hash (unique), message, author_name, files_added[], files_modified[], files_deleted[], insertions, deletions |

### Relations (Drizzle)

```
projects     → tickets (1:many)
tickets      → diff (1:1)
tickets      → reasoning (1:1)
tickets      → userStory (1:1)
tickets      → comments (1:many)
tickets      → changelog (1:many)
tickets      → gitBranches (1:many)
tickets      → gitCommits (1:many)
gitBranches  → gitCommits (1:many)
```

### Indexes

```sql
idx_tickets_status          ON tickets(status)
idx_tickets_priority        ON tickets(priority)
idx_tickets_project         ON tickets(project_id)
idx_diffs_ticket            ON diffs(ticket_id)
idx_reasoning_confidence    ON reasoning(confidence)
idx_comments_ticket         ON comments(ticket_id)
idx_changelog_ticket        ON changelog(ticket_id)
idx_hook_events_event       ON hook_events(event)
idx_hook_events_created     ON hook_events(created_at DESC)
idx_git_branches_ticket     ON git_branches(ticket_id)
idx_git_commits_ticket      ON git_commits(ticket_id)
idx_git_commits_branch      ON git_commits(branch_id)
idx_git_commits_hash        ON git_commits(hash)
```

---

## 6. Features In Detail

### 6.1 Kanban Board

Five columns: **Backlog → Todo → In Progress → Review → Done**

- Tickets created with auto-generated ID in format `DC-XXXXX`
- Each ticket: title, description, priority, tags, project assignment
- Filter by priority and search by text in real time
- Switch between multiple projects via Header project switcher
- New Ticket button opens `CreateModal` with priority picker, tag picker, and optional code diff attachment
- Tickets show branch status badge if a git branch is linked

### 6.2 AI Reasoning Trees

The central feature. Clicking **Process Ticket** sends the ticket to Claude which returns a full structured decision.

**Tree node types:**

| Type | Color | Meaning |
|------|-------|---------|
| `problem` | Red | The issue being solved |
| `investigation` | Blue | What was explored |
| `discovery` | Cyan | What was found during investigation |
| `root_cause` | Orange | The actual source of the problem |
| `decision` | Purple | A choice point |
| `chosen` | Green | The option that was picked |
| `rejected` | Gray | Options considered but dropped |
| `ruled_out` | Dark gray | Options dismissed immediately |

**Processing phases tracked:**
Intake → Scan → Research → Analysis → Architecture → Alternatives → Implementation → Edge Cases → Validation

**What's stored per reasoning:**
- `summary` — one paragraph conclusion
- `confidence` — float 0–1 on reasoning quality
- `timeMs` — total processing time in milliseconds
- `tree` — full JSON tree (JSONB in Postgres)
- `logs` — array of LogEntry with step number, phase, action, reasoning, durationMs

**Displayed in UI:**
- `SummaryBar` — confidence score as colored bar + summary text
- `TreeView` — recursive tree of `TreeNode` components, color coded by type
- `TreeLegend` — explains what each color means
- `LogList` / `LogEntry` — step-by-step log with per-step timing

### 6.3 Git Integration

Branches and commits auto-link to tickets via naming convention — no manual wiring required.

**Branch naming:**

```
DC-00042/fix-auth-bug               → links to ticket DC-00042
DC-00042/US-015/add-tests           → links to ticket + user story US-015
```

**Auto-detection rules:**

| Signal | Action |
|--------|--------|
| Branch created matching `DC-XXX/*` | Auto-link to ticket, show in Git tab |
| Branch created matching `DC-XXX/US-YYY/*` | Auto-link + tag with story ID |
| Commit on a `DC-*` branch | Append to ticket's commit history |
| Commit message contains `DC-XXX` | Link even if branch doesn't match |
| Branch merged to main | Auto-mark as merged, optionally move ticket to Done |
| Branch stale (>7 days no commits) | Show warning badge on ticket card |

**Detection methods:**
- Git hooks (post-commit, post-checkout, post-merge) — real time
- Polling fallback every 30 seconds if hooks not installed

**Git tab in ticket detail shows:**
- All linked branches with status badge (open/merged/stale/deleted)
- Ahead/behind count vs base branch
- Full commit list: hash, message, author name, committed date
- Per-commit: files added[], files modified[], files deleted[], insertions, deletions
- `MergeStatus` component showing merge state

**Git hook scripts:**

```
hooks/git/
├── post-commit.sh      # Parses branch, POSTs to /api/git/commit
├── post-checkout.sh    # Detects new DC-* branches, POSTs to /api/git/branch
└── post-merge.sh       # Reports merge to /api/git/merge
hooks/install-git-hooks.sh   # Symlinks hooks into .git/hooks/
```

### 6.4 Multi-Project Support

- Projects are containers for tickets with name, color, and optional folder path
- Switch active project from the Header
- Board filters to show only that project's tickets
- Stats and exports are scoped per project
- `ProjectSwitcher` component lists all projects with color dots

### 6.5 User Stories

Structured "As a [role], I want [action], so that [benefit]" format per ticket.

Fields:
- `role` — who the story is for
- `want` — what they want to do
- `benefit` — the outcome/value
- `acceptanceCriteria` — what "done" looks like
- `files[]` — specific files referenced

Displayed in the **Story tab** of ticket detail via `UserStoryTab` component.

### 6.6 Comments and Audit Trail

**Comments:**
- Threaded discussion per ticket
- Author + text + timestamp
- `CommentList` + `CommentInput` components

**Changelog (append-only audit trail):**
- Every action logged: created, updated fields, moved to column
- Never editable or deletable — permanent history
- `HistoryTimeline` component shows chronological timeline

### 6.7 Code Diffs

- Store before/after code per ticket with file path
- Syntax highlighted in `DiffView` component
- Expandable per file
- Included in document exports
- Can be attached at ticket creation time via `CodeAttach`

### 6.8 Document Export

Generate a complete project document at any time.

**Formats:** Markdown, HTML (self-contained with inline styles)

**What's included:**
1. Executive summary — ticket count, completion rate, avg confidence, timeline
2. Board overview — tickets by status
3. Each ticket — title, description, priority, tags, reasoning tree, diffs, comments, git history, changelog
4. Stats — by priority, by tag, confidence distribution, time-to-done
5. Architecture flow diagrams
6. Hook event log and appendix

**Access:**
- UI: Export button in Toolbar → `ExportModal` → choose format → download
- REST: `GET /api/export/:projectId?format=markdown`
- MCP: `export-project` tool from editor

### 6.9 Visual Flow Diagrams

Four interactive diagrams in the **Flows tab** via `FlowView` component:

| Diagram | What it shows |
|---------|--------------|
| Architecture | Package dependency graph (core → server/mcp/web) |
| Data Flow | User action → Store → API → Service → Repository → PostgreSQL |
| Ticket Lifecycle | Column state machine with hook annotations at each transition |
| Reasoning Pipeline | Ticket → Claude API → Tree + Diff → Review |

### 6.10 Hook System

Event-driven bash automation. Each hook is a shell script in `hooks/`. The core `runner.ts` executes the matching script on each event and logs the firing to the `hook_events` table.

| Event | When it fires |
|-------|--------------|
| `SESSION_START` | App launches |
| `TICKET_CREATED` | New ticket created |
| `TICKET_MOVED` | Ticket changes column |
| `TICKET_DELETED` | Ticket deleted |
| `POST_SAVE` | After any ticket update |

Hook scripts receive event payload as environment variables. All firings are viewable in the **Hooks tab** via `HooksPanel`.

### 6.11 Stats Dashboard

Live metrics pulled from PostgreSQL in the **Stats tab**:

- Total tickets
- Tickets by status (backlog/todo/in_progress/review/done)
- Tickets by priority (critical/high/medium/low)
- How many tickets have AI reasoning trees
- Average confidence score across all reasoning
- Total AI reasoning time

### 6.12 AI Agents

Four Claude agent definitions in `agents/` for specialized analysis:

| Agent | Purpose |
|-------|---------|
| `bug-triager.md` | Classify and triage incoming bugs |
| `code-reviewer.md` | Structured code review of diffs |
| `perf-analyzer.md` | Performance bottleneck identification |
| `refactor-planner.md` | Scope and sequence refactoring work |

---

## 7. Architecture & Request Flow

```
USER (browser at :5173)
  ↓ click / action
REACT FRONTEND
  ↓ Zustand store method
API CLIENT (fetch to :3117)
  ↓ HTTP
EXPRESS SERVER (:3117)
  ↓ route handler
CORE SERVICE (ticket-service, reasoning-service, git-service...)
  ↓ repository method
DRIZZLE ORM
  ↓ SQL query
POSTGRESQL (:5434)
```

**MCP path (from editor):**

```
EDITOR (Cursor / Claude Code / Windsurf)
  ↓ MCP tool call
MCP SERVER (stdio)
  ↓ direct import
CORE SERVICE
  ↓ repository
POSTGRESQL
```

**File bridge path:**

```
.decidr/inbox/ticket.json  (written by any tool)
  ↓ file watcher detects
FILE BRIDGE
  ↓ parses JSON
CORE SERVICE → ticketService.createTicket()
  ↓
POSTGRESQL
```

---

## 8. Environment Configuration

**`.env` file at project root:**

```bash
DATABASE_URL=postgresql://decidr_code:decidr_code_dev@localhost:5434/decidr_code
ANTHROPIC_API_KEY=sk-ant-...
PORT=3117
```

**For remote database (friend's laptop on same WiFi):**

```bash
DATABASE_URL=postgresql://decidr_code:decidr_code_dev@<friend-ip>:5434/decidr_code
```

**Docker Compose (PostgreSQL):**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: decidr-code-db
    ports:
      - "5434:5432"
    environment:
      POSTGRES_DB: decidr_code
      POSTGRES_USER: decidr_code
      POSTGRES_PASSWORD: decidr_code_dev
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - pgdata:/var/lib/postgresql/data
```

---

## 9. Development Workflow

### Start everything

```bash
# Terminal 1 — start PostgreSQL
docker compose up -d

# Terminal 2 — start API + frontend together
npm run dev

# Open browser
http://localhost:5173
```

### Individual services

```bash
npm run dev:server    # Express API only on :3117
npm run dev:web       # Vite frontend only on :5173
npm run dev:mcp       # MCP server (stdio)
npm run dev:bridge    # File bridge watcher
npm run dev:docs      # Documentation site
```

### Database commands

```bash
npm run db:migrate    # Apply all pending migrations
npm run db:generate   # Generate new migration after schema change
npm run db:studio     # Open Drizzle Studio visual DB browser
```

### Build desktop app (Tauri)

```bash
# 1. Compile sidecar (Node.js → binary)
cd sidecar && ./build.sh

# 2. Build frontend
cd packages/web && npm run build

# 3. Build Tauri app
cargo tauri build
# Output: src-tauri/target/release/bundle/
```

---

## 10. Key Scripts (root `package.json`)

| Script | What it runs |
|--------|-------------|
| `npm run dev` | server + web concurrently (cyan/magenta logs) |
| `npm run dev:tauri` | Tauri dev window |
| `npm run dev:server` | Express API only |
| `npm run dev:web` | Vite only |
| `npm run dev:mcp` | MCP server |
| `npm run dev:bridge` | File bridge watcher |
| `npm run dev:docs` | Docs site |
| `npm run build` | Build all packages |
| `npm run db:migrate` | Run migrations |
| `npm run db:generate` | Generate new migration |
| `npm run db:studio` | Open Drizzle Studio |

---

## 11. TypeScript Types Reference

### Ticket

```typescript
type Status   = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type Tag      = 'bug' | 'feature' | 'refactor' | 'perf' | 'docs' | 'test' | 'style' | 'infra'

interface Ticket {
  id: string              // DC-XXXXX
  projectId: string | null
  title: string
  description: string | null
  status: Status
  priority: Priority
  tags: string[]
  createdAt: Date
  updatedAt: Date
  // relations (loaded on detail view)
  project?: Project | null
  diff?: Diff | null
  reasoning?: Reasoning | null
  userStory?: UserStory | null
  gitBranches?: GitBranch[]
  gitCommits?: GitCommit[]
  comments?: Comment[]
  changelog?: ChangelogEntry[]
}
```

### Reasoning Tree

```typescript
type NodeType = 'problem' | 'investigation' | 'discovery' | 'root_cause'
              | 'decision' | 'chosen' | 'rejected' | 'ruled_out'

type Phase = 'Intake' | 'Scan' | 'Research' | 'Analysis' | 'Architecture'
           | 'Alternatives' | 'Implementation' | 'Edge cases' | 'Validation'

interface TreeNode {
  id: string
  label: string
  type: NodeType
  detail?: string
  children?: TreeNode[]
}

interface LogEntry {
  step: number
  phase: Phase
  action: string
  reasoning: string
  durationMs: number
}

interface Reasoning {
  id: number
  ticketId: string
  summary: string
  confidence: number   // 0.0 – 1.0
  timeMs: number
  tree: TreeNode       // JSONB in DB
  logs: LogEntry[]     // JSONB in DB
  createdAt: Date
  updatedAt: Date
}
```

---

## 12. File Size Budget (enforced conventions)

| File type | Max lines | Split rule |
|-----------|-----------|------------|
| React component | 120 | Extract sub-component |
| Zustand store | 50 | Split into slices |
| Repository | 60 | Extract query builder |
| Service | 70 | Extract helper |
| MCP tool | 45 | Extract handler |
| Server route | 70 | Split by HTTP method |
| Type file | 50 | Split by domain |

---

## 13. What Is Not Yet Implemented

| Feature | Status |
|---------|--------|
| Tauri sidecar binary compilation | Scaffold in place, `sidecar/build.sh` exists, binary not yet compiled |
| VS Code extension packaging | Source complete, not yet packaged as `.vsix` |
| PDF / DOCX export | Markdown + HTML export works; PDF/DOCX planned |
| Auto-updater | Tauri config references it, not yet wired |
| Test suite | No test files — zero test coverage currently |
| Polling-based git detection | Git hooks work; polling fallback not implemented |
| Drag-and-drop kanban | Board uses click-to-move; true DnD not yet built |
