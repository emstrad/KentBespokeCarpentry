-- Kent Bespoke Carpentry — enquiries table
-- Run in the Neon SQL editor or via `npm run db:migrate`.

CREATE TYPE "public"."enquiry_source" AS ENUM('booking', 'contact');

CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text NOT NULL,
	"ideas" text,
	"source" "enquiry_source" NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL
);

CREATE INDEX "enquiries_created_at_idx" ON "enquiries" ("created_at" DESC);
