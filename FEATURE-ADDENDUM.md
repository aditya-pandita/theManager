# Decidr Code — Feature Addendum v4

> Additions: Git Integration, Document Generation, Visual Flow, Branch Strategy

---

## Feature 1: Git History on Tickets

### How It Works

Every ticket has a **Git tab** in the detail view showing:
- Linked branch(es) and their status (open / merged / stale)
- Commit history on those branches (hash, message, author, date, files changed)
- Inline diffs for each commit (expandable)
- Branch comparison (ahead/behind main)
- Merge status and conflicts

### Branch Naming Convention

```
Ticket branches:
  DC-001/fix-auth-middleware

Story sub-branches (branched FROM ticket branch):
  DC-001/US-005/add-unit-tests
  DC-001/US-006/refactor-service

Example git flow:
  main
  ├── DC-001/fix-auth-middleware              ← ticket-level branch
  │   ├── DC-001/US-005/add-unit-tests       ← story work
  │   └── DC-001/US-006/refactor-service     ← story work
  ├── DC-002/add-rate-limiter
  │   └── DC-002/US-010/sliding-window
  └── DC-003/refactor-user-service
```

### Auto-Detection Rules

| Signal | Action |
|--------|--------|
| New branch matching `DC-XXX/*` | Auto-link to ticket DC-XXX, show in Git tab |
| New branch matching `DC-XXX/US-YYY/*` | Auto-link to ticket + tag with story ID |
| Commit on a `DC-*` branch | Auto-append to ticket's git history |
| Commit message contains `DC-XXX` | Link to ticket even if on a different branch |
| Branch merged to main | Auto-move ticket to "review" (configurable) |
| Branch deleted after merge | Mark as "merged" in git tab |
| Branch stale (>7 days no commits) | Show warning badge on ticket card |

### How Detection Works (Polling + Hooks)

```
Option A: Git Hook (recommended for real-time)
─────────────────────────────────────────────
.git/hooks/post-commit:
  Parse branch name → extract DC-XXX
  POST to http://localhost:3117/api/git/commit
  with {branch, hash, message, author, files}

.git/hooks/post-checkout:
  If new branch matching DC-* pattern
  POST to http://localhost:3117/api/git/branch

.git/hooks/post-merge:
  POST to http://localhost:3117/api/git/merge


Option B: Polling (fallback, no git hooks needed)
─────────────────────────────────────────────────
Every 30 seconds, git-service runs:
  1. `git branch --list DC-*` → find linked branches
  2. For each branch: `git log main..{branch}` → new commits
  3. Compare with DB → insert new commits
  4. Check for merged branches → update status
```

### New Database Tables

```sql
-- git_branches: tracks branches linked to tickets
CREATE TABLE git_branches (
  id SERIAL PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  story_id TEXT,                          -- e.g. "US-005" (optional)
  branch_name TEXT NOT NULL UNIQUE,
  base_branch TEXT DEFAULT 'main',
  status TEXT DEFAULT 'open',             -- open, merged, stale, deleted
  ahead_count INTEGER DEFAULT 0,
  behind_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  merged_at TIMESTAMP,
  merged_by TEXT
);

-- git_commits: individual commits linked to tickets via branches
CREATE TABLE git_commits (
  id SERIAL PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  branch_id INTEGER REFERENCES git_branches(id),
  hash TEXT NOT NULL UNIQUE,
  abbrev_hash TEXT NOT NULL,
  message TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  files_added TEXT[],
  files_modified TEXT[],
  files_deleted TEXT[],
  insertions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  committed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_git_branches_ticket ON git_branches(ticket_id);
CREATE INDEX idx_git_commits_ticket ON git_commits(ticket_id);
CREATE INDEX idx_git_commits_branch ON git_commits(branch_id);
CREATE INDEX idx_git_commits_hash ON git_commits(hash);
```

### New Core Files

```
packages/core/src/
  repositories/
    git-branch-repo.ts       # CRUD for git_branches table
    git-commit-repo.ts        # CRUD for git_commits table
  services/
    git-service.ts            # Branch detection, commit syncing, merge handling
```

### New Frontend Components

```
packages/web/src/components/ticket/
  GitTab.tsx                  # Container: branch list + commit log
  BranchCard.tsx              # Single branch: name, status, ahead/behind
  CommitList.tsx              # List of commits with expandable diffs
  CommitEntry.tsx             # Single commit: hash, message, author, files
  MergeStatus.tsx             # Merge button / conflict indicator
```

### New MCP Tools

```
tools/
  link-branch.ts              # Manually link a branch to a ticket
  get-git-history.ts          # Get commit history for a ticket
  create-branch.ts            # Create a properly named branch for a ticket
```

### New REST Endpoints

```
POST   /api/git/commit         # Git hook reports a new commit
POST   /api/git/branch         # Git hook reports a new branch
POST   /api/git/merge          # Git hook reports a merge
GET    /api/tickets/:id/git    # Get all git data for a ticket
POST   /api/tickets/:id/branch # Create a branch for a ticket
```

### New Hook Scripts

```
hooks/
  git/
    post-commit.sh            # Parses branch, POSTs to API
    post-checkout.sh          # Detects new DC-* branches
    post-merge.sh             # Reports merge events
  install-git-hooks.sh        # Symlinks hooks into .git/hooks/
```

---

## Feature 2: Project Document Generation

### What It Generates

At the end of a project (or anytime), generate a comprehensive document containing:

1. **Executive Summary** — total tickets, completion rate, avg confidence, timeline
2. **Board Overview** — tickets by status with counts
3. **Ticket Details** (for each ticket):
   - Title, description, priority, tags, status
   - Decision tree (rendered as indented text or diagram)
   - Step-by-step reasoning logs
   - Code diffs (syntax highlighted)
   - Comment thread
   - Git history (commits, branches, merge status)
   - Full changelog/audit trail
4. **Statistics** — charts/tables: by priority, by tag, confidence distribution, time-to-done
5. **Architecture Flow** — component connection diagram (from Feature 3)
6. **Appendix** — agent definitions, hook event log, configuration

### Output Formats

| Format | Library | Use Case |
|--------|---------|----------|
| **PDF** | `puppeteer` or `@react-pdf/renderer` | Formal handoff document |
| **Markdown** | Built-in | Developer-friendly, git-committable |
| **HTML** | Built-in | Self-contained, shareable |
| **DOCX** | `docx` (npm) | Corporate/enterprise consumption |

### New Core Files

```
packages/core/src/services/
  doc-generator.ts            # Orchestrates: query all data → build document structure
  doc-templates/
    markdown.ts               # Render to .md
    html.ts                   # Render to self-contained .html

packages/server/src/routes/
  export.ts                   # GET /api/export?format=pdf|md|html|docx
```

### New Frontend

```
packages/web/src/components/
  export/
    ExportModal.tsx           # Choose format, scope (all/filtered/single ticket), download
    ExportPreview.tsx         # Preview before download
```

### New MCP Tools

```
tools/
  export-project.ts           # Generate project document via MCP
```

---

## Feature 3: Visual Component Flow

### What It Shows

An interactive diagram showing how components connect to each other:

1. **Architecture View** — packages and their relationships (core → server, core → mcp, web → server)
2. **Data Flow View** — how data moves: User Action → React Store → API → Service → Repository → PostgreSQL
3. **Ticket Lifecycle View** — visual state machine: Backlog → Todo → In Progress → Review → Done with hooks that fire at each transition
4. **Reasoning Flow View** — how a ticket gets processed: Ticket → Agent Router → Claude API → Reasoning Tree → Diff → Review

### Implementation

Use **React Flow** (or **D3.js**) for interactive node-graph visualization:

```
packages/web/src/components/
  flow/
    FlowView.tsx              # Container: tab switcher between flow types
    ArchitectureFlow.tsx      # Package dependency graph
    DataFlowDiagram.tsx       # Request lifecycle visualization
    TicketLifecycle.tsx       # State machine with hook annotations
    ReasoningPipeline.tsx     # Ticket → Processing → Output flow
    FlowNode.tsx              # Custom node component
    FlowEdge.tsx              # Custom edge with labels
```

Also available in the **docs site** as an interactive page.

### In Ticket Detail

A mini flow diagram in each ticket showing:
- Current position in the lifecycle
- Which hooks have fired
- Which agent processed it
- The data path from creation to current state

---

## Feature 4: Branch Strategy & Review Workflow

### The Full Workflow

```
1. CREATE TICKET
   └── Decidr Code creates ticket DC-042
       └── Auto-suggests: git checkout -b DC-042/fix-auth-bug

2. START WORK
   └── Developer creates branch: DC-042/fix-auth-bug
       └── Decidr Code detects new branch → links to DC-042
       └── Ticket auto-moves to "In Progress"

3. STORY-LEVEL WORK (optional)
   └── Developer branches off: DC-042/US-015/add-tests
       └── Decidr Code links sub-branch to DC-042 + tags US-015
   └── Developer branches off: DC-042/US-016/refactor
       └── Same auto-linking

4. COMMITS
   └── Every commit on DC-042/* branches appears in ticket's Git tab
   └── Commit messages can reference: "DC-042: fix token comparison"
   └── Files changed are tracked per commit

5. STORY BRANCH MERGE
   └── Developer merges DC-042/US-015/add-tests → DC-042/fix-auth-bug
       └── Sub-branch marked "merged" in Decidr Code
       └── Changelog entry added to ticket

6. REVIEW
   └── Ticket moved to "Review" (manually or auto on PR creation)
   └── Reviewer opens ticket in Decidr Code:
       - Sees all commits across all sub-branches
       - Sees the reasoning tree (WHY these changes)
       - Sees the diff (WHAT changed)
       - Sees the comment thread (DISCUSSION)
       - Can add review comments
   └── code-reviewer agent can auto-review the diff

7. MERGE TO MAIN
   └── Developer merges DC-042/fix-auth-bug → main
       └── Decidr Code detects merge → auto-moves to "Done"
       └── Generates final reasoning summary
       └── All branches marked "merged"

8. DOCUMENT
   └── At any point, export project document with full history
```

### Branch Commands (via MCP or CLI)

```bash
# MCP tool: create-branch
# Creates branch with correct naming, links to ticket, moves to In Progress
decidr-code create-branch --ticket DC-042 --name fix-auth-bug
# → creates: DC-042/fix-auth-bug

# MCP tool: create-story-branch  
# Creates sub-branch from ticket branch
decidr-code create-story-branch --ticket DC-042 --story US-015 --name add-tests
# → creates: DC-042/US-015/add-tests (branched from DC-042/fix-auth-bug)

# Install git hooks in current repo
decidr-code install-hooks
# → symlinks post-commit, post-checkout, post-merge into .git/hooks/
```

### Relevance Detection (answering "how does the tool know which changes matter?")

The tool determines relevance through a **hierarchy of signals**:

| Priority | Signal | Confidence | Example |
|----------|--------|------------|---------|
| 1 (highest) | Branch name starts with `DC-XXX/` | 100% | `DC-042/fix-auth-bug` |
| 2 | Commit message contains `DC-XXX` | 95% | `"DC-042: fix token comparison"` |
| 3 | Branch was created from a `DC-*` branch | 90% | `feature/tests` branched from `DC-042/fix-auth-bug` |
| 4 | Commit modifies files in ticket's diff | 70% | Ticket's diff touches `auth.ts`, commit modifies `auth.ts` |
| 5 (lowest) | Commit author matches ticket assignee | 50% | Same person, same timeframe |

Signals 1-3 are **automatic**. Signal 4-5 are **suggested** (shown as "possibly related" in the UI, user confirms).

### Configuration

```json
// .decidr/config.json
{
  "git": {
    "enabled": true,
    "repoPath": ".",                        // path to git repo
    "baseBranch": "main",                   // or "master", "develop"
    "branchPrefix": "DC-",                  // ticket ID prefix in branches
    "pollInterval": 30000,                  // ms between git polls (0 = hooks only)
    "autoMoveOnBranch": "in_progress",      // move ticket when branch created
    "autoMoveOnMerge": "done",              // move ticket when merged to base
    "autoMoveOnPR": "review",              // move ticket when PR opened
    "installHooks": true,                   // auto-install git hooks
    "staleThreshold": 7                     // days before marking branch stale
  },
  "export": {
    "defaultFormat": "pdf",
    "includeGitHistory": true,
    "includeReasoningTrees": true,
    "includeDiffs": true,
    "includeComments": true
  }
}
```

---

## New Epics (added to project)

### EP-13: Git Integration & Branch Strategy
**Sprint**: 7 · **Points**: 34

| ID | Story | Points |
|----|-------|--------|
| US-047 | As a developer, I want branches auto-linked to tickets by naming convention so that git history is visible on tickets | 8 |
| US-048 | As a developer, I want to see commit history on a ticket's Git tab so that I can track what changed | 5 |
| US-049 | As a developer, I want git hooks that report commits and merges to Decidr Code so that tracking is real-time | 5 |
| US-050 | As a developer, I want tickets to auto-move when branches are created or merged so that the board stays current | 3 |
| US-051 | As a developer, I want story-level sub-branches so that work within a ticket is organized | 3 |
| US-052 | As a developer, I want branch status indicators on ticket cards so that I can see git state at a glance | 2 |
| US-053 | As a developer, I want MCP tools for branch creation and git history so that editors can manage git workflow | 3 |
| US-054 | As a developer, I want a git hook installer so that setting up tracking is one command | 2 |
| US-055 | As a developer, I want relevance detection for unlinked commits so that nothing falls through cracks | 3 |

### EP-14: Document Generation
**Sprint**: 8 · **Points**: 18

| ID | Story | Points |
|----|-------|--------|
| US-056 | As a project lead, I want to export the entire project as a document so that I have a complete record | 8 |
| US-057 | As a developer, I want to choose export format (PDF, Markdown, HTML, DOCX) so that I can share in the right format | 3 |
| US-058 | As a developer, I want the export to include reasoning trees, diffs, comments, and git history so that the document is comprehensive | 5 |
| US-059 | As a developer, I want an export MCP tool so that I can generate documents from my editor | 2 |

### EP-15: Visual Flow Diagrams
**Sprint**: 8 · **Points**: 16

| ID | Story | Points |
|----|-------|--------|
| US-060 | As a developer, I want an architecture flow diagram so that I can see how packages connect | 5 |
| US-061 | As a developer, I want a ticket lifecycle visualization so that I can see the state machine with hooks | 3 |
| US-062 | As a developer, I want a data flow diagram so that I can trace requests from UI to database | 3 |
| US-063 | As a developer, I want a reasoning pipeline visualization so that I can see how tickets get processed | 3 |
| US-064 | As a developer, I want a mini flow in each ticket detail showing its journey so far | 2 |

---

## Updated Sprint Plan

| Sprint | Duration | Epics | Focus |
|--------|----------|-------|-------|
| Sprint 1 | 1 week | EP-01, EP-02 | Foundation + Core Engine + Database |
| Sprint 2 | 1 week | EP-03, EP-04, EP-05 | REST, MCP, File Bridge |
| Sprint 3 | 1 week | EP-06, EP-07 (partial) | Frontend shell, board, ticket detail |
| Sprint 4 | 1 week | EP-07 (reasoning), EP-08 | Reasoning engine, create modal, panels |
| Sprint 5 | 1 week | EP-09, EP-10 | Tauri desktop + VS Code extension |
| Sprint 6 | 1 week | EP-11, EP-12 | Documentation + ECC integration |
| **Sprint 7** | **1 week** | **EP-13** | **Git integration + branch strategy** |
| **Sprint 8** | **1 week** | **EP-14, EP-15** | **Document generation + visual flows** |

**Updated Total**: ~228 story points · 8 sprints · ~8 weeks
