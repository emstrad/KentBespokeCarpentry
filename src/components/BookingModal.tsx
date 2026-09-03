"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ACCEPTED_TYPES, MAX_FILES, MAX_FILE_BYTES } from "@/lib/enquiry";
import { sendFormSubmitFromBrowser } from "@/lib/formsubmitClient";
import { TickIcon, UploadIcon } from "./Icons";
import { useUi } from "./UiProvider";

type Step = 1 | 2 | 3 | 4;
type Dir = "fwd" | "back";

const LABELS = ["Step 1 of 3: Your details", "Step 2 of 3: Your ideas", "Step 3 of 3: Inspiration (optional)", "Done"];
const TITLES = ["Book a free visit", "What would you like us to make?", "Show us what you like", "Thank you"];

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [enquiryId, setEnquiryId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
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
    const t = window.setTimeout(() => {
      const el = cardRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      el?.focus();
    }, 80);
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

  const onSend = async (ev: FormEvent) => {
    ev.preventDefault();
    if (ideas.trim().length < 3) { setErrors({ ideas: "Tell us a little about what you have in mind" }); return; }
    setErrors({}); setBusy(true); setApiError(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, ideas, source: "booking", company }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string | null; error?: string; emailed?: boolean; stored?: boolean };
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again or call us.");
      if (data.emailed === false) {
        // Server-side send was rejected; send the notification from the browser instead.
        const fb = await sendFormSubmitFromBrowser({ _subject: `New enquiry: ${name}`, _replyto: email, name, email, phone: phone || "not given", ideas, source: "booking", reference: data.id ?? "not stored" });
        if (!fb.ok && !data.stored) throw new Error(fb.message || "We couldn't send that right now. Please call us on 07494 280614.");
      }
      setEnquiryId(data.id ?? null);
      go(3);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again or call us.");
    } finally { setBusy(false); }
  };

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

  const onFinish = async () => {
    if (!enquiryId) { go(4); return; }
    setBusy(true); setApiError(null);
    try {
      // Upload straight to Vercel Blob from the browser (bypasses the 4.5 MB serverless body limit),
      // then tell the API which files belong to this enquiry. Falls back to names-only if storage is unavailable.
      const uploaded: { name: string; size: number; type: string; url?: string }[] = [];
      let storage = true;
      const { upload } = await import("@vercel/blob/client");
      for (const f of files) {
        const meta = { name: f.name, size: f.size, type: f.type || "application/octet-stream" };
        if (!storage) { uploaded.push(meta); continue; }
        try {
          const blob = await upload(`enquiries/${enquiryId}/${f.name}`, f, { access: "public", handleUploadUrl: `/api/enquiry/${enquiryId}/attachments`, multipart: false });
          uploaded.push({ ...meta, url: blob.url });
        } catch { storage = false; uploaded.push(meta); }
      }
      const res = await fetch(`/api/enquiry/${enquiryId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attachments: uploaded }),
      });
      if (!res.ok) { const d = (await res.json().catch(() => ({}))) as { error?: string }; throw new Error(d.error || "We couldn't attach those files. Your enquiry has still been sent."); }
      go(4);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "We couldn't attach those files. Your enquiry has still been sent.");
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
          <span data-on="true" /><span data-on={step >= 2 ? "true" : "false"} /><span data-on={step >= 3 ? "true" : "false"} />
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
              <textarea id="bk-ideas" name="ideas" rows={5} required data-autofocus placeholder="e.g. A media wall for the living room, around 3m wide, with lit alcoves either side…" value={ideas} onChange={(e) => setIdeas(e.target.value)} aria-invalid={!!errors.ideas} aria-describedby={errors.ideas ? "bk-ideas-err" : undefined} />
              {err("ideas")}
            </div>
            {apiError && <p className="field__err" role="alert">{apiError}</p>}
            <div className="modal__btns">
              <button type="button" className="pill pill--lg pill--outline-navy" style={{ padding: "0 22px" }} onClick={() => go(1, "back")}>← Back</button>
              <button type="submit" className="pill pill--lg pill--navy grow" disabled={busy}>{busy ? "Sending…" : "Send to our team"}</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="modal__step" data-dir={dir} style={{ gap: 20 }}>
            <div className="modal__ok" role="status">
              <span className="tick"><TickIcon /></span>
              <p><strong>Sent to our team, thank you.</strong> We&apos;ll call or email within one working day.</p>
            </div>
            <label className="drop" htmlFor="bk-files">
              <UploadIcon />
              <span className="t">Add photos, sketches or links to things you like</span>
              <span className="s">Images or PDFs · optional · up to {MAX_FILES} files, 10 MB each</span>
              <input id="bk-files" type="file" multiple accept="image/*,.pdf,application/pdf" data-autofocus onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
            </label>
            {files.length > 0 && (
              <ul className="files" aria-label="Selected files">
                {files.map((f, i) => (
                  <li key={`${f.name}-${f.size}`}>
                    <span>{f.name}</span>
                    <span className="sz">{fmtSize(f.size)}</span>
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button>
                  </li>
                ))}
              </ul>
            )}
            {apiError && <p className="field__err" role="alert">{apiError}</p>}
            <div className="modal__btns">
              <button type="button" className="pill pill--lg pill--outline-navy" style={{ padding: "0 22px" }} onClick={onClose} disabled={busy}>{files.length ? "Cancel" : "Skip, I'm done"}</button>
              {files.length > 0 && (
                <button type="button" className="pill pill--lg pill--navy grow" onClick={onFinish} disabled={busy}>{busy ? "Uploading…" : "Send inspiration"}</button>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="modal__done" role="status">
            <span className="tick tick--lg"><TickIcon size={26} /></span>
            <p>All received. We&apos;ll be in touch within one working day to arrange a visit.</p>
            <button type="button" className="pill pill--lg pill--navy" data-autofocus onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
