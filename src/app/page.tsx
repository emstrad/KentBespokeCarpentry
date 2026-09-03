import type { Metadata } from "next";
import Link from "next/link";
import { Banner } from "@/components/Banner";
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Showcase } from "@/components/Showcase";
import { PROJECTS } from "@/lib/site";
import heroImage from "../../public/assets/pergola-deck.jpg";

export const metadata: Metadata = {
  title: { absolute: "Kent Bespoke Carpentry Ltd | Bespoke joinery, made in Kent" },
  description: "Kent Bespoke Carpentry design, build and install bespoke joinery across Kent: media walls, staircases, pergolas, garden rooms and fitted furniture.",
  alternates: { canonical: "/" },
  openGraph: { title: "Kent Bespoke Carpentry Ltd | Bespoke joinery, made in Kent", url: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero
        variant="home"
        src={heroImage}
        alt="Timber pergola and decking built by Kent Bespoke Carpentry"
        eyebrow="Kent Bespoke Carpentry Ltd"
        words={[
          { text: "Bespoke", delay: 0.55 },
          { text: "joinery,", delay: 0.65, br: true },
          { text: "made", delay: 0.75, light: true },
          { text: "in", delay: 0.85, light: true },
          { text: "Kent.", delay: 0.95, light: true },
        ]}
      />

      <section className="section intro" aria-labelledby="intro-h">
        <h2 id="intro-h" className="h-md" data-reveal="" style={{ maxWidth: "20ch" }}>
          Joinery that fits your home<br /><span className="light">exactly, first time.</span>
        </h2>
        <p className="lede d15" data-reveal="">
          From media walls and staircases to pergolas and garden rooms, we take every project from first sketch to final fix ourselves: one team, one standard, across Kent.
        </p>
      </section>

      <Showcase />

      <section className="section projects" aria-labelledby="recent-h">
        <div className="projects__head">
          <h2 id="recent-h" className="h-xl" data-reveal="">Recent work<br /><span className="light">across Kent</span></h2>
          <Link href="/projects" className="ul-link" data-reveal=""><span>View all projects →</span><span /></Link>
        </div>
        <div className="projects__grid">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.slug} project={p} href="/projects" headingLevel="h3" />
          ))}
        </div>
      </section>

      <Banner title="Have a project in mind?" sub="Let's talk it through." />
    </>
  );
}
