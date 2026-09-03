import "server-only";
import { sendFormSubmit } from "./formsubmit";
import { NAP } from "./site";

export type EnquiryMail = {
  subject: string;
  replyTo: string;
  /** Label → value rows rendered as a table in the email body. */
  rows: Record<string, string>;
};

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

/**
 * Sends the enquiry notification to the team.
 * Provider order: Resend (when RESEND_API_KEY is set) → FormSubmit.
 * Resend is a proper transactional email API and is far more reliable from a serverless
 * function than FormSubmit, which is designed for browser submissions.
 */
export async function sendEnquiryEmail(mail: EnquiryMail): Promise<{ ok: boolean; provider: "resend" | "formsubmit"; detail?: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (key) {
    const r = await sendViaResend(key, mail);
    return { provider: "resend", ...r };
  }
  const r = await sendFormSubmit({ _subject: mail.subject, _replyto: mail.replyTo, ...mail.rows });
  return { provider: "formsubmit", ...r };
}

async function sendViaResend(key: string, mail: EnquiryMail): Promise<{ ok: boolean; detail?: string }> {
  const from = process.env.RESEND_FROM?.trim() || `Kent Bespoke Carpentry <enquiries@kentbespokecarpentry.co.uk>`;
  const to = (process.env.ENQUIRY_TO?.trim() || NAP.email).split(",").map((s) => s.trim()).filter(Boolean);
  const rowsHtml = Object.entries(mail.rows)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;border:1px solid #e5e5e5;font-weight:600;white-space:nowrap;vertical-align:top">${escape(k)}</td><td style="padding:8px 12px;border:1px solid #e5e5e5;white-space:pre-wrap">${escape(v)}</td></tr>`)
    .join("");
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0a0a0a"><h2 style="margin:0 0 16px;font-weight:500">${escape(mail.subject)}</h2><table style="border-collapse:collapse;font-size:15px">${rowsHtml}</table><p style="margin-top:20px;font-size:13px;color:#666">Reply to this email to respond to the enquirer.</p></div>`;
  const text = Object.entries(mail.rows).map(([k, v]) => `${k}: ${v}`).join("\n");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, reply_to: mail.replyTo, subject: mail.subject, html, text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { ok: true };
    const body = await res.text();
    return { ok: false, detail: `Resend HTTP ${res.status}: ${body.slice(0, 200)}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}
