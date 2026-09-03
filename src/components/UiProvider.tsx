"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Ui = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  bookingOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
  /** Element that opened the modal, so focus can be returned on close. */
  openerRef: React.MutableRefObject<HTMLElement | null>;
};

const UiContext = createContext<Ui | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const openBooking = useCallback(() => {
    openerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    setMenuOpen(false);
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  // Single source of truth for the body scroll lock.
  useEffect(() => {
    const lock = menuOpen || bookingOpen;
    document.body.dataset.lock = lock ? "true" : "";
    return () => { document.body.dataset.lock = ""; };
  }, [menuOpen, bookingOpen]);

  const value = useMemo(() => ({ menuOpen, setMenuOpen, bookingOpen, openBooking, closeBooking, openerRef }), [menuOpen, bookingOpen, openBooking, closeBooking]);
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>");
  return ctx;
}
