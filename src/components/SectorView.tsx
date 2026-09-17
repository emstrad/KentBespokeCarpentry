import Image from "next/image";
import { Banner } from "@/components/Banner";
import { Faqs } from "@/components/Faqs";
import { JsonLd, faqJsonLd } from "@/components/JsonLd";
import { Crumb, PageHead } from "@/components/PageHead";
import { ProjectCard } from "@/components/ProjectCard";
import { RelatedLinks } from "@/components/RelatedLinks";
import { SERVICE_PAGES } from "@/lib/services";
import type { SectorPage } from "@/lib/sectors";
import { PROJECTS } from "@/lib/site";

export function SectorView({ sector }: { sector: SectorPage }) {
  const projects = PROJECTS.filter((p) => p.sector === sector.slug);
  const shown = projects.length ? projects : PROJECTS;
  return (
    <>
      <JsonLd data={faqJsonLd(sector.faqs)} />
      <Crumb href="/" label="Home" />
      <PageHead eyebrow={sector.eyebrow} h1={sector.h1} intro={sector.intro} />

      <section className="band" aria-hidden="true">
        <div className="band__img" data-drift="">
          <Image src={sector.hero} alt={sector.heroAlt} fill sizes="100vw" quality={74} style={{ objectFit: "cover" }} />
        </div>
      </section>

      <section className="section approach" aria-labelledby="who-h">
        <h2 id="who-h" className="h-md" data-reveal="">Who we work for</h2>
        <div className="cols-3" style={{ gap: "clamp(24px, 3vw, 48px)" }}>
          {sector.audience.map((a, i) => (
            <div key={a.heading} className="approach__item" data-reveal="" style={{ transitionDelay: `${i * 0.12}s` }}>
              <h3>{a.heading}</h3>
              <p>{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {sector.sections.map((sec, i) => (
        <section key={sec.heading} className="section prose" aria-labelledby={`sec-${i}`}>
          <h2 id={`sec-${i}`} className="h-md" data-reveal="">{sec.heading}</h2>
          <div className="prose__body">
            {sec.body.map((p, j) => (
              <p key={j} className="body-lg" data-reveal="" style={{ transitionDelay: `${j * 0.1}s` }}>{p}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="section approach" aria-labelledby="how-h">
        <h2 id="how-h" className="h-md" data-reveal="">How it works</h2>
        <ol className="steps">
          {sector.process.map((p, i) => (
            <li key={p.n} data-reveal="" style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className="steps__n">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section projects" aria-labelledby="work-h">
        <h2 id="work-h" className="h-xl" data-reveal="">Recent work<br /><span className="light">across Kent</span></h2>
        <div className="projects__grid">
          {shown.slice(0, 6).map((p) => <ProjectCard key={p.slug} project={p} href="/projects" headingLevel="h3" />)}
        </div>
      </section>

      <Faqs items={sector.faqs} />

      <RelatedLinks
        heading="What we do"
        items={[
          ...SERVICE_PAGES.map((s) => ({ href: `/services/${s.slug}`, label: s.label, note: s.eyebrow })),
          { href: "/areas", label: "Areas we cover", note: "Kent and the South East" },
        ]}
      />

      <Banner title="Planning a project?" sub="Let's talk it through." />
    </>
  );
}
