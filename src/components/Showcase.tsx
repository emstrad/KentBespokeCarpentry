import Image from "next/image";
import Link from "next/link";

const STEPS = [
  {
    n: "01 / Design", tone: "slide--navy", src: "/assets/media-wall.jpg", alt: "Bespoke media wall with lit display niches",
    title: "Measured, drawn and agreed before we cut a thing.",
    copy: "Every job starts with a site visit and a drawing. We work through proportions, materials and finish with you, so the quote is fixed and there are no surprises later.",
    cta: { href: "/about", label: "How we work", cls: "pill pill--outline-white-soft" },
  },
  {
    n: "02 / Build", tone: "slide--white", src: "/assets/pergola-octagon.jpg", alt: "Octagonal pergola frame under construction",
    title: "Made by carpenters who care about the joins nobody sees.",
    copy: "Structural timber, hardwood or painted MDF: we build in the workshop where we can and on site where we must, to the same standard either way.",
    cta: { href: "/projects", label: "See recent builds", cls: "pill pill--navy" },
  },
  {
    n: "03 / Install", tone: "slide--black", src: "/assets/fireplace-wall.jpg", alt: "Finished fireplace media wall with lit alcoves",
    title: "Fitted cleanly, finished properly, left ready to live with.",
    copy: "Tidy site, protected floors, and a final walk-round with you before we call it done. We don't leave until it's right.",
    cta: { href: "/contact", label: "Get a quote", cls: "pill pill--white-on-black" },
  },
];

const IMG_SIZES = "(min-width: 768px) 50vw, 100vw";

/**
 * Design › Build › Install. On ≥768px browsers with scroll-driven animation support this is a
 * 600vh sticky counter-scroll (see globals.css). Everywhere else it is three stacked cards, each
 * with its own image.
 */
export function Showcase() {
  return (
    <section className="showcase" aria-label="How we work: design, build, install">
      <div className="showcase__sticky">
        <div className="showcase__wrap">
          <div className="showcase__col showcase__col--left">
            {STEPS.map((s, i) => (
              <article key={s.n} className={`slide ${s.tone}`}>
                <div className="slide__mobimg" data-drift="">
                  <Image src={s.src} alt={s.alt} fill sizes="100vw" quality={72} style={{ objectFit: "cover" }} />
                </div>
                <div className="slide__body" data-fade={i + 1}>
                  <p className="eyebrow" data-reveal="">{s.n}</p>
                  <h2 className="h-sm d1" data-reveal="">{s.title}</h2>
                  <p className="copy d2" data-reveal="">{s.copy}</p>
                  <div className="d3" data-reveal=""><Link href={s.cta.href} className={s.cta.cls}>{s.cta.label}</Link></div>
                </div>
              </article>
            ))}
          </div>
          <div className="showcase__col showcase__col--right" aria-hidden="true">
            {[...STEPS].reverse().map((s) => (
              <div key={s.n} className="showcase__img">
                <Image src={s.src} alt="" fill sizes={IMG_SIZES} quality={72} style={{ objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
