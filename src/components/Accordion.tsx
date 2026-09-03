"use client";

import { useId, useState } from "react";
import type { Service } from "@/lib/site";

/** Expand/collapse via CSS grid 0fr → 1fr. No fixed heights, so content never clips. */
export function Accordion({ items }: { items: Service[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const base = useId();
  return (
    <div className="services__list">
      {items.map((s, i) => {
        const isOpen = !!open[i];
        const panelId = `${base}-panel-${i}`;
        const btnId = `${base}-btn-${i}`;
        return (
          <div key={s.title} className="acc" data-acc={isOpen ? "open" : "closed"} data-reveal="" style={{ background: s.bg, color: s.fg, transitionDelay: `${i * 0.06}s` }}>
            <h3 className="acc__btn-wrap" style={{ margin: 0 }}>
              <button type="button" id={btnId} className="acc__btn" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}>
                <span className="acc__title" style={{ fontSize: "clamp(20px, 2.2vw, 34px)", fontWeight: 400, letterSpacing: "-0.01em" }}>{s.title}</span>
                <span className="acc__icon" aria-hidden="true"><span /><span /></span>
              </button>
            </h3>
            <div id={panelId} className="acc__panel" role="region" aria-labelledby={btnId} inert={!isOpen}>
              <div><p>{s.body}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
