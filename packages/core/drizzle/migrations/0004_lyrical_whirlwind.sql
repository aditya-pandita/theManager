CREATE TABLE IF NOT EXISTS "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text,
	"project_id" text,
	"actor_type" text NOT NULL,
	"actor_name" text,
	"action_type" text NOT NULL,
	"payload" jsonb,
	"before_snapshot" jsonb,
	"after_snapshot" jsonb,
	"tokens_used" integer,
	"cost_usd" real,
	"is_immutable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_context" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"agent" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"project_id" text,
	"agent" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"reasoning" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"model" text DEFAULT 'gemini-2.0-flash' NOT NULL,
	"tokens_input" integer,
	"tokens_output" integer,
	"cost_usd" real,
	"duration_ms" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"thread_id" text,
	"role" text NOT NULL,
	"agent_name" text,
	"content" text NOT NULL,
	"context_assembled" jsonb,
	"actions_taken" jsonb,
	"tokens_used" integer,
	"cost_usd" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pipeline_checkpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"agent" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"output" jsonb,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"file_path" text NOT NULL,
	"content" text NOT NULL,
	"framework" text NOT NULL,
	"agent" text DEFAULT 'tester' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"framework" text NOT NULL,
	"total_tests" integer NOT NULL,
	"passed" integer NOT NULL,
	"failed" integer NOT NULL,
	"skipped" integer DEFAULT 0 NOT NULL,
	"duration_ms" integer,
	"coverage_percent" real,
	"coverage_delta" real,
	"failures" jsonb,
	"coverage_detail" jsonb,
	"stdout" text,
	"stderr" text,
	"is_flaky" boolean DEFAULT false NOT NULL,
	"flaky_count" integer DEFAULT 0 NOT NULL,
	"run_number" integer DEFAULT 1 NOT NULL,
	"triggered_by" text,
	"agent_run_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "pipeline_state" text DEFAULT 'idle' NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "current_agent" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "is_paused" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "is_locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "pipeline_config" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_context" ADD CONSTRAINT "agent_context_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pipeline_checkpoints" ADD CONSTRAINT "pipeline_checkpoints_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_files" ADD CONSTRAINT "test_files_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_results" ADD CONSTRAINT "test_results_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_results" ADD CONSTRAINT "test_results_agent_run_id_agent_runs_id_fk" FOREIGN KEY ("agent_run_id") REFERENCES "public"."agent_runs"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activities_ticket" ON "activities" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activities_project" ON "activities" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activities_action" ON "activities" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activities_created" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activities_actor" ON "activities" USING btree ("actor_type","actor_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agent_context_ticket_key" ON "agent_context" USING btree ("ticket_id","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agent_runs_ticket" ON "agent_runs" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agent_runs_agent" ON "agent_runs" USING btree ("agent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agent_runs_status" ON "agent_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_ticket" ON "chat_messages" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_thread" ON "chat_messages" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_checkpoints_ticket" ON "pipeline_checkpoints" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_checkpoints_status" ON "pipeline_checkpoints" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_test_files_ticket" ON "test_files" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_test_results_ticket" ON "test_results" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_test_results_created" ON "test_results" USING btree ("created_at");