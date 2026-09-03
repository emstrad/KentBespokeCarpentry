# Kent Bespoke Carpentry — kentbespokecarpentry.co.uk

Next.js 15 (App Router, TypeScript, fully static pages) recreation of the approved design
(`KBC Website.dc.html`). Four pages — `/`, `/projects`, `/about`, `/contact` — plus a
three-step booking modal, an enquiry API backed by Neon Postgres, and FormSubmit email
notifications to sales@kentbespokecarpentry.co.uk.

See [`CHECKLIST.md`](./CHECKLIST.md) for the brief §4 acceptance list mapped to where each
item is satisfied.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15.5 + React 19, TypeScript, static generation for all pages |
| Styling | Plain CSS (`src/app/globals.css`) using the design's values: navy `#0E2140`, black `#0A0A0A`, white, 8px card radii, 100px pills, no shadows |
| Fonts | Montserrat 300/400/500 only, self-hosted at build time via `next/font/google` |
| Motion | Native CSS `animation-timeline: view()` for the showcase and parallax, `@keyframes` for intro motion, one `IntersectionObserver` for reveals. No GSAP, no jQuery, no animation engine |
| Database | Neon Postgres via `@neondatabase/serverless` + Drizzle ORM (`src/db`) |
| Email | FormSubmit (formsubmit.co) AJAX endpoint |
| Uploads | Vercel Blob (client-side upload, optional — degrades gracefully) |
| Validation | zod, honeypot field, per-IP rate limit |

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL etc.
npm run db:migrate           # creates the enquiries table in Neon
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run typecheck`, `npm run lint`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon connection string. Server-only; never imported by client code (`src/db/index.ts` is marked `server-only`). |
| `FORMSUBMIT_ENDPOINT` | yes | `https://formsubmit.co/ajax/sales@kentbespokecarpentry.co.uk` |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin used in metadata, sitemap, robots and JSON-LD. |
| `BLOB_READ_WRITE_TOKEN` | optional | Enables inspiration-file storage in Vercel Blob. Auto-set when a Blob store is linked to the Vercel project. Without it, the booking modal still works and file *names* are emailed instead of links. |

## Neon migration

The schema lives in `src/db/schema.ts` (Drizzle) and the SQL in `drizzle/0000_enquiries.sql`.

Either of these applies it:

1. `npm run db:migrate` — runs every `drizzle/*.sql` file once, tracking applied files in a
   `_kbc_migrations` table. Reads `DATABASE_URL` from the environment or `.env.local`.
2. Paste `drizzle/0000_enquiries.sql` into the Neon console SQL editor.

`enquiries` columns: `id uuid`, `created_at timestamptz`, `name`, `phone`, `email`, `ideas`,
`source` (`booking` | `contact`), `attachments jsonb` (array of `{ name, size, type, url? }`).

To evolve the schema later: edit `schema.ts`, run `npm run db:generate` (drizzle-kit) to
emit a new SQL file, then `npm run db:migrate`.

## FormSubmit activation (one-off)

FormSubmit requires the destination address to be confirmed before it forwards anything.

1. Deploy (or run locally with `FORMSUBMIT_ENDPOINT` set) and submit one enquiry.
2. FormSubmit emails **sales@kentbespokecarpentry.co.uk** with an "Activate form" link.
3. Click it. Every subsequent submission is delivered immediately.

Until activated, the API still stores the enquiry in Neon and returns 200, so no lead is
lost; the notification email just won't arrive. Emails use `_template: table`,
`_replyto` = the enquirer's address, `_subject: "New enquiry — {name}"`, `_captcha: false`.

## Enquiry data flow

```
Booking modal step 2 / Contact form
  └─ POST /api/enquiry  { name, phone, email, ideas, source, company(honeypot) }
       ├─ rate limit (5 per 10 min per IP)  → 429
       ├─ honeypot filled                    → fake 200, nothing stored
       ├─ zod validation                     → 400
       ├─ INSERT INTO enquiries              (Neon)
       ├─ POST FormSubmit                    (email)
       └─ 200 { id, stored, emailed }        (502 only if both DB and email fail)

Booking modal step 3 (optional inspiration files)
  ├─ browser uploads each file straight to Vercel Blob using a scoped token issued by
  │  POST /api/enquiry/[id]/attachments (Blob client-upload protocol)
  └─ POST /api/enquiry/[id]/attachments { attachments: [{ name, size, type, url? }] }
       ├─ enquiry must exist and be < 24h old
       ├─ URLs must be on *.public.blob.vercel-storage.com
       ├─ merges into enquiries.attachments (deduped, max 8)
       └─ emails the links via FormSubmit ("Inspiration for enquiry — {name}")
```

**Why client-side Blob upload:** Vercel serverless functions cap request bodies at 4.5 MB,
which is smaller than one phone photo. Uploading from the browser with a server-issued token
avoids that limit; the route still gates every token behind a valid, recent enquiry id and
the size/type limits in `src/lib/enquiry.ts` (8 files, 10 MB each, images or PDF).

**Rate limiting** is an in-memory sliding window per serverless instance (`src/lib/ratelimit.ts`).
That is adequate for a low-volume trade site; swap for an Upstash or Postgres counter if
needed.

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel (framework preset: Next.js, no extra
   build settings needed).
2. Add the environment variables above in *Project → Settings → Environment Variables*.
   The easiest way to get `DATABASE_URL` is the Neon integration in the Vercel marketplace,
   which sets it automatically.
3. (Optional) *Storage → Create → Blob* and link it to the project to enable file uploads.
   This sets `BLOB_READ_WRITE_TOKEN`.
4. Run the migration once against the production database (`npm run db:migrate` locally
   with the production `DATABASE_URL`, or paste the SQL in the Neon console).
5. Deploy. Add the custom domain `kentbespokecarpentry.co.uk` under *Domains* and set
   `NEXT_PUBLIC_SITE_URL` to match.
6. Submit one enquiry and click the FormSubmit activation link (see above).

## Project layout

```
src/app/            layout (fonts, JSON-LD), pages, sitemap.ts, robots.ts, opengraph-image.tsx, icon.svg
src/app/api/        enquiry route + attachments route
src/components/     Header (+ curtain Menu), Hero, Showcase, ProjectCard, Banner, Footer,
                    Accordion, BookingModal, ContactForm, RevealObserver, UiProvider
src/lib/            site data (NAP, projects, services), zod schema, rate limit, FormSubmit
src/db/             Drizzle schema + Neon client
drizzle/            migration SQL
scripts/migrate.mjs applies drizzle/*.sql
public/assets/      photography + logos
```

## Lighthouse (mobile, production build, local)

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 97 | 100 | 100 | 100 |
| `/projects` | 98 | 100 | 100 | 100 |
| `/about` | 97 | 100 | 100 | 100 |
| `/contact` | 98 | 100 | 100 | 100 |

CLS is 0 on every page. On Vercel the image optimiser serves AVIF/WebP from the same
`next/image` markup, so LCP should improve further versus the local run.

## Notes on the photography

The supplied `pergola-deck.jpg` (hero, project 01, About) carries a faint baked-in logo
watermark in its top-left. Replace the file in `public/assets/` with a clean export when
one is available; nothing else needs to change.
