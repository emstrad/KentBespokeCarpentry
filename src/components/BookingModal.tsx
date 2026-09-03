"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ACCEPTED_TYPES, MAX_FILES, MAX_FILE_BYTES } from "@/lib/enquiry";
import { sendFormSubmitFromBrowser } from "@/lib/formsubmitClient";
import { TickIcon, UploadIcon } from "./Icons";
import { useUi } from "./UiProvider";

type Step = 1 | 2 | 3;
type Dir = "fwd" | "back";

const LABELS = ["Step 1 of 2: Your details", "Step 2 of 2: Your ideas", "Done"];
const TITLES = ["Book a free visit", "What would you like us to make?", "Thank you"];

const fmtSize = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`);

export function BookingModal() {
  const { bookingOpen, closeBooking, openerRef } = useUi();
  if (!bookingOpen) return null;
  return <Dialog onClose={() => { closeBooking(); openerRef.current?.focus?.(); }} />;
}

function Dialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [dir, setDir] = useState<Dir>("fwd");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ideas, setIdeas] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<false | "sending" | "uploading">(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mailNote, setMailNote] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = "booking-title";

  // Escape closes; Tab is trapped inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab" || !cardRef.current) return;
      const els = cardRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus management per step.
  useEffect(() => {
    const t = window.setTimeout(() => cardRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [step]);

  const go = (to: Step, d: Dir = "fwd") => { setDir(d); setStep(to); setApiError(null); };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Please enter your name";
    if (phone.trim().length < 7) e.phone = "Please enter a phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Please enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onNext = (ev: FormEvent) => { ev.preventDefault(); if (validateStep1()) go(2); };

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    const errs: string[] = [];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) { errs.push(`Up to ${MAX_FILES} files`); break; }
      if (f.size > MAX_FILE_BYTES) { errs.push(`${f.name} is over 10 MB`); continue; }
      if (!(ACCEPTED_TYPES.includes(f.type) || f.type.startsWith("image/"))) { errs.push(`${f.name}: images or PDFs only`); continue; }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setFiles(next);
    setApiError(errs.length ? errs.join(". ") : null);
  };

  /**
   * One click does everything: store the enquiry, upload any photos, then send a single email
   * with the details and file links. Nothing is sent until this button is pressed, and nothing
   * is left pending afterwards.
   */
  const onSend = async (ev: FormEvent) => {
    ev.preventDefault();
    if (ideas.trim().length < 3) { setErrors({ ideas: "Tell us a little about what you have in mind" }); return; }
    setErrors({}); setApiError(null); setMailNote(null);
    setBusy("sending");
    try {
      // 1. Store the enquiry (email deferred so files can be included).
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, ideas, source: "booking", company, notify: false }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string | null; error?: string; emailed?: boolean; stored?: boolean; deferred?: boolean; emailDetail?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again or call us.");

      const baseFields = { _subject: `New enquiry: ${name}`, _replyto: email, name, email, phone: phone || "not given", ideas, source: "booking" };

      if (!data.id) {
        // Database unavailable: the API has already tried to email; fall back from the browser if needed.
        if (data.emailed === false) {
          const fb = await sendFormSubmitFromBrowser({ ...baseFields, files: files.length ? files.map((f) => `${f.name} (not stored)`).join("\n") : "none", reference: "not stored" });
          if (!fb.ok) throw new Error(fb.message || "We couldn't send that right now. Please call us on 07494 280614.");
        }
        go(3);
        return;
      }

      // 2. Upload photos straight to Blob storage (skipped gracefully if storage isn't configured).
      const uploaded: { name: string; size: number; type: string; url?: string; pathname?: string }[] = [];
      if (files.length) {
        setBusy("uploading");
        let storage = true;
        const { upload } = await import("@vercel/blob/client");
        for (const f of files) {
          const meta = { name: f.name, size: f.size, type: f.type || "application/octet-stream" };
          if (!storage) { uploaded.push(meta); continue; }
          try {
            const blob = await upload(`enquiries/${data.id}/${f.name}`, f, { access: "private", handleUploadUrl: `/api/enquiry/${data.id}/attachments`, multipart: false });
            uploaded.push({ ...meta, url: blob.url, pathname: blob.pathname });
          } catch { storage = false; uploaded.push(meta); }
        }
      }

      // 3. Send the one notification email.
      setBusy("sending");
      const sendRes = await fetch(`/api/enquiry/${data.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attachments: uploaded }),
      });
      const sent = (await sendRes.json().catch(() => ({}))) as { emailed?: boolean; emailDetail?: string; mail?: Record<string, string>; error?: string };
      if (!sendRes.ok) throw new Error(sent.error || "Something went wrong. Please try again or call us.");
      if (sent.emailed === false && sent.mail) {
        const fb = await sendFormSubmitFromBrowser(sent.mail);
        if (fb.ok) {
          fetch(`/api/enquiry/${data.id}/send`, { method: "PATCH" }).catch(() => undefined);
        } else {
          console.warn("[enquiry] email not confirmed:", fb.message ?? sent.emailDetail);
          setMailNote("Your enquiry has been saved. If you don't hear from us within one working day, please call 07494 280614.");
        }
      }
      go(3);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again or call us.");
    } finally { setBusy(false); }
  };

  const err = (k: string) => (errors[k] ? <span className="field__err" id={`bk-${k}-err`} role="alert">{errors[k]}</span> : null);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal__card" ref={cardRef}>
        <div className="modal__head">
          <div>
            <span className="modal__step-label">{LABELS[step - 1]}</span>
            <h2 id={titleId} className="modal__title">{TITLES[step - 1]}</h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal__dots" aria-hidden="true">
          <span data-on="true" /><span data-on={step >= 2 ? "true" : "false"} />
        </div>

        {step === 1 && (
          <form className="modal__step" data-dir={dir} onSubmit={onNext} noValidate>
            <div className="field field--light">
              <label htmlFor="bk-name">Name</label>
              <input id="bk-name" name="name" type="text" required autoComplete="name" data-autofocus value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "bk-name-err" : undefined} />
              {err("name")}
            </div>
            <div className="cols" style={{ gap: 16 }}>
              <div className="field field--light">
                <label htmlFor="bk-phone">Phone</label>
                <input id="bk-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "bk-phone-err" : undefined} />
                {err("phone")}
              </div>
              <div className="field field--light">
                <label htmlFor="bk-email">Email</label>
                <input id="bk-email" name="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "bk-email-err" : undefined} />
                {err("email")}
              </div>
            </div>
            <div className="hp" aria-hidden="true">
              <label htmlFor="bk-company">Company</label>
              <input id="bk-company" name="company" type="text" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <button type="submit" className="pill pill--lg pill--navy" style={{ marginTop: 6 }}>Continue →</button>
            <p className="modal__hint">Takes under a minute. We only use this to get back to you.</p>
          </form>
        )}

        {step === 2 && (
          <form className="modal__step" data-dir={dir} onSubmit={onSend} noValidate>
            <div className="field field--light">
              <label htmlFor="bk-ideas">What are you thinking of?</label>
              <textarea id="bk-ideas" name="ideas" rows={4} required data-autofocus placeholder="e.g. A media wall for the living room, around 3m wide, with lit alcoves either side…" value={ideas} onChange={(e) => setIdeas(e.target.value)} aria-invalid={!!errors.ideas} aria-describedby={errors.ideas ? "bk-ideas-err" : undefined} />
              {err("ideas")}
            </div>
            <label className="drop" htmlFor="bk-files">
              <UploadIcon />
              <span className="t">Add photos, sketches or things you like</span>
              <span className="s">Images or PDFs · optional · up to {MAX_FILES} files, 10 MB each</span>
              <input id="bk-files" type="file" multiple accept="image/*,.pdf,application/pdf" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} disabled={!!busy} />
            </label>
            {files.length > 0 && (
              <ul className="files" aria-label="Selected files">
                {files.map((f, i) => (
                  <li key={`${f.name}-${f.size}`}>
                    <span>{f.name}</span>
                    <span className="sz">{fmtSize(f.size)}</span>
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))} disabled={!!busy}>×</button>
                  </li>
                ))}
              </ul>
            )}
            {apiError && <p className="field__err" role="alert">{apiError}</p>}
            <div className="modal__btns">
              <button type="button" className="pill pill--lg pill--outline-navy" style={{ padding: "0 22px" }} onClick={() => go(1, "back")} disabled={!!busy}>← Back</button>
              <button type="submit" className="pill pill--lg pill--navy grow" disabled={!!busy}>
                {busy === "uploading" ? "Uploading photos…" : busy === "sending" ? "Sending…" : "Send to our team"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="modal__done" role="status">
            <span className="tick tick--lg"><TickIcon size={26} /></span>
            <p>All received. We&apos;ll be in touch within one working day to arrange a visit.</p>
            {mailNote && <p className="modal__mailnote">{mailNote}</p>}
            <button type="button" className="pill pill--lg pill--navy" data-autofocus onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
