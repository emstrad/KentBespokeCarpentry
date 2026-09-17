import type { Metadata } from "next";
import Image from "next/image";
import { Accordion } from "@/components/Accordion";
import { Banner } from "@/components/Banner";
import { Hero } from "@/components/Hero";
import { SERVICES } from "@/lib/site";
import heroImage from "../../../public/assets/staircase.jpg";

export const metadata: Metadata = {
  title: "About: fifteen years of carpentry and joinery in Kent",
  description: "Kent Bespoke Carpentry has covered first fix, second fix and bespoke joinery across Kent for fifteen years. Fully insured, fixed quotes and one point of contact throughout.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Kent Bespoke Carpentry", url: "/about" },
};

const APPROACH = [
  { n: "01", title: "Surveyed and fixed-priced", body: "Every project is measured and drawn before it is priced, and the quoted figure is the figure you pay." },
  { n: "02", title: "One team, every stage", body: "First fix, second fix and bespoke joinery handled by the same carpenters, without three separate trades to co-ordinate." },
  { n: "03", title: "Finished and handed over", body: "Consistent joints, clean lines and a tidy site, with a final inspection walked through before the project is signed off." },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        variant="about"
        slides={[{ src: heroImage, alt: "Softwood staircase with glass balustrade, mid-installation", objectPosition: "50% 50%", objectPositionMobile: "55% 55%" }]}
        eyebrow="About us"
        sub="Fifteen years of carpentry and joinery across Kent."
        words={[
          { text: "Built on", delay: 0.2, br: true },
          { text: "craft and care.", delay: 0.35, light: true },
        ]}
      />

      <section className="section" aria-labelledby="story-h">
        <div className="cols" style={{ gap: "clamp(24px,4vw,64px)", alignItems: "start" }}>
          <h2 id="story-h" className="h-md" data-reveal="">Fifteen years of carpentry,<br /><span className="light">start to finish.</span></h2>
          <div className="body-lg" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p className="d1" data-reveal="">Kent Bespoke Carpentry has worked across the county for fifteen years, taking the carpentry on a project from end to end: the structural first fix, the second fix that finishes a room, and the bespoke joinery in between.</p>
            <p className="d2" data-reveal="">The carpenter who measures a project is the carpenter who builds and installs it, so there are no hand-offs and one point of contact throughout. We work directly for homeowners and alongside builders and main contractors on larger projects, and we are fully insured.</p>
          </div>
        </div>
      </section>

      <section className="about-photos" aria-label="Recent work">
        <div className="cols" style={{ gap: 24 }}>
          <div className="photo" data-drift="" data-reveal="">
            <Image src="/assets/garden-bar.jpg" alt="Timber garden bar with slatted front and hatch" fill sizes="(min-width: 768px) 50vw, 100vw" quality={74} style={{ objectFit: "cover" }} />
          </div>
          <div className="photo photo--offset d15" data-drift="" data-reveal="">
            <Image src="/assets/pergola-deck.jpg" alt="Pergola with slatted screens over raised decking" fill sizes="(min-width: 768px) 50vw, 100vw" quality={74} style={{ objectFit: "cover" }} />
          </div>
        </div>
      </section>

      <section className="section approach" aria-labelledby="how-h">
        <h2 id="how-h" className="h-md" data-reveal="" style={{ maxWidth: "20ch" }}>How we work</h2>
        <div className="cols-3" style={{ gap: "clamp(24px,3vw,48px)" }}>
          {APPROACH.map((a, i) => (
            <div key={a.n} className={`approach__item${i === 1 ? " d12" : i === 2 ? " d24" : ""}`} data-reveal="">
              <span>{a.n}</span>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="services" aria-labelledby="make-h">
        <h2 id="make-h" className="h-md" data-reveal="" style={{ maxWidth: "20ch" }}>What we make</h2>
        <Accordion items={SERVICES} />
      </section>

      <Banner title="Have a project in mind?" sub="Let's talk it through." />
    </>
  );
}
