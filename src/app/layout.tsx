import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { BookingModal } from "@/components/BookingModal";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Parallax } from "@/components/Parallax";
import { RevealObserver } from "@/components/RevealObserver";
import { UiProvider } from "@/components/UiProvider";
import { NAP, OFFERS, SITE_URL } from "@/lib/site";
import "./globals.css";

// Only the three weights actually rendered (300/400/500). Self-hosted at build time by next/font.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500"], display: "swap", variable: "--font-montserrat" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Kent Bespoke Carpentry Ltd | Bespoke joinery, made in Kent", template: "%s | Kent Bespoke Carpentry" },
  description: "Kent Bespoke Carpentry design, build and install bespoke joinery across Kent: media walls, staircases, pergolas, garden rooms and fitted furniture.",
  applicationName: NAP.name,
  openGraph: { type: "website", locale: "en_GB", siteName: NAP.name, url: SITE_URL },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0e2140", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${SITE_URL}/#business`,
  name: NAP.name,
  url: SITE_URL,
  telephone: NAP.phoneE164,
  email: NAP.email,
  image: `${SITE_URL}/opengraph-image`,
  logo: `${SITE_URL}/assets/logo-navy.png`,
  address: { "@type": "PostalAddress", addressRegion: "Kent", addressCountry: "GB" },
  areaServed: { "@type": "AdministrativeArea", name: "Kent" },
  priceRange: "££",
  sameAs: [NAP.facebook, NAP.instagram],
  makesOffer: OFFERS.map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name, areaServed: "Kent" } })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={montserrat.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <noscript><style>{`[data-reveal]{opacity:1!important;transform:none!important}.hero__card--mask{clip-path:none!important}.hero__gate{opacity:1!important;transform:none!important}`}</style></noscript>
      </head>
      <body>
        <UiProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <BookingModal />
          <RevealObserver />
          <Parallax />
        </UiProvider>
      </body>
    </html>
  );
}
