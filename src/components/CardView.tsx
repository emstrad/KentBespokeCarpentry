"use client";

import { useEffect, useRef } from "react";

/**
 * Translucent "View" disc that drifts towards the cursor around the card's centre.
 * Only visible (and only listens) on hover-capable devices; CSS hides it elsewhere.
 */
export function CardView() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const card = el?.parentElement;
    if (!el || !card || !window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const FOLLOW = 0.35; // fraction of the distance from centre to cursor
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * FOLLOW;
      ty = (e.clientY - r.top - r.height / 2) * FOLLOW;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; el.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`; });
    };
    const leave = () => { el.style.translate = "0px 0px"; };
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", leave);
    return () => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, []);

  return <div ref={ref} className="card__view" aria-hidden="true">View</div>;
}
