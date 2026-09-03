import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import type { Attachment } from "@/db/schema";
import { ACCEPTED_TYPES, MAX_FILES, MAX_FILE_BYTES } from "@/lib/enquiry";
import { sendFormSubmit } from "@/lib/formsubmit";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ATTACH_WINDOW_MS = 24 * 60 * 60 * 1000;
const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

const attachSchema = z.object({
  attachments: z.array(z.object({
    name: z.string().min(1).max(255),
    size: z.number().int().nonnegative().max(MAX_FILE_BYTES),
    type: z.string().max(100),
    url: z.string().url().optional(),
  })).min(1).max(MAX_FILES),
});

async function findRecentEnquiry(id: string) {
  const db = getDb();
  const since = new Date(Date.now() - ATTACH_WINDOW_MS);
  const [row] = await db.select().from(schema.enquiries).where(and(eq(schema.enquiries.id, id), gt(schema.enquiries.createdAt, since))).limit(1);
  return row ?? null;
}

/**
 * POST /api/enquiry/[id]/attachments
 *
 * Two bodies are accepted:
 *  1. Vercel Blob client-upload protocol ({ type, payload }): issues a scoped upload token so the
 *     browser can upload directly to Blob storage (bypasses the 4.5 MB serverless body limit).
 *  2. { attachments: [{ name, size, type, url? }] }: records the files against the enquiry and
 *     emails the links to the team. `url` is optional so the flow degrades to names-only when no
 *     BLOB_READ_WRITE_TOKEN is configured.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { ok, retryAfter } = rateLimit(`attach:${clientIp(req)}`, 30);
  if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  // --- 1. Blob client-upload token exchange -------------------------------------------------
  if (body && typeof body === "object" && "type" in body && typeof (body as { type: unknown }).type === "string" && (body as { type: string }).type.startsWith("blob.")) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "File storage is not configured" }, { status: 503 });
    try {
      const result = await handleUpload({
        request: req,
        body: body as HandleUploadBody,
        onBeforeGenerateToken: async (pathname) => {
          if (!pathname.startsWith(`enquiries/${id}/`)) throw new Error("Invalid upload path");
          const enquiry = await findRecentEnquiry(id);
          if (!enquiry) throw new Error("Enquiry not found");
          if (enquiry.attachments.length >= MAX_FILES) throw new Error("Attachment limit reached");
          return {
            allowedContentTypes: ACCEPTED_TYPES,
            maximumSizeInBytes: MAX_FILE_BYTES,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({ id }),
          };
        },
        // Fires from Vercel once the upload lands (production only). The browser also POSTs the final
        // list below, so this is a belt-and-braces record; writes are deduped by URL.
        onUploadCompleted: async ({ blob }) => {
          try { await appendAttachments(id, [{ name: blob.pathname.split("/").pop() ?? "file", size: 0, type: blob.contentType ?? "", url: blob.url }]); }
          catch (e) { console.error("[attachments] onUploadCompleted:", e); }
        },
      });
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
    }
  }

  // --- 2. Record attachments + email links --------------------------------------------------
  const parsed = attachSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the files" }, { status: 400 });
  for (const a of parsed.data.attachments) {
    if (a.url && !BLOB_HOST.test(new URL(a.url).hostname)) return NextResponse.json({ error: "Invalid attachment URL" }, { status: 400 });
  }

  let enquiry: typeof schema.enquiries.$inferSelect | null = null;
  try { enquiry = await findRecentEnquiry(id); } catch (e) { console.error("[attachments] DB lookup failed:", e); }
  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  let saved: Attachment[] = enquiry.attachments;
  try { saved = await appendAttachments(id, parsed.data.attachments); }
  catch (e) { console.error("[attachments] DB update failed:", e); }

  const lines = parsed.data.attachments.map((a) => (a.url ? `${a.name}: ${a.url}` : `${a.name} (${Math.round(a.size / 1024)} KB, not stored)`));
  const mail = await sendFormSubmit({
    _subject: `Inspiration for enquiry: ${enquiry.name}`,
    _replyto: enquiry.email,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone ?? "not given",
    reference: id,
    attachments: lines.join("\n"),
  });
  if (!mail.ok) console.error("[attachments] FormSubmit failed:", mail.detail);

  return NextResponse.json({ ok: true, attachments: saved, emailed: mail.ok });
}

async function appendAttachments(id: string, incoming: Attachment[]): Promise<Attachment[]> {
  const db = getDb();
  const [row] = await db.select({ attachments: schema.enquiries.attachments }).from(schema.enquiries).where(eq(schema.enquiries.id, id)).limit(1);
  const existing = row?.attachments ?? [];
  const merged = [...existing];
  for (const a of incoming) {
    const dup = merged.some((m) => (a.url && m.url === a.url) || (!a.url && m.name === a.name && m.size === a.size));
    if (!dup) merged.push(a);
  }
  const next = merged.slice(0, MAX_FILES);
  await db.update(schema.enquiries).set({ attachments: next }).where(eq(schema.enquiries.id, id));
  return next;
}
