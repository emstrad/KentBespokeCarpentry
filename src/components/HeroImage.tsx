"use client";

import type { StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

/** Mirrors images.deviceSizes in next.config.ts. */
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1440, 1920, 2560];
const QUALITY = 78;
/** How long each photo holds before the cross fade to the next one. */
const HOLD_MS = 6000;

const optimised = (src: string, w: number) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${QUALITY}`;
const srcSetFor = (src: string) =>
  DEVICE_SIZES.map((w) => `${optimised(src, w)} ${w}w`).join(", ");

export type HeroSlide = {
  src: StaticImageData;
  alt: string;
  objectPosition?: string;
  /** Crop focus below 768px, where the card is portrait rather than landscape. */
  objectPositionMobile?: string;
  /** Portrait-native alternative used below 768px, where the desktop crop does not work. */
  mobileSrc?: StaticImageData;
};

type Props = { slides: HeroSlide[] };

const idle = (fn: () => void) =>
  typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback(fn, { timeout: 2000 })
    : window.setTimeout(fn, 600);

/**
 * The hero's LCP image, optionally rotating through several photos.
 *
 * Uses a plain <picture> rather than next/image so the two art-directed crops can be chosen by
 * media query: the browser downloads exactly one of them. next/image cannot do art direction, and
 * rendering two of its components downloads both and costs roughly 0.4s of LCP on mobile.
 * The srcset still points at Next's image optimiser, so AVIF/WebP and per-width resizing are
 * unchanged. The <img> is server-rendered, so the preload scanner finds it immediately.
 *
 * Only the first slide is server rendered and eagerly fetched, so it alone is the LCP candidate.
 * The rest are mounted after the load event and an idle callback, which keeps them off the
 * critical path entirely: rotating costs nothing until the page is already interactive.
 *
 * The card's mask wipe and text stagger wait for the first image to decode (data-loaded="true"
 * on .hero__card), so the wipe always reveals the photo and never a navy box. A 4s safety timer
 * starts the reveal regardless, so a failed image can't hide the H1.
 */
export function HeroImage({ slides }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);

  const reveal = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.ready = "true";
    el.closest(".hero__card")?.setAttribute("data-loaded", "true");
  }, []);

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) reveal();
    const t = window.setTimeout(reveal, 4000);
    return () => window.clearTimeout(t);
  }, [reveal]);

  // Bring in the remaining photos only once the page has finished loading, and never when the
  // visitor has asked for reduced motion: for them the hero stays a single still image.
  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    const start = () => idle(() => { if (!cancelled) setMounted(true); });
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => { cancelled = true; window.removeEventListener("load", start); };
  }, [slides.length]);

  useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => {
      // Rotating in a background tab just burns work the visitor will never see.
      if (!document.hidden) setActive((i) => (i + 1) % slides.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [mounted, slides.length]);

  const styleFor = (s: HeroSlide, first: boolean): CSSProperties => ({
    objectFit: "cover",
    "--obj": s.objectPosition ?? "50% 42%",
    "--obj-m": s.objectPositionMobile ?? s.objectPosition ?? "50% 42%",
    ...(first ? { backgroundImage: `url(${s.mobileSrc?.blurDataURL ?? s.src.blurDataURL})` } : null),
  } as CSSProperties);

  const sources = (s: HeroSlide) => (
    <>
      {s.mobileSrc && <source media="(max-width: 767px)" srcSet={srcSetFor(s.mobileSrc.src)} sizes="100vw" />}
      <source media="(min-width: 768px)" srcSet={srcSetFor(s.src.src)} sizes="100vw" />
    </>
  );

  const [first, ...rest] = slides;

  return (
    <>
      <picture>
        {sources(first)}
        <img
          ref={ref}
          className="hero__img"
          data-active={active === 0 ? "true" : "false"}
          src={optimised(first.src.src, 1200)}
          srcSet={srcSetFor(first.src.src)}
          sizes="100vw"
          alt={first.alt}
          width={first.src.width}
          height={first.src.height}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          style={styleFor(first, true)}
          onLoad={reveal}
        />
      </picture>
      {mounted && rest.map((s, i) => (
        <picture key={s.src.src}>
          {sources(s)}
          {/* Decorative: the first slide already describes the hero to assistive tech. */}
          <img
            className="hero__img"
            data-active={active === i + 1 ? "true" : "false"}
            src={optimised(s.src.src, 1200)}
            srcSet={srcSetFor(s.src.src)}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            width={s.src.width}
            height={s.src.height}
            loading="lazy"
            decoding="async"
            style={styleFor(s, false)}
          />
        </picture>
      ))}
    </>
  );
}
