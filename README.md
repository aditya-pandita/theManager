# Decidr Code

**AI-assisted change tracking for developers — every decision, made visible.**

Decidr Code is a desktop application that combines a Jira-style kanban board with AI-powered decision trees, git integration, and editor-native MCP support. When Claude processes a ticket, it generates a full reasoning tree showing what was considered, what was chosen, and why — creating an auditable trail of every engineering decision.

---

## What It Does

- **Kanban board** — Manage work items across Backlog → Todo → In Progress → Review → Done
- **AI reasoning trees** — Claude analyzes tickets and produces structured decision trees with confidence scores
- **Git integration** — Branches and commits auto-link to tickets via naming convention (`DC-XXXXX/feature-name`)
- **MCP-first** — Works natively inside Cursor, Claude Code, Windsurf, and any MCP-compatible editor
- **File bridge** — Drop a JSON file into `.decidr/inbox/` to create a ticket from any tool or script
- **Document export** — Export an entire project as Markdown or HTML (tickets, reasoning, diffs, git history)
- **Visual flows** — Architecture, data flow, ticket lifecycle, and reasoning pipeline diagrams
- **Hook system** — Event-driven bash automation (TicketCreated, TicketMoved, PostSave, SessionStart)
- **User stories** — Structured "As a [role], I want [action], so that [benefit]" with acceptance criteria

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri v2 (Rust) |
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand |
| API | Express 4 (REST, port 3117) |
| Database | PostgreSQL 16 via Drizzle ORM |
| AI | Anthropic Claude API |
| Editor integration | Model Context Protocol (MCP) |
| Language | TypeScript throughout |

Tauri is used instead of Electron — the app binary is 5–10 MB vs 150 MB+ and uses the system webview.

---

## Project Structure

```
decidr-code/
├── packages/
│   ├── core/          # Headless engine — schema, repositories, services, types
│   ├── server/        # Express REST API
│   ├── mcp/           # MCP server for editor integration
│   ├── web/           # React + Vite frontend
│   ├── file-bridge/   # .decidr/ folder watcher for editor-agnostic integration
│   └── vscode-ext/    # VS Code / Cursor extension scaffold
├── src-tauri/         # Tauri v2 native shell (Rust)
├── sidecar/           # Node.js sidecar (compiled to binary via pkg)
├── hooks/             # Bash hook scripts for git and app events
├── agents/            # AI agent definitions (bug-triager, code-reviewer, etc.)
├── docs/              # Interactive documentation site
└── tasks/             # Session tracking (changelog, todo, lessons)
```

### Core Package Architecture

```
User action
  └── React frontend (Zustand store)
        └── REST API client → Express :3117
              └── Route → Service → Repository
                    └── Drizzle ORM → PostgreSQL :5434
```

The `core` package is headless — it has no HTTP or UI dependencies. Both the REST server and the MCP server import directly from `core`, keeping business logic in one place.

---

## Features in Detail

### Kanban Board

Five columns: **Backlog → Todo → In Progress → Review → Done**. Tickets are created with a unique ID in the format `DC-XXXXX`. Each ticket carries a title, description, priority (critical/high/medium/low), and tags.

### AI Reasoning Trees

Clicking **Process Ticket** sends the ticket to Claude, which returns:

- A **decision tree** with typed nodes: `problem`, `investigation`, `discovery`, `root_cause`, `decision`, `chosen`, `rejected`, `ruled_out`
- A **confidence score** (0–1) on the quality of the reasoning
- **Execution logs** with per-step timing
- A **summary** of the conclusion

Processing phases tracked: Intake → Scan → Research → Analysis → Architecture → Alternatives → Implementation → Edge Cases → Validation

### Git Integration

Branches auto-link to tickets when they follow the naming convention:

```
DC-XXXXX/feature-name         # links to ticket DC-XXXXX
DC-XXXXX/US-YYY/sub-feature   # links to ticket + user story
```

Tracking covers:
- Branch status: `open | merged | stale | deleted`
- Commit author, message, files changed (added/modified/deleted), insertions/deletions
- Ahead/behind counts against base branch
- Stale detection (>7 days without commits)
- Merge auto-detection

Hooks fire on `post-commit`, `post-checkout`, and `post-merge`.

### MCP Integration

The MCP server provides 11 tools, 3 resources, and 2 prompts usable directly from any compatible editor.

**Tools**
| Tool | What it does |
|------|-------------|
| `create-ticket` | Create a new ticket on the board |
| `update-ticket` | Edit title, description, priority, tags |
| `move-ticket` | Change column (status) |
| `add-comment` | Add a discussion comment |
| `process-ticket` | Run Claude AI reasoning on a ticket |
| `list-tickets` | Query board with filters |
| `get-reasoning` | Retrieve the decision tree for a ticket |
| `list-projects` | List all projects |
| `link-branch` | Manually link a git branch to a ticket |
| `get-git-history` | Fetch commits for a ticket |
| `create-branch` | Create and link a new branch |
| `export-project` | Export project as Markdown or HTML |

**Resources**: `board://`, `ticket://{id}`, `stats://`

**Prompts**: `analyze-ticket`, `review-diff`

Configure in Cursor via `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "decidr": {
      "command": "node",
      "args": ["packages/mcp/dist/index.js"]
    }
  }
}
```

### File Bridge

Drop a JSON file into `.decidr/inbox/` to create a ticket from any script or CLI tool:

```json
{
  "title": "Fix login timeout",
  "description": "Session expires too early on mobile",
  "priority": "high",
  "tags": ["auth", "mobile"]
}
```

The bridge writes `board.json` to `.decidr/` for other tools to read, and reasoning results appear in `.decidr/outbox/`.

### Hook System

Hook events fire at key moments. Each hook is a bash script in `hooks/`:

| Event | Trigger |
|-------|---------|
| `SessionStart` | App launches |
| `TicketCreated` | New ticket added |
| `TicketMoved` | Ticket changes column |
| `PostSave` | Git post-save |

All hook firings are logged to the `hook_events` table with full payload.

### Document Export

`GET /api/export/:projectId?format=markdown` returns a full project export including tickets, reasoning trees, diffs, comments, git history, and aggregate stats. HTML format includes inline styles for standalone viewing.

---

## Database Schema

11 tables managed by Drizzle ORM with full type safety:

| Table | Purpose |
|-------|---------|
| `projects` | Multi-project containers |
| `tickets` | Work items (kanban cards) |
| `user_stories` | Structured story format per ticket |
| `diffs` | Before/after code per ticket |
| `reasoning` | AI decision trees (JSONB) |
| `comments` | Discussion threads |
| `changelog` | Append-only audit trail |
| `hook_events` | Event log |
| `sessions` | Session tracking |
| `git_branches` | Branch ↔ ticket links |
| `git_commits` | Commit records per branch |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Rust + Cargo
- Docker (for PostgreSQL)
- An Anthropic API key

### Quick Start

```bash
# 1. Clone and install dependencies
git clone <repo>
cd decidr-code
npm install

# 2. Start PostgreSQL
docker-compose up -d

# 3. Run database migrations
cd packages/core
npm run db:migrate

# 4. Set your API key
export ANTHROPIC_API_KEY=sk-ant-...

# 5. Start dev servers (API + frontend)
npm run dev
```

The app opens at http://localhost:5173 and the API runs at http://localhost:3117.

For full build instructions including the Tauri desktop app, sidecar compilation, and git hook setup, see [BUILD.md](BUILD.md).

---

## REST API Reference

Base URL: `http://localhost:3117/api`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tickets` | List tickets (filter by status, priority, projectId) |
| `POST` | `/tickets` | Create ticket |
| `GET` | `/tickets/:id` | Get ticket by ID |
| `PATCH` | `/tickets/:id` | Update ticket |
| `DELETE` | `/tickets/:id` | Delete ticket |
| `POST` | `/tickets/:id/move` | Move to column |
| `GET` | `/tickets/:id/comments` | Get comments |
| `POST` | `/tickets/:id/comments` | Add comment |
| `GET` | `/tickets/:id/reasoning` | Get reasoning tree |
| `POST` | `/process/:id` | Run AI reasoning |
| `GET` | `/projects` | List projects |
| `POST` | `/projects` | Create project |
| `GET` | `/stats` | Board statistics |
| `GET` | `/hooks` | Hook event log |
| `GET` | `/git/branches/:ticketId` | Get branches for ticket |
| `GET` | `/git/commits/:ticketId` | Get commits for ticket |
| `POST` | `/git/link` | Link branch to ticket |
| `GET` | `/export/:projectId` | Export project |
| `POST` | `/import` | Import tickets |

---

## AI Agents

The `agents/` directory contains Claude agent definitions for specialized analysis:

- `bug-triager.md` — Triage and classify incoming bugs
- `code-reviewer.md` — Structured code review
- `perf-analyzer.md` — Performance bottleneck analysis
- `refactor-planner.md` — Refactoring strategy and scope

---

## Development

```bash
# Run all packages in dev mode
npm run dev

# Build core package
cd packages/core && npm run build

# Generate a new database migration
cd packages/core && npm run db:generate

# Apply migrations
cd packages/core && npm run db:migrate

# Build the desktop app
cargo tauri build

# Compile the Node.js sidecar to binary
cd sidecar && ./build.sh
```

---

## Key Design Decisions

**Tauri over Electron** — 5–10 MB binary, no bundled Chromium, uses the system webview. Faster startup and lower memory.

**Drizzle over Prisma** — Schema-as-code in TypeScript, no code generation step, direct SQL access when needed. Type safety without magic.

**MCP first** — The MCP server gives editors the same power as the full UI. Claude Code, Cursor, and Windsurf users can manage the entire board without leaving their editor.

**Core as headless package** — No HTTP or React dependencies in `core`. Both the REST server and MCP server import from it, so business logic lives in exactly one place.

**File bridge** — No auth, no API key, no SDK required. Any tool that can write a JSON file can create tickets.

**Git hooks over polling** — Branch and commit detection fires immediately on git events rather than on a timer, keeping the board accurate in real time.

---

## License

See [LICENSE](LICENSE) if present, or contact the maintainer.
