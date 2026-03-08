# Decidr Code — Build Progress

## Phase 0: Monorepo Scaffold ✅
- [x] Root package.json (npm workspaces)
- [x] tsconfig.base.json
- [x] docker-compose.yml
- [x] .env
- [x] .gitignore
- [x] Package scaffolds (core, server, mcp, file-bridge, web, sidecar, docs)
- [x] Hook scripts

## Phase 1: Core Engine + Database
- [ ] Types (ticket, reasoning, hook, config)
- [ ] DB Schema (7 tables, Drizzle)
- [ ] DB Connection + Migration
- [ ] Repositories (ticket, comment, changelog, reasoning, hook, session)
- [ ] Services (ticket, reasoning, stats)
- [ ] Hooks runner + events
- [ ] Utils + Constants + index

## Phase 2: REST Server
- [ ] HTTP utilities
- [ ] Ticket routes
- [ ] Comment routes
- [ ] Reasoning routes
- [ ] Stats + Hooks routes
- [ ] Process route (Claude proxy)
- [ ] Server entry

## Phase 3: MCP Server
- [ ] 7 tools
- [ ] 3 resources
- [ ] 2 prompts
- [ ] MCP entry

## Phase 4: File Bridge
- [ ] Watcher
- [ ] Writer
- [ ] Reader
- [ ] Bridge entry

## Phase 5: React Frontend
- [ ] Stores (ticket, ui, hook)
- [ ] API client
- [ ] Layout components
- [ ] Board components
- [ ] Ticket detail + tabs
- [ ] Reasoning components
- [ ] Create modal + panels
- [ ] Shared components
- [ ] App.tsx + main.tsx

## Phase 6: Tauri Desktop Shell
- [ ] Cargo.toml + tauri.conf.json
- [ ] main.rs (sidecar lifecycle)
- [ ] tray.rs
- [ ] capabilities

## Phase 7: VS Code Extension
- [ ] Manifest + extension.ts
- [ ] Sidebar panel
- [ ] Commands

## Phase 8: Docs
- [ ] Vite doc site scaffold
