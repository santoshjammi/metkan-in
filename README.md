# MITT — Metkan Institute for Technical Training

Website for **MITT**, a technical training institute and skilled-workforce coordination partner in
Autonagar, Visakhapatnam, India.

The site publishes MITT's training programmes, facility, trade-testing capability and enquiry process,
and captures employer workforce enquiries. It is a **marketing website only** — it holds no candidate
records, no logins and no recruitment data.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4 (CSS-first, no config file) |
| Animation | CSS only — no animation runtime is shipped |
| Forms | Server validation on Node, or PHP on shared hosting |
| Tests | Vitest (unit), Playwright (browser), axe (accessibility) |

## Run it

```bash
npm install
npm run dev          # http://localhost:3210
```

## Build

Two artifacts come from the same source, chosen by one variable.

```bash
npm run build && npm start      # Node server (has /api/enquiry and /api/health)
npm run build:static            # static export into out/ for shared hosting
```

`build:static` also asserts the export is complete and switches the form endpoint to `/enquiry.php`.
See [`docs/BUILD-SPEC.md`](docs/BUILD-SPEC.md) for the design and content contract.

## Verify

```bash
npx tsc --noEmit
npm run lint
npm run test                    # unit tests
npx playwright test             # browser tests
node scripts/ace-audit.mjs out  # SEO / AEO / EEAT audit of the built HTML
npm run boundary                # proves this repo is standalone
```

## Structure

```
src/app/           routes (10 pages, plus API routes in server mode)
src/components/    layout, marketing sections, forms, UI primitives
src/content/       ALL copy and configuration — start here to edit text
src/lib/           validation, persistence, notification, SEO, rate limiting
public/            images, brochure, and the PHP enquiry endpoint
scripts/           build, audit, deploy and mail-setup tooling
```

Content is deliberately separated from layout: nearly every edit a non-developer wants (phone numbers,
programmes, FAQs, figures) is a change inside `src/content/`.

## Content and claims

Figures and history published on the site are MITT's own statements, attributed as such on the page.
The site publishes **no** testimonials, client logos, certifications or accreditation claims, because
none have been approved for publication. See `docs/BUILD-SPEC.md` for the claim rules that apply to
every edit.

## Licence

Source and design are proprietary to Metkan Institute for Technical Training and Sai Ameya
Technologies LLP. Published here for review and maintenance; not licensed for reuse.
