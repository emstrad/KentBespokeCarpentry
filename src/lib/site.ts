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

/**
 * Checkatrade profile. `rating` and `reviewCount` are deliberately separate so they can be
 * corrected in one place. Leave `reviewCount` null until the real figure is confirmed: the
 * JSON-LD aggregateRating is only emitted when both are present, because Google treats an
 * invented review count as a structured-data violation.
 */
/** Verified credentials. Confirmed by the client: 15 years trading, public liability insured. */
export const CREDENTIALS = {
  years: 15,
  yearsWord: "Fifteen",
  family: "Family run",
  /** Kept for the About page, where the detail belongs. Not shown on the homepage. */
  insurance: "Public liability insured",
} as const;

export const CHECKATRADE = {
  url: "https://www.checkatrade.com/trades/kentbespokecarpentryltd",
  label: "5 star reviews on Checkatrade",
  rating: 5,
  reviewCount: null as number | null,
} as const;

/** Towns named in the footer for local search. Swap these for the areas actually covered. */
export const AREAS_SHOWN = ["Maidstone", "Ashford", "Canterbury", "Sittingbourne", "Tonbridge"] as const;

export const NAVY = "#0e2140";
export const BLACK = "#0a0a0a";

export const OFFERS = [
  "First fix carpentry",
  "Second fix carpentry",
  "Bespoke media walls and fireplaces",
  "Staircases and balustrades",
  "Fitted wardrobes and alcoves",
  "Pergolas, decking and garden structures",
] as const;

/**
 * Towns used for `areaServed` in the JSON-LD only, never shown on the page.
 * Trim this to the areas the business actually travels to.
 */
export const AREAS_SERVED = [
  "Maidstone", "Ashford", "Canterbury", "Sittingbourne", "Faversham",
  "Tonbridge", "Tunbridge Wells", "Sevenoaks", "Gravesend", "Dartford",
  "Rochester", "Chatham", "Gillingham", "Whitstable", "Herne Bay",
] as const;

export type Project = {
  slug: string;
  /** Which sector page this project appears on. */
  sector: "residential" | "commercial";
  src: string;
  alt: string;
  type: string;
  title: string;
  num: string;
  width: number;
  height: number;
};

export const PROJECTS: Project[] = [
  { slug: "slatted-pergola-deck", sector: "residential", src: "/assets/pergola-deck.jpg", alt: "Pergola with slatted screens over raised decking", type: "Garden structure", title: "Slatted pergola & deck", num: "01", width: 1080, height: 1350 },
  { slug: "recessed-media-wall", sector: "residential", src: "/assets/media-wall.jpg", alt: "Bespoke media wall with lit display niches and herringbone floor", type: "Media wall", title: "Recessed media wall", num: "02", width: 1152, height: 1213 },
  { slug: "fitted-wardrobes", sector: "residential", src: "/assets/fitted-wardrobes.jpg", alt: "Fitted wardrobes with a central drawer bank and oak top, built into a bedroom alcove", type: "Fitted wardrobe", title: "Fitted bedroom wardrobes", num: "03", width: 1600, height: 1200 },
  { slug: "glass-balustrade-staircase", sector: "residential", src: "/assets/staircase.jpg", alt: "Softwood staircase with glass balustrade", type: "Staircase", title: "Glass-balustrade staircase", num: "04", width: 1080, height: 1350 },
  { slug: "covered-garden-bar", sector: "residential", src: "/assets/garden-bar.jpg", alt: "Timber garden bar with hatch and slatted front", type: "Garden structure", title: "Covered garden bar", num: "05", width: 1536, height: 2048 },
  { slug: "octagonal-pergola", sector: "residential", src: "/assets/pergola-octagon.jpg", alt: "Octagonal pergola frame over composite decking", type: "Garden structure", title: "Octagonal pergola", num: "06", width: 1080, height: 1440 },
  { slug: "fireplace-alcove-wall", sector: "residential", src: "/assets/fireplace-wall.jpg", alt: "Fireplace media wall with lit alcoves and cupboards", type: "Media wall", title: "Fireplace & alcove wall", num: "07", width: 942, height: 677 },
  { slug: "loft-roof-frame", sector: "residential", src: "/assets/loft-roof-frame.jpg", alt: "Loft conversion floor joists and rafters framed up over a terrace", type: "First fix", title: "Loft conversion frame", num: "08", width: 1206, height: 891 },
  { slug: "cut-roof-extension", sector: "residential", src: "/assets/cut-roof-extension.jpg", alt: "Cut roof rafters framed off a blockwork extension beside a tile-hung elevation", type: "First fix", title: "Cut roof over extension", num: "09", width: 1206, height: 1605 },
  { slug: "cut-roof-ridge", sector: "residential", src: "/assets/roof-ridge.jpg", alt: "Ridge of a newly cut roof with rafters and purlins in place", type: "First fix", title: "New build cut roof", num: "10", width: 941, height: 2048 },
];

export type Service = { title: string; body: string; bg: string; fg: string };

export const SERVICES: Service[] = [
  { title: "First fix carpentry", body: "The structural carpentry that goes in before plastering: stud partitions, floor joists, roof carcassing, noggins, door linings and window boards. Getting this stage square and level makes every trade that follows more straightforward.", bg: "#0e2140", fg: "#fff" },
  { title: "Second fix carpentry", body: "Doors hung and adjusted to close cleanly, skirting and architrave cut and mitred to a consistent line, stair parts, loft hatches and kitchen installation. The stage that determines how finished a room actually looks.", bg: "#fff", fg: "#0a0a0a" },
  { title: "Media walls & fireplaces", body: "Recessed television and fireplace walls with lit display niches, concealed cabling and painted or veneered finishes, designed around the proportions of the room rather than a standard unit size.", bg: "#f2f2f0", fg: "#0a0a0a" },
  { title: "Staircases & balustrades", body: "New softwood and hardwood flights, replacement treads and risers, and glass or timber balustrades, measured on site and made to suit awkward landings and existing openings.", bg: "#fff", fg: "#0a0a0a" },
  { title: "Fitted wardrobes & alcoves", body: "Floor-to-ceiling wardrobes, alcove units and under-stair storage, designed around what needs to go inside them rather than around a standard carcass.", bg: "#0a0a0a", fg: "#fff" },
  { title: "Pergolas, decking & garden structures", body: "Structural timber pergolas, covered outdoor kitchens and bars, decking and slatted screens. Treated timber on properly set footings, built to stay square through a Kent winter.", bg: "#fff", fg: "#0a0a0a" },
];
