"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll parallax fallback. Browsers with `animation-timeline: view()` (Chromium, Safari 26+)
 * drive the image drift purely in CSS. Everywhere else this writes a 0..1 progress into a CSS
 * custom property (--p on [data-drift], --hp on the hero image) that globals.css maps to the
 * same translate values, so the photos move with the scroll in every browser.
 */
export function Parallax() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let drift = Array.from(document.querySelectorAll<HTMLElement>("[data-drift]"));
    let hero = Array.from(document.querySelectorAll<HTMLElement>(".hero__img"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of drift) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty("--p", p.toFixed(4));
      }
      for (const el of hero) {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
        el.style.setProperty("--hp", p.toFixed(4));
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const refresh = () => { drift = Array.from(document.querySelectorAll("[data-drift]")); hero = Array.from(document.querySelectorAll(".hero__img")); schedule(); };
    const mo = new MutationObserver(refresh);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => { mo.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); cancelAnimationFrame(raf); };
  }, [pathname]);
  return null;
}
