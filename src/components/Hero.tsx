import Image from "next/image";
import { NAP } from "@/lib/site";
import { BookButton } from "./BookButton";
import { ChevronDown } from "./Icons";

type Word = { text: string; delay: number; light?: boolean; br?: boolean };

type Props = {
  src: string;
  alt: string;
  eyebrow: string;
  words: Word[];
  /** Home variant: mask wipe, CTAs, Scroll tab. About variant: scale only. */
  variant: "home" | "about";
  objectPosition?: string;
};

export function Hero({ src, alt, eyebrow, words, variant, objectPosition = "50% 42%" }: Props) {
  const home = variant === "home";
  return (
    <section className="hero" aria-labelledby="page-h1">
      <div className={home ? "hero__card hero__card--mask" : "hero__card"}>
        <div className={home ? "hero__img-wrap" : "hero__img-wrap hero__img-wrap--fast"}>
          <Image
            className="hero__img"
            src={src}
            alt={alt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={78}
            style={{ objectFit: "cover", objectPosition }}
          />
        </div>
        <div className={home ? "hero__tint" : "hero__tint hero__tint--45"} />
        <div className="hero__content">
          <p className={home ? "eyebrow" : "eyebrow eyebrow--early"}>{eyebrow}</p>
          <h1 id="page-h1" className="h-display hero__h1">
            {words.map((w, i) => (
              <span key={i}>
                <span className={w.light ? "hero__word light" : "hero__word"} style={{ animationDelay: `${w.delay}s` }}>{w.text}</span>
                {w.br ? <br /> : " "}
              </span>
            ))}
          </h1>
          {home && (
            <div className="hero__ctas">
              <BookButton className="pill pill--white">Book a free visit</BookButton>
              <a className="pill pill--outline-white" href={NAP.phoneHref}>Call {NAP.phoneDisplay}</a>
            </div>
          )}
        </div>
        {home && (
          <div className="hero__scroll hide-m" aria-hidden="true">
            <div><span>Scroll</span><ChevronDown /></div>
          </div>
        )}
      </div>
    </section>
  );
}
