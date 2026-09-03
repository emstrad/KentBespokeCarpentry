import { NAP } from "./site";

export const FORMSUBMIT_BROWSER_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMSUBMIT_ENDPOINT?.trim() || `https://formsubmit.co/ajax/${NAP.email}`;

/**
 * Browser-side FormSubmit send. Used as a fallback when the server-side attempt is rejected
 * (FormSubmit sits behind bot protection that sometimes blocks server-to-server calls).
 * The destination address is already public on the site, so nothing secret is exposed.
 */
export async function sendFormSubmitFromBrowser(fields: Record<string, string>): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(FORMSUBMIT_BROWSER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _template: "table", _captcha: "false", ...fields }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    const explicitFail = data.success === false || data.success === "false";
    return { ok: res.ok && !explicitFail, message: data.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}
