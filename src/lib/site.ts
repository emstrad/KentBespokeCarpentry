const DEFAULT_SITE_URL = "https://www.kentbespokecarpentry.co.uk";

/**
 * Canonical origin for metadata, sitemap, robots and JSON-LD.
 * Uses NEXT_PUBLIC_SITE_URL only when it is a valid absolute URL; otherwise the live domain.
 * The www host is the primary domain in Vercel (the bare domain 308-redirects to it), so every
 * canonical, sitemap and JSON-LD URL uses www to avoid pointing search engines at a redirect.
 * Deliberately never falls back to VERCEL_URL, so preview/fork deployments still declare the
 * live domain as canonical instead of a *.vercel.app host.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

export const NAP = {
  name: "Kent Bespoke Carpentry Ltd",
  shortName: "Kent Bespoke Carpentry",
  phoneDisplay: "07494 280614",
  phoneHref: "tel:+447494280614",
  phoneE164: "+447494280614",
  email: "sales@kentbespokecarpentry.co.uk",
  emailHref: "mailto:sales@kentbespokecarpentry.co.uk",
  area: "Kent",
  facebook: "https://www.facebook.com/share/1DVn67btQs/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/kentbespokecarpentry?igsi=MTVzc3Z6ZGUwemU1Nw==",
} as const;

export const NAVY = "#0e2140";
export const BLACK = "#0a0a0a";

export const OFFERS = [
  "Bespoke media walls",
  "Staircases and balustrades",
  "Pergolas and garden rooms",
  "Fitted wardrobes and alcoves",
  "Doors, skirting and architrave",
] as const;

export type Project = {
  slug: string;
  src: string;
  alt: string;
  type: string;
  title: string;
  num: string;
  width: number;
  height: number;
};

export const PROJECTS: Project[] = [
  { slug: "slatted-pergola-deck", src: "/assets/pergola-deck.jpg", alt: "Pergola with slatted screens over raised decking", type: "Garden structure", title: "Slatted pergola & deck", num: "01", width: 1080, height: 1350 },
  { slug: "recessed-media-wall", src: "/assets/media-wall.jpg", alt: "Bespoke media wall with lit display niches and herringbone floor", type: "Media wall", title: "Recessed media wall", num: "02", width: 1152, height: 1213 },
  { slug: "glass-balustrade-staircase", src: "/assets/staircase.jpg", alt: "Softwood staircase with glass balustrade", type: "Staircase", title: "Glass-balustrade staircase", num: "03", width: 1080, height: 1350 },
  { slug: "covered-garden-bar", src: "/assets/garden-bar.jpg", alt: "Timber garden bar with hatch and slatted front", type: "Garden structure", title: "Covered garden bar", num: "04", width: 1536, height: 2048 },
  { slug: "octagonal-pergola", src: "/assets/pergola-octagon.jpg", alt: "Octagonal pergola frame over composite decking", type: "Garden structure", title: "Octagonal pergola", num: "05", width: 1080, height: 1440 },
  { slug: "fireplace-alcove-wall", src: "/assets/fireplace-wall.jpg", alt: "Fireplace media wall with lit alcoves and cupboards", type: "Media wall", title: "Fireplace & alcove wall", num: "06", width: 942, height: 677 },
];

export type Service = { title: string; body: string; bg: string; fg: string };

export const SERVICES: Service[] = [
  { title: "Media walls", body: "Recessed TV and fireplace walls with lit display niches, hidden cabling and painted or veneered finishes, built to suit the room rather than the other way round.", bg: "#0e2140", fg: "#fff" },
  { title: "Staircases & balustrades", body: "New softwood or hardwood flights, replacement treads and risers, and glass or timber balustrades, measured on site and made to fit awkward landings.", bg: "#fff", fg: "#0a0a0a" },
  { title: "Pergolas & garden rooms", body: "Structural timber pergolas, covered outdoor kitchens and bars, decking and slatted screens. Treated timber, proper footings, built to stay square.", bg: "#f2f2f0", fg: "#0a0a0a" },
  { title: "Fitted wardrobes & alcoves", body: "Floor-to-ceiling wardrobes, alcove units and under-stair storage designed around what you actually need to put in them.", bg: "#fff", fg: "#0a0a0a" },
  { title: "Doors, skirting & architrave", body: "Second-fix carpentry done properly: hung doors that close, mitres that meet, and mouldings that match the rest of the house.", bg: "#0a0a0a", fg: "#fff" },
];
