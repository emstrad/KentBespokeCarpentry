import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { NAP } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — book a free visit or get a quote",
  description: "Tell Kent Bespoke Carpentry about your project. Call 07494 280614, email sales@kentbespokecarpentry.co.uk, or send an enquiry and we'll reply within one working day.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Kent Bespoke Carpentry", url: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="contact" aria-labelledby="page-h1">
      <div className="contact__card cols">
        <div className="contact__info">
          <h1 id="page-h1" className="h-display" data-reveal="" style={{ fontSize: "clamp(40px,5.4vw,84px)" }}>Tell us about<br /><span className="light">your project.</span></h1>
          <div className="contact__nap">
            <div className="d1" data-reveal=""><span className="label">Phone</span><a href={NAP.phoneHref}>{NAP.phoneDisplay}</a></div>
            <div className="d2" data-reveal=""><span className="label">Email</span><a href={NAP.emailHref}>{NAP.email}</a></div>
            <div className="d3" data-reveal=""><span className="label">Area</span><span className="val">Homes across Kent</span></div>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
