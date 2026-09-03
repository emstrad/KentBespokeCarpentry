import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { enquirySchema } from "@/lib/enquiry";
import { sendFormSubmit } from "@/lib/formsubmit";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/enquiry
 * validate (zod) → insert into Neon `enquiries` → forward to FormSubmit → 200 { id }
 * Honeypot: a filled `company` field returns a fake 200 and stores nothing.
 */
export async function POST(req: Request) {
  const { ok, retryAfter } = rateLimit(`enquiry:${clientIp(req)}`);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly or call us." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    // Honeypot tripped → pretend success so bots don't learn.
    if (first?.path[0] === "company") return NextResponse.json({ id: null, ok: true });
    return NextResponse.json({ error: first?.message ?? "Please check the form", issues: parsed.error.issues }, { status: 400 });
  }
  const { name, email, phone, ideas, source } = parsed.data;

  let id: string | null = null;
  let stored = false;
  try {
    const db = getDb();
    const [row] = await db.insert(schema.enquiries).values({ name, email, phone: phone || null, ideas: ideas || null, source, attachments: [] }).returning({ id: schema.enquiries.id });
    id = row?.id ?? null;
    stored = !!id;
  } catch (e) {
    console.error("[enquiry] DB insert failed:", e instanceof Error ? e.message : e);
  }

  const mail = await sendFormSubmit({
    _subject: `New enquiry: ${name}`,
    _replyto: email,
    name,
    email,
    phone: phone || "not given",
    ideas: ideas || "not given",
    source,
    reference: id ?? "not stored",
  });
  if (!mail.ok) console.error("[enquiry] FormSubmit failed:", mail.detail);

  if (!stored && !mail.ok) {
    return NextResponse.json({ error: "We couldn't send that right now. Please call us on 07494 280614." }, { status: 502 });
  }
  return NextResponse.json({ id, ok: true, stored, emailed: mail.ok });
}
