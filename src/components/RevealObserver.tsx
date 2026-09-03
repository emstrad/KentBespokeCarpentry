"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Adds data-reveal="in" once per element when it enters the viewport.
 * Elements opt in with `data-reveal=""` (server-rendered), so no per-element client component is needed.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const all = () => document.querySelectorAll<HTMLElement>('[data-reveal=""]');
    if (reduce || !("IntersectionObserver" in window)) {
      all().forEach((el) => el.setAttribute("data-reveal", "in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.setAttribute("data-reveal", "in"); io.unobserve(e.target); }
      }
    }, { rootMargin: "0px 0px -10% 0px" });
    const observe = () => all().forEach((el) => io.observe(el));
    observe();
    let t: number | undefined;
    const mo = new MutationObserver(() => { window.clearTimeout(t); t = window.setTimeout(observe, 30); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); window.clearTimeout(t); };
  }, [pathname]);
  return null;
}
