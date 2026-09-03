import type { Metadata } from "next";
import Image from "next/image";
import { Accordion } from "@/components/Accordion";
import { Banner } from "@/components/Banner";
import { Hero } from "@/components/Hero";
import { SERVICES } from "@/lib/site";
import heroImage from "../../../public/assets/staircase.jpg";

export const metadata: Metadata = {
  title: "About: a small Kent carpentry team that does the whole job",
  description: "Kent Bespoke Carpentry is a small team that designs, builds and fits bespoke joinery itself: fixed quotes, one point of contact, and a finish you can live with.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Kent Bespoke Carpentry", url: "/about" },
};

const APPROACH = [
  { n: "01", title: "Fixed, honest quotes", body: "Drawn and priced before we start. The number you agree is the number you pay." },
  { n: "02", title: "One team, start to finish", body: "The carpenter who measures is the carpenter who builds and fits. Nothing gets lost in between." },
  { n: "03", title: "Finished properly", body: "Clean lines, tight joins, tidy site. We walk it round with you before we sign it off." },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        variant="about"
        src={heroImage}
        alt="Softwood staircase with glass balustrade, mid-installation"
        eyebrow="About us"
        objectPosition="50% 50%"
        words={[
          { text: "Built on", delay: 0.2, br: true },
          { text: "craft and care.", delay: 0.35, light: true },
        ]}
      />

      <section className="section" aria-labelledby="story-h">
        <div className="cols" style={{ gap: "clamp(24px,4vw,64px)", alignItems: "start" }}>
          <h2 id="story-h" className="h-md" data-reveal="">A small Kent team<br /><span className="light">that does the whole job.</span></h2>
          <div className="body-lg" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p className="d1" data-reveal="">Kent Bespoke Carpentry was set up to do one thing well: joinery that is designed around the home it&apos;s going into, built by the people who drew it, and fitted by the same people again.</p>
            <p className="d2" data-reveal="">That means no hand-offs, no sub-contractor surprises and one point of contact from the first measure to the last coat of paint. It&apos;s slower to scale, and better to live with.</p>
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
