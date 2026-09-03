# Brief §4 acceptance checklist

Each item from `kbc-build-brief.md` §4 and where it is satisfied in this repo.

## Performance / LCP

| Item | Where |
| --- | --- |
| No blocking preloader | There is none. The hero animates *in* (`.hero__card--mask`, `.hero__img-wrap` in `globals.css`) with `animation-fill-mode: both`; the image and `<h1>` are in the server HTML and LCP is not gated on any JS. |
| LCP image eager + prioritised | `src/components/Hero.tsx` — the single `next/image` with `priority` and `fetchPriority="high"` (emits `<link rel="preload">` + `fetchpriority="high"`, no `loading="lazy"`). Every other image is `next/image` default (lazy) with an explicit `sizes`. |
| No duplicate library loads | No third-party runtime libraries at all. First-load JS is ~104 kB shared (React + Next runtime); the Blob upload client is `import()`ed only when a user adds files. |
| No heavy animation engine | Zero GSAP/ScrollTrigger/jQuery/split-type. Showcase and parallax use `animation-timeline: view()`; intro motion is `@keyframes`; reveals are one `IntersectionObserver` (`RevealObserver.tsx`). |
| No unused font requests | `layout.tsx` loads Montserrat 300/400/500 only, self-hosted by `next/font` (no Google Fonts request at runtime, no Typekit). |
| Responsive images sized for DPR | `next/image` `sizes` set per placement: hero `100vw`, showcase right column `50vw`, cards `calc(100vw - 2*gutter)`, About photos `50vw`, logos fixed px. `deviceSizes` in `next.config.ts` go up to 2560 so a 390 px card at 3× gets a ≥1080 w candidate. |

## Motion & accessibility

| Item | Where |
| --- | --- |
| `prefers-reduced-motion` respected everywhere | `globals.css` final block: all animations/transitions off, `animation-timeline: none`, reveals visible, showcase falls back to stacked cards. `RevealObserver.tsx` also short-circuits to visible. Verified with Playwright `reducedMotion: "reduce"`: hero words and reveals render at opacity 1. |
| No hover-only affordances leaking to touch | `.card__view` is `display:none` by default and only becomes `display:flex` + hover-reveal inside `@media (hover: hover)`. Cards are fully tappable links without it. |
| No stuck hover states on tap | Every `:hover` rule in `globals.css` lives inside `@media (hover: hover)` (pills, cards, underline links, menu links, drop zone, footer links). |
| Accordion not fixed-height | `Accordion.tsx` + `.acc__panel` — CSS grid `grid-template-rows: 0fr → 1fr`, content measured by the browser; no `height` anywhere. Closed panels are `inert`. |
| No dead/broken interactions | Every animation is bound to an element that exists; parallax (`[data-drift]`) is applied on all breakpoints via the same rule; there are no configured-but-unbound scripts. Menu, modal, forms, accordion all wired and exercised in the screenshot pass. |

## Touch ergonomics

| Item | Where |
| --- | --- |
| All tap targets ≥ 44×44 px | `.pill` min-height 48 (52 in modal), `.pill--sm` 44×44 min, header menu button 44 min, menu links ≥ 44 line box, social icons 44×44, footer/menu/contact links `min-height: 44px`, modal close 44×44, accordion buttons `min-height: 64px`, file "remove" buttons 44×44. |
| Phone number above the fold on mobile | Fixed header `tel:` pill (icon at <768 px, number ≥768 px) **and** the hero "Call 07494 280614" pill, both `tel:+447494280614`. |

## SEO / crawlability / semantics

| Item | Where |
| --- | --- |
| Semantic landmarks | `layout.tsx`: `<header>` → `<nav aria-label="Main">` → `<main id="main">` → `<footer>`; sections carry `aria-labelledby`. |
| One `<h1>` per page, unique `<title>`/description | `Hero.tsx` renders the only `<h1>` on `/` and `/about`; `/projects` and `/contact` render their own single `<h1>`. Each `page.tsx` exports its own `metadata` title + description + canonical; `layout.tsx` sets the title template. |
| JSON-LD structured data | `layout.tsx` — `HomeAndConstructionBusiness` with name, telephone, email, `areaServed: Kent`, address region, `sameAs`, and `makesOffer` from the design's helmet list. |
| Server-rendered core content | All four routes are `○ (Static)` in the build output; headings, copy, NAP and JSON-LD are in the HTML. Reveal elements are visible without JS via the `<noscript>` style in `layout.tsx`. |
| `sitemap.xml`, `robots.txt`, OG image | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, plus `src/app/icon.svg` favicon. |

## Forms

| Item | Where |
| --- | --- |
| Real `<label>` elements | `ContactForm.tsx` and `BookingModal.tsx` — every input has a `<label htmlFor>`; the only placeholder is an *example* on the ideas textarea, which still has a label. |
| `autocomplete` + `inputmode` | `autoComplete="name" / "email" / "tel"`, `inputMode="email" / "tel"` on the matching fields in both forms. |
| 16 px inputs | `.field input, .field textarea { font-size: 16px }` for both dark and light field variants. |

## NAP / content integrity

| Item | Where |
| --- | --- |
| Displayed contact strings match `href` exactly | Single source in `src/lib/site.ts` (`NAP.phoneDisplay` / `NAP.phoneHref`, `NAP.email` / `NAP.emailHref`) used by header, menu, hero, banners, contact page, footer and JSON-LD. |

## Data flow & security (from the build prompt)

| Item | Where |
| --- | --- |
| `POST /api/enquiry` zod → Neon → FormSubmit → 200 | `src/app/api/enquiry/route.ts`, schema in `src/lib/enquiry.ts`, DB in `src/db/`, email in `src/lib/formsubmit.ts`. |
| Attachments | `src/app/api/enquiry/[id]/attachments/route.ts` issues Vercel Blob client-upload tokens and streams private files back; `src/app/api/enquiry/[id]/send/route.ts` records the files and sends the single notification email (see README). |
| Drizzle schema + migration SQL | `src/db/schema.ts`, `drizzle/0000_enquiries.sql`, `drizzle/0001_notified_at.sql`, `scripts/migrate.mjs`. |
| Honeypot + rate limit | `company` field (visually hidden, `tabindex=-1`) rejected server-side with a fake 200; `src/lib/ratelimit.ts` sliding window per IP → 429 with `Retry-After`. |
| `DATABASE_URL` never client-side | Only read in `src/db/index.ts`, which imports `server-only`; no `NEXT_PUBLIC_` prefix. |
