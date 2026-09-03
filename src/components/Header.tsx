"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAP } from "@/lib/site";
import { PhoneIcon } from "./Icons";
import { SocialLinks } from "./SocialLinks";
import { useUi } from "./UiProvider";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { menuOpen, setMenuOpen, openBooking, bookingOpen } = useUi();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname();

  // Hide on scroll-down, show on scroll-up (never while the menu is open).
  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const hide = y > lastY.current && y > 80 && !menuOpen;
        setHidden(hide);
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  // Close the menu on navigation and reset nav visibility.
  useEffect(() => { setMenuOpen(false); setHidden(false); }, [pathname, setMenuOpen]);

  // Escape closes the menu (when the booking modal isn't the one open).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !bookingOpen) setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, bookingOpen, setMenuOpen]);

  const toggle = () => { setMenuOpen(!menuOpen); setHidden(false); };
  const menuState = menuOpen ? "open" : "closed";

  return (
    <>
      <header className="header" data-nav={hidden ? "hidden" : "shown"} data-menu-open={menuState}>
        <Link href="/" className="header__logo" aria-label="Kent Bespoke Carpentry, home">
          <Image className="logo-navy" src="/assets/logo-navy.png" alt="Kent Bespoke Carpentry Ltd" width={104} height={52} priority />
          <Image className="logo-white" src="/assets/logo-white.png" alt="" width={104} height={52} />
        </Link>
        <div className="header__actions">
          <a className="pill pill--sm pill--outline" href={NAP.phoneHref} aria-label={`Call ${NAP.phoneDisplay}`}>
            <PhoneIcon />
            <span className="hide-m">{NAP.phoneDisplay}</span>
          </a>
          <button type="button" className="pill pill--sm header__book" style={{ padding: "0 20px" }} onClick={openBooking}>Book a visit</button>
          <button type="button" className="header__menu-btn" onClick={toggle} aria-expanded={menuOpen} aria-controls="site-menu" aria-label={menuOpen ? "Close menu" : "Open menu"}>
            <span className="hide-m" aria-hidden="true">{menuOpen ? "Close" : "Menu"}</span>
            <span className="header__menu-icon" aria-hidden="true">+</span>
          </button>
        </div>
      </header>

      <nav id="site-menu" className="menu" data-menu={menuState} aria-label="Main" aria-hidden={!menuOpen}>
        <div className="menu__inner">
          <div className="menu__links">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="menu__link" tabIndex={menuOpen ? 0 : -1} aria-current={pathname === l.href ? "page" : undefined}>{l.label}</Link>
            ))}
          </div>
          <div className="menu__meta row">
            <div><span className="label">Call</span><a href={NAP.phoneHref} tabIndex={menuOpen ? 0 : -1}>{NAP.phoneDisplay}</a></div>
            <div><span className="label">Email</span><a href={NAP.emailHref} tabIndex={menuOpen ? 0 : -1} style={{ wordBreak: "break-all" }}>{NAP.email}</a></div>
            <div><span className="label">Area</span><span className="val">Across Kent</span></div>
            <div><span className="label">Social</span><SocialLinks /></div>
          </div>
        </div>
      </nav>
    </>
  );
}
