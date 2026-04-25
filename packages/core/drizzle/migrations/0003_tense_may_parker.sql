CREATE TABLE IF NOT EXISTS "git_branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"story_id" text,
	"branch_name" text NOT NULL,
	"base_branch" text DEFAULT 'main' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"ahead_count" integer DEFAULT 0 NOT NULL,
	"behind_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"merged_at" timestamp,
	"merged_by" text,
	CONSTRAINT "git_branches_branch_name_unique" UNIQUE("branch_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "git_commits" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"branch_id" integer,
	"hash" text NOT NULL,
	"abbrev_hash" text NOT NULL,
	"message" text NOT NULL,
	"author_name" text NOT NULL,
	"author_email" text,
	"files_added" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"files_modified" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"files_deleted" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"insertions" integer DEFAULT 0 NOT NULL,
	"deletions" integer DEFAULT 0 NOT NULL,
	"committed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "git_commits_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "git_branches" ADD CONSTRAINT "git_branches_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "git_commits" ADD CONSTRAINT "git_commits_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "git_commits" ADD CONSTRAINT "git_commits_branch_id_git_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."git_branches"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_git_branches_ticket" ON "git_branches" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_git_commits_ticket" ON "git_commits" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_git_commits_branch" ON "git_commits" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_git_commits_hash" ON "git_commits" USING btree ("hash");