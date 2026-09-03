import type { Metadata } from "next";
import { Banner } from "@/components/Banner";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recent projects — media walls, staircases, pergolas across Kent",
  description: "A selection of bespoke joinery designed, built and installed by Kent Bespoke Carpentry: media walls, staircases, pergolas, garden bars and fitted furniture around Kent.",
  alternates: { canonical: "/projects" },
  openGraph: { title: "Recent projects — Kent Bespoke Carpentry", url: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <section className="projects" style={{ padding: "clamp(120px,16vw,200px) var(--gutter) clamp(56px,10vw,120px)" }} aria-labelledby="page-h1">
        <h1 id="page-h1" className="h-display" data-reveal="">Recent work<br /><span className="light">across Kent</span></h1>
        <p className="body-lg d1" data-reveal="" style={{ maxWidth: "56ch", lineHeight: 1.55, color: "rgba(10,10,10,.72)" }}>
          A selection of what we&apos;ve designed, built and installed for homes around the county. Every one drawn up with the client, made by us, and fitted by the same hands.
        </p>
        {PROJECTS.map((p) => (
          <ProjectCard key={p.slug} project={p} wide headingLevel="h2" />
        ))}
      </section>
      <Banner title="Something similar in mind?" sub="We'd like to hear about it." />
    </>
  );
}
