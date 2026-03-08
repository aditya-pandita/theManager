# Decidr Code — Prompt Plan v3

> Tauri desktop app. PostgreSQL. MCP-first. Editor-agnostic.
> React + Vite + Tailwind frontend. Drizzle ORM. Node.js sidecar.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                TAURI SHELL (Rust)                │
│  Native window · System tray · Auto-updater     │
│  Launches Node sidecar on startup               │
├─────────────────────────────────────────────────┤
│                                                  │
│   ┌──────────────────────────────────────────┐  │
│   │          REACT FRONTEND (webview)         │  │
│   │   Vite + Tailwind + Zustand + Recharts   │  │
│   │   Board · Reasoning · Diffs · Stats      │  │
│   └──────────────┬───────────────────────────┘  │
│                  │ HTTP :3117                     │
│   ┌──────────────▼───────────────────────────┐  │
│   │       NODE.JS SIDECAR (compiled binary)   │  │
│   │                                           │  │
│   │   ┌─────────┐ ┌─────────┐ ┌───────────┐ │  │
│   │   │  REST   │ │   MCP   │ │   File    │ │  │
│   │   │  API    │ │  Server │ │  Bridge   │ │  │
│   │   │  :3117  │ │  stdio  │ │  .decidr/     │ │  │
│   │   └────┬────┘ └────┬────┘ └─────┬─────┘ │  │
│   │        │            │            │        │  │
│   │        └────────────┼────────────┘        │  │
│   │                     ▼                     │  │
│   │           ┌──────────────────┐            │  │
│   │           │   CORE ENGINE    │            │  │
│   │           │  Drizzle ORM     │            │  │
│   │           │  Hook Runner     │            │  │
│   │           │  Agent Router    │            │  │
│   │           └────────┬─────────┘            │  │
│   │                    ▼                      │  │
│   │           ┌──────────────────┐            │  │
│   │           │   PostgreSQL     │            │  │
│   │           │  (local or cloud)│            │  │
│   │           └──────────────────┘            │  │
│   └───────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘

      EXTERNAL EDITORS (connect via MCP or REST)
  ┌────────┐ ┌────────────┐ ┌──────────┐ ┌─────┐
  │ Cursor │ │ Claude Code│ │ Windsurf │ │ CLI │
  └────────┘ └────────────┘ └──────────┘ └─────┘
```

### Why This Architecture

| Decision | Reasoning |
|----------|-----------|
| **Tauri v2** | 5-10MB vs Electron's 150MB+. Uses system webview. Rust manages window + sidecar lifecycle. |
| **Node.js sidecar** | Compiled to binary via `pkg`. User doesn't need Node installed. Runs REST + MCP server. |
| **PostgreSQL** | Proper relational queries, indexes, concurrent access. Same DB works local and cloud. Future-proofs for multi-user SaaS. |
| **Drizzle ORM** | Lightweight, TypeScript-native, zero codegen. Schema-as-code with migrations. |
| **Monorepo** | `packages/core` is headless. Server, MCP, UI are thin wrappers. Swap any layer independently. |

---

## Project Structure

```
decidr-code/
│
├── packages/
│   │
│   ├── core/                           # HEADLESS ENGINE (no UI, no HTTP)
│   │   ├── src/
│   │   │   ├── index.ts               # Public exports
│   │   │   ├── db/
│   │   │   │   ├── connection.ts      # Drizzle + postgres.js client
│   │   │   │   ├── schema.ts          # All table definitions
│   │   │   │   └── migrate.ts         # Run migrations on startup
│   │   │   ├── repositories/
│   │   │   │   ├── ticket-repo.ts     # CRUD tickets
│   │   │   │   ├── comment-repo.ts    # CRUD comments
│   │   │   │   ├── changelog-repo.ts  # Append-only audit log
│   │   │   │   ├── reasoning-repo.ts  # Store/retrieve reasoning trees
│   │   │   │   ├── hook-repo.ts       # Hook event log
│   │   │   │   └── session-repo.ts    # Session tracking
│   │   │   ├── services/
│   │   │   │   ├── ticket-service.ts  # Business logic: create, move, process
│   │   │   │   ├── reasoning-service.ts # Build/validate reasoning trees
│   │   │   │   └── stats-service.ts   # Aggregation queries
│   │   │   ├── hooks/
│   │   │   │   ├── runner.ts          # Execute bash scripts on events
│   │   │   │   └── events.ts          # Event name constants
│   │   │   ├── types/
│   │   │   │   ├── ticket.ts          # Ticket, Diff, Status, Priority
│   │   │   │   ├── reasoning.ts       # Reasoning, TreeNode, LogEntry, NodeType
│   │   │   │   ├── hook.ts            # HookEvent
│   │   │   │   └── config.ts          # AppConfig, resolveConfig()
│   │   │   ├── constants/
│   │   │   │   ├── columns.ts         # Board columns
│   │   │   │   ├── priorities.ts      # Priority definitions + colors
│   │   │   │   ├── tags.ts            # Tag list
│   │   │   │   └── node-types.ts      # Decision tree node types + colors
│   │   │   └── utils/
│   │   │       ├── id.ts              # generateId()
│   │   │       └── timestamp.ts       # now()
│   │   ├── drizzle/
│   │   │   └── migrations/            # Generated migration SQL files
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── server/                         # REST API
│   │   ├── src/
│   │   │   ├── index.ts               # HTTP server entry, mount routes
│   │   │   ├── routes/
│   │   │   │   ├── tickets.ts         # /api/tickets CRUD
│   │   │   │   ├── reasoning.ts       # /api/tickets/:id/reasoning
│   │   │   │   ├── comments.ts        # /api/tickets/:id/comments
│   │   │   │   ├── hooks.ts           # /api/hooks
│   │   │   │   ├── stats.ts           # /api/stats
│   │   │   │   └── process.ts         # /api/process → Claude API proxy
│   │   │   └── utils/
│   │   │       └── http.ts            # parseBody, sendJSON, CORS
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mcp/                            # MCP SERVER (stdio)
│   │   ├── src/
│   │   │   ├── index.ts               # McpServer entry
│   │   │   ├── tools/
│   │   │   │   ├── create-ticket.ts
│   │   │   │   ├── update-ticket.ts
│   │   │   │   ├── move-ticket.ts
│   │   │   │   ├── add-comment.ts
│   │   │   │   ├── process-ticket.ts
│   │   │   │   ├── list-tickets.ts
│   │   │   │   └── get-reasoning.ts
│   │   │   ├── resources/
│   │   │   │   ├── board.ts
│   │   │   │   ├── ticket.ts
│   │   │   │   └── stats.ts
│   │   │   └── prompts/
│   │   │       ├── analyze-ticket.ts
│   │   │       └── review-diff.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── file-bridge/                    # .decidr/ FOLDER WATCHER
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── watcher.ts             # Watch .decidr/inbox/ for new files
│   │   │   ├── writer.ts              # Write board state to .decidr/board.json
│   │   │   └── reader.ts              # Parse inbox files
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                            # REACT FRONTEND
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── stores/
│       │   │   ├── ticket-store.ts
│       │   │   ├── ui-store.ts
│       │   │   └── hook-store.ts
│       │   ├── api/
│       │   │   └── client.ts
│       │   ├── components/
│       │   │   ├── layout/            # Header, NavTabs, Toolbar
│       │   │   ├── board/             # Board, Column, TicketCard
│       │   │   ├── ticket/            # Detail modal + all tabs
│       │   │   ├── reasoning/         # TreeView, TreeNode, LogList, LogEntry...
│       │   │   ├── create/            # CreateModal, PriorityPicker, TagPicker...
│       │   │   ├── hooks/             # HooksPanel
│       │   │   ├── stats/             # StatsPanel, StatCard
│       │   │   └── shared/            # Modal, Badge, Tag, Avatar, ProgressBar...
│       │   ├── constants/             # Re-exports from @decidr-code/core
│       │   └── styles/
│       │       └── index.css
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── src-tauri/                          # TAURI SHELL (Rust)
│   ├── src/
│   │   ├── main.rs                    # Tauri entry: window + sidecar lifecycle
│   │   ├── commands.rs                # Tauri commands (Rust ↔ frontend)
│   │   └── tray.rs                    # System tray icon + menu
│   ├── binaries/                      # Compiled sidecar goes here
│   ├── capabilities/
│   │   └── default.json              # Permissions for shell/sidecar
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
│
├── sidecar/                            # NODE.JS SIDECAR SOURCE
│   ├── src/
│   │   └── index.ts                   # Boots server + MCP + file-bridge
│   ├── package.json
│   └── build.sh                       # Compile with pkg → src-tauri/binaries/
│
├── hooks/                              # HOOK SCRIPTS
│   ├── SessionStart.sh
│   ├── TicketCreated.sh
│   ├── TicketMoved.sh
│   └── PostSave.sh
│
├── agents/                             # AGENT DEFINITIONS
│   ├── bug-triager.md
│   ├── refactor-planner.md
│   ├── code-reviewer.md
│   └── perf-analyzer.md
│
├── docs/                               # INTERACTIVE DOCS (Vite app)
│   ├── app/
│   │   ├── src/
│   │   │   ├── pages/                 # Architecture, API, MCP, Schemas, Hooks...
│   │   │   └── components/            # Sidebar, CodeBlock, SchemaViewer, TreeDemo...
│   │   └── package.json
│   └── content/                       # Raw markdown
│
├── .decidr/                                # FILE BRIDGE (gitignored)
│   ├── board.json
│   ├── inbox/
│   └── outbox/
│
├── .cursorrules                        # Cursor integration
├── CLAUDE.md                           # Claude Code integration
├── .cursor/mcp.json                    # Cursor MCP config
├── docker-compose.yml                  # Local PostgreSQL
├── package.json                        # Workspace root
├── tsconfig.base.json
└── README.md
```

---

## Database Schema (PostgreSQL + Drizzle)

### Tables

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   tickets    │────<│   comments   │     │   changelog      │
│─────────────│     │──────────────│     │─────────────────│
│ id (PK)      │     │ id (PK)      │     │ id (PK)          │
│ title        │     │ ticket_id FK │     │ ticket_id FK     │
│ description  │     │ author       │     │ action           │
│ status       │     │ text         │     │ author           │
│ priority     │     │ created_at   │     │ created_at       │
│ tags[]       │     └──────────────┘     └─────────────────┘
│ created_at   │
│ updated_at   │     ┌──────────────┐     ┌─────────────────┐
└──────┬───────┘     │    diffs     │     │   hook_events    │
       │             │──────────────│     │─────────────────│
       └────────────<│ id (PK)      │     │ id (PK)          │
                     │ ticket_id FK │     │ event            │
                     │ file_path    │     │ payload (jsonb)  │
                     │ before_code  │     │ created_at       │
                     │ after_code   │     └─────────────────┘
                     │ created_at   │
                     └──────────────┘     ┌─────────────────┐
                                          │   reasoning      │
       ┌──────────────────────────────────│─────────────────│
       │                                  │ id (PK)          │
       └─────────────────────────────────>│ ticket_id FK (UQ)│
                                          │ summary          │
                                          │ confidence       │
                                          │ time_ms          │
                                          │ tree (jsonb)     │
                                          │ logs (jsonb)     │
                                          │ created_at       │
                                          │ updated_at       │
                                          └─────────────────┘
```

### Why Separate Tables (Not One Big JSON)

| Approach | Problem |
|----------|---------|
| One `tickets` table with JSON columns for everything | Can't query "all comments by Claude" or "tickets with confidence > 0.8" efficiently |
| Separate tables | Proper indexes, foreign keys, join queries. "Show me all tickets where Claude rejected more than 2 alternatives" becomes a real query. |

### Drizzle Schema (what you'll build in Phase 1)

```typescript
// packages/core/src/db/schema.ts

// tickets table
// - id: text PK (DC-XXXXX)
// - title: text NOT NULL
// - description: text
// - status: text NOT NULL DEFAULT 'backlog'  (enum: backlog/todo/in_progress/review/done)
// - priority: text NOT NULL DEFAULT 'medium' (enum: critical/high/medium/low)
// - tags: text[] (postgres array)
// - created_at: timestamp DEFAULT now()
// - updated_at: timestamp DEFAULT now()

// diffs table
// - id: serial PK
// - ticket_id: text FK → tickets.id ON DELETE CASCADE
// - file_path: text NOT NULL
// - before_code: text NOT NULL
// - after_code: text NOT NULL
// - created_at: timestamp DEFAULT now()

// reasoning table
// - id: serial PK
// - ticket_id: text FK → tickets.id ON DELETE CASCADE, UNIQUE
// - summary: text NOT NULL
// - confidence: real NOT NULL (0.0 – 1.0)
// - time_ms: integer NOT NULL
// - tree: jsonb NOT NULL (TreeNode structure)
// - logs: jsonb NOT NULL (LogEntry[] structure)
// - created_at: timestamp DEFAULT now()
// - updated_at: timestamp DEFAULT now()

// comments table
// - id: serial PK
// - ticket_id: text FK → tickets.id ON DELETE CASCADE
// - author: text NOT NULL
// - text: text NOT NULL
// - created_at: timestamp DEFAULT now()

// changelog table
// - id: serial PK
// - ticket_id: text FK → tickets.id ON DELETE CASCADE
// - action: text NOT NULL
// - author: text NOT NULL
// - created_at: timestamp DEFAULT now()

// hook_events table
// - id: serial PK
// - event: text NOT NULL
// - payload: jsonb
// - created_at: timestamp DEFAULT now()

// sessions table
// - id: serial PK
// - started_at: timestamp DEFAULT now()
// - metadata: jsonb
```

### Useful Indexes

```sql
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_comments_ticket ON comments(ticket_id);
CREATE INDEX idx_changelog_ticket ON changelog(ticket_id);
CREATE INDEX idx_reasoning_confidence ON reasoning(confidence);
CREATE INDEX idx_hook_events_event ON hook_events(event);
CREATE INDEX idx_hook_events_created ON hook_events(created_at DESC);
```

---

## Local PostgreSQL Setup

### docker-compose.yml (at project root)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: decidr-code-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: decidr_code
      POSTGRES_USER: decidr_code
      POSTGRES_PASSWORD: decidr_code_dev
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Start DB

```bash
docker compose up -d
# Connection: postgresql://decidr_code:decidr_code_dev@localhost:5432/decidr_code
```

### .env

```bash
DATABASE_URL=postgresql://decidr_code:decidr_code_dev@localhost:5432/decidr_code
ANTHROPIC_API_KEY=sk-ant-...   # Optional: for real Claude processing
PORT=3117
```

---

## Build Phases

### Phase 0 — Project Scaffolding

> **Prompt**:

```
Create the monorepo scaffold for Decidr Code — a Tauri v2 desktop app with
React + Vite + Tailwind frontend, Node.js sidecar, PostgreSQL via Drizzle ORM.

Root package.json (npm workspaces):
- workspaces: ["packages/*", "sidecar", "docs/app"]
- scripts: dev, dev:server, dev:web, dev:mcp, dev:bridge, dev:docs, build, db:push, db:migrate, db:studio

Initialize:
- packages/core — TypeScript library, deps: drizzle-orm, postgres, dotenv
- packages/server — TypeScript, deps: @decidr-code/core
- packages/mcp — TypeScript, deps: @decidr-code/core, @modelcontextprotocol/sdk, zod
- packages/file-bridge — TypeScript, deps: @decidr-code/core
- packages/web — React + Vite + Tailwind, deps: zustand, lucide-react, recharts
- sidecar — TypeScript, compiles with pkg
- src-tauri — Tauri v2 (run: npm create tauri-app@latest)

Create docker-compose.yml for PostgreSQL 16.
Create .env with DATABASE_URL, PORT, ANTHROPIC_API_KEY.
Create tsconfig.base.json with shared compiler options.
Create .gitignore (node_modules, dist, data, .cj, .env, src-tauri/binaries).
```

---

### Phase 1 — Core Engine + Database

> **Prompt**:

```
Build packages/core — the headless engine. Drizzle ORM + PostgreSQL.
No HTTP, no UI. Just TypeScript functions that talk to the database.

TYPES (packages/core/src/types/):

ticket.ts (40 lines)
- Ticket, Diff, Status, Priority, Tag
- NewTicket (input type for creation)

reasoning.ts (35 lines)
- Reasoning, TreeNode, LogEntry, NodeType, Phase

hook.ts (8 lines)
- HookEvent

config.ts (20 lines)
- AppConfig interface
- resolveConfig() reads from env with defaults

DATABASE (packages/core/src/db/):

schema.ts (90 lines)
- Define all 7 tables using Drizzle's pgTable():
  tickets, diffs, reasoning, comments, changelog, hook_events, sessions
- Use Drizzle's text, serial, timestamp, real, integer, jsonb, pgEnum
- Define relations

connection.ts (20 lines)
- Create postgres client from DATABASE_URL
- Export drizzle(client, {schema})

migrate.ts (15 lines)
- Run Drizzle migrations on startup

REPOSITORIES (packages/core/src/repositories/):
Each repo is a thin wrapper around Drizzle queries. Max 60 lines each.

ticket-repo.ts
- create(input: NewTicket): Ticket
- update(id, changes): Ticket
- delete(id): void
- findById(id): Ticket | null (with joins: diff, reasoning, comments, changelog)
- findAll(filters?): Ticket[]
- getStats(): StatsResult

comment-repo.ts
- create(ticketId, author, text): Comment
- findByTicket(ticketId): Comment[]

changelog-repo.ts
- append(ticketId, action, author): void
- findByTicket(ticketId): ChangelogEntry[]

reasoning-repo.ts
- upsert(ticketId, reasoning): Reasoning
- findByTicket(ticketId): Reasoning | null

hook-repo.ts
- append(event: HookEvent): void
- getRecent(limit): HookEvent[]

SERVICES (packages/core/src/services/):
Business logic layer. Orchestrates repos + hooks. Max 70 lines each.

ticket-service.ts
- createTicket(input) → creates ticket + changelog entry + fires hook
- updateTicket(id, changes) → updates + changelog + hook if status changed
- moveTicket(id, newStatus) → update status + changelog + TicketMoved hook
- deleteTicket(id) → delete + hook
- getBoard() → tickets grouped by status column
- getTicketDetail(id) → full ticket with all relations

reasoning-service.ts
- saveReasoning(ticketId, reasoning) → validates tree, upserts
- getReasoning(ticketId) → returns reasoning or null

stats-service.ts
- getDashboard() → {total, byStatus, byPriority, avgConfidence, withReasoning, totalReasoningTime}

HOOKS (packages/core/src/hooks/):
runner.ts (30 lines)
- fireHook(event, payload, hooksDir) → log to DB + execute bash script

events.ts (8 lines)
- Constants: SESSION_START, TICKET_CREATED, TICKET_MOVED, TICKET_DELETED, POST_SAVE

UTILS (packages/core/src/utils/):
id.ts (5 lines), timestamp.ts (3 lines)

CONSTANTS (packages/core/src/constants/):
columns.ts (10 lines), priorities.ts (15 lines), tags.ts (3 lines), node-types.ts (20 lines)

index.ts (25 lines) — re-export everything

Then run: npx drizzle-kit generate
Then run: npx drizzle-kit migrate
```

**Verify Phase 1:**
```bash
docker compose up -d
cd packages/core
npx tsx -e "
  const { createTicketService } = require('./src');
  // test create, read, stats
"
```

---

### Phase 2 — REST Server

> Same as v2 plan but routes now call core services instead of JSON files.
> Each route file: max 70 lines.

```
packages/server/src/routes/tickets.ts
- GET /api/tickets?status=X&priority=Y&search=Z → ticketService.getBoard() or filtered list
- GET /api/tickets/:id → ticketService.getTicketDetail(id)
- POST /api/tickets → ticketService.createTicket(body)
- PUT /api/tickets/:id → ticketService.updateTicket(id, body)
- DELETE /api/tickets/:id → ticketService.deleteTicket(id)

packages/server/src/routes/reasoning.ts
- GET /api/tickets/:id/reasoning → reasoningService.getReasoning(id)
- PUT /api/tickets/:id/reasoning → reasoningService.saveReasoning(id, body)

packages/server/src/routes/comments.ts
- GET /api/tickets/:id/comments → commentRepo.findByTicket(id)
- POST /api/tickets/:id/comments → commentRepo.create(id, body.author, body.text)

packages/server/src/routes/process.ts
- POST /api/process → proxy to Anthropic API, save reasoning to DB
```

---

### Phase 3 — MCP Server

> Same MCP tools as v2 plan. Key difference: tools call core services, which hit PostgreSQL.
> Cursor/Claude Code/Windsurf connect via stdio.

```
Install: npm install @modelcontextprotocol/sdk zod

7 tools:
- create-ticket, update-ticket, move-ticket, add-comment
- process-ticket (triggers Claude analysis)
- list-tickets, get-reasoning

3 resources:
- decidr-code://board → current board state
- decidr-code://ticket/{id} → full ticket detail
- decidr-code://stats → dashboard metrics

2 prompts:
- analyze-ticket → system prompt for ticket analysis
- review-diff → system prompt for diff review
```

---

### Phase 4 — File Bridge

> Same as v2. Watches `.decidr/inbox/`, writes `.decidr/board.json` and `.decidr/outbox/`.
> Now reads from PostgreSQL via core services.

---

### Phase 5 — React Frontend (sub-phases a–g)

> Same component breakdown as v2. 35 components, none over 120 lines.
> Key difference: API calls return richer data from PostgreSQL (proper joins,
> sorted comments, paginated changelogs).

Use the sub-phase prompts from v2:
- 5a: Stores + API client
- 5b: Layout (Header, NavTabs, Toolbar)
- 5c: Board (Board, Column, TicketCard)
- 5d: Ticket detail + tabs
- 5e: Reasoning engine (7 components)
- 5f: Create modal + panels
- 5g: Shared components

---

### Phase 6 — Tauri Desktop Shell

> **Prompt**:

```
Set up Tauri v2 to wrap the React frontend as a native desktop app
and manage the Node.js sidecar lifecycle.

Prerequisites:
- Rust toolchain installed
- Tauri CLI: cargo install tauri-cli --version "^2"

Initialize Tauri inside the project:
cd packages/web && npx tauri init

src-tauri/tauri.conf.json:
- app.productName: "Decidr Code"
- app.version: "1.0.0"
- build.devUrl: "http://localhost:5173" (Vite dev server)
- build.frontendDist: "../packages/web/dist"
- bundle.externalBin: ["binaries/decidr-code-sidecar"]
- app.windows[0]: {title: "Decidr Code", width: 1280, height: 800, decorations: true}
- plugins.shell.scope: allow sidecar execution

src-tauri/src/main.rs (40 lines)
- On app startup:
  1. Spawn the sidecar binary (Node.js server)
  2. Wait for sidecar to be ready (poll :3117/api/stats until response)
  3. Load the webview
- On app close: kill the sidecar process
- Register Tauri commands if needed

src-tauri/src/tray.rs (30 lines)
- System tray icon with menu: Show Window, Quit
- Tray icon uses the CJ logo

src-tauri/capabilities/default.json
- Grant shell:allow-execute for the sidecar binary
- Grant shell:allow-spawn for long-running sidecar

sidecar/src/index.ts (30 lines)
- Import and boot: REST server + file-bridge
- Run DB migrations on startup
- Log "Sidecar ready" when server is listening

sidecar/build.sh
- Compile with pkg: npx pkg sidecar/dist/index.js --output src-tauri/binaries/decidr-code-sidecar
- Rename with target triple for Tauri

Development mode (no sidecar compilation needed):
- Terminal 1: docker compose up -d (Postgres)
- Terminal 2: npm run dev:server (Node server on :3117)
- Terminal 3: npm run dev:web (Vite on :5173)
- Terminal 4: cargo tauri dev (opens native window pointing at :5173)
```

---

### Phase 7 — VS Code / Cursor Extension

> Same as v2 plan. Sidebar panel, 3 commands, API client.
> Works inside both Cursor and VS Code.

---

### Phase 8 — Interactive Docs

> Same as v2 plan. Vite-powered doc site with live demos.
> Add new page: `EditorSetup.tsx` with Cursor, Claude Code, Windsurf, VS Code configs.
> Add new page: `DatabaseGuide.tsx` with schema viewer, migration instructions, query examples.

---

### Phase 9 — Editor Configs + ECC Integration

```
.cursorrules — tells Cursor about available MCP tools
CLAUDE.md — tells Claude Code about the project
.cursor/mcp.json — MCP server config for Cursor
.claude/settings.json — MCP server config for Claude Code

Clone ECC:
git clone https://github.com/affaan-m/everything-claude-code.git ecc
Copy agents, skills, rules, hooks as needed.
```

---

## Implementation Order

| Phase | What | Est. Time | Depends On |
|-------|------|-----------|------------|
| 0 | Scaffolding + Docker | 1 hr | — |
| 1 | Core + DB + Drizzle | 3 hrs | Phase 0 |
| 2 | REST Server | 1.5 hrs | Phase 1 |
| 3 | MCP Server | 2 hrs | Phase 1 |
| 4 | File Bridge | 1 hr | Phase 1 |
| 5a-g | React Frontend | 6-7 hrs | Phase 2 |
| 6 | Tauri Shell + Sidecar | 2-3 hrs | Phase 2, 5 |
| 7 | VS Code Extension | 2 hrs | Phase 2 |
| 8 | Interactive Docs | 2-3 hrs | Phase 5e |
| 9 | Editor Configs + ECC | 1 hr | Phase 3 |

**Total: ~22-26 hours.**
Phases 2, 3, 4 are parallel after Phase 1.
Phase 6 (Tauri) needs Phase 5 to be mostly done.

---

## Dev Workflow

### Daily Development (no Tauri compilation)

```bash
# Terminal 1: Database
docker compose up -d

# Terminal 2: Backend
npm run dev:server    # Node server on :3117

# Terminal 3: Frontend
npm run dev:web       # Vite on :5173

# Terminal 4 (optional): MCP
npm run dev:mcp       # stdio MCP server for editor testing

# Open: http://localhost:5173
```

### Desktop Build

```bash
# 1. Build the sidecar
cd sidecar && npm run build  # → src-tauri/binaries/

# 2. Build the frontend
cd packages/web && npm run build  # → packages/web/dist/

# 3. Build the Tauri app
cargo tauri build  # → src-tauri/target/release/bundle/
```

### Database Workflow

```bash
# After changing schema.ts:
npx drizzle-kit generate    # Generate migration SQL
npx drizzle-kit migrate     # Apply to database
npx drizzle-kit studio      # Visual DB browser at https://local.drizzle.studio
```

---

## File Size Budget

| Category | Max Lines | Split If Over |
|----------|-----------|---------------|
| React component | 120 | Extract sub-component |
| Zustand store | 50 | Split into slices |
| Repository | 60 | Extract query builder |
| Service | 70 | Extract helper |
| MCP tool | 45 | Extract handler function |
| Server route | 70 | Split by method |
| DB schema table | 15 | One table = one block |
| Type file | 50 | Split by domain |
| Rust file | 60 | Extract module |
| Hook script | 20 | Create helper script |

---

## Key Files Reference

| Need | File | Package |
|------|------|---------|
| Add a DB table | `db/schema.ts` | core |
| Add a DB query | `repositories/*.ts` | core |
| Add business logic | `services/*.ts` | core |
| Add a REST endpoint | `routes/*.ts` | server |
| Add an MCP tool | `tools/*.ts` | mcp |
| Add a UI component | `components/**/*.tsx` | web |
| Add a Tauri command | `src/commands.rs` | src-tauri |
| Add a hook event | `hooks/events.ts` + `hooks/*.sh` | core + root |
| Change DB schema | `db/schema.ts` → `drizzle-kit generate` | core |

---

## PostgreSQL Queries You'll Actually Use

These drive the stats dashboard and advanced filtering:

```sql
-- Tickets with reasoning confidence below threshold
SELECT t.*, r.confidence FROM tickets t
JOIN reasoning r ON r.ticket_id = t.id
WHERE r.confidence < 0.7;

-- Most commented tickets (active discussions)
SELECT t.id, t.title, COUNT(c.id) as comment_count
FROM tickets t JOIN comments c ON c.ticket_id = t.id
GROUP BY t.id ORDER BY comment_count DESC LIMIT 10;

-- Claude's decision patterns: how often does it reject alternatives?
SELECT r.ticket_id,
  jsonb_array_length(r.tree->'children') as decision_branches
FROM reasoning r WHERE r.confidence > 0.8;

-- Hook event frequency by type (last 7 days)
SELECT event, COUNT(*) FROM hook_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event ORDER BY count DESC;

-- Average time-to-done by priority
SELECT t.priority,
  AVG(EXTRACT(EPOCH FROM (
    (SELECT MIN(cl.created_at) FROM changelog cl
     WHERE cl.ticket_id = t.id AND cl.action LIKE 'Moved to DONE%')
    - t.created_at
  ))) / 3600 as avg_hours
FROM tickets t WHERE t.status = 'done'
GROUP BY t.priority;
```

These queries are impossible with JSON files — this is why PostgreSQL matters.

---

*Feed each phase to your editor. Verify. Proceed. The tool builds itself.*
