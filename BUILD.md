# Decidr Code — Local Build Guide

> Tauri desktop app. PostgreSQL. MCP-first. Editor-agnostic.
> *Decisions, made visible.*

---

## Prerequisites

| Tool | Version | Check | Install |
|------|---------|-------|---------|
| **Node.js** | 18+ | `node -v` | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | `npm -v` | Comes with Node.js |
| **Rust** | 1.77+ | `rustc --version` | [rustup.rs](https://rustup.rs) |
| **Docker** | 24+ | `docker --version` | [docker.com](https://docker.com) |
| **Git** | 2.30+ | `git --version` | [git-scm.com](https://git-scm.com) |

**Tauri v2 system deps** (one-time):

```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Windows — install Visual Studio Build Tools + WebView2
# See: https://v2.tauri.app/start/prerequisites/
```

---

## Quick Start (Development Mode)

```bash
# 1. Clone the project
git clone https://github.com/your-username/decidr-code.git
cd decidr-code

# 2. Install all dependencies (monorepo — installs everything)
npm install

# 3. Start PostgreSQL
docker compose up -d

# 4. Run database migrations
npm run db:migrate

# 5. Start development (3 processes in parallel)
npm run dev
```

This boots:
- **PostgreSQL** on `:5432` (via Docker)
- **REST API server** on `:3117` (Node.js)
- **React dev server** on `:5173` (Vite with HMR)

Open **http://localhost:5173** in your browser — or continue to launch the Tauri desktop window:

```bash
# 6. (Optional) Open as native desktop app
cargo tauri dev
```

---

## Project Structure

```
decidr-code/
│
├── packages/
│   ├── core/                    # Headless engine (types, DB, services, hooks)
│   │   ├── src/
│   │   │   ├── db/              # Drizzle schema, connection, migrations
│   │   │   ├── repositories/    # One per table (ticket, comment, reasoning...)
│   │   │   ├── services/        # Business logic (ticket-service, reasoning-service, stats)
│   │   │   ├── hooks/           # Event runner + constants
│   │   │   ├── types/           # TypeScript interfaces (Ticket, Reasoning, TreeNode...)
│   │   │   ├── constants/       # Columns, priorities, tags, node types
│   │   │   └── utils/           # ID generator, timestamps
│   │   └── drizzle/             # Migration SQL files
│   │
│   ├── server/                  # REST API wrapping core
│   │   └── src/routes/          # tickets, comments, reasoning, hooks, stats, process
│   │
│   ├── mcp/                     # MCP Server (stdio transport)
│   │   └── src/
│   │       ├── tools/           # 7 tools (create-ticket, move-ticket, process-ticket...)
│   │       ├── resources/       # 3 resources (board, ticket, stats)
│   │       └── prompts/         # 2 prompts (analyze-ticket, review-diff)
│   │
│   ├── file-bridge/             # .decidr/ folder watcher
│   │   └── src/                 # watcher, writer, reader
│   │
│   └── web/                     # React + Vite + Tailwind frontend
│       └── src/
│           ├── stores/          # Zustand (ticket-store, ui-store, hook-store)
│           ├── api/             # REST client
│           └── components/      # 35 components across 8 directories
│               ├── layout/      # Header, NavTabs, Toolbar
│               ├── board/       # Board, Column, TicketCard
│               ├── ticket/      # TicketDetail, DiffView, ProcessButton...
│               ├── reasoning/   # TreeView, TreeNode, LogEntry, SummaryBar...
│               ├── create/      # CreateModal, PriorityPicker, TagPicker...
│               ├── hooks/       # HooksPanel
│               ├── stats/       # StatsPanel, StatCard
│               └── shared/      # Modal, Badge, Tag, Avatar, ProgressBar...
│
├── src-tauri/                   # Tauri v2 shell (Rust)
│   ├── src/
│   │   ├── main.rs              # Window + sidecar lifecycle
│   │   ├── commands.rs          # Tauri commands
│   │   └── tray.rs              # System tray
│   ├── binaries/                # Compiled Node.js sidecar goes here
│   ├── capabilities/            # Permission config
│   └── tauri.conf.json          # App config
│
├── sidecar/                     # Node.js sidecar source
│   ├── src/index.ts             # Boots REST server + file-bridge + migrations
│   └── build.sh                 # Compile with pkg → src-tauri/binaries/
│
├── hooks/                       # Bash hook scripts
│   ├── SessionStart.sh
│   ├── TicketCreated.sh
│   ├── TicketMoved.sh
│   └── PostSave.sh
│
├── agents/                      # Agent definitions (YAML frontmatter + markdown)
│   ├── bug-triager.md
│   ├── refactor-planner.md
│   ├── code-reviewer.md
│   └── perf-analyzer.md
│
├── docs/                        # Interactive documentation (Vite app)
│   ├── app/
│   └── content/
│
├── .decidr/                     # File bridge folder (gitignored)
│   ├── board.json               # Current board state
│   ├── inbox/                   # Drop JSON here → creates ticket
│   └── outbox/                  # Processed reasoning results
│
├── docker-compose.yml           # PostgreSQL 16
├── .env                         # DATABASE_URL, PORT, ANTHROPIC_API_KEY
├── .cursorrules                 # Cursor MCP tool instructions
├── .cursor/mcp.json             # Cursor MCP server config
├── CLAUDE.md                    # Claude Code project context
├── package.json                 # Workspace root
├── tsconfig.base.json           # Shared TS config
└── README.md
```

---

## Database Setup

### Start PostgreSQL

```bash
docker compose up -d
```

This creates:
- Container: `decidr-code-db`
- Database: `decidr_code`
- User: `decidr_code`
- Password: `decidr_code_dev`
- Port: `5432`

### Connection String

```
postgresql://decidr_code:decidr_code_dev@localhost:5432/decidr_code
```

Already set in `.env` — no manual config needed.

### Schema (7 tables)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `tickets` | Core work items | id (DC-XXXXX), title, status, priority, tags[] |
| `diffs` | Code changes per ticket | file_path, before_code, after_code |
| `reasoning` | Decision trees + logs | tree (JSONB), logs (JSONB), confidence |
| `comments` | Discussion threads | author, text |
| `changelog` | Audit trail | action, author |
| `hook_events` | Hook firing log | event, payload (JSONB) |
| `sessions` | Session tracking | started_at, metadata (JSONB) |

### Database Commands

```bash
# Run migrations (create/update tables)
npm run db:migrate

# Generate migration after schema change
npm run db:generate

# Open Drizzle Studio (visual DB browser)
npm run db:studio
# Opens: https://local.drizzle.studio

# Reset database (drop all + recreate)
docker compose down -v && docker compose up -d && npm run db:migrate

# Connect with psql
docker exec -it decidr-code-db psql -U decidr_code -d decidr_code
```

---

## Development Workflows

### Full Stack (recommended daily workflow)

```bash
# Terminal 1: Database (run once, stays up)
docker compose up -d

# Terminal 2: Everything else (parallel)
npm run dev
# Starts: REST server (:3117) + Vite (:5173) concurrently
```

### Individual Processes (for debugging)

```bash
# Backend only
npm run dev:server              # REST API on :3117

# Frontend only
npm run dev:web                 # Vite HMR on :5173

# MCP server (for editor testing)
npm run dev:mcp                 # stdio — pipe to test

# File bridge
npm run dev:bridge              # Watches .decidr/inbox/

# Docs site
npm run dev:docs                # Docs on :5174
```

### Desktop App (Tauri)

```bash
# Development (hot reload, no compilation)
cargo tauri dev
# Opens native window pointing at Vite :5173
# Rust recompiles on changes to src-tauri/

# Production build
npm run build                   # Build all packages
cd sidecar && bash build.sh     # Compile Node.js sidecar binary
cargo tauri build               # Bundle into native installer
# Output: src-tauri/target/release/bundle/
#   macOS: Decidr Code.app + .dmg
#   Windows: Decidr Code.exe + .msi
#   Linux: decidr-code.AppImage + .deb
```

---

## Editor Integration

### Cursor (MCP)

The project includes `.cursor/mcp.json` pre-configured:

```json
{
  "mcpServers": {
    "decidr-code": {
      "command": "npx",
      "args": ["tsx", "packages/mcp/src/index.ts"],
      "env": {
        "DATABASE_URL": "postgresql://decidr_code:decidr_code_dev@localhost:5432/decidr_code"
      }
    }
  }
}
```

Once the server is running, Cursor can use these MCP tools:

| Tool | What It Does |
|------|--------------|
| `create-ticket` | Create a new ticket on the board |
| `update-ticket` | Update ticket fields |
| `move-ticket` | Change ticket status (column) |
| `add-comment` | Add a comment to a ticket |
| `process-ticket` | Generate reasoning tree + diff via Claude |
| `list-tickets` | List/filter tickets |
| `get-reasoning` | Read the decision tree for a ticket |

And read these resources:

| Resource | URI |
|----------|-----|
| Board state | `decidr-code://board` |
| Single ticket | `decidr-code://ticket/{id}` |
| Statistics | `decidr-code://stats` |

### Claude Code

The project includes `CLAUDE.md` (project context) and can be configured in `~/.claude.json`:

```json
{
  "mcpServers": {
    "decidr-code": {
      "command": "npx",
      "args": ["tsx", "packages/mcp/src/index.ts"],
      "cwd": "/path/to/decidr-code"
    }
  }
}
```

### VS Code / Cursor Extension

```bash
cd packages/vscode-ext
npm run build
# Install: code --install-extension decidr-code-0.1.0.vsix
```

Provides:
- Sidebar panel with compact board view
- Command palette: `Decidr Code: Create Ticket`, `List Tickets`, `Process Ticket`

### File Bridge (any editor, CLI, scripts)

```bash
# Create a ticket by dropping a JSON file
echo '{"title":"Fix CORS bug","priority":"high","tags":["bug"]}' > .decidr/inbox/fix-cors.json

# Read current board
cat .decidr/board.json | jq '.in_progress'

# Read reasoning after processing
cat .decidr/outbox/DC-A3F9X.json | jq '.reasoning.tree'
```

---

## REST API Reference

Base URL: `http://localhost:3117`

### Tickets

```bash
# List all tickets
curl http://localhost:3117/api/tickets

# List filtered
curl "http://localhost:3117/api/tickets?status=in_progress&priority=high"

# Get ticket with full detail (reasoning, comments, changelog, diff)
curl http://localhost:3117/api/tickets/DC-A3F9X

# Create ticket
curl -X POST http://localhost:3117/api/tickets \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Fix CORS headers on /api/users",
    "description": "OPTIONS preflight returns 404",
    "status": "backlog",
    "priority": "high",
    "tags": ["bug", "infra"]
  }'

# Update ticket
curl -X PUT http://localhost:3117/api/tickets/DC-A3F9X \
  -H 'Content-Type: application/json' \
  -d '{"status": "in_progress"}'

# Delete ticket
curl -X DELETE http://localhost:3117/api/tickets/DC-A3F9X
```

### Reasoning

```bash
# Get reasoning for a ticket
curl http://localhost:3117/api/tickets/DC-A3F9X/reasoning

# Save reasoning (after Claude processes)
curl -X PUT http://localhost:3117/api/tickets/DC-A3F9X/reasoning \
  -H 'Content-Type: application/json' \
  -d '{"summary":"...","confidence":0.92,"timeMs":1200,"tree":{...},"logs":[...]}'
```

### Comments

```bash
# List comments
curl http://localhost:3117/api/tickets/DC-A3F9X/comments

# Add comment
curl -X POST http://localhost:3117/api/tickets/DC-A3F9X/comments \
  -H 'Content-Type: application/json' \
  -d '{"author": "Aditya", "text": "Check the auth middleware"}'
```

### Other Endpoints

```bash
# Process ticket (triggers Claude analysis)
curl -X POST http://localhost:3117/api/process \
  -H 'Content-Type: application/json' \
  -d '{"ticketId": "DC-A3F9X"}'

# Stats dashboard
curl http://localhost:3117/api/stats

# Hook event log (last 100)
curl http://localhost:3117/api/hooks
```

---

## Everything-Claude-Code Integration

```bash
# Clone as subdirectory
git clone https://github.com/affaan-m/everything-claude-code.git ecc

# Install ECC agents, skills, rules
cp ecc/agents/*.md ~/.claude/agents/
cp ecc/commands/*.md ~/.claude/commands/
cp -r ecc/skills/* ~/.claude/skills/
cp -r ecc/rules/common/* ~/.claude/rules/

# Or install as Claude Code plugin
# (inside Claude Code terminal)
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code

# Security scan
npx ecc-agentshield scan

# Setup continuous learning
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands},projects}
```

---

## Useful PostgreSQL Queries

Connect: `docker exec -it decidr-code-db psql -U decidr_code -d decidr_code`

```sql
-- Tickets with low confidence (need human review)
SELECT t.id, t.title, r.confidence
FROM tickets t JOIN reasoning r ON r.ticket_id = t.id
WHERE r.confidence < 0.7
ORDER BY r.confidence ASC;

-- Most discussed tickets
SELECT t.id, t.title, COUNT(c.id) as comments
FROM tickets t JOIN comments c ON c.ticket_id = t.id
GROUP BY t.id ORDER BY comments DESC LIMIT 10;

-- Average time-to-done by priority
SELECT t.priority,
  AVG(EXTRACT(EPOCH FROM (
    (SELECT MIN(cl.created_at) FROM changelog cl
     WHERE cl.ticket_id = t.id AND cl.action LIKE 'Moved to DONE%')
    - t.created_at
  ))) / 3600 as avg_hours
FROM tickets t WHERE t.status = 'done'
GROUP BY t.priority;

-- Hook event frequency (last 7 days)
SELECT event, COUNT(*) FROM hook_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event ORDER BY count DESC;
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `EADDRINUSE :3117` | Kill existing: `lsof -ti:3117 \| xargs kill` or use `PORT=8080` |
| `docker: Cannot connect` | Start Docker Desktop, then `docker compose up -d` |
| `relation "tickets" does not exist` | Run `npm run db:migrate` |
| `ECONNREFUSED :5432` | PostgreSQL not running: `docker compose up -d` |
| Hooks not firing | `chmod +x hooks/*.sh` |
| Tauri build fails | Check Rust toolchain: `rustup update` |
| Tauri `sidecar not found` | Run `cd sidecar && bash build.sh` first |
| MCP tools not showing in Cursor | Restart Cursor after adding `.cursor/mcp.json` |
| Drizzle Studio won't open | Run `npm run db:studio` (needs DB running) |
| Windows hooks | Use Git Bash / WSL, or rewrite as `.js` files |
| `ANTHROPIC_API_KEY` missing | Add to `.env` — only needed for `process-ticket` |

---

## npm Scripts Reference

```bash
npm run dev          # Start server + web concurrently
npm run dev:server   # REST API only (:3117)
npm run dev:web      # Vite frontend only (:5173)
npm run dev:mcp      # MCP server (stdio)
npm run dev:bridge   # File bridge watcher
npm run dev:docs     # Docs site (:5174)
npm run build        # Build all packages for production
npm run start        # Start production server
npm run db:migrate   # Run Drizzle migrations
npm run db:generate  # Generate migration from schema changes
npm run db:studio    # Open Drizzle visual DB browser
```

---

## Reading List

| File | What It Covers |
|------|---------------|
| `PROMPT-PLAN.md` | Full build blueprint — every phase, file, and prompt |
| `PROJECT-BREAKDOWN.md` | Epics, stories, tasks — 201 items with estimates |
| `CLAUDE.md` | Project context for Claude Code |
| `.cursorrules` | Project context for Cursor |
| `ecc/the-shortform-guide.md` | ECC setup and philosophy (after cloning) |

---

## License

MIT
