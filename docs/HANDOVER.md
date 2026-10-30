# MITT Website — Owner Handover

**Project root:** `/Users/santosh/Desktop/projects/MITT/website`
**Status:** demonstrable and commercially usable. **Not launch-ready** — see `docs/LAUNCH-CHECKLIST.md`.
**Scope:** this deliverable is the marketing website only. It is not, and must never be, the internal
platform MITT uses to run recruitment operations. It shares no code, no data and no deployment path with
it, and nothing in this repository references it.

**Disclosure boundary (binding):** the internal application is private, is still being built, and must
not be shown, linked, described or deployed to anyone outside MITT. This repository is standalone; it
can be handed to a developer or a host without disclosing anything about that platform. `bash
scripts/check-boundary.sh` enforces this and fails if the boundary is broken.

---

## 1. Run it

```bash
cd /Users/santosh/Desktop/projects/MITT/website
npm install          # first time only
npm run dev          # http://localhost:3210
```

Production check (what a host would run):

```bash
npm run build && npm start      # http://localhost:3210
```

Node is required in production — the enquiry endpoint is a server route and **cannot** run on static hosting. A single small VPS or any Node host works.

## 2. Change content without touching layout

Everything a non-developer would want to edit lives in `src/content/`:

| File | Controls |
|---|---|
| `site.ts` | brand name, tagline, phone, email, postal address, Maps link, navigation, CTA labels, dropdown options |
| `capabilities.ts` | the 7 trade categories, their descriptions, skill examples, availability status |
| `process.ts` | the 8 engagement stages and each stage's honest "boundary" note |
| `training.ts` | training areas, the training image, its disclosure caption |
| `faqs.ts` | employer FAQs and training FAQs |
| `evidence.ts` | evidence points, testimonials array (empty by design), partner array (empty), hero image + disclaimer |

**Rule:** replace a placeholder, never invent one. Every unverified value is flagged (`placeholder: true`) so the UI renders an honest pending state instead of a fake one.

### Turning on the enquiries email later

One edit in `src/content/site.ts`:

```ts
email: { display: "enquiries@yourdomain.com", href: "mailto:enquiries@yourdomain.com", placeholder: false },
```

The footer, `/contact` and `/about` all switch from the "pending confirmation" chip to a real link automatically. No component changes.

## 3. How enquiries actually work

1. Employer submits `/contact`.
2. `POST /api/enquiry` runs: honeypot + render-timing check → per-IP rate limit (5 / 10 min) → zod validation → **append-only JSONL write**.
3. Only after the write succeeds does the API return `201 { ok: true, reference }`.
4. The browser goes to `/thank-you?ref=MITT-…` showing that reference.

**Where leads land:** `./var/enquiries/enquiries-YYYY-MM.jsonl` (override with `MITT_LEAD_DIR`). Directory `0700`, file `0600`, one JSON object per line. `var/` is git-ignored.

**If the store fails, the API returns `503` and the page tells the user to call instead.** It never fakes success. Verified.

**Notifications:** implemented and verified. After a successful persist the API calls `notifyEnquiry()`,
which delivers by **SMTP** (`MITT_SMTP_*` + `MITT_NOTIFY_TO`) or **webhook** (`MITT_NOTIFY_WEBHOOK`).
A delivery failure never fails the enquiry — it is already stored, and the response reports
`notified: false`. **Neither channel is configured yet**, so enquiries are stored but nobody is emailed.
`npm run preflight` refuses to pass until one is set.

Health probe: `GET /api/health` returns `{ ok, leadStoreWritable, notifyConfigured, siteUrlConfigured }`
and 503 if the lead store is unwritable — point an uptime monitor at it.

Reading leads:

```bash
cat var/enquiries/enquiries-*.jsonl | jq -r '[.receivedAt, .reference, .organisation, .orgType] | @tsv'
```

## 4. Verification commands

```bash
npx tsc --noEmit                      # types
npm run lint                          # eslint
npm run test                          # 47 unit tests (validation, rate limit, references, persistence)
npx playwright test                   # 19 browser tests run across desktop + mobile projects (38 executions)
node tests/a11y-audit.mjs             # axe across 11 routes x 2 viewports
npm run preflight                     # launch gate: exits 1 on any blocker
npm run boundary                      # proves the internal app is unreachable/undisclosed
npm run backup:leads                  # archive + checksum + verify the lead store
```

`node tests/a11y-audit.mjs` needs a server running; point it with `AXE_BASE=http://localhost:3220`.

## 5. What is deliberately absent

- **No `/for-workers` page.** There is no approved worker-facing information and no follow-up channel for workers, so shipping one would create a dead end.
- **No testimonials, client logos or placement statistics.** None are verified or permissioned. The components exist and render an honest empty state — add entries to `src/content/evidence.ts` when you have written permission and the UI fills itself.
- **No video hero.** No licensed footage. The hero is a graded still; `HeroMedia` accepts a video later without a redesign.
- **No worker registration, login, dashboard, payment or visa flow.** Out of scope by design.
- **No third-party analytics.** A privacy-conscious hook activates only if `NEXT_PUBLIC_ANALYTICS_DOMAIN` is set, and it never receives form field values.

## 6. Known limitations to be honest about

1. **Rate limiting is in-memory** — it resets on restart and does not share state across instances. Fine on one server; not sufficient if you scale horizontally.
2. **The lead store is a local file** — back it up; it is not replicated. Before real traffic, schedule a copy.
3. **Hero and facility images are placeholders**, and the hero is almost certainly AI-generated. Both carry a visible disclaimer in the footer. Replace them with real MITT photography before launch.
4. **`/privacy` and `/terms` need legal review.** They render a visible "DRAFT — pending legal review" chip driven by `site.legalReviewPending`. Do not remove the chip until counsel has reviewed the text.
5. **No response-time promise is made anywhere** — deliberate, because none has been agreed. If MITT commits to one, add it in one place rather than across pages.

## 7. Where things live

```
src/app/            routes (11 pages + api/enquiry + sitemap/robots/opengraph)
src/components/     layout (header, footer, mobile nav), marketing sections,
                    cinematic motion primitives, forms, ui primitives
src/content/        ALL copy and config — start here for edits
src/lib/            validation, rate-limit, reference, leads, seo, analytics
public/media/       optimised images
tests/              unit (vitest), e2e (playwright), a11y-audit.mjs
docs/               BUILD-SPEC, LAUNCH-CHECKLIST, MEDIA-INVENTORY, this file
```

Design decisions and their rationale: `docs/BUILD-SPEC.md`.
