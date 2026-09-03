import "server-only";
import { neon } from "@neondatabase/serverless";

let ready: Promise<void> | null = null;

/**
 * Idempotently creates the enquiries schema on first use, so a fresh Neon database works without
 * running the migration by hand. Mirrors drizzle/0000_enquiries.sql. Runs once per server instance.
 */
export function ensureSchema(): Promise<void> {
  if (ready) return ready;
  const url = process.env.DATABASE_URL;
  if (!url) return Promise.reject(new Error("DATABASE_URL is not set"));
  const sql = neon(url);
  ready = (async () => {
    await sql.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enquiry_source') THEN
        CREATE TYPE "enquiry_source" AS ENUM ('booking', 'contact');
      END IF;
    END $$`);
    await sql.query(`CREATE TABLE IF NOT EXISTS "enquiries" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "name" text NOT NULL,
      "phone" text,
      "email" text NOT NULL,
      "ideas" text,
      "source" "enquiry_source" NOT NULL,
      "attachments" jsonb DEFAULT '[]'::jsonb NOT NULL
    )`);
    await sql.query(`CREATE INDEX IF NOT EXISTS "enquiries_created_at_idx" ON "enquiries" ("created_at" DESC)`);
    await sql.query(`ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "notified_at" timestamp with time zone`);
  })().catch((e) => { ready = null; throw e; });
  return ready;
}
