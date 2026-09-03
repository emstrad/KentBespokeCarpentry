import "server-only";
import { NAP, SITE_URL } from "./site";

const DEFAULT_ENDPOINT = `https://formsubmit.co/ajax/${NAP.email}`;

/**
 * Forward an enquiry to FormSubmit (formsubmit.co), which emails sales@kentbespokecarpentry.co.uk.
 * Uses FORMSUBMIT_ENDPOINT when set, otherwise the address above.
 * First ever submission triggers a one-off activation email, see README.
 */
export async function sendFormSubmit(fields: Record<string, string>): Promise<{ ok: boolean; detail?: string }> {
  const endpoint = process.env.FORMSUBMIT_ENDPOINT?.trim() || DEFAULT_ENDPOINT;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: SITE_URL,
        Referer: `${SITE_URL}/`,
      },
      body: JSON.stringify({ _template: "table", _captcha: "false", ...fields }),
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text();
    let data: { success?: string | boolean; message?: string } = {};
    try { data = JSON.parse(text); } catch { /* non-JSON body */ }
    const explicitFail = data.success === false || data.success === "false";
    // A 2xx from FormSubmit means it accepted the submission (or queued an activation email).
    const ok = res.ok && !explicitFail;
    if (!ok) return { ok, detail: data.message ?? `HTTP ${res.status} ${text.slice(0, 160)}` };
    if (data.message) console.info("[formsubmit]", data.message);
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}
