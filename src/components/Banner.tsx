import Link from "next/link";
import { NAP } from "@/lib/site";

type Props = { title: string; sub: string };

export function Banner({ title, sub }: Props) {
  return (
    <section className="banner" aria-label="Get in touch">
      <div className="banner__card">
        <h2 className="h-lg" data-reveal="" style={{ maxWidth: "18ch" }}>
          {title}<br /><span className="light">{sub}</span>
        </h2>
        <div className="banner__ctas d15" data-reveal="">
          <Link href="/contact" className="pill pill--white">Get a quote</Link>
          <a href={NAP.phoneHref} className="pill pill--outline-white-soft">Call {NAP.phoneDisplay}</a>
        </div>
      </div>
    </section>
  );
}
