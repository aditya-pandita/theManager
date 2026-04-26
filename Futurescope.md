# Future Scope

A running list of features that are *deliberately deferred* — captured here so we can pick them up later without having to re-discover the context. Add new entries to the top.

---

## File picker — GitHub repo support
**Why deferred:** the local-folder picker (reads from `project.folderPath`) ships now and covers the common case. Adding GitHub support requires a token, error handling for rate limits, and a UX for "log in with GitHub."
**Where it would slot in:**
- Extend `packages/core/src/services/project-files-service.ts` so when `folderPath` is missing but `gitRepoUrl` is set, fall back to the GitHub Trees API (`GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1`).
- Add `GITHUB_TOKEN` env var (or per-project token) and a token-caching layer; honor `If-None-Match` ETags so we don't burn rate limit on every keystroke.
- Frontend already accepts the `files` array from the result, so no UI changes — just remove the "Clone the repo locally…" hint when GitHub mode kicks in.

## Auto-populate referenced files from CSV import
**Why deferred:** today the CSV importer creates a user story per ticket but leaves `files: []`. If the CSV has a `Files` or `Affected Components` column, we could parse it.
**Where it would slot in:** `packages/server/src/routes/import.ts` — extend the loop that calls `userStoryRepo.upsert` to also pull `row['Files']` (comma- or semicolon-separated) into the `files` array.

## Story-driven agent context (richer than JSON)
**Why deferred:** agents currently get the user story as a JSON object inside their prompt. They can read it, but it's not formatted for prose-style consumption.
**Where it would slot in:** the existing `formatUserStory()` helper in `packages/core/src/utils/format-user-story.ts` already returns a markdown-friendly block. Splice that into each agent's system-prompt header (or as a leading message) so the model sees the story as a "spec" before the JSON payload.

## Per-project team membership
**Why deferred:** today `Team` is workspace-scoped (members belong to a workspace, not a project). The user has asked at least once for project-level teams.
**Where it would slot in:**
- New `project_members` table in `packages/core/src/db/schema.ts` (project_id, user_id, role).
- New repo + service + routes in `packages/core/repositories` and `packages/server/src/routes`.
- `TeamPanel` reads from the active project instead of the workspace.

## Hooks log: include non-ticket events when project is active
**Why deferred:** the project-scoping filter for hooks joins `payload->>'id'` to `tickets.projectId`. Events without a `ticketId` (e.g., `SessionStart`) are hidden when a project is active. Today this is intentional — but if we ever want session-level events to show in every project's hooks log, the join needs to allow `projectId IS NULL` events through.

## Architecture / Dataflow refresh on ticket changes
**Why deferred:** the FlowView fetches once on mount and on project change. It does NOT refetch when a ticket's tags or files change in another tab. A tiny improvement: invalidate the flows cache on ticket save.
**Where it would slot in:** `packages/web/src/components/flow/FlowView.tsx` — subscribe to `useTicketStore` and refetch when `tickets` mutates.

## Reasoning view: per-ticket mini-tree
**Why deferred:** today the Reasoning flow is a flat radial fan (one node per reasoned ticket). A richer version: render a tiny version of each ticket's reasoning tree inline, or open one in a side panel on click.

## Cosmetic: rename `bg` → `background` in ChatPanel's `AGENT_BADGE` map
**Why deferred:** the same `bg:`-as-style-key footgun that broke the Run Pipeline button also exists in `packages/web/src/components/chat/ChatPanel.tsx`, but the author worked around it with an explicit `background:` override after the spread. Cosmetic only — clean it up so the badge map looks like the others (and React stops emitting the "unknown attribute" warning).

## File listing depth/exclude config per project
**Why deferred:** `projectFilesService` hard-codes the source extensions and skip dirs (`node_modules`, `.git`, etc.). Long-term, a per-project `.decidrignore` or analogous config would let each project tune this.
