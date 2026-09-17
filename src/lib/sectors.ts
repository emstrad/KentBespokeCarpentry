/** Content for the Residential and Commercial pages. */

export type SectorPage = {
  slug: "residential" | "commercial";
  label: string;
  h1: [string, string];
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  hero: string;
  heroAlt: string;
  /** Who the page is written for. */
  audience: { heading: string; body: string }[];
  /** The main body, two or three sections. */
  sections: { heading: string; body: string[] }[];
  /** What a client gets, shown as a numbered list. */
  process: { n: string; title: string; body: string }[];
  faqs: { q: string; a: string }[];
};

export const SECTOR_PAGES: SectorPage[] = [
  {
    slug: "residential",
    label: "Residential",
    h1: ["Carpentry for", "homes."],
    eyebrow: "Residential",
    title: "Residential Carpentry & Joinery in Kent",
    description:
      "Residential carpentry across Kent and the South East: extensions, renovations, loft conversions and single rooms. First fix, second fix and bespoke joinery from one family run team.",
    intro:
      "Most of our work is in people's homes, from a single alcove unit to the full carpentry package on an extension. Living in a house while it is being worked on is nobody's idea of a good time, so we plan around you, keep the working area contained and tell you what is happening next.",
    hero: "/assets/fitted-wardrobes-open.jpg",
    heroAlt: "Fitted wardrobes opened to show hanging rails, oak tops and drawer banks built into the alcoves",
    audience: [
      { heading: "Homeowners", body: "Working directly with you, from one room to a whole house. One point of contact, a fixed quote and no sub-contractor surprises." },
      { heading: "Extensions and conversions", body: "The full carpentry package alongside your builder: roof carcassing and partitions at first fix, doors, trim and staircases at second." },
      { heading: "Period property", body: "Sympathetic work in older houses, including matching existing mouldings and making replacement stair parts to suit an original flight." },
    ],
    sections: [
      {
        heading: "One team across every stage",
        body: [
          "A typical renovation needs a carpenter twice, several weeks apart, and most households end up booking two different ones. We cover both stages plus any bespoke pieces, so the carpenter who forms the partitions is the carpenter who hangs the doors into them.",
          "That continuity is worth more than it sounds. Nobody has to re-measure, nothing is lost in the handover, and if a dimension changes at first fix we already know what it means for the joinery going in three weeks later.",
        ],
      },
      {
        heading: "Living in the house while we work",
        body: [
          "We sheet floors and protect finished surfaces before anything starts, keep cutting outside or contained wherever practical, and clear the working area at the end of each day rather than at the end of the job.",
          "You will know which days we are on site and roughly what is happening on each, and if something changes you will hear it from us rather than find out. At the end we walk the work round with you and deal with anything you are not happy with before we sign it off.",
        ],
      },
    ],
    process: [
      { n: "01", title: "Free site visit", body: "We come and look at the job, take measurements and talk through what you want. No charge and no obligation." },
      { n: "02", title: "Drawing and fixed quote", body: "You get a drawing where it needs one and a written quote. The figure you agree is the figure you pay." },
      { n: "03", title: "Booked in", body: "We confirm a start date and, on longer jobs, roughly which weeks we will be on site." },
      { n: "04", title: "Built and fitted", body: "First fix, second fix and any bespoke pieces, by the same team throughout." },
      { n: "05", title: "Walked round", body: "We go through the finished work with you and put right anything that is not as it should be before we leave." },
    ],
    faqs: [
      { q: "Will you work alongside our builder?", a: "Yes, and often do. We are used to fitting into a programme run by someone else and co-ordinating with the electrician, plumber and plasterer." },
      { q: "Do you take on small jobs?", a: "Yes. A set of alcove cupboards or a few doors rehung is a perfectly normal enquiry. We will tell you honestly if a job is too small to be worth a separate visit." },
      { q: "How do payments work?", a: "For smaller jobs, on completion. For longer projects we agree staged payments in writing before we start, tied to stages rather than dates." },
    ],
  },
  {
    slug: "commercial",
    label: "Commercial",
    h1: ["Carpentry for", "contractors."],
    eyebrow: "Commercial",
    title: "Commercial Carpentry & Site Joinery in Kent",
    description:
      "Commercial carpentry across Kent and the South East for main contractors, developers and landlords. First fix packages, fit-out, fire door installation and site joinery. Fifteen years established.",
    intro:
      "We take carpentry packages for main contractors, developers, landlords and letting agents across the South East. That means turning up on the day we said, working to the programme you are running, and leaving the next trade something they can get straight on with.",
    hero: "/assets/staircase.jpg",
    heroAlt: "Timber staircase and structural carpentry on a construction project",
    audience: [
      { heading: "Main contractors", body: "First fix and second fix packages priced from drawings, delivered to programme and co-ordinated with the trades either side of us." },
      { heading: "Developers", body: "Repeatable carpentry across multiple plots or units, priced per plot, with a consistent finish from the first to the last." },
      { heading: "Landlords and agents", body: "Void turnarounds, fire door installation and upgrades, and the repeat maintenance carpentry that keeps a portfolio lettable." },
    ],
    sections: [
      {
        heading: "Working to a programme",
        body: [
          "Commercial work lives or dies on sequence. We price from your drawings, confirm the slot we can hold, and tell you early if a preceding trade slipping means we need to move rather than sitting on site doing nothing chargeable.",
          "On multi-plot work we would rather agree a rhythm than a single date, so the same operation runs plot to plot and the finish is consistent across all of them. Where a detail on the drawing does not match what has been built, it gets raised before it is covered up.",
        ],
      },
      {
        heading: "Fire doors and compliance",
        body: [
          "Fire door installation is one of the most commonly failed items on a building control or fire risk assessment inspection, usually on gaps, missing intumescent strips or the wrong ironmongery rather than the door itself.",
          "We fit to the door set's specification, with the correct gaps, strips, seals and closers, and can provide photographic records per opening where you need them for a handover pack or a fire risk assessment. For landlords running blocks, that record is usually the difference between a straightforward inspection and a remedial programme.",
        ],
      },
      {
        heading: "On site, properly",
        body: [
          "We carry public liability insurance, work to site rules, and turn up with the right kit rather than borrowing. Our working area gets swept and our waste gets removed, which sounds like a small thing until you have chased a trade who does neither.",
          "Where you need paperwork before we start, tell us at enquiry stage and we will have it with you rather than on the morning.",
        ],
      },
    ],
    process: [
      { n: "01", title: "Drawings and scope", body: "Send us the drawings and the scope. If something is unclear we ask before we price rather than qualifying it away." },
      { n: "02", title: "Priced package", body: "A written price against the scope, broken down enough that you can see what is in it." },
      { n: "03", title: "Programme slot", body: "We confirm the weeks we can hold and flag any dependency we can see from the drawings." },
      { n: "04", title: "On site", body: "Delivered to programme, co-ordinated with the trades either side, with anything unexpected raised early." },
      { n: "05", title: "Handover", body: "Snagged, signed off and, where required, recorded per opening for your handover pack." },
    ],
    faqs: [
      { q: "Are you insured for site work?", a: "Yes, we carry public liability insurance. Certificates are available on request before we start." },
      { q: "Can you price from drawings without a site visit?", a: "For most packages yes. On refurbishment work where the existing building matters we would rather come and look, because pricing a survey off a drawing helps nobody." },
      { q: "Do you take labour only?", a: "Yes. Labour only, supply and fit, or a full package. Tell us which suits the way you buy." },
      { q: "What about payment terms?", a: "Agreed in writing before we start. We are a small family run business, so we are direct about terms rather than discovering a problem later." },
    ],
  },
];

export const sectorBySlug = (slug: string) => SECTOR_PAGES.find((s) => s.slug === slug);
