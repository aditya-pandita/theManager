# Decidr Code — Phase 2 Build Guide
## Multi-Agent Development · TDD Testing · Ticket Interaction & Activity History
### EP-16 · EP-17 · EP-18 · 65 Stories · 260 Points

> Last updated: 2026-04-25
> Verified against actual codebase — all patterns, imports, and conventions match existing code exactly.

---

## CODEBASE AUDIT FINDINGS

These corrections were made after reading the actual source files:

| # | Issue Found | Fix Applied |
|---|-------------|-------------|
| 1 | Spec said Anthropic Claude for all agents | **FIXED** — All Phase 2 agents use `@google/generative-ai` with `gemini-2.0-flash` |
| 2 | `process.ts` already uses `@google/generative-ai` with `gemini-2.5-flash` and `GEMINI_KEY` env var | **NOTED** — Phase 2 reads `process.env.GEMINI_KEY ?? process.env.GEMINI_API_KEY` |
| 3 | `@google/generative-ai` is already in `packages/server/package.json` at `^0.24.1` | **NOTED** — must also add to `packages/core/package.json` since agents live there |
| 4 | `@anthropic-ai/sdk` is in server deps but process.ts uses Gemini not Anthropic | **NOTED** — leave it, unused, harmless |
| 5 | Repos use plain object exports (`export const ticketRepo = { ... }`) not classes | **FIXED** — all new repos use the same plain object export pattern |
| 6 | Services use plain object exports (`export const ticketService = { ... }`) not classes | **FIXED** — all new services use same pattern |
| 7 | Routes import from `@decidr-code/core` (not relative paths) | **FIXED** — all new routes import from `@decidr-code/core` |
| 8 | Routes use `sendJSON` and `sendError` from `../utils/http` | **FIXED** — all new routes use same pattern |
| 9 | `db` is imported from `../db/connection` (not `drizzle`) | **FIXED** throughout |
| 10 | All repos use `as unknown as Type` cast pattern on Drizzle results | **FIXED** — all new repos use this pattern |
| 11 | `now()` from `../utils/timestamp` used for updatedAt | **FIXED** — new repos use `now()` |
| 12 | Drizzle queries use `.returning()` after insert/update | **FIXED** throughout |
| 13 | Schema uses `boolean` from `drizzle-orm/pg-core` — NOT currently imported | **NOTED** — must add `boolean` to schema.ts imports |
| 14 | `generateId()` from `../utils/id` generates `DC-XXXXXX` hex format | **NOTED** — agent runs use serial PK, not `generateId()` |
| 15 | dotenv loaded in `connection.ts` via absolute path | **FIXED** — base-agent re-reads .env on each call, same as process.ts |

---

## 1. What Phase 2 Is

Phase 2 transforms Decidr Code from a **kanban + AI reasoning tool** into a **full autonomous software development platform**.

**What already exists (fully working):**
- Kanban board, 5 columns, ticket CRUD, projects, filtering
- AI reasoning trees — existing `/api/process` route uses `gemini-2.5-flash` via `@google/generative-ai`
- Git integration (branch auto-linking, commit tracking, git hooks)
- MCP server (11 tools, 3 resources, 2 prompts)
- File bridge (.decidr/ inbox/outbox)
- Document export (Markdown, HTML)
- VS Code/Cursor extension
- Stats dashboard, hook system, flow diagrams

**What Phase 2 adds:**

| Epic | Stories | Points | What It Does |
|------|---------|--------|-------------|
| EP-16: Multi-Agent Software Development | 16 | 70 | 7 specialized AI agents + orchestrator (all using `gemini-2.0-flash`) |
| EP-17: TDD Testing Layer | 17 | 64 | Full test framework integration with Red→Green→Refactor, coverage, flaky detection |
| EP-18: Ticket Interaction, Prompting & Activity History | 32 | 126 | In-ticket chat, @agent routing, slash commands, pipeline controls, unified activity log |

**AI provider for Phase 2:** Google Gemini (`gemini-2.0-flash`) via `@google/generative-ai` SDK — same SDK already used by the existing process route. The existing Process button uses `gemini-2.5-flash` and is unchanged.

---

## 2. New Packages and Directories

All new business logic goes in `packages/core`. Server and MCP are thin wrappers. Nothing existing is deleted.

```
decidr-code/
├── packages/
│   ├── core/
│   │   └── src/
│   │       ├── agents/                    ← NEW
│   │       │   ├── base-agent.ts          # Abstract base class using @google/generative-ai
│   │       │   ├── registry.ts            # Plain object registry — get(name), listAll()
│   │       │   ├── orchestrator.ts        # Routes tickets through agent chains
│   │       │   ├── context-store.ts       # Per-ticket shared scratchpad (agent_context table)
│   │       │   ├── failure-handler.ts     # Retry loop with backoff
│   │       │   ├── planner-agent.ts
│   │       │   ├── architect-agent.ts
│   │       │   ├── coder-agent.ts
│   │       │   ├── reviewer-agent.ts
│   │       │   ├── tester-agent.ts
│   │       │   ├── debugger-agent.ts
│   │       │   └── docs-agent.ts
│   │       │
│   │       ├── testing/                   ← NEW
│   │       │   ├── framework-adapter.ts
│   │       │   ├── test-runner.ts
│   │       │   ├── coverage-service.ts
│   │       │   ├── tdd-cycle.ts
│   │       │   ├── mutation-tester.ts
│   │       │   ├── flaky-detector.ts
│   │       │   └── snapshot-manager.ts
│   │       │
│   │       ├── prompting/                 ← NEW
│   │       │   ├── prompt-router.ts
│   │       │   ├── context-assembler.ts
│   │       │   ├── slash-commands.ts
│   │       │   ├── action-executor.ts
│   │       │   └── templates.ts
│   │       │
│   │       ├── activity/                  ← NEW
│   │       │   ├── activity-service.ts
│   │       │   └── token-tracker.ts
│   │       │
│   │       ├── db/
│   │       │   └── schema.ts              # EXTENDED: boolean import added + 7 new tables
│   │       │
│   │       ├── repositories/
│   │       │   ├── agent-run-repo.ts      ← NEW (plain object export pattern)
│   │       │   ├── agent-context-repo.ts  ← NEW
│   │       │   ├── test-result-repo.ts    ← NEW
│   │       │   ├── test-file-repo.ts      ← NEW
│   │       │   ├── activity-repo.ts       ← NEW
│   │       │   ├── chat-message-repo.ts   ← NEW
│   │       │   └── checkpoint-repo.ts     ← NEW
│   │       │
│   │       ├── services/
│   │       │   ├── pipeline-service.ts    ← NEW (plain object export pattern)
│   │       │   ├── test-service.ts        ← NEW
│   │       │   ├── chat-service.ts        ← NEW
│   │       │   └── activity-service.ts    ← NEW
│   │       │
│   │       └── types/
│   │           ├── agent.ts               ← NEW
│   │           ├── testing.ts             ← NEW
│   │           └── activity.ts            ← NEW
│   │
│   ├── server/
│   │   └── src/routes/
│   │       ├── agents.ts                  ← NEW
│   │       ├── pipeline.ts                ← NEW
│   │       ├── tests.ts                   ← NEW
│   │       ├── chat.ts                    ← NEW
│   │       └── activity.ts                ← NEW
│   │
│   ├── mcp/
│   │   └── src/tools/
│   │       ├── agent-tools.ts             ← NEW
│   │       └── tdd-tools.ts               ← NEW
│   │
│   └── web/
│       └── src/
│           ├── components/
│           │   ├── agents/                ← NEW
│           │   ├── testing/               ← NEW
│           │   ├── chat/                  ← NEW
│           │   ├── activity/              ← NEW
│           │   └── controls/              ← NEW
│           └── stores/
│               ├── agent-store.ts         ← NEW
│               ├── pipeline-store.ts      ← NEW
│               └── activity-store.ts      ← NEW
│
└── agents/                                # EXTENDED
    ├── planner.md    ← NEW
    ├── architect.md  ← NEW
    ├── coder.md      ← NEW
    ├── tester.md     ← NEW
    ├── debugger.md   ← NEW
    ├── docs.md       ← NEW
    └── reviewer.md   # EXISTS — enhanced
```

---

## 3. Request Flows

**Agent pipeline flow:**
```
User clicks "Run Pipeline"
  ↓ POST /api/pipeline/run/:ticketId
Express route (packages/server/src/routes/pipeline.ts)
  ↓ imports pipelineService from @decidr-code/core
Pipeline service
  ↓ detects ticket type from tags (bug/feature/refactor/docs/test)
  ↓ calls orchestrator.runPipeline(ticket, ticketType)
Orchestrator
  ↓ checks ticket.isPaused, ticket.isLocked flags
  ↓ calls registry.get(agentName).run(input)
Agent (extends BaseAgent)
  ↓ calls Google Gemini API (gemini-2.0-flash)
  ↓ writes output to context store (agent_context table)
  ↓ logs to agentRunRepo (agent_runs table)
  ↓ calls activityService.log(...)
  ↓ writes SSE event via res.write() on /api/pipeline/events/:ticketId
Orchestrator → next agent in chain
  ↓ repeat until chain complete or checkpoint/pause hit
```

**In-ticket chat flow:**
```
User types in chat input
  ↓ POST /api/tickets/:id/chat
Express route (packages/server/src/routes/chat.ts)
  ↓ imports chatService from @decidr-code/core
Chat service
  ↓ contextAssembler.assemble(ticketId) — loads all ticket data
  ↓ promptRouter.route(content) — classifies intent → picks agent
  ↓ registry.get(agentName).run(input)
Agent (Gemini API)
  ↓ if slash command → actionExecutor.run(action, ticketId)
  ↓ chatMessageRepo.create(ticketId, 'user', content)
  ↓ chatMessageRepo.create(ticketId, 'agent', response)
  ↓ activityService.log(...)
  ↓ sendJSON(res, { role: 'agent', agentName, content: response })
```

**Test execution flow:**
```
POST /api/tests/:ticketId/run
  ↓ testService.run(ticketId)
  ↓ frameworkAdapter.detect(projectPath) → picks jest/vitest/pytest/go_test
  ↓ testRunner.execute(command) — spawns child_process
  ↓ frameworkAdapter.parseResults(stdout, stderr)
  ↓ coverageService.parse(reportPath) — reads lcov/istanbul
  ↓ testResultRepo.create(ticketId, results)
  ↓ if failures → ticketService.createTicket({ title: 'Bug: ...', priority: 'high' })
  ↓ activityService.log({ actionType: 'tests_run', ... })
  ↓ sendJSON(res, results)
```

---

## 4. Environment Variables

```bash
# EXISTING — unchanged:
DATABASE_URL=postgresql://decidr_code:decidr_code_dev@localhost:5434/decidr_code
PORT=3117

# EXISTING — used by /api/process route (gemini-2.5-flash reasoning):
GEMINI_KEY=your-gemini-key-here

# NEW alias (Phase 2 reads: process.env.GEMINI_KEY ?? process.env.GEMINI_API_KEY):
# Either one works — if GEMINI_KEY is already set, no change needed
GEMINI_API_KEY=your-gemini-key-here

# EXISTING — still in .env but unused now that process.ts uses Gemini:
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 5. Package Changes

### `packages/core/package.json` — add one dependency

```json
"dependencies": {
  "@google/generative-ai": "^0.24.1",   ← ADD THIS
  "dotenv": "^16.4.5",
  "drizzle-orm": "^0.31.4",
  "postgres": "^3.4.4"
}
```

Install: `npm install --workspace=packages/core @google/generative-ai`

### `packages/server/package.json` — no changes needed

`@google/generative-ai` is already there at `^0.24.1`.

---

## 6. Database Schema Additions

All additions go in `packages/core/src/db/schema.ts`. Existing 11 tables are untouched except 5 new columns on `tickets`.

### 6.1 Import Change — Add `boolean`

```typescript
// Change existing import from:
import {
  pgTable, text, serial, timestamp, real, integer, jsonb, index,
} from 'drizzle-orm/pg-core';

// To:
import {
  pgTable, text, serial, timestamp, real, integer, jsonb, index, boolean,
} from 'drizzle-orm/pg-core';
```

### 6.2 New Columns on Existing `tickets` Table

Add inside the existing `pgTable('tickets', { ... })` definition:

```typescript
pipelineState:  text('pipeline_state').notNull().default('idle'),
  // 'idle' | 'running' | 'paused' | 'blocked' | 'completed' | 'awaiting_approval'
currentAgent:   text('current_agent'),
  // null | 'planner' | 'architect' | 'coder' | 'tester' | 'reviewer' | 'debugger' | 'docs'
isPaused:       boolean('is_paused').notNull().default(false),
isLocked:       boolean('is_locked').notNull().default(false),
pipelineConfig: jsonb('pipeline_config'),
  // { checkpointsEnabled: { afterPlanner: bool, ... }, skippedAgents: string[] }
```

### 6.3 New Tables (append to schema.ts after existing tables)

```typescript
// ─── AGENT RUNS ─────────────────────────────────────────────

export const agentRuns = pgTable(
  'agent_runs',
  {
    id:           serial('id').primaryKey(),
    ticketId:     text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    projectId:    text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    agent:        text('agent').notNull(),
    status:       text('status').notNull().default('running'),
    input:        jsonb('input'),
    output:       jsonb('output'),
    reasoning:    jsonb('reasoning'),
    errorMessage: text('error_message'),
    retryCount:   integer('retry_count').notNull().default(0),
    model:        text('model').notNull().default('gemini-2.0-flash'),
    tokensInput:  integer('tokens_input'),
    tokensOutput: integer('tokens_output'),
    costUsd:      real('cost_usd'),
    durationMs:   integer('duration_ms'),
    startedAt:    timestamp('started_at').notNull().defaultNow(),
    completedAt:  timestamp('completed_at'),
  },
  (t) => ({
    ticketIdx: index('idx_agent_runs_ticket').on(t.ticketId),
    agentIdx:  index('idx_agent_runs_agent').on(t.agent),
    statusIdx: index('idx_agent_runs_status').on(t.status),
  })
);

// ─── AGENT CONTEXT STORE ────────────────────────────────────

export const agentContext = pgTable(
  'agent_context',
  {
    id:        serial('id').primaryKey(),
    ticketId:  text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    key:       text('key').notNull(),
      // 'plan'|'design'|'code_files'|'test_results'|'review'|'decisions'|'bug_analysis'|'doc_updates'
    value:     jsonb('value').notNull(),
    agent:     text('agent').notNull(),
    version:   integer('version').notNull().default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    ticketKeyIdx: index('idx_agent_context_ticket_key').on(t.ticketId, t.key),
  })
);

// ─── TEST RESULTS ────────────────────────────────────────────

export const testResults = pgTable(
  'test_results',
  {
    id:              serial('id').primaryKey(),
    ticketId:        text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    framework:       text('framework').notNull(),
      // 'jest' | 'vitest' | 'pytest' | 'go_test'
    totalTests:      integer('total_tests').notNull(),
    passed:          integer('passed').notNull(),
    failed:          integer('failed').notNull(),
    skipped:         integer('skipped').notNull().default(0),
    durationMs:      integer('duration_ms'),
    coveragePercent: real('coverage_percent'),
    coverageDelta:   real('coverage_delta'),
    failures:        jsonb('failures'),
    coverageDetail:  jsonb('coverage_detail'),
    stdout:          text('stdout'),
    stderr:          text('stderr'),
    isFlaky:         boolean('is_flaky').notNull().default(false),
    flakyCount:      integer('flaky_count').notNull().default(0),
    runNumber:       integer('run_number').notNull().default(1),
    triggeredBy:     text('triggered_by'),
      // 'agent' | 'user' | 'hook'
    agentRunId:      integer('agent_run_id').references(() => agentRuns.id, { onDelete: 'set null' }),
    createdAt:       timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx:  index('idx_test_results_ticket').on(t.ticketId),
    createdIdx: index('idx_test_results_created').on(t.createdAt),
  })
);

// ─── TEST FILES ──────────────────────────────────────────────

export const testFiles = pgTable(
  'test_files',
  {
    id:        serial('id').primaryKey(),
    ticketId:  text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    filePath:  text('file_path').notNull(),
    content:   text('content').notNull(),
    framework: text('framework').notNull(),
    agent:     text('agent').notNull().default('tester'),
    version:   integer('version').notNull().default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx: index('idx_test_files_ticket').on(t.ticketId),
  })
);

// ─── ACTIVITIES ──────────────────────────────────────────────

export const activities = pgTable(
  'activities',
  {
    id:             serial('id').primaryKey(),
    ticketId:       text('ticket_id').references(() => tickets.id, { onDelete: 'cascade' }),
    projectId:      text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    actorType:      text('actor_type').notNull(),
      // 'user' | 'agent' | 'system' | 'hook' | 'mcp'
    actorName:      text('actor_name'),
    actionType:     text('action_type').notNull(),
    payload:        jsonb('payload'),
    beforeSnapshot: jsonb('before_snapshot'),
    afterSnapshot:  jsonb('after_snapshot'),
    tokensUsed:     integer('tokens_used'),
    costUsd:        real('cost_usd'),
    isImmutable:    boolean('is_immutable').notNull().default(false),
    createdAt:      timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx:  index('idx_activities_ticket').on(t.ticketId),
    projectIdx: index('idx_activities_project').on(t.projectId),
    actionIdx:  index('idx_activities_action').on(t.actionType),
    createdIdx: index('idx_activities_created').on(t.createdAt),
    actorIdx:   index('idx_activities_actor').on(t.actorType, t.actorName),
  })
);

// ─── CHAT MESSAGES ───────────────────────────────────────────

export const chatMessages = pgTable(
  'chat_messages',
  {
    id:               serial('id').primaryKey(),
    ticketId:         text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    threadId:         text('thread_id'),
    role:             text('role').notNull(),
      // 'user' | 'agent'
    agentName:        text('agent_name'),
    content:          text('content').notNull(),
    contextAssembled: jsonb('context_assembled'),
    actionsTaken:     jsonb('actions_taken'),
    tokensUsed:       integer('tokens_used'),
    costUsd:          real('cost_usd'),
    createdAt:        timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx: index('idx_chat_messages_ticket').on(t.ticketId),
    threadIdx: index('idx_chat_messages_thread').on(t.threadId),
  })
);

// ─── PIPELINE CHECKPOINTS ────────────────────────────────────

export const pipelineCheckpoints = pgTable(
  'pipeline_checkpoints',
  {
    id:         serial('id').primaryKey(),
    ticketId:   text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    agent:      text('agent').notNull(),
    status:     text('status').notNull().default('pending'),
      // 'pending' | 'approved' | 'rejected'
    output:     jsonb('output'),
    feedback:   text('feedback'),
    createdAt:  timestamp('created_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
  },
  (t) => ({
    ticketIdx: index('idx_checkpoints_ticket').on(t.ticketId),
    statusIdx: index('idx_checkpoints_status').on(t.status),
  })
);
```

### 6.4 New Relations (append after existing relations in schema.ts)

```typescript
export const agentRunsRelations = relations(agentRuns, ({ one }) => ({
  ticket:  one(tickets,  { fields: [agentRuns.ticketId],  references: [tickets.id] }),
  project: one(projects, { fields: [agentRuns.projectId], references: [projects.id] }),
}));

export const agentContextRelations = relations(agentContext, ({ one }) => ({
  ticket: one(tickets, { fields: [agentContext.ticketId], references: [tickets.id] }),
}));

export const testResultsRelations = relations(testResults, ({ one }) => ({
  ticket:   one(tickets,   { fields: [testResults.ticketId],   references: [tickets.id] }),
  agentRun: one(agentRuns, { fields: [testResults.agentRunId], references: [agentRuns.id] }),
}));

export const testFilesRelations = relations(testFiles, ({ one }) => ({
  ticket: one(tickets, { fields: [testFiles.ticketId], references: [tickets.id] }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  ticket:  one(tickets,  { fields: [activities.ticketId],  references: [tickets.id] }),
  project: one(projects, { fields: [activities.projectId], references: [projects.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  ticket: one(tickets, { fields: [chatMessages.ticketId], references: [tickets.id] }),
}));

export const pipelineCheckpointsRelations = relations(pipelineCheckpoints, ({ one }) => ({
  ticket: one(tickets, { fields: [pipelineCheckpoints.ticketId], references: [tickets.id] }),
}));

// EXTEND existing ticketsRelations — add to the many() block:
// agentRuns:           many(agentRuns),
// testResults:         many(testResults),
// testFiles:           many(testFiles),
// activities:          many(activities),
// chatMessages:        many(chatMessages),
// agentContextEntries: many(agentContext),
// checkpoints:         many(pipelineCheckpoints),
```

---

## 7. EP-16: Multi-Agent Software Development

### 7.1 The 7 Agents

| Agent | Model | Purpose | maxTokens |
|-------|-------|---------|-----------|
| Planner | gemini-2.0-flash | Decomposes tickets into ordered tasks with acceptance criteria | 4096 |
| Architect | gemini-2.0-flash | Proposes file structure, patterns, affected components | 4096 |
| Coder | gemini-2.0-flash | Implements tasks, emits file diffs | 8192 |
| Reviewer | gemini-2.0-flash | Reviews code for correctness, style, security | 4096 |
| Tester | gemini-2.0-flash | Generates tests, runs them, reports coverage delta | 4096 |
| Debugger | gemini-2.0-flash | Root cause analysis, fix diff, re-runs tester | 4096 |
| Docs | gemini-2.0-flash | Updates README/JSDoc/changelog from merged diffs | 2048 |

### 7.2 Pipeline Routes by Ticket Type

```
feature:  planner → architect → coder → tester → reviewer → docs
bug:      debugger → tester → reviewer
refactor: architect → coder → tester → reviewer
docs:     docs → reviewer
test:     tester
```

### 7.3 `base-agent.ts` — Exact Implementation Pattern

Matches the Gemini usage already in `packages/server/src/routes/process.ts`:

```typescript
// packages/core/src/agents/base-agent.ts
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected systemPrompt: string;

  constructor(config: AgentConfig) {
    this.config = config;
    this.systemPrompt = fs.readFileSync(
      path.join(process.cwd(), 'agents', config.systemPromptPath),
      'utf-8'
    );
  }

  get name(): string { return this.config.name; }

  abstract buildPrompt(input: AgentInput): string;
  abstract parseResponse(raw: string, ticketId: string): AgentOutput;

  async run(input: AgentInput): Promise<AgentOutput> {
    // Re-read .env on each call — same pattern as process.ts
    dotenv.config({
      path: path.resolve(__dirname, '../../../../.env'),
      override: true,
    });

    const apiKey = process.env.GEMINI_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_KEY not set');

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: this.config.model,       // 'gemini-2.0-flash'
      systemInstruction: this.systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: this.config.maxTokens,
      },
    });

    const startTime = Date.now();
    const userPrompt = this.buildPrompt(input);
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const rawText = response.text();
    const usage = response.usageMetadata;

    const output = this.parseResponse(rawText, input.ticket.id);
    output.tokensInput  = usage?.promptTokenCount    ?? 0;
    output.tokensOutput = usage?.candidatesTokenCount ?? 0;
    output.durationMs   = Date.now() - startTime;
    return output;
  }
}
```

### 7.4 `agent-run-repo.ts` — Exact Pattern (matches existing repos)

```typescript
// packages/core/src/repositories/agent-run-repo.ts
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { agentRuns } from '../db/schema';
import { now } from '../utils/timestamp';
import type { AgentRun, NewAgentRun } from '../types/agent';

export const agentRunRepo = {
  async create(input: NewAgentRun): Promise<AgentRun> {
    const [row] = await db
      .insert(agentRuns)
      .values(input)
      .returning();
    return row as unknown as AgentRun;
  },

  async complete(
    id: number,
    output: object,
    tokensInput: number,
    tokensOutput: number,
    durationMs: number
  ): Promise<AgentRun> {
    const [row] = await db
      .update(agentRuns)
      .set({ status: 'completed', output, tokensInput, tokensOutput, durationMs, completedAt: now() })
      .where(eq(agentRuns.id, id))
      .returning();
    return row as unknown as AgentRun;
  },

  async fail(id: number, errorMessage: string, retryCount: number): Promise<AgentRun> {
    const [row] = await db
      .update(agentRuns)
      .set({ status: 'failed', errorMessage, retryCount, completedAt: now() })
      .where(eq(agentRuns.id, id))
      .returning();
    return row as unknown as AgentRun;
  },

  async findByTicket(ticketId: string): Promise<AgentRun[]> {
    const rows = await db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.ticketId, ticketId))
      .orderBy(desc(agentRuns.startedAt));
    return rows as unknown as AgentRun[];
  },

  async findById(id: number): Promise<AgentRun | null> {
    const [row] = await db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.id, id))
      .limit(1);
    return (row as unknown as AgentRun) ?? null;
  },
};
```

### 7.5 `activity-repo.ts` — Exact Pattern

```typescript
// packages/core/src/repositories/activity-repo.ts
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { activities } from '../db/schema';
import type { Activity, NewActivity } from '../types/activity';

export const activityRepo = {
  async create(input: NewActivity): Promise<Activity> {
    const [row] = await db
      .insert(activities)
      .values(input)
      .returning();
    return row as unknown as Activity;
  },

  async findByTicket(ticketId: string): Promise<Activity[]> {
    const rows = await db
      .select()
      .from(activities)
      .where(eq(activities.ticketId, ticketId))
      .orderBy(desc(activities.createdAt));
    return rows as unknown as Activity[];
  },

  async findByProject(projectId: string): Promise<Activity[]> {
    const rows = await db
      .select()
      .from(activities)
      .where(eq(activities.projectId, projectId))
      .orderBy(desc(activities.createdAt));
    return rows as unknown as Activity[];
  },

  async findById(id: number): Promise<Activity | null> {
    const [row] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .limit(1);
    return (row as unknown as Activity) ?? null;
  },
};
```

### 7.6 `activity-service.ts` — Exact Pattern (matches existing services)

```typescript
// packages/core/src/activity/activity-service.ts
import { activityRepo } from '../repositories/activity-repo';
import type { Activity, NewActivity } from '../types/activity';

export const activityService = {
  async log(entry: NewActivity): Promise<Activity> {
    return activityRepo.create(entry);
  },

  async getForTicket(ticketId: string): Promise<Activity[]> {
    return activityRepo.findByTicket(ticketId);
  },

  async getForProject(projectId: string): Promise<Activity[]> {
    return activityRepo.findByProject(projectId);
  },

  async revert(activityId: number): Promise<void> {
    const activity = await activityRepo.findById(activityId);
    if (!activity || activity.isImmutable) {
      throw new Error('Activity cannot be reverted');
    }
    await activityRepo.create({
      ticketId: activity.ticketId ?? undefined,
      projectId: activity.projectId ?? undefined,
      actorType: 'user',
      actionType: 'reverted',
      payload: { revertedActivityId: activityId },
      afterSnapshot: activity.beforeSnapshot,
    });
  },
};
```

### 7.7 Route Pattern — `pipeline.ts` (matches existing routes exactly)

```typescript
// packages/server/src/routes/pipeline.ts
import { Router } from 'express';
import { pipelineService } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';

const router = Router();

router.post('/run/:ticketId', async (req, res) => {
  try {
    const { ticketType } = req.body as { ticketType?: string };
    await pipelineService.run(req.params.ticketId, ticketType);
    sendJSON(res, { started: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/pause/:ticketId', async (req, res) => {
  try {
    await pipelineService.pause(req.params.ticketId);
    sendJSON(res, { paused: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.post('/resume/:ticketId', async (req, res) => {
  try {
    await pipelineService.resume(req.params.ticketId);
    sendJSON(res, { resumed: true });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

router.get('/status/:ticketId', async (req, res) => {
  try {
    const status = await pipelineService.getStatus(req.params.ticketId);
    sendJSON(res, status);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

// SSE — real-time agent progress events
router.get('/events/:ticketId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  pipelineService.subscribe(req.params.ticketId, send);

  req.on('close', () => pipelineService.unsubscribe(req.params.ticketId, send));
});

export default router;
```

### 7.8 Context Store Keys

| Key | Written by | Read by |
|-----|-----------|---------|
| `plan` | planner | architect, coder, tester |
| `design` | architect | coder, reviewer |
| `code_files` | coder | reviewer, tester, debugger, docs |
| `test_results` | tester | debugger, reviewer |
| `review` | reviewer | coder (if re-run after rejection) |
| `decisions` | any | any |
| `bug_analysis` | debugger | tester |
| `doc_updates` | docs | — |

### 7.9 Orchestrator Logic

```
1. Detect ticket type: tag 'bug' → bug pipeline, else feature pipeline
2. chain = PIPELINE_ROUTES[type].filter(a => !config.skippedAgents.includes(a))
3. For each agent in chain:
   a. Reload ticket from DB — check ticket.isPaused → stop if true
   b. Check ticket.isLocked → stop if true
   c. agentRunRepo.create({ ticketId, agent, status: 'running', model: 'gemini-2.0-flash' })
   d. failureHandler.run(agent, input, config) — retries with exponential backoff
   e. On success:
      - agentRunRepo.complete(runId, output, tokensInput, tokensOutput, durationMs)
      - agentContextRepo.set(ticketId, agentName, output.data)
      - activityService.log({ actorType: 'agent', actorName, actionType: 'agent_completed', tokensUsed, costUsd })
      - emit SSE: { type: 'agent:completed', agent, confidence, durationMs }
      - if checkpoint configured → checkpointRepo.create(ticketId, agent, output) + stop
   f. On failure after all retries:
      - agentRunRepo.fail(runId, error.message, retryCount)
      - activityService.log({ actionType: 'agent_failed', ... })
      - ticketRepo.update(id, { pipelineState: 'blocked' })
      - emit SSE: { type: 'pipeline:blocked', reason: error.message }
      - return (human must intervene)
4. ticketRepo.update(id, { pipelineState: 'completed', currentAgent: null })
```

### 7.10 Failure Handler

```typescript
// packages/core/src/agents/failure-handler.ts
import type { BaseAgent } from './base-agent';
import type { AgentConfig, AgentInput, AgentOutput } from '../types/agent';

export const failureHandler = {
  async run(agent: BaseAgent, input: AgentInput, config: AgentConfig): Promise<AgentOutput> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await agent.run(input);
      } catch (err) {
        lastError = err as Error;
        if (attempt < config.maxRetries) {
          await new Promise((r) => setTimeout(r, config.retryBackoffMs * (attempt + 1)));
        }
      }
    }
    throw lastError!;
  },
};
```

---

## 8. EP-17: TDD Testing Layer

### 8.1 Supported Frameworks

| Framework | Language | Detection signal |
|-----------|----------|-----------------|
| Jest | JS/TS | `jest` in package.json deps OR `jest.config.*` file |
| Vitest | JS/TS | `vitest` in package.json deps OR `vitest.config.*` file |
| PyTest | Python | `pytest.ini` OR `setup.cfg [tool:pytest]` OR `pyproject.toml [tool.pytest]` |
| Go test | Go | `go.mod` + at least one `*_test.go` file |

### 8.2 TDD Cycle — Red → Green → Refactor

**Red Phase:**
1. Tester agent reads `ticket.userStory.acceptanceCriteria`
2. Generates failing test suite (writes to `test_files` table)
3. `testRunner.execute()` spawns test command via `child_process.execFile`
4. Confirms all tests fail — expected (no implementation yet)
5. Tests committed to ticket branch before any implementation

**Green Phase:**
1. Coder agent receives failing test files from context store key `test_results`
2. Writes minimum implementation code to make tests pass
3. Test runner re-runs — confirms all pass
4. Code committed to ticket branch

**Refactor Phase:**
1. Coder agent cleans up implementation
2. After each change → test runner verifies no regression
3. If any test fails → log warning, stop refactor pass
4. Final commit with clean code

### 8.3 `test-result-repo.ts` Pattern

```typescript
// packages/core/src/repositories/test-result-repo.ts
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { testResults } from '../db/schema';
import type { TestResult, NewTestResult } from '../types/testing';

export const testResultRepo = {
  async create(input: NewTestResult): Promise<TestResult> {
    const [row] = await db
      .insert(testResults)
      .values(input)
      .returning();
    return row as unknown as TestResult;
  },

  async findLatestByTicket(ticketId: string): Promise<TestResult | null> {
    const [row] = await db
      .select()
      .from(testResults)
      .where(eq(testResults.ticketId, ticketId))
      .orderBy(desc(testResults.createdAt))
      .limit(1);
    return (row as unknown as TestResult) ?? null;
  },

  async findAllByTicket(ticketId: string): Promise<TestResult[]> {
    const rows = await db
      .select()
      .from(testResults)
      .where(eq(testResults.ticketId, ticketId))
      .orderBy(desc(testResults.createdAt));
    return rows as unknown as TestResult[];
  },
};
```

### 8.4 Coverage and Flaky Detection

- `coverage_delta` = current `coveragePercent` minus previous run's `coveragePercent`
- Flaky: if suite fails, re-run up to `maxFlakyRetries` times; if results differ → `isFlaky=true`, `flakyCount++`
- Coverage gate: if `coveragePercent` drops below `minCoverageOnChangedFiles` → error response
- Optional mutation testing: spawn Stryker (JS) or MutMut (Python) subprocess

### 8.5 TDD Config — `.decidr/config.json`

```json
{
  "framework": "auto",
  "coverageTool": "auto",
  "thresholds": {
    "enabled": true,
    "minCoverageOnChangedFiles": 80,
    "failOnDrop": true,
    "warnOnDrop": true
  },
  "refactorPassEnabled": true,
  "failOnFlaky": false,
  "maxFlakyRetries": 3,
  "mutationTestingEnabled": false
}
```

---

## 9. EP-18: Ticket Interaction, Prompting & Activity

### 9.1 Pipeline Controls

| Control | REST call | What it does |
|---------|-----------|-------------|
| Pause | `POST /api/pipeline/pause/:id` | Sets `isPaused=true`; orchestrator checks between agents |
| Resume | `POST /api/pipeline/resume/:id` | Sets `isPaused=false`; re-triggers from current agent |
| Take Over | `POST /api/pipeline/takeover/:id` | Sets `isLocked=true`; no agents run until unlocked |
| Reject + Feedback | `POST /api/pipeline/reject/:id` `{ feedback }` | Re-queues current agent with feedback prepended to prompt |
| Skip Agent | `POST /api/pipeline/skip/:id` | Marks current agent_run as 'skipped'; advances |
| Approve Checkpoint | `POST /api/pipeline/approve/:id` | Sets checkpoint status='approved', resumes |
| Request Changes | `POST /api/pipeline/reject/:id` `{ feedback }` | Sets checkpoint status='rejected', re-runs agent |
| Manual Override | `PUT /api/tickets/:id/status/override` `{ status, reason }` | Updates status + logs `status_overridden` to activities |
| Lock | `PUT /api/tickets/:id/lock` `{ locked: bool }` | Toggles `isLocked` |

### 9.2 Prompt Routing (priority order)

1. Starts with `@agentname` → route directly to that agent
2. Starts with `/command` → execute slash command handler
3. Intent keywords → route to best-matching agent
4. Default fallback → coder agent

**Intent keyword routing (prompt-router.ts):**

```typescript
const ROUTING_RULES: Array<{ pattern: RegExp; agent: string }> = [
  { pattern: /^@planner\b/i,                                           agent: 'planner' },
  { pattern: /^@architect\b/i,                                         agent: 'architect' },
  { pattern: /^@coder\b/i,                                             agent: 'coder' },
  { pattern: /^@tester\b/i,                                            agent: 'tester' },
  { pattern: /^@reviewer\b/i,                                          agent: 'reviewer' },
  { pattern: /^@debugger\b/i,                                          agent: 'debugger' },
  { pattern: /^@docs\b/i,                                              agent: 'docs' },
  { pattern: /\b(add|write|generate|create)\s+tests?\b/i,              agent: 'tester' },
  { pattern: /\b(run|execute)\s+tests?\b/i,                            agent: 'tester' },
  { pattern: /\b(fix|debug|broken|crash|error|bug)\b/i,                agent: 'debugger' },
  { pattern: /\b(implement|code|build|scaffold|write code)\b/i,        agent: 'coder' },
  { pattern: /\b(review|check quality|security|audit)\b/i,             agent: 'reviewer' },
  { pattern: /\b(plan|break down|decompose|split|subtask)\b/i,         agent: 'planner' },
  { pattern: /\b(design|architect|structure|pattern|schema)\b/i,       agent: 'architect' },
  { pattern: /\b(document|readme|changelog|jsdoc|update docs)\b/i,     agent: 'docs' },
  { pattern: /\b(why|explain|reasoning|decision|rationale)\b/i,        agent: 'reviewer' },
  { pattern: /\b(rename|refactor|move|extract|clean up)\b/i,           agent: 'coder' },
];
```

**Slash commands:**

| Command | Routes to | Action |
|---------|-----------|--------|
| `/run-tests` | tester | Run test suite |
| `/generate-tests` | tester | Generate tests from acceptance criteria |
| `/refactor` | coder | Refactor with test guardrails |
| `/explain` | reviewer | Explain decisions |
| `/review` | reviewer | Full code review |
| `/split-ticket` | planner | Split into subtasks |
| `/create-branch` | system | `gitService.createBranchForTicket(...)` |
| `/coverage` | tester | Show coverage delta |

**File references with `#`:**
```
"Check the validation in #src/utils/validate.ts"
→ context-assembler reads file via fs.readFileSync
→ embeds full content in agent prompt
```

**Context auto-assembled per chat prompt:**
- `ticket` fields (title, description, status, priority, tags)
- `ticket.userStory` (role, want, benefit, acceptanceCriteria)
- Latest diff from `diffs` table
- Most recent reasoning tree
- Last 10 comments
- Linked git branches and recent commits
- All `agent_context` entries for this ticket
- Most recent test result
- Last 20 activity entries
- Last 10 chat messages in this thread

**Destructive action confirmation:**

| Action | Requires confirmation |
|--------|----------------------|
| `create_branch`, `write_code`, `run_tests`, `update_status`, `create_ticket` | No |
| `commit`, `push`, `move_to_done`, `delete_file` | Yes — show `ActionConfirmation` modal |

### 9.3 Activity Integration

Every existing service needs a call to `activityService.log()` added:

| File | What to add |
|------|------------|
| `ticket-service.ts` | log after createTicket, moveTicket, updateTicket, deleteTicket |
| `reasoning-service.ts` | log after saveReasoning |
| `git-service.ts` | log after reportBranch, reportCommit, reportMerge |
| `hooks/runner.ts` | log after execFile fires |

**All `action_type` values:**
```
ticket_created     ticket_moved       ticket_edited      ticket_deleted
agent_started      agent_completed    agent_failed       agent_rejected
code_generated     code_edited_by_human  tests_generated  tests_run
bug_created        bug_fixed          review_completed   comment_added
prompt_sent        prompt_responded   status_overridden  ticket_locked
ticket_approved    ticket_rejected    pipeline_paused    pipeline_resumed
pipeline_started   pipeline_completed branch_linked      commit_detected
merge_detected     hook_fired         reverted
```

---

## 10. All New REST Endpoints

### Mount in `packages/server/src/index.ts`

```typescript
// ADD these imports and mounts (follow existing pattern in index.ts):
import agentsRouter   from './routes/agents';
import pipelineRouter from './routes/pipeline';
import testsRouter    from './routes/tests';
import chatRouter     from './routes/chat';
import activityRouter from './routes/activity';

app.use('/api/agents',   agentsRouter);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/tests',    testsRouter);
app.use('/api/tickets',  chatRouter);     // adds /:id/chat under existing tickets base
app.use('/api/activity', activityRouter);
```

### Agents
```
GET /api/agents                     List all 7 agents with configs
GET /api/agents/metrics             Per-agent stats: runs, cost, latency, retry rate
GET /api/agents/:name/config        Get config for one agent
PUT /api/agents/:name/config        Update model, maxTokens, maxRetries
```

### Pipeline
```
POST /api/pipeline/run/:ticketId        Run full pipeline (body: { ticketType? })
POST /api/pipeline/run-agent/:ticketId  Run one agent only (body: { agent })
POST /api/pipeline/pause/:ticketId      Pause
POST /api/pipeline/resume/:ticketId     Resume
POST /api/pipeline/reject/:ticketId     Reject + feedback (body: { feedback })
POST /api/pipeline/skip/:ticketId       Skip current agent
POST /api/pipeline/approve/:ticketId    Approve checkpoint
GET  /api/pipeline/status/:ticketId     { pipelineState, currentAgent, isPaused, isLocked }
GET  /api/pipeline/checkpoints/:ticketId  List pending checkpoints
GET  /api/pipeline/timeline/:ticketId   All agent_runs for ticket (desc by startedAt)
GET  /api/pipeline/events/:ticketId     SSE stream for real-time agent progress
```

### Tests
```
GET  /api/tests/:ticketId               Latest test result
GET  /api/tests/:ticketId/history       All test results (desc)
POST /api/tests/:ticketId/run           Trigger test run
GET  /api/tests/:ticketId/coverage      Coverage report from latest run
GET  /api/tests/:ticketId/coverage/delta  Delta vs previous run
GET  /api/tests/:ticketId/files         Generated test files
GET  /api/tests/flaky                   All flaky tests across project
GET  /api/tests/config                  TDD config from .decidr/config.json
PUT  /api/tests/config                  Update TDD config
```

### Chat (mounted under `/api/tickets`)
```
GET  /api/tickets/:id/chat              All chat messages for ticket
GET  /api/tickets/:id/chat/:threadId    Messages in specific thread
POST /api/tickets/:id/chat              Send prompt (body: { content, threadId? })
POST /api/tickets/:id/chat/replay/:msgId  Re-run a past message
GET  /api/tickets/:id/chat/templates    Prompt templates for ticket's type
```

### Activity
```
GET  /api/activity/ticket/:ticketId     Activity feed (?actorType=&actionType=&after=&before=&search=)
GET  /api/activity/project/:projectId   Project-wide feed
POST /api/activity/:id/revert           Revert a non-immutable activity
GET  /api/activity/export/:ticketId     Export as JSON
GET  /api/activity/export/project/:id   Export project activities
```

### Extended Ticket Controls (add to existing tickets.ts router)
```
PUT  /api/tickets/:id/lock              body: { locked: bool }
PUT  /api/tickets/:id/status/override   body: { status, reason }
POST /api/tickets/:id/approve           Approve agent artifact
POST /api/tickets/:id/request-changes   body: { comment }
```

---

## 11. New TypeScript Types

### `packages/core/src/types/agent.ts`

```typescript
export type AgentName      = 'planner' | 'architect' | 'coder' | 'reviewer' | 'tester' | 'debugger' | 'docs';
export type AgentRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'rejected' | 'skipped';
export type PipelineState  = 'idle' | 'running' | 'paused' | 'blocked' | 'completed' | 'awaiting_approval';
export type TicketType     = 'bug' | 'feature' | 'refactor' | 'docs' | 'test';

export interface AgentConfig {
  name:             AgentName;
  displayName:      string;
  model:            string;           // 'gemini-2.0-flash'
  systemPromptPath: string;           // e.g. 'planner.md'
  toolAllowlist:    string[];
  maxTokens:        number;
  maxRetries:       number;
  retryBackoffMs:   number;
  timeoutMs:        number;
}

export interface AgentInput {
  ticket:        import('./ticket').Ticket;
  contextStore:  Record<string, unknown>;
  userFeedback?: string;
}

export interface AgentOutput {
  agent:        AgentName;
  ticketId:     string;
  reasoning:    import('./reasoning').TreeNode;
  confidence:   number;
  data:         Record<string, unknown>;
  tokensInput:  number;
  tokensOutput: number;
  durationMs:   number;
}

export interface AgentRun {
  id:           number;
  ticketId:     string;
  projectId:    string | null;
  agent:        AgentName;
  status:       AgentRunStatus;
  input:        unknown;
  output:       unknown;
  reasoning:    unknown;
  errorMessage: string | null;
  retryCount:   number;
  model:        string;
  tokensInput:  number | null;
  tokensOutput: number | null;
  costUsd:      number | null;
  durationMs:   number | null;
  startedAt:    Date;
  completedAt:  Date | null;
}

export interface NewAgentRun {
  ticketId:   string;
  projectId?: string;
  agent:      AgentName;
  status?:    AgentRunStatus;
  input?:     unknown;
  model?:     string;
}

export interface PipelineConfig {
  checkpointsEnabled: {
    afterPlanner:   boolean;
    afterArchitect: boolean;
    afterCoder:     boolean;
    afterTester:    boolean;
    afterReviewer:  boolean;
    beforeMerge:    boolean;
  };
  skippedAgents:       AgentName[];
  maxConcurrentAgents: number;
}
```

### `packages/core/src/types/testing.ts`

```typescript
export type TestFramework = 'jest' | 'vitest' | 'pytest' | 'go_test';
export type TDDPhase      = 'red' | 'green' | 'refactor';

export interface TestResult {
  id:              number;
  ticketId:        string;
  framework:       TestFramework;
  totalTests:      number;
  passed:          number;
  failed:          number;
  skipped:         number;
  durationMs:      number | null;
  coveragePercent: number | null;
  coverageDelta:   number | null;
  failures:        TestFailure[] | null;
  coverageDetail:  CoverageFile[] | null;
  stdout:          string | null;
  stderr:          string | null;
  isFlaky:         boolean;
  flakyCount:      number;
  runNumber:       number;
  triggeredBy:     string | null;
  agentRunId:      number | null;
  createdAt:       Date;
}

export type NewTestResult = Omit<TestResult, 'id' | 'createdAt'>;

export interface TestFailure {
  testName:   string;
  suiteName:  string;
  expected:   string;
  actual:     string;
  error:      string;
  stackTrace: string;
  file:       string;
  line:       number;
}

export interface CoverageFile {
  path:            string;
  coveragePercent: number;
  uncoveredLines:  number[];
}
```

### `packages/core/src/types/activity.ts`

```typescript
export type ActorType = 'user' | 'agent' | 'system' | 'hook' | 'mcp';

export interface Activity {
  id:             number;
  ticketId:       string | null;
  projectId:      string | null;
  actorType:      ActorType;
  actorName:      string | null;
  actionType:     string;
  payload:        unknown;
  beforeSnapshot: unknown;
  afterSnapshot:  unknown;
  tokensUsed:     number | null;
  costUsd:        number | null;
  isImmutable:    boolean;
  createdAt:      Date;
}

export interface NewActivity {
  ticketId?:       string;
  projectId?:      string;
  actorType:       ActorType;
  actorName?:      string;
  actionType:      string;
  payload?:        unknown;
  beforeSnapshot?: unknown;
  afterSnapshot?:  unknown;
  tokensUsed?:     number;
  costUsd?:        number;
  isImmutable?:    boolean;
}

export interface ActivityFilters {
  actorType?:  ActorType;
  actionType?: string;
  after?:      Date;
  before?:     Date;
  search?:     string;
}
```

---

## 12. New Frontend Components

### `components/agents/`

| File | Purpose |
|------|---------|
| `PipelinePanel.tsx` | Pipeline state, active agent indicator, progress through chain |
| `AgentCard.tsx` | Single agent run: name badge, status, confidence bar, duration, output summary |
| `AgentTimeline.tsx` | All agent_runs as vertical timeline |
| `AgentMetricsPanel.tsx` | Per-agent stats: runs, cost, latency, retry rate |
| `ContextStoreViewer.tsx` | All context store keys with collapsible JSON values |
| `CheckpointModal.tsx` | Approve/reject UI — shows agent output, text input for feedback |

### `components/testing/`

| File | Purpose |
|------|---------|
| `TestResultsPanel.tsx` | Pass/fail counts, coverage %, delta badge (green/red) |
| `FailureList.tsx` | Expandable failures: test name, expected, actual, stack trace |
| `CoverageBar.tsx` | Visual coverage bar with delta indicator |
| `CoverageDetail.tsx` | Per-file coverage table |
| `FlakySummary.tsx` | Flaky tests list with flip count |
| `TDDCycleIndicator.tsx` | Current phase indicator: Red / Green / Refactor |

### `components/chat/`

| File | Purpose |
|------|---------|
| `ChatPanel.tsx` | Chat container in ticket detail, loads messages via API |
| `ChatMessage.tsx` | Message bubble — user (right) or agent (left) with agent name badge |
| `ChatInput.tsx` | Text input with @-mention autocomplete and /command hints |
| `ActionConfirmation.tsx` | Modal for destructive action confirmation |
| `ContextSummary.tsx` | Collapsible "context sent to agent" section per agent message |

### `components/activity/`

| File | Purpose |
|------|---------|
| `ActivityFeed.tsx` | Scrollable list of activity entries |
| `ActivityEntry.tsx` | Actor badge, action type pill, timestamp, payload preview |
| `ActivityFilters.tsx` | Filter bar: actor type, action type, date range, text search |
| `ActivityRevertButton.tsx` | Revert button (disabled for immutable entries) |
| `TokenCostBadge.tsx` | Shows `X tokens / $Y` for AI activities |

### `components/controls/`

| File | Purpose |
|------|---------|
| `PipelineControls.tsx` | Pause/Resume/Take Over/Reject/Skip/Lock button group |
| `HumanTakeoverBanner.tsx` | Yellow banner: "Automation locked — manual mode" |
| `PipelineLockBadge.tsx` | Lock icon badge on ticket card when `isLocked=true` |
| `StatusOverrideModal.tsx` | Manual status change with required reason input |

---

## 13. New Zustand Stores

### `agent-store.ts`
```typescript
interface AgentStore {
  agentRuns:      AgentRun[];
  agentMetrics:   AgentMetrics | null;
  contextStore:   Record<string, unknown>;
  fetchAgentRuns: (ticketId: string) => Promise<void>;
  fetchMetrics:   ()                 => Promise<void>;
  fetchContext:   (ticketId: string) => Promise<void>;
}
```

### `pipeline-store.ts`
```typescript
interface PipelineStore {
  pipelineState:      PipelineState;
  currentAgent:       AgentName | null;
  pendingCheckpoints: Checkpoint[];
  sseConnected:       boolean;
  runPipeline:       (ticketId: string, ticketType?: string) => Promise<void>;
  pausePipeline:     (ticketId: string) => Promise<void>;
  resumePipeline:    (ticketId: string) => Promise<void>;
  skipAgent:         (ticketId: string) => Promise<void>;
  approveCheckpoint: (ticketId: string) => Promise<void>;
  rejectCheckpoint:  (ticketId: string, feedback: string) => Promise<void>;
  lockTicket:        (ticketId: string, locked: boolean) => Promise<void>;
  connectSSE:        (ticketId: string) => void;
  disconnectSSE:     () => void;
}
```

### `activity-store.ts`
```typescript
interface ActivityStore {
  activities:      Activity[];
  filters:         ActivityFilters;
  fetchForTicket:  (ticketId: string)   => Promise<void>;
  fetchForProject: (projectId: string)  => Promise<void>;
  revert:          (activityId: number) => Promise<void>;
  setFilters:      (filters: ActivityFilters) => void;
}
```

---

## 14. New MCP Tools

### `packages/mcp/src/tools/agent-tools.ts`
```
run-pipeline         Run full pipeline (input: ticketId, ticketType?)
run-agent            Run specific agent (input: ticketId, agent)
pause-pipeline       Pause (input: ticketId)
resume-pipeline      Resume (input: ticketId)
approve-checkpoint   Approve checkpoint (input: ticketId)
reject-checkpoint    Reject + feedback (input: ticketId, feedback)
get-pipeline-status  State + current agent (input: ticketId)
get-agent-metrics    Per-agent stats (no input)
```

### `packages/mcp/src/tools/tdd-tools.ts`
```
run-tests            Run test suite (input: ticketId)
generate-tests       Generate tests from acceptance criteria (input: ticketId)
get-coverage         Coverage report (input: ticketId)
get-coverage-delta   Delta vs previous run (input: ticketId)
configure-tdd        Update TDD config (input: config object)
get-flaky-tests      List all flaky tests (no input)
```

---

## 15. Implementation Order

| Step | What to build | Depends on |
|------|--------------|-----------|
| 1 | Add `boolean` to schema.ts imports + 5 new ticket columns + 7 new tables | — |
| 2 | `npm run db:generate` then `npm run db:migrate` | Step 1 |
| 3 | New type files: `agent.ts`, `testing.ts`, `activity.ts` in `packages/core/src/types/` | Step 1 |
| 4 | New repos: `agent-run-repo`, `agent-context-repo`, `test-result-repo`, `test-file-repo`, `activity-repo`, `chat-message-repo`, `checkpoint-repo` | Steps 1, 3 |
| 5 | `activity-service.ts` in `packages/core/src/activity/` | Step 4 |
| 6 | Integrate `activityService.log()` into existing: `ticket-service`, `reasoning-service`, `git-service`, `hooks/runner` | Step 5 |
| 7 | Add `@google/generative-ai` to `packages/core/package.json` + `npm install` | — |
| 8 | `base-agent.ts` + `failure-handler.ts` + `context-store.ts` in `packages/core/src/agents/` | Steps 3, 7 |
| 9 | `registry.ts` + 7 agent implementations + 7 `.md` prompt files in `agents/` | Step 8 |
| 10 | `orchestrator.ts` + `pipeline-service.ts` | Steps 4, 5, 9 |
| 11 | `framework-adapter.ts` + `test-runner.ts` + `coverage-service.ts` + `tdd-cycle.ts` + `test-service.ts` | Steps 3, 4, 5 |
| 12 | `prompt-router.ts` + `context-assembler.ts` + `slash-commands.ts` + `action-executor.ts` + `chat-service.ts` | Steps 8, 9 |
| 13 | New server routes: `agents.ts`, `pipeline.ts`, `tests.ts`, `chat.ts`, `activity.ts` | Steps 10, 11, 12 |
| 14 | Mount new routes in `packages/server/src/index.ts` | Step 13 |
| 15 | New frontend components (agents/, testing/, chat/, activity/, controls/) | Step 14 |
| 16 | New Zustand stores (`agent-store`, `pipeline-store`, `activity-store`) | Step 15 |
| 17 | Wire new tabs/panels into `TicketDetail.tsx` and `App.tsx` | Step 16 |
| 18 | New MCP tools (`agent-tools.ts`, `tdd-tools.ts`) | Steps 10, 11 |

**Parallel opportunities:**
- Steps 3–7 can all run in parallel (types, repos, activity, install)
- Steps 10, 11, 12 can run in parallel after steps 8–9
- Steps 13–14 (all routes) can be written in parallel

---

## 16. What Does NOT Change

- All 11 existing tables (only `tickets` gets 5 new columns)
- `packages/core/src/db/connection.ts` — unchanged
- `packages/server/src/routes/process.ts` — unchanged (continues using `gemini-2.5-flash` + `GEMINI_KEY`)
- All existing REST routes
- All 11 existing MCP tools
- File bridge (`.decidr/` inbox/outbox)
- Git hooks (post-commit, post-checkout, post-merge)
- Hook system (bash scripts + `EVENTS` constants in `hooks/events.ts`)
- Tauri shell (`src-tauri/`)
- VS Code extension (`packages/vscode-ext/`)

The existing **Process** button (single-ticket Gemini reasoning via `gemini-2.5-flash`) continues to work exactly as before. The new **Run Pipeline** button is completely separate and uses `gemini-2.0-flash`.
