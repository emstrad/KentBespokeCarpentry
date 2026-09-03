"use client";

import { useState, type FormEvent } from "react";
import { sendFormSubmitFromBrowser } from "@/lib/formsubmitClient";

type State = { status: "idle" | "busy" | "sent" | "error"; message?: string };

/** Contact page form: same submit path as the booking modal (POST /api/enquiry, source: "contact"). */
export function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    setState({ status: "busy" });
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone") ?? "",
          ideas: fd.get("message") ?? "", source: "contact", company: fd.get("company") ?? "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; emailed?: boolean; stored?: boolean; id?: string | null };
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again or call us.");
      if (data.emailed === false) {
        const name = String(fd.get("name") ?? ""), email = String(fd.get("email") ?? "");
        const fb = await sendFormSubmitFromBrowser({ _subject: `New enquiry: ${name}`, _replyto: email, name, email, phone: String(fd.get("phone") || "not given"), ideas: String(fd.get("message") || "not given"), source: "contact", reference: data.id ?? "not stored" });
        if (!fb.ok && !data.stored) throw new Error(fb.message || "We couldn't send that right now. Please call us on 07494 280614.");
      }
      form.reset();
      setState({ status: "sent", message: "Thanks, we’ll be in touch within one working day." });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong. Please try again or call us." });
    }
  };

  const busy = state.status === "busy";
  return (
    <form className="form d2" data-reveal="" onSubmit={onSubmit} noValidate={false}>
      <div className="field field--dark">
        <label htmlFor="kbc-name">Name</label>
        <input id="kbc-name" name="name" type="text" required autoComplete="name" minLength={2} />
      </div>
      <div className="field field--dark">
        <label htmlFor="kbc-email">Email</label>
        <input id="kbc-email" name="email" type="email" required autoComplete="email" inputMode="email" />
      </div>
      <div className="field field--dark">
        <label htmlFor="kbc-phone">Phone <span className="opt">(optional)</span></label>
        <input id="kbc-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
      </div>
      <div className="field field--dark">
        <label htmlFor="kbc-msg">What are you thinking of?</label>
        <textarea id="kbc-msg" name="message" rows={5} />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="kbc-company">Company</label>
        <input id="kbc-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form__foot">
        <span className="form__note" role={state.status === "error" ? "alert" : "status"} aria-live="polite">{state.message ?? ""}</span>
        <button type="submit" className="pill pill--white" style={{ padding: "0 28px" }} disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</button>
      </div>
    </form>
  );
}
