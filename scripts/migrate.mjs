/**
 * Applies drizzle/*.sql migrations to the Neon database in DATABASE_URL, in order, once each.
 * Usage: node scripts/migrate.mjs   (reads .env.local / .env if DATABASE_URL isn't already set)
 */
import { neon } from "@neondatabase/serverless";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  if (process.env.DATABASE_URL) return;
  for (const f of [".env.local", ".env"]) {
    if (!existsSync(f)) continue;
    const m = readFileSync(f, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
    if (m) { process.env.DATABASE_URL = m[1].trim(); return; }
  }
}
loadEnv();
if (!process.env.DATABASE_URL) { console.error("DATABASE_URL is not set"); process.exit(1); }

const sql = neon(process.env.DATABASE_URL);
await sql`CREATE TABLE IF NOT EXISTS "_kbc_migrations" ("tag" text PRIMARY KEY, "applied_at" timestamptz NOT NULL DEFAULT now())`;
const applied = new Set((await sql`SELECT tag FROM "_kbc_migrations"`).map((r) => r.tag));
const files = readdirSync("drizzle").filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const tag = file.replace(/\.sql$/, "");
  if (applied.has(tag)) { console.log(`skip  ${tag} (already applied)`); continue; }
  const statements = readFileSync(join("drizzle", file), "utf8")
    .split(/;\s*\n/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
  for (const stmt of statements) await sql.query(stmt);
  await sql`INSERT INTO "_kbc_migrations" (tag) VALUES (${tag})`;
  console.log(`apply ${tag} (${statements.length} statements)`);
}
const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'enquiries' ORDER BY ordinal_position`;
console.table(cols);
