import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/site";
import { CardView } from "./CardView";

const SIZES = "(min-width: 768px) 33vw, 100vw";

type Props = { project: Project; href?: string; headingLevel?: "h2" | "h3"; delay?: string };

/** 2.5:1 image card with scroll-driven parallax drift. Hover "View" circle only on hover-capable devices. */
export function ProjectCard({ project: p, href, headingLevel = "h3", delay }: Props) {
  const H = headingLevel;
  const inner = (
    <>
      <Image src={p.src} alt={p.alt} fill sizes={SIZES} quality={74} style={{ objectFit: "cover" }} />
      <div className="card__shade" />
      <div className="card__meta">
        <div>
          <span className="card__type">{p.type}</span>
          <H className="card__title">{p.title}</H>
        </div>
        <span className="card__num">/{p.num}</span>
      </div>
      {href && <CardView />}
    </>
  );
  const cls = `card${delay ?? ""}`;
  if (href) {
    return (
      <Link href={href} className={cls} data-drift="" data-reveal="" aria-label={`${p.title}, view all projects`}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={cls} data-drift="" data-reveal="">
      {inner}
    </div>
  );
}
