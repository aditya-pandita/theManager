# Decidr Code — Full Project Breakdown

> Initiative → Epics → User Stories → Tasks → Sub-tasks
> With Acceptance Criteria and Story Point estimates.

---

## Hierarchy Key

| Level | Jira Type | Prefix | Example |
|-------|-----------|--------|---------|
| L0 | **Initiative** | `INIT-` | The entire product |
| L1 | **Epic** | `EP-` | Major feature area |
| L2 | **Story** | `US-` | User-facing capability |
| L3 | **Task** | `TK-` | Implementation work |
| L4 | **Sub-task** | `ST-` | Granular step within a task |

**Story Points Scale**: 1 (trivial, <1hr) · 2 (small, 1-2hr) · 3 (medium, 2-4hr) · 5 (large, 4-8hr) · 8 (XL, 1-2 days) · 13 (XXL, 2-3 days)

---

## L0 — INITIATIVE

### INIT-001: Decidr Code — AI-Assisted Change Tracker Desktop Application

**Vision**: A local-first Tauri desktop application that provides a Jira-style kanban board where AI-generated code changes are tracked with full decision-tree reasoning, hook-based automation, and multi-editor integration via MCP.

**Success Metrics**:
- Desktop app launches and runs on macOS, Windows, Linux
- Tickets can be created, processed, and tracked through a 5-column kanban workflow
- Every Claude-processed ticket has a visible decision tree showing what was considered, chosen, and rejected
- Cursor, Claude Code, and other editors can interact via MCP tools
- PostgreSQL stores all data with proper relations, indexes, and query capability
- Interactive documentation covers all features

**Total Estimated Effort**: ~228 story points (~30-35 working hours)

---

## L1 — EPICS

| ID | Epic | Description | Sprint | Points |
|----|------|-------------|--------|--------|
| EP-01 | Project Foundation | Monorepo scaffolding, Docker, CI config | Sprint 1 | 11 |
| EP-02 | Core Engine & Database | Headless data layer, Drizzle ORM, PostgreSQL schema | Sprint 1 | 26 |
| EP-03 | REST API Server | HTTP routes wrapping core services | Sprint 2 | 13 |
| EP-04 | MCP Server | stdio MCP server with tools, resources, prompts | Sprint 2 | 18 |
| EP-05 | File Bridge | .decidr/ folder watcher for editor-agnostic integration | Sprint 2 | 8 |
| EP-06 | Frontend — Shell & Board | React app shell, kanban board, ticket cards | Sprint 3 | 18 |
| EP-07 | Frontend — Ticket Detail & Reasoning | Detail modal, diff viewer, decision tree, logs | Sprint 3-4 | 26 |
| EP-08 | Frontend — Create & Panels | Ticket creation, hooks viewer, stats dashboard | Sprint 4 | 13 |
| EP-09 | Tauri Desktop Shell | Native window, sidecar lifecycle, system tray | Sprint 5 | 13 |
| EP-10 | VS Code / Cursor Extension | Sidebar panel, commands, API client | Sprint 5 | 10 |
| EP-11 | Interactive Documentation | Doc site with live demos, API tester, schema viewer | Sprint 6 | 13 |
| EP-12 | Editor Integration & ECC | Config files, ECC repo integration, agent system | Sprint 6 | 8 |
| EP-13 | Git Integration & Branch Strategy | Branch naming, auto-linking, commit tracking, git hooks, merge detection, review workflow | Sprint 7 | 34 |
| EP-14 | Document Generation | Export project as PDF/Markdown/HTML/DOCX with full ticket details | Sprint 8 | 18 |
| EP-15 | Visual Flow Diagrams | Architecture flow, data flow, ticket lifecycle, reasoning pipeline | Sprint 8 | 16 |

---

## L2–L4 — FULL BREAKDOWN BY EPIC

---

### EP-01: Project Foundation

---

#### US-001: As a developer, I want a monorepo scaffold so that all packages share config and can be developed together.
**Points**: 3 · **Priority**: Highest

**Acceptance Criteria**:
- npm workspaces configured with all 6 packages
- `tsconfig.base.json` shared by all packages
- `npm install` at root installs all dependencies
- `npm run dev` starts server + web concurrently

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-001 | Initialize root package.json with npm workspaces | 1 |
| TK-002 | Create tsconfig.base.json with shared TS compiler options | 1 |
| TK-003 | Create package.json for each package (core, server, mcp, file-bridge, web) | 1 |

**Sub-tasks for TK-001**:
- ST-001: Create package.json with workspaces array
- ST-002: Add dev scripts (dev, dev:server, dev:web, dev:mcp, dev:bridge)
- ST-003: Add build scripts (build, start)
- ST-004: Add db scripts (db:push, db:migrate, db:studio)
- ST-005: Install root devDependencies (concurrently, tsx, typescript)

---

#### US-002: As a developer, I want a local PostgreSQL instance so that I can develop against a real database.
**Points**: 2 · **Priority**: Highest

**Acceptance Criteria**:
- `docker compose up -d` starts PostgreSQL 16
- Database `decidr_code` is created automatically
- Connection string works from Node.js

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-004 | Create docker-compose.yml with PostgreSQL 16 Alpine | 1 |
| TK-005 | Create .env with DATABASE_URL, PORT, ANTHROPIC_API_KEY | 1 |

---

#### US-003: As a developer, I want proper git configuration so that generated files are excluded.
**Points**: 1 · **Priority**: High

**Acceptance Criteria**:
- `.gitignore` excludes node_modules, dist, data, .cj, .env, src-tauri/binaries, pgdata

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-006 | Create .gitignore with all exclusion patterns | 1 |

---

#### US-004: As a developer, I want the sidecar package scaffolded so that the Node server can be compiled to a binary later.
**Points**: 2 · **Priority**: Medium

**Acceptance Criteria**:
- `sidecar/` directory with package.json, tsconfig, and build script
- `build.sh` compiles with pkg and renames with target triple

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-007 | Create sidecar/package.json with pkg dependency | 1 |
| TK-008 | Create sidecar/build.sh that compiles and renames binary | 1 |

---

#### US-005: As a developer, I want hook scripts scaffolded so that the event system has scripts to execute.
**Points**: 1 · **Priority**: Medium

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-009 | Create hooks/ directory with SessionStart.sh, TicketCreated.sh, TicketMoved.sh, PostSave.sh | 1 |

---

### EP-02: Core Engine & Database

---

#### US-006: As a developer, I want TypeScript type definitions so that all packages share a single source of truth for data shapes.
**Points**: 3 · **Priority**: Highest

**Acceptance Criteria**:
- All types are exported from `@decidr-code/core`
- Ticket, Reasoning, TreeNode, LogEntry, HookEvent, AppConfig all defined
- Status, Priority, NodeType, Phase are union string types (not enums, for portability)

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-010 | Create types/ticket.ts — Ticket, Diff, Status, Priority, Tag, NewTicket | 1 |
| TK-011 | Create types/reasoning.ts — Reasoning, TreeNode, LogEntry, NodeType, Phase | 1 |
| TK-012 | Create types/hook.ts — HookEvent | 0.5 |
| TK-013 | Create types/config.ts — AppConfig, resolveConfig() | 0.5 |

---

#### US-007: As a developer, I want a PostgreSQL schema with proper relations so that tickets, reasoning, comments, and changelogs are stored efficiently.
**Points**: 5 · **Priority**: Highest

**Acceptance Criteria**:
- 7 tables created: tickets, diffs, reasoning, comments, changelog, hook_events, sessions
- Foreign keys with CASCADE deletes
- Indexes on status, priority, confidence, ticket_id FKs, event type
- `reasoning.tree` and `reasoning.logs` stored as JSONB
- `tickets.tags` stored as postgres text array
- Schema runs clean on fresh database

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-014 | Define tickets table in Drizzle schema | 1 |
| TK-015 | Define diffs table with FK to tickets | 0.5 |
| TK-016 | Define reasoning table with FK to tickets (unique constraint) | 1 |
| TK-017 | Define comments table with FK to tickets | 0.5 |
| TK-018 | Define changelog table with FK to tickets | 0.5 |
| TK-019 | Define hook_events table | 0.5 |
| TK-020 | Define sessions table | 0.5 |
| TK-021 | Add all indexes (status, priority, confidence, FKs, event, created_at) | 1 |
| TK-022 | Define Drizzle relations between tables | 1 |

**Sub-tasks for TK-014**:
- ST-006: Define columns: id (text PK), title, description, status, priority, tags (text[]), created_at, updated_at
- ST-007: Add pgEnum for status and priority OR use text with CHECK constraints
- ST-008: Set defaults: status='backlog', priority='medium', timestamps=now()

---

#### US-008: As a developer, I want a database connection module so that all repositories share a single client.
**Points**: 2 · **Priority**: Highest

**Acceptance Criteria**:
- Connection reads DATABASE_URL from env
- Single drizzle instance exported
- Connection handles errors gracefully

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-023 | Create db/connection.ts — postgres client + drizzle wrapper | 1 |
| TK-024 | Create db/migrate.ts — run migrations on startup | 1 |

---

#### US-009: As a developer, I want repository classes so that each table has clean CRUD operations.
**Points**: 8 · **Priority**: Highest

**Acceptance Criteria**:
- Each repo is under 60 lines
- Each repo handles only its own table(s)
- ticket-repo includes joins for full detail queries
- All repos return typed results

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-025 | Create ticket-repo.ts — create, update, delete, findById (with joins), findAll (with filters), getStats | 3 |
| TK-026 | Create comment-repo.ts — create, findByTicket | 1 |
| TK-027 | Create changelog-repo.ts — append, findByTicket | 1 |
| TK-028 | Create reasoning-repo.ts — upsert, findByTicket | 1 |
| TK-029 | Create hook-repo.ts — append, getRecent | 1 |
| TK-030 | Create session-repo.ts — create, findAll | 1 |

**Sub-tasks for TK-025**:
- ST-009: Implement create() — generate ID, insert ticket, return with timestamps
- ST-010: Implement findById() — LEFT JOIN diffs, reasoning, comments, changelog
- ST-011: Implement findAll() — filter by status, priority, search (ILIKE on title)
- ST-012: Implement update() — partial update, set updated_at
- ST-013: Implement delete() — CASCADE handles related rows
- ST-014: Implement getStats() — COUNT, GROUP BY, AVG on confidence

---

#### US-010: As a developer, I want service classes so that business logic is separated from data access.
**Points**: 5 · **Priority**: Highest

**Acceptance Criteria**:
- Services orchestrate repos + hooks
- ticket-service handles create/move/delete with changelog + hook firing
- reasoning-service validates tree structure before saving
- stats-service returns dashboard-ready aggregations

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-031 | Create ticket-service.ts — createTicket, updateTicket, moveTicket, deleteTicket, getBoard, getTicketDetail | 3 |
| TK-032 | Create reasoning-service.ts — saveReasoning (with tree validation), getReasoning | 1 |
| TK-033 | Create stats-service.ts — getDashboard aggregation | 1 |

---

#### US-011: As a developer, I want a hook execution system so that bash scripts fire on events.
**Points**: 2 · **Priority**: High

**Acceptance Criteria**:
- fireHook() logs event to DB AND executes `hooks/{Event}.sh` if it exists
- Script receives payload as JSON argument
- Script timeout is 5 seconds
- Failures are logged but don't block the caller

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-034 | Create hooks/runner.ts — fireHook(event, payload, hooksDir) | 1 |
| TK-035 | Create hooks/events.ts — event name constants | 0.5 |
| TK-036 | Create utils/id.ts and utils/timestamp.ts | 0.5 |

---

#### US-012: As a developer, I want shared constants so that columns, priorities, tags, and node types are defined once.
**Points**: 1 · **Priority**: High

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-037 | Create constants/ — columns.ts, priorities.ts, tags.ts, node-types.ts | 1 |

---

### EP-03: REST API Server

---

#### US-013: As a frontend developer, I want a REST API so that the React app can read and write tickets.
**Points**: 5 · **Priority**: Highest

**Acceptance Criteria**:
- All endpoints return JSON with CORS headers
- Ticket CRUD: GET list, GET by ID, POST create, PUT update, DELETE
- Comments: GET by ticket, POST to ticket
- Error responses include status code and message
- Server starts on PORT from env (default 3117)

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-038 | Create server entry (index.ts) — HTTP server, route mounting, static file serving | 2 |
| TK-039 | Create routes/tickets.ts — GET /api/tickets, GET /:id, POST, PUT /:id, DELETE /:id | 2 |
| TK-040 | Create routes/comments.ts — GET /api/tickets/:id/comments, POST | 1 |

---

#### US-014: As a frontend developer, I want reasoning and stats endpoints so that the UI can display decision trees and dashboards.
**Points**: 3 · **Priority**: High

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-041 | Create routes/reasoning.ts — GET /api/tickets/:id/reasoning, PUT | 1 |
| TK-042 | Create routes/stats.ts — GET /api/stats | 1 |
| TK-043 | Create routes/hooks.ts — GET /api/hooks | 1 |

---

#### US-015: As a developer, I want a Claude API proxy endpoint so that the frontend can trigger ticket processing without exposing the API key.
**Points**: 3 · **Priority**: High

**Acceptance Criteria**:
- POST /api/process accepts {ticketId}
- Server reads ANTHROPIC_API_KEY from env
- Sends ticket data to Claude with system prompt for reasoning generation
- Parses response, saves reasoning to DB, returns result
- Handles API errors gracefully

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-044 | Create routes/process.ts — Claude API proxy | 2 |
| TK-045 | Create prompts/analyze-ticket.txt — system prompt for reasoning generation | 1 |

---

#### US-016: As a developer, I want HTTP utility functions so that route handlers are clean.
**Points**: 2 · **Priority**: High

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-046 | Create utils/http.ts — parseBody, sendJSON, sendError, CORS middleware | 2 |

---

### EP-04: MCP Server

---

#### US-017: As a Cursor/Claude Code user, I want MCP tools so that I can create and manage tickets from inside my editor.
**Points**: 8 · **Priority**: Highest

**Acceptance Criteria**:
- 7 MCP tools registered and working via stdio transport
- Each tool has proper zod input schema with descriptions
- Tools call core services (not direct DB access)
- Cursor can list tools via MCP protocol

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-047 | Create MCP server entry (index.ts) — McpServer + StdioTransport + register all tools/resources/prompts | 2 |
| TK-048 | Create tools/create-ticket.ts | 1 |
| TK-049 | Create tools/update-ticket.ts | 0.5 |
| TK-050 | Create tools/move-ticket.ts | 0.5 |
| TK-051 | Create tools/add-comment.ts | 0.5 |
| TK-052 | Create tools/process-ticket.ts — trigger Claude analysis, save reasoning | 2 |
| TK-053 | Create tools/list-tickets.ts | 0.5 |
| TK-054 | Create tools/get-reasoning.ts | 0.5 |

**Sub-tasks for TK-052**:
- ST-015: Read ticket from DB with all context
- ST-016: Build Claude API request with system prompt + ticket JSON
- ST-017: Parse response into Reasoning schema
- ST-018: Save reasoning to DB via reasoning-service
- ST-019: Add changelog entry "Claude generated reasoning"
- ST-020: Return reasoning + diff as MCP tool result

---

#### US-018: As an editor, I want MCP resources so that I can read the current board state and ticket details.
**Points**: 3 · **Priority**: High

**Acceptance Criteria**:
- 3 resources registered with proper URIs
- Board resource returns tickets grouped by column
- Ticket resource accepts ID parameter
- Stats resource returns aggregated metrics

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-055 | Create resources/board.ts — decidr-code://board | 1 |
| TK-056 | Create resources/ticket.ts — decidr-code://ticket/{id} | 1 |
| TK-057 | Create resources/stats.ts — decidr-code://stats | 1 |

---

#### US-019: As an editor, I want MCP prompts so that I can analyze tickets and review diffs with pre-built system prompts.
**Points**: 2 · **Priority**: Medium

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-058 | Create prompts/analyze-ticket.ts | 1 |
| TK-059 | Create prompts/review-diff.ts | 1 |

---

#### US-020: As a developer, I want editor config files so that MCP connects automatically.
**Points**: 2 · **Priority**: High

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-060 | Create .cursor/mcp.json for Cursor | 0.5 |
| TK-061 | Create .claude/settings.json for Claude Code | 0.5 |
| TK-062 | Create .cursorrules with tool usage instructions | 0.5 |
| TK-063 | Create CLAUDE.md with project context | 0.5 |

---

### EP-05: File Bridge

---

#### US-021: As a developer using any editor, I want to create tickets by dropping JSON files so that I don't need MCP support.
**Points**: 3 · **Priority**: Medium

**Acceptance Criteria**:
- Dropping a .json file in `.decidr/inbox/` creates a ticket in the database
- The inbox file is deleted after processing
- Invalid JSON is logged and moved to `.decidr/errors/`

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-064 | Create file-bridge entry (index.ts) — boot watcher + writer | 1 |
| TK-065 | Create watcher.ts — fs.watch on .decidr/inbox/ with debounce | 1 |
| TK-066 | Create reader.ts — parse and validate inbox JSON files | 1 |

---

#### US-022: As a developer, I want the current board state written to a file so that any tool can read it.
**Points**: 2 · **Priority**: Medium

**Acceptance Criteria**:
- `.decidr/board.json` always reflects current DB state
- Updated after every ticket mutation
- `.decidr/outbox/{id}.json` written after reasoning is generated

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-067 | Create writer.ts — writeBoardState(), writeProcessingResult() | 2 |

---

### EP-06: Frontend — Shell & Board

---

#### US-023: As a user, I want a React app shell with navigation so that I can switch between Board, Hooks, and Stats views.
**Points**: 5 · **Priority**: Highest

**Acceptance Criteria**:
- App renders with header (logo, title, progress bar)
- Nav tabs switch between Board, Hooks Log, Stats
- Toolbar has search input, priority filters, "+ New Ticket" button
- Dark theme with DM Sans / JetBrains Mono fonts

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-068 | Initialize Vite + React + Tailwind project | 1 |
| TK-069 | Create Zustand stores (ticket-store, ui-store, hook-store) | 2 |
| TK-070 | Create API client (client.ts) | 1 |
| TK-071 | Create App.tsx — layout + view routing | 1 |

**Sub-tasks for TK-069**:
- ST-021: ticket-store — tickets[], fetchTickets, addTicket, updateTicket, moveTicket, deleteTicket
- ST-022: ui-store — activeView, searchQuery, filterPriority, selectedTicketId, isCreateModalOpen, activeDetailTab + setters
- ST-023: hook-store — hooks[], fetchHooks with 5-second auto-poll

---

#### US-024: As a user, I want layout components so that the app has a consistent header, navigation, and toolbar.
**Points**: 3 · **Priority**: Highest

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-072 | Create Header.tsx — logo, title, done/total progress bar | 1 |
| TK-073 | Create NavTabs.tsx — Board, Hooks, Stats with badge counts | 1 |
| TK-074 | Create Toolbar.tsx — search, priority filters, new ticket button | 1 |

---

#### US-025: As a user, I want a kanban board so that I can see all tickets organized by status column.
**Points**: 5 · **Priority**: Highest

**Acceptance Criteria**:
- 5 columns render: Backlog, To Do, In Progress, Review, Done
- Each column shows ticket count
- Cards display: ID, title, priority badge, tags, indicators (diff/reasoning/comments)
- Search and priority filter work in real-time
- Clicking a card opens the detail modal
- Cards have subtle hover animation

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-075 | Create Board.tsx — renders 5 Column components with filtered tickets | 1 |
| TK-076 | Create Column.tsx — header (dot + label + count) + card list + empty state | 2 |
| TK-077 | Create TicketCard.tsx — card with all visual elements and click handler | 2 |

---

#### US-026: As a user, I want shared UI components so that badges, tags, and avatars are consistent.
**Points**: 2 · **Priority**: High

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-078 | Create shared components — Modal, Badge, Tag, Avatar, ProgressBar, EmptyState | 2 |

---

### EP-07: Frontend — Ticket Detail & Reasoning

---

#### US-027: As a user, I want a ticket detail modal so that I can view all information about a ticket in one place.
**Points**: 5 · **Priority**: Highest

**Acceptance Criteria**:
- Modal opens when clicking a ticket card
- Header shows: ID, title, priority badge, status badge, tags, move buttons
- 5 tabs: Diff, Reasoning, Comments, History, Media
- Move buttons transition ticket to adjacent columns
- ESC or backdrop click closes modal

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-079 | Create TicketDetail.tsx — modal wrapper, tab routing | 2 |
| TK-080 | Create TicketHeader.tsx — ID, title, badges, move buttons | 2 |
| TK-081 | Create TabBar.tsx — 5-tab switcher with active state | 1 |

---

#### US-028: As a user, I want a side-by-side diff viewer so that I can see what code Claude changed.
**Points**: 3 · **Priority**: Highest

**Acceptance Criteria**:
- Two-pane display: BEFORE (red) / AFTER (green)
- File path shown in header
- Line numbers on each pane
- "No code changes yet" empty state when no diff exists

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-082 | Create DiffView.tsx — side-by-side code display with line numbers | 3 |

---

#### US-029: As a user, I want to trigger Claude processing from the UI so that reasoning and diffs are generated.
**Points**: 3 · **Priority**: Highest

**Acceptance Criteria**:
- "Ask Claude to Process" button calls /api/process
- Spinner shows during processing
- On completion: reasoning tab populated, diff updated, comment added
- Error state shown if API fails

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-083 | Create ProcessButton.tsx — trigger + loading + error states | 3 |

---

#### US-030: As a user, I want an interactive decision tree so that I can understand WHY Claude made each choice.
**Points**: 8 · **Priority**: Highest

**Acceptance Criteria**:
- Tree renders recursively with expand/collapse
- 8 node types with distinct colors: problem, investigation, discovery, root_cause, decision, chosen (✓), rejected (✕), ruled_out (✕)
- Click node to expand/collapse children
- Detail text shown below expanded nodes
- Color-coded legend at bottom
- Summary bar shows: confidence %, reasoning time, one-line summary
- Toggle between Tree View and Step-by-Step Logs

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-084 | Create ReasoningTab.tsx — container with summary bar + view toggle | 1 |
| TK-085 | Create SummaryBar.tsx — confidence (color-coded), time, summary text | 1 |
| TK-086 | Create TreeView.tsx — renders root TreeNode + TreeLegend | 1 |
| TK-087 | Create TreeNode.tsx — recursive component with expand/collapse, detail, children | 3 |
| TK-088 | Create TreeLegend.tsx — horizontal color-coded legend | 0.5 |
| TK-089 | Create LogList.tsx — renders LogEntry list + total time footer | 0.5 |
| TK-090 | Create LogEntry.tsx — expandable: step, phase badge, action, WHY, duration bar | 1 |

**Sub-tasks for TK-087**:
- ST-024: Render node box with type-colored background and border
- ST-025: Show icon based on type (✓ for chosen, ✕ for rejected, ▼ for expandable)
- ST-026: Toggle expand/collapse on click
- ST-027: Show detail panel below when expanded
- ST-028: Recursively render children with increased depth/indent
- ST-029: Connector lines between parent and children

---

#### US-031: As a user, I want a comment thread so that I can discuss tickets with Claude.
**Points**: 3 · **Priority**: High

**Acceptance Criteria**:
- Comments displayed with avatar (purple gradient for Claude, amber for user)
- Author name and timestamp on each comment
- Input bar at bottom with Enter-to-send
- New comments appear immediately (optimistic update)

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-091 | Create CommentList.tsx — threaded comment display | 1 |
| TK-092 | Create CommentInput.tsx — input + send with Enter key | 1 |
| TK-093 | Wire comments to API — POST on send, refresh on success | 1 |

---

#### US-032: As a user, I want a history timeline so that I can see every action taken on a ticket.
**Points**: 2 · **Priority**: High

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-094 | Create HistoryTimeline.tsx — vertical timeline with colored dots and metadata | 2 |

---

#### US-033: As a user, I want a media drop zone so that I can attach screenshots and GIFs to tickets.
**Points**: 2 · **Priority**: Low

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-095 | Create MediaDrop.tsx — drag-and-drop zone with visual feedback | 2 |

---

### EP-08: Frontend — Create & Panels

---

#### US-034: As a user, I want a ticket creation modal so that I can add new tickets with all details.
**Points**: 5 · **Priority**: Highest

**Acceptance Criteria**:
- Modal with fields: title (required), description, priority picker, tag picker, code attachment (optional)
- Priority picker shows 4 buttons with active state
- Tag picker allows multi-select
- Code attachment has file path input + code textarea
- Create button disabled until title is filled
- Ticket appears on board immediately after creation

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-096 | Create CreateModal.tsx — form layout and submission logic | 2 |
| TK-097 | Create PriorityPicker.tsx — 4-button selector | 1 |
| TK-098 | Create TagPicker.tsx — multi-select tag buttons | 1 |
| TK-099 | Create CodeAttach.tsx — file path + code textarea | 1 |

---

#### US-035: As a user, I want a hooks log panel so that I can see what events have fired.
**Points**: 2 · **Priority**: Medium

**Acceptance Criteria**:
- Shows recent hook events in reverse chronological order
- Each entry: event badge (color-coded), payload summary, timestamp
- Auto-refreshes every 5 seconds

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-100 | Create HooksPanel.tsx — event log with auto-refresh | 2 |

---

#### US-036: As a user, I want a stats dashboard so that I can see project health at a glance.
**Points**: 3 · **Priority**: Medium

**Acceptance Criteria**:
- Cards: total tickets, completed, in progress, with reasoning, avg confidence, total reasoning time
- Color-coded values
- Refreshes when switching to Stats tab

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-101 | Create StatsPanel.tsx — grid container | 1 |
| TK-102 | Create StatCard.tsx — single metric card | 1 |
| TK-103 | Wire stats to API — fetch on tab switch | 1 |

---

### EP-09: Tauri Desktop Shell

---

#### US-037: As a user, I want Decidr Code to run as a native desktop application so that I don't need a browser.
**Points**: 5 · **Priority**: Highest

**Acceptance Criteria**:
- Native window opens with title "Decidr Code" (1280x800)
- Node.js sidecar starts automatically on app launch
- App waits for sidecar to be ready before loading webview
- Sidecar is killed when app closes (no orphan processes)

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-104 | Initialize Tauri v2 in project (tauri init) | 1 |
| TK-105 | Configure tauri.conf.json — window, sidecar, build paths | 1 |
| TK-106 | Implement main.rs — spawn sidecar, poll readiness, load webview, cleanup on close | 2 |
| TK-107 | Configure capabilities/default.json — shell permissions for sidecar | 1 |

**Sub-tasks for TK-106**:
- ST-030: Spawn sidecar binary using app.shell().sidecar()
- ST-031: Poll http://localhost:3117/api/stats every 500ms until response
- ST-032: Set webview URL to localhost:3117 when ready
- ST-033: Handle sidecar spawn failure with error dialog
- ST-034: Kill sidecar on app close event

---

#### US-038: As a user, I want a system tray icon so that I can minimize Decidr Code to the background.
**Points**: 3 · **Priority**: Medium

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-108 | Create tray.rs — system tray with CJ icon | 1 |
| TK-109 | Add tray menu: Show Window, Separator, Quit | 1 |
| TK-110 | Minimize to tray on window close (instead of quitting) | 1 |

---

#### US-039: As a developer, I want a sidecar build pipeline so that the Node server compiles to a standalone binary.
**Points**: 3 · **Priority**: High

**Acceptance Criteria**:
- `sidecar/build.sh` produces a binary in `src-tauri/binaries/`
- Binary is named with correct target triple suffix
- Binary boots REST server + runs DB migrations on startup

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-111 | Create sidecar/src/index.ts — boots server + file-bridge + migrations | 1 |
| TK-112 | Create build.sh — compile with pkg, rename with target triple, copy to binaries/ | 1 |
| TK-113 | Test: compiled binary starts and serves API on :3117 | 1 |

---

### EP-10: VS Code / Cursor Extension

---

#### US-040: As a Cursor/VS Code user, I want a sidebar panel so that I can see the board without leaving my editor.
**Points**: 5 · **Priority**: High

**Acceptance Criteria**:
- Activity bar icon for Decidr Code
- Sidebar shows compact ticket list grouped by status
- Click ticket opens detail (in webview tab or browser)
- Refreshes automatically

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-114 | Create extension manifest (package.json) with contributes.views | 1 |
| TK-115 | Create extension.ts — activate, register sidebar, register commands | 1 |
| TK-116 | Create sidebar/provider.ts — WebviewViewProvider | 2 |
| TK-117 | Create sidebar/webview.ts — HTML generation for compact board | 1 |

---

#### US-041: As a Cursor/VS Code user, I want commands so that I can create tickets and trigger processing from the command palette.
**Points**: 3 · **Priority**: High

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-118 | Create commands/create-ticket.ts — input boxes for title, priority | 1 |
| TK-119 | Create commands/list-tickets.ts — quick pick showing all tickets | 1 |
| TK-120 | Create commands/process-ticket.ts — process selected ticket | 1 |

---

#### US-042: As a developer, I want an API client utility so that the extension can talk to the REST server.
**Points**: 2 · **Priority**: High

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-121 | Create utils/api-client.ts — fetch wrapper, .decidr/ file fallback | 2 |

---

### EP-11: Interactive Documentation

---

#### US-043: As a developer, I want interactive documentation so that I can understand the architecture, API, and schemas.
**Points**: 8 · **Priority**: Medium

**Acceptance Criteria**:
- Standalone Vite app with sidebar navigation
- Pages: Architecture, API Reference, MCP Tools, Schemas, Hooks, Agents, Reasoning, Editor Setup, Extending
- CodeBlock component with syntax highlighting + copy button
- API tester: input endpoint + body → fire request → see response
- Schema viewer: expandable JSON schema with type annotations
- Tree demo: live rendering of a sample decision tree

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-122 | Initialize docs/app Vite project | 1 |
| TK-123 | Create Sidebar.tsx — nav with sections + search | 1 |
| TK-124 | Create CodeBlock.tsx — syntax highlight + copy | 1 |
| TK-125 | Create SchemaViewer.tsx — expandable JSON schema | 2 |
| TK-126 | Create ApiTester.tsx — in-browser endpoint tester | 2 |
| TK-127 | Create TreeDemo.tsx — live decision tree with sample data | 1 |

---

#### US-044: As a developer, I want doc content pages covering every feature.
**Points**: 5 · **Priority**: Medium

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-128 | Write Architecture page — structure diagram, data flow, package relationships | 1 |
| TK-129 | Write API Reference page — every endpoint with examples | 1 |
| TK-130 | Write MCP Tools page — every tool with schema and editor config snippets | 1 |
| TK-131 | Write Schemas, Hooks, Agents, Reasoning pages | 1 |
| TK-132 | Write Editor Setup page — Cursor, Claude Code, Windsurf, VS Code, CLI | 0.5 |
| TK-133 | Write Extending page — Claude API, WebSocket, Docker, CI/CD | 0.5 |

---

### EP-12: Editor Integration & ECC

---

#### US-045: As a developer, I want everything-claude-code integrated so that I get 13+ agents, 50+ skills, and hooks.
**Points**: 3 · **Priority**: Low

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-134 | Clone ECC repo as git submodule at ecc/ | 0.5 |
| TK-135 | Copy relevant agents to ~/.claude/agents/ | 0.5 |
| TK-136 | Copy relevant skills to ~/.claude/skills/ | 0.5 |
| TK-137 | Copy rules (common + language-specific) to ~/.claude/rules/ | 0.5 |
| TK-138 | Merge ECC hooks into .claude/settings.json | 0.5 |
| TK-139 | Run AgentShield security scan (npx ecc-agentshield scan) | 0.5 |

---

#### US-046: As a developer, I want agent definitions optimized for Decidr Code so that tickets route to the right specialist.
**Points**: 3 · **Priority**: Medium

**Tasks**:

| ID | Task | Points |
|----|------|--------|
| TK-140 | Create agents/bug-triager.md — root cause analysis, minimal fixes | 1 |
| TK-141 | Create agents/refactor-planner.md — architecture evaluation, migration planning | 1 |
| TK-142 | Create agents/code-reviewer.md — correctness, security, performance review | 0.5 |
| TK-143 | Create agents/perf-analyzer.md — profiling, optimization, benchmarking | 0.5 |

---

## Sprint Plan

| Sprint | Duration | Epics | Focus |
|--------|----------|-------|-------|
| Sprint 1 | 1 week | EP-01, EP-02 | Foundation + Core Engine + Database |
| Sprint 2 | 1 week | EP-03, EP-04, EP-05 | All integration layers (REST, MCP, File Bridge) |
| Sprint 3 | 1 week | EP-06, EP-07 (partial) | Frontend shell, board, ticket detail |
| Sprint 4 | 1 week | EP-07 (reasoning), EP-08 | Reasoning engine, create modal, panels |
| Sprint 5 | 1 week | EP-09, EP-10 | Tauri desktop + VS Code extension |
| Sprint 6 | 1 week | EP-11, EP-12 | Documentation + ECC integration |
| Sprint 7 | 1 week | EP-13 | Git Integration + Branch Strategy |
| Sprint 8 | 1 week | EP-14, EP-15 | Document Generation + Visual Flows |

---

## Summary

| Metric | Count |
|--------|-------|
| Initiative | 1 |
| Epics | 15 |
| User Stories | 64 |
| Tasks | 195 |
| Sub-tasks | 34+ |
| Total Story Points | ~228 |
| Estimated Duration | 8 sprints (8 weeks) |
