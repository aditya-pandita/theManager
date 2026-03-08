# Changelog

## 2026-03-07
- [feat] `packages/core/src/db/schema.ts` — added `projects` table (id, name, description, color) and `user_stories` table (role, want, benefit, acceptanceCriteria, files[]); added `projectId` FK to `tickets`
- [feat] `packages/core/src/types/ticket.ts` — added `Project`, `UserStory`, `NewProject` interfaces; added `projectId` + `userStory` to `Ticket`; `NewTicket` now accepts `projectId`
- [feat] `packages/core/src/repositories/project-repo.ts` — new CRUD repo for projects
- [feat] `packages/core/src/repositories/user-story-repo.ts` — new upsert/find repo for user stories
- [feat] `packages/core/src/services/project-service.ts` — project service wrapping repo
- [fix] `packages/core/src/repositories/ticket-repo.ts` — include `project` + `userStory` in all query joins; support `projectId` filter
- [feat] `packages/server/src/routes/projects.ts` — REST CRUD for `/api/projects`
- [feat] `packages/server/src/routes/user-stories.ts` — GET + PUT `/api/tickets/:id/user-story`
- [feat] `packages/server/src/index.ts` — mount projects + user-story routes
- [feat] `packages/web/src/types/index.ts` — added `Project`, `UserStory` interfaces; added `projectId`/`project`/`userStory` to `Ticket`
- [feat] `packages/web/src/stores/project-store.ts` — Zustand store for projects (fetch, create, setActive)
- [feat] `packages/web/src/stores/ticket-store.ts` — `fetchTickets` now accepts optional `projectId` filter
- [feat] `packages/web/src/components/layout/ProjectSwitcher.tsx` — dropdown to switch / create projects
- [feat] `packages/web/src/components/layout/Header.tsx` — embedded ProjectSwitcher; fires `onProjectChange` callback
- [feat] `packages/web/src/components/ticket/UserStoryTab.tsx` — structured "As a / I want / So that" form with acceptance criteria + file references
- [feat] `packages/web/src/components/ticket/TabBar.tsx` — added "Story" tab as first tab
- [feat] `packages/web/src/components/ticket/TicketDetail.tsx` — shows UserStoryTab when Story tab active; default tab changed to 'story'
- [feat] `packages/web/src/components/shared/Icons.tsx` — added `User` icon for Story tab
- [feat] `packages/web/src/App.tsx` — wires project fetch on mount, passes `activeProjectId` to ticket fetches
- [feat] `packages/core/drizzle/migrations/0001_spotty_moon_knight.sql` — incremental migration adding new tables/columns
- [docs] `BUILD.md` — added Multi-Project Boards + User Story Details sections; updated schema table count to 9

<!-- Reverse-chronological. Format: [type] file(s) — what and why -->

## 2026-03-07 (session 4 - csv import)

- [feat] `packages/server/src/routes/import.ts` — new route: `POST /api/import/csv`; accepts `text/plain` body; parses CSV in-memory (no deps); maps Jira fields to Decidr ticket fields; returns `{ imported, skipped, total, errors }`
- [feat] `packages/server/src/index.ts` — mounted import route at `/api/import/csv` with `express.text()` middleware (10mb limit)
- [feat] `packages/web/src/api/client.ts` — added `api.importCSV(csvText)` method (sends `text/plain`)
- [feat] `packages/web/src/components/layout/Toolbar.tsx` — added "Import CSV" button with hidden file input, loading state, and inline result toast; `onImportDone` callback triggers board refresh
- [fix] `packages/web/src/App.tsx` — wired `onImportDone={fetchTickets}` to Toolbar so board refreshes after import

## 2026-03-07 (session 3 - desktop)

- [feat] `src-tauri/src/lib.rs` — created Tauri v2 lib entry point (required alongside main.rs for the [lib] crate target)
- [fix] `src-tauri/src/main.rs` — simplified to just call `decidr_code_lib::run()`
- [fix] `src-tauri/src/lib.rs` — wrapped `ShellExt` import in `#[cfg(not(debug_assertions))]` to suppress unused import warning
- [fix] `src-tauri/tauri.conf.json` — set `externalBin: []` for dev mode; sidecar binary doesn't exist yet, build script validates presence
- [fix] `src-tauri/src/lib.rs` — changed sidecar spawn to `#[cfg(not(debug_assertions))]`; dev mode uses manually-run server
- [feat] `src-tauri/icons/` — generated all platform icons (32x32, 128x128, .ico, .icns, Android, iOS) from app-icon.svg via `tauri icon`
- [feat] `app-icon.svg` — created placeholder kanban-themed SVG icon (indigo/purple palette)
- [chore] root `package.json` — added `dev:tauri` script; added `@tauri-apps/cli@2` as devDependency

## 2026-03-07 (session 2)

- [fix] `docker-compose.yml` — changed port mapping 5432→5434 to avoid conflict with local PostgreSQL 15/18 services
- [fix] `.env`, all hardcoded fallback URLs — updated port from 5432 to 5434 (`packages/core/src/db/migrate.ts`, `connection.ts`, `types/config.ts`, `drizzle.config.ts`)
- [fix] `docker-compose.yml` — added `POSTGRES_HOST_AUTH_METHOD: trust` for dev convenience
- [fix] `packages/core/src/db/schema.ts` — changed `default([])` to `default(sql\`ARRAY[]::text[]\`)` for `tags` column; empty array wasn't serializing to valid SQL
- [fix] `packages/core/drizzle/migrations/` — deleted stale migration, regenerated with corrected SQL
- [fix] `packages/core/drizzle.config.ts`, `src/db/migrate.ts`, `src/db/connection.ts` — replaced `import 'dotenv/config'` with explicit `dotenv.config({ path: ... })` pointing at repo root `.env`
- [fix] `packages/core/package.json` — upgraded `drizzle-kit` to 0.22.8 and `drizzle-orm` to 0.31.4 (compatibilityVersion mismatch); also installed `drizzle-orm` at workspace root so drizzle-kit can resolve it

## 2026-03-07

[feat] packages/core/src/db/schema.ts — 7-table Drizzle schema (tickets, diffs, reasoning, comments, changelog, hook_events, sessions) with relations
[feat] packages/core/src/** — types, repos, services, hooks runner, utils, constants; full core barrel export
[feat] packages/server/src/** — Express REST API on :3117 with CORS; routes for tickets/comments/reasoning/stats/hooks/process
[feat] packages/mcp/src/** — 7 MCP tools, 3 resources, 2 prompts via StdioServerTransport; McpServer 1.27.1
[feat] packages/file-bridge/src/** — .decidr/inbox/ watcher + board state writer
[feat] packages/web/src/** — 35+ React components; Zustand stores; Vite+Tailwind; API client with proxy
[feat] src-tauri/src/** — Rust shell with sidecar lifecycle management, system tray, window hide until ready
[feat] packages/vscode-ext/src/** — Sidebar webview, 3 commands (create/list/process), API client
[feat] docs/app/src/** — Interactive Vite doc site scaffold with navigation
[feat] .cursor/mcp.json — MCP server config for Cursor integration
[feat] .cursorrules — Full MCP usage guide for Cursor agents
[feat] agents/*.md — 4 agent definitions (bug-triager, refactor-planner, code-reviewer, perf-analyzer)
[chore] package.json — Root npm workspaces monorepo (packages/*, sidecar, docs/app)
[chore] tsconfig.base.json — Shared CommonJS TypeScript config
[chore] docker-compose.yml — PostgreSQL 16 with named volume
[chore] packages/core/package.json — Changed main to ./src/index.ts for tsx dev compatibility
[fix] packages/server/src/routes/comments.ts — Added Request<{id:string}> type for mergeParams routes
[fix] packages/mcp/src/** — Removed .js extension from @modelcontextprotocol/sdk imports for moduleResolution:Node
