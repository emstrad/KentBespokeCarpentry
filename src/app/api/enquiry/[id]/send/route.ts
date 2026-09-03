import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { ensureSchema } from "@/db/bootstrap";
import type { Attachment } from "@/db/schema";
import { MAX_FILES, MAX_FILE_BYTES } from "@/lib/enquiry";
import { sendFormSubmit } from "@/lib/formsubmit";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const BLOB_HOST = /\.blob\.vercel-storage\.com$/;

const bodySchema = z.object({
  attachments: z.array(z.object({
    name: z.string().min(1).max(255),
    size: z.number().int().nonnegative().max(MAX_FILE_BYTES),
    type: z.string().max(100),
    url: z.string().url().optional(),
    pathname: z.string().max(400).optional(),
  })).max(MAX_FILES).default([]),
});

/**
 * POST /api/enquiry/[id]/send
 * Final step of the booking modal: records any uploaded files against the enquiry and sends the
 * ONE notification email (details + file links). Idempotent: a repeat call with no new files is a
 * no-op once the enquiry has been notified.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { ok, retryAfter } = rateLimit(`send:${clientIp(req)}`, 20);
  if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the files" }, { status: 400 });
  for (const a of parsed.data.attachments) {
    if (a.url && !BLOB_HOST.test(new URL(a.url).hostname)) return NextResponse.json({ error: "Invalid attachment URL" }, { status: 400 });
    if (a.pathname && !a.pathname.startsWith(`enquiries/${id}/`)) return NextResponse.json({ error: "Invalid attachment path" }, { status: 400 });
  }

  let enquiry: typeof schema.enquiries.$inferSelect | null = null;
  try {
    await ensureSchema();
    const db = getDb();
    const since = new Date(Date.now() - WINDOW_MS);
    [enquiry] = await db.select().from(schema.enquiries).where(and(eq(schema.enquiries.id, id), gt(schema.enquiries.createdAt, since))).limit(1);
  } catch (e) { console.error("[send] DB lookup failed:", e); }
  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  // Merge attachments (deduped by pathname/url).
  const merged: Attachment[] = [...enquiry.attachments];
  let added = 0;
  for (const a of parsed.data.attachments) {
    const dup = merged.some((m) => (a.pathname && m.pathname === a.pathname) || (a.url && m.url === a.url));
    if (!dup && merged.length < MAX_FILES) { merged.push(a); added++; }
  }
  if (enquiry.notifiedAt && added === 0) return NextResponse.json({ ok: true, emailed: true, alreadySent: true });

  const linkFor = (a: Attachment) => (a.pathname ? `${SITE_URL}/api/enquiry/${id}/attachments?file=${encodeURIComponent(a.pathname)}` : a.url);
  const files = merged.length
    ? merged.map((a) => { const l = linkFor(a); return l ? `${a.name}: ${l}` : `${a.name} (${Math.round(a.size / 1024)} KB, not stored)`; }).join("\n")
    : "none";
  const fields = {
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone ?? "not given",
    ideas: enquiry.ideas ?? "not given",
    source: enquiry.source,
    files,
    reference: id,
  };
  const subject = enquiry.notifiedAt ? `More photos for enquiry: ${enquiry.name}` : `New enquiry: ${enquiry.name}`;
  const mail = await sendFormSubmit({ _subject: subject, _replyto: enquiry.email, ...fields });
  if (!mail.ok) console.error("[send] FormSubmit failed:", mail.detail);

  try {
    const db = getDb();
    await db.update(schema.enquiries).set({ attachments: merged, notifiedAt: enquiry.notifiedAt ?? (mail.ok ? new Date() : null) }).where(eq(schema.enquiries.id, id));
  } catch (e) { console.error("[send] DB update failed:", e); }

  return NextResponse.json({
    ok: true,
    emailed: mail.ok,
    emailDetail: mail.ok ? undefined : mail.detail?.slice(0, 200),
    // For the browser-side FormSubmit fallback.
    mail: { _subject: subject, _replyto: enquiry.email, ...fields },
  });
}

/** Marks an enquiry as notified after a successful browser-side send. */
export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await ensureSchema();
    await getDb().update(schema.enquiries).set({ notifiedAt: new Date() }).where(eq(schema.enquiries.id, id));
  } catch (e) { console.error("[send] PATCH failed:", e); }
  return NextResponse.json({ ok: true });
}
