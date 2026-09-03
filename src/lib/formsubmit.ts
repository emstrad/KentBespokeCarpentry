import "server-only";

/**
 * Forward an enquiry to FormSubmit (formsubmit.co), which emails sales@kentbespokecarpentry.co.uk.
 * First ever submission triggers a one-off activation email, see README.
 */
export async function sendFormSubmit(fields: Record<string, string>): Promise<{ ok: boolean; detail?: string }> {
  const endpoint = process.env.FORMSUBMIT_ENDPOINT;
  if (!endpoint) return { ok: false, detail: "FORMSUBMIT_ENDPOINT not set" };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _template: "table", _captcha: "false", ...fields }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    const ok = res.ok && (data.success === true || data.success === "true");
    return { ok, detail: ok ? undefined : data.message ?? `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}
