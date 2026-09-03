"use client";

import { useUi } from "./UiProvider";

export function BookButton({ className, children }: { className: string; children: React.ReactNode }) {
  const { openBooking } = useUi();
  return (
    <button type="button" className={className} onClick={openBooking}>
      {children}
    </button>
  );
}
