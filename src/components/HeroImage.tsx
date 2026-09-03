"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef } from "react";

type Props = { src: StaticImageData; alt: string; objectPosition: string };

/**
 * The hero's LCP image. The card's mask wipe and the text stagger wait for this image to be
 * decoded (data-loaded="true" on .hero__card), so the wipe always reveals the photo and never a
 * navy box. A 4s safety timer starts the reveal regardless, so a failed image can't hide the H1.
 */
export function HeroImage({ src, alt, objectPosition }: Props) {
  const ref = useRef<HTMLImageElement>(null);

  const reveal = useCallback(() => {
    ref.current?.closest(".hero__card")?.setAttribute("data-loaded", "true");
  }, []);

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) reveal();
    const t = window.setTimeout(reveal, 4000);
    return () => window.clearTimeout(t);
  }, [reveal]);

  return (
    <Image
      ref={ref}
      className="hero__img"
      src={src}
      alt={alt}
      fill
      priority
      fetchPriority="high"
      placeholder="blur"
      sizes="100vw"
      quality={78}
      style={{ objectFit: "cover", objectPosition }}
      onLoad={reveal}
    />
  );
}
