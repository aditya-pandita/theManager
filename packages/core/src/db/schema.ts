import {
  pgTable,
  text,
  serial,
  timestamp,
  real,
  integer,
  jsonb,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#3B82F6'),
  folderPath: text('folder_path'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tickets = pgTable(
  'tickets',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('backlog'),
    priority: text('priority').notNull().default('medium'),
    tags: text('tags').array().notNull().default(sql`ARRAY[]::text[]`),
    pipelineState: text('pipeline_state').notNull().default('idle'),
    currentAgent: text('current_agent'),
    isPaused: boolean('is_paused').notNull().default(false),
    isLocked: boolean('is_locked').notNull().default(false),
    pipelineConfig: jsonb('pipeline_config'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('idx_tickets_status').on(t.status),
    priorityIdx: index('idx_tickets_priority').on(t.priority),
    projectIdx: index('idx_tickets_project').on(t.projectId),
  })
);

export const diffs = pgTable(
  'diffs',
  {
    id: serial('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),
    beforeCode: text('before_code').notNull(),
    afterCode: text('after_code').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({ ticketIdx: index('idx_diffs_ticket').on(t.ticketId) })
);

export const reasoning = pgTable(
  'reasoning',
  {
    id: serial('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .unique()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    summary: text('summary').notNull(),
    confidence: real('confidence').notNull(),
    timeMs: integer('time_ms').notNull(),
    tree: jsonb('tree').notNull(),
    logs: jsonb('logs').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({ confidenceIdx: index('idx_reasoning_confidence').on(t.confidence) })
);

export const comments = pgTable(
  'comments',
  {
    id: serial('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    text: text('text').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({ ticketIdx: index('idx_comments_ticket').on(t.ticketId) })
);

export const changelog = pgTable(
  'changelog',
  {
    id: serial('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    author: text('author').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({ ticketIdx: index('idx_changelog_ticket').on(t.ticketId) })
);

export const hookEvents = pgTable(
  'hook_events',
  {
    id: serial('id').primaryKey(),
    event: text('event').notNull(),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    eventIdx: index('idx_hook_events_event').on(t.event),
    createdIdx: index('idx_hook_events_created').on(t.createdAt),
  })
);

export const userStories = pgTable('user_stories', {
  id: serial('id').primaryKey(),
  ticketId: text('ticket_id')
    .notNull()
    .unique()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default(''),
  want: text('want').notNull().default(''),
  benefit: text('benefit').notNull().default(''),
  acceptanceCriteria: text('acceptance_criteria').notNull().default(''),
  files: text('files').array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  metadata: jsonb('metadata'),
});

export const gitBranches = pgTable(
  'git_branches',
  {
    id: serial('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    storyId: text('story_id'),
    branchName: text('branch_name').notNull().unique(),
    baseBranch: text('base_branch').notNull().default('main'),
    status: text('status').notNull().default('open'),
    aheadCount: integer('ahead_count').notNull().default(0),
    behindCount: integer('behind_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    mergedAt: timestamp('merged_at'),
    mergedBy: text('merged_by'),
  },
  (t) => ({
    ticketIdx: index('idx_git_branches_ticket').on(t.ticketId),
  })
);

export const gitCommits = pgTable(
  'git_commits',
  {
    id: serial('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    branchId: integer('branch_id').references(() => gitBranches.id, { onDelete: 'set null' }),
    hash: text('hash').notNull().unique(),
    abbrevHash: text('abbrev_hash').notNull(),
    message: text('message').notNull(),
    authorName: text('author_name').notNull(),
    authorEmail: text('author_email'),
    filesAdded: text('files_added').array().notNull().default(sql`ARRAY[]::text[]`),
    filesModified: text('files_modified').array().notNull().default(sql`ARRAY[]::text[]`),
    filesDeleted: text('files_deleted').array().notNull().default(sql`ARRAY[]::text[]`),
    insertions: integer('insertions').notNull().default(0),
    deletions: integer('deletions').notNull().default(0),
    committedAt: timestamp('committed_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx: index('idx_git_commits_ticket').on(t.ticketId),
    branchIdx: index('idx_git_commits_branch').on(t.branchId),
    hashIdx: index('idx_git_commits_hash').on(t.hash),
  })
);

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  project: one(projects, { fields: [tickets.projectId], references: [projects.id] }),
  diff: one(diffs, { fields: [tickets.id], references: [diffs.ticketId] }),
  reasoning: one(reasoning, { fields: [tickets.id], references: [reasoning.ticketId] }),
  userStory: one(userStories, { fields: [tickets.id], references: [userStories.ticketId] }),
  gitBranches: many(gitBranches),
  gitCommits: many(gitCommits),
  comments: many(comments),
  changelog: many(changelog),
  agentRuns: many(agentRuns),
  testResults: many(testResults),
  testFiles: many(testFiles),
  activities: many(activities),
  chatMessages: many(chatMessages),
  agentContextEntries: many(agentContext),
  checkpoints: many(pipelineCheckpoints),
}));

export const gitBranchesRelations = relations(gitBranches, ({ one, many }) => ({
  ticket: one(tickets, { fields: [gitBranches.ticketId], references: [tickets.id] }),
  commits: many(gitCommits),
}));

export const gitCommitsRelations = relations(gitCommits, ({ one }) => ({
  ticket: one(tickets, { fields: [gitCommits.ticketId], references: [tickets.id] }),
  branch: one(gitBranches, { fields: [gitCommits.branchId], references: [gitBranches.id] }),
}));

export const diffsRelations = relations(diffs, ({ one }) => ({
  ticket: one(tickets, { fields: [diffs.ticketId], references: [tickets.id] }),
}));

export const reasoningRelations = relations(reasoning, ({ one }) => ({
  ticket: one(tickets, { fields: [reasoning.ticketId], references: [tickets.id] }),
}));

export const userStoriesRelations = relations(userStories, ({ one }) => ({
  ticket: one(tickets, { fields: [userStories.ticketId], references: [tickets.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  ticket: one(tickets, { fields: [comments.ticketId], references: [tickets.id] }),
}));

export const changelogRelations = relations(changelog, ({ one }) => ({
  ticket: one(tickets, { fields: [changelog.ticketId], references: [tickets.id] }),
}));

// ─── PHASE 2 TABLES ──────────────────────────────────────────

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

export const agentContext = pgTable(
  'agent_context',
  {
    id:        serial('id').primaryKey(),
    ticketId:  text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    key:       text('key').notNull(),
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

export const testResults = pgTable(
  'test_results',
  {
    id:              serial('id').primaryKey(),
    ticketId:        text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    framework:       text('framework').notNull(),
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
    agentRunId:      integer('agent_run_id').references(() => agentRuns.id, { onDelete: 'set null' }),
    createdAt:       timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx:  index('idx_test_results_ticket').on(t.ticketId),
    createdIdx: index('idx_test_results_created').on(t.createdAt),
  })
);

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

export const activities = pgTable(
  'activities',
  {
    id:             serial('id').primaryKey(),
    ticketId:       text('ticket_id').references(() => tickets.id, { onDelete: 'cascade' }),
    projectId:      text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    actorType:      text('actor_type').notNull(),
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

export const chatMessages = pgTable(
  'chat_messages',
  {
    id:               serial('id').primaryKey(),
    ticketId:         text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    threadId:         text('thread_id'),
    role:             text('role').notNull(),
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

export const pipelineCheckpoints = pgTable(
  'pipeline_checkpoints',
  {
    id:         serial('id').primaryKey(),
    ticketId:   text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    agent:      text('agent').notNull(),
    status:     text('status').notNull().default('pending'),
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

// ─── PHASE 2 RELATIONS ───────────────────────────────────────

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
