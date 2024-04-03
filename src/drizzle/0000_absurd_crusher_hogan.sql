-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" text PRIMARY KEY NOT NULL,
	"userName" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" timestamp(3) NOT NULL,
	"userId" text NOT NULL,
	"expected" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Response" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"available" boolean NOT NULL,
	"eventId" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Response_eventId_userId_key" ON "Response" ("userId","eventId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Response" ADD CONSTRAINT "Response_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Response" ADD CONSTRAINT "Response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/