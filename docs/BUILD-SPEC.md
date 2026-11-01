# MITT Cinematic Website — Build Specification (frozen contract)

**Project:** MITT marketing website
**Owner:** Santosh (MITT)
**Technology partner (internal only):** Sai Ameya Technologies LLP
**Build root:** `/Users/santosh/Desktop/projects/MITT/website`
**Status:** Frozen for implementation. Deviations must be reported, not silently made.

---

## 0. Hard boundaries

1. **This is a marketing website, not the recruitment platform.** It must not contain worker registration, candidate profiles, interview management, financial, passport, visa or workforce data — no database of workers, no login, no dashboards, no exports.
2. **A separate internal application exists outside this repository.** It is MITT's own platform, it is
   not part of this deliverable, and it must not be imported, read, modified, disclosed or deployed
   from here. This site exposes no worker records of any kind.
3. **No fabricated proof.** No invented testimonials, employer logos, placement counts, certifications, awards, years-in-service, addresses or phone numbers. If a fact is not verified (see §1), it ships as a clearly-labelled development placeholder AND is listed in `LAUNCH-CHECKLIST (private ops docs)`.
4. **No false success.** The enquiry endpoint must only report success after a durable write. If the store is unavailable it returns an honest error.
5. **No public deployment.** Local production build + preview only.

---

## 1. Verified facts vs. placeholders

### Verified (may be published)
| Fact | Source |
|---|---|
| Brand name: **MITT** | brief + WR-PRD-001 |
| Full name: **Metkan Institute for Technical Training** | `../docs/01_WORKER_REGISTRY_MVP_PRD.md` |
| Location: **Visakhapatnam, Andhra Pradesh, India** | same |
| Postal address: **A-3, B Block, Autonagar, Visakhapatnam 530012, Andhra Pradesh, India** | Owner-supplied 2026-10-30 |
| Phone: **+91 74163 42020** | Owner-supplied 2026-10-30 |
| Capability areas: technical training, skilled-worker screening, employer interview coordination, recruitment/placement support, workforce readiness coordination | client brief §1 |
| Occupational categories: welding, fitting & fabrication, electrical, plumbing, mechanical & industrial support, construction trades, industrial helpers | client brief §1 |

### Unverified — placeholder only, never presented as fact

| Element | Placeholder to use | Where |
|---|---|---|
| Email | `Enquiries email pending confirmation` chip (`placeholder: true`, no href) | footer, contact |
| WhatsApp | **omit entirely** — no approved business number confirmed | — |
| Worker counts / placement stats / years / certifications / partner logos / testimonials | **omit; render real empty states instead** | evidence section |

**Now verified, and therefore publishable:** phone (`+91 74163 42020`) and the full postal address. A real, owner-supplied address also makes `EducationalOrganization` / `Organization` structured data with a `PostalAddress` legitimate — implement it in `src/lib/seo.ts` for `/` and `/about`. Do **not** emit `aggregateRating`, `review`, `openingHours`, geo coordinates or accreditation fields: none are verified.

Placeholder values come from a single config object flagged `placeholder: true` so a later swap is one edit, and so the UI can render them in a visibly unfinished state, never as a normal link.

### Claims discipline (copy rules)
- Never say *guaranteed*, *100% placement*, *verified deployment*, *visa assured*, *authorized for overseas recruitment*, *government certified*.
- Selection ≠ deployment. Never describe an interviewed or selected candidate as joined/placed/mobilized.
- Overseas work: only "where an authorized partner arrangement applies, and subject to applicable law" — never advertise independent overseas recruitment authorization.
- Always hedge scope: "varies by employer, trade, assignment and jurisdiction".
- Frame MITT as coordinating a process, not owning outcomes.

### Positioning choice (approved direction)
- **H1:** "Skilled Hands. Stronger Industries."
- **Brand line (footer / about / OG):** "Connecting skilled people with real opportunities."
- **Value line:** "MITT supports technical training, skilled-worker screening and coordinated employer hiring."
- Chosen over "The People Behind Every Project" because it names the two sides of the market in the first five seconds.

---

## 2. Routes

| Route | Purpose | Primary action |
|---|---|---|
| `/` | Cinematic homepage (7 acts) | Discuss your workforce requirement |
| `/for-employers` | Highest-priority commercial page | Submit a workforce requirement |
| `/capabilities` | Trade categories + honest availability states | Discuss a requirement |
| `/training` | Training & preparation | Explore training support |
| `/our-process` | 8-stage process with event disambiguation | Start a conversation |
| `/about` | Organisation, facility, technology partner | Contact MITT |
| `/contact` | Enquiry form + contact methods | Submit enquiry |
| `/privacy` | DPDP-aware privacy notice (draft chip) | — |
| `/terms` | Website terms (draft chip) | — |
| `/thank-you` | True confirmation, shows reference | Return to capabilities |
| `not-found.tsx` | Styled 404 | Home / capabilities |

**Not built:** `/for-workers` — no approved public worker-facing information or follow-up channel exists yet. Documented as a launch dependency, not silently dropped.

All pages share `Header`, `Footer`, `PageHero` template, `CTABand` — one template system, no bespoke layouts.

---

## 3. Design system

### Concept — "The Arc"
The welding arc is the site's only light source. Every screen is a dark workshop lit by one warm source; type reads like chalk on steel. Cinematic quality comes from **composition, contrast between lit and unlit acts, and restraint** — not from effects everywhere.

Rules that make it MITT and not a template:
- Alternating **dark acts** (`ink`) and **lit acts** (`ivory`) create cinematic rhythm. Never two identical-intensity sections in a row.
- One "arc glow" moment per page maximum (a soft copper radial that appears once on hero, then rests).
- Section numbers set in display font, tiny, copper, upper-right of each section head — editorial documentary signalling.
- Thin 1px hairlines (`--line`) instead of card shadows. Industrial, not SaaS.
- Corner radii small (4–8px), never pill-shaped except badges. No glassmorphism, no neon, no generic gradient meshes.

### Tokens (CSS custom properties in `globals.css`, consumed via Tailwind v4 `@theme`)
```
--ink           #0B0F13   base dark
--graphite      #171D23   raised dark surface
--graphite-2    #1E262E   borders/dividers on dark
--ivory         #F5F2EA   light act surface
--ivory-2       #EAE5D9   light act raised
--steel         #728391   muted text on dark
--steel-ink     #55636F   muted text on light
--copper        #C87539   accent / CTA / arc light
--copper-hi     #E08E4E   hover
--text-dark     #111827   body text on light
--line          rgba(245,242,234,0.14)  dark hairlines
--line-ink      rgba(17,24,39,0.12)     light hairlines
```
Contrast targets (verify): ivory on ink ≥ 15:1; steel on ink ≥ 5.5:1; copper on ink ≥ 5.2:1 (use for large text/graphics; for small text on dark use `--copper-hi`); white on copper ≥ 3.4:1 → **CTA on copper uses `--ink` text, not white** (check reaches ≥ 4.5:1).

### Type
- Display: **Space Grotesk** (`next/font/google`, weights 500/700, `display: swap`, subset latin).
- Body: **Inter** (400/500/600).
- Fluid scale via `clamp()`: `--fs-display  clamp(2.6rem, 6.2vw, 5.2rem)`, `--fs-h2 clamp(2rem, 3.6vw, 3.1rem)`, `--fs-h3 clamp(1.25rem, 1.7vw, 1.6rem)`, body `1.0625rem`, `--lh-tight 1.02` for display.
- Display: `letter-spacing: -0.03em`, `text-wrap: balance`. Body: `max-width: 68ch`, `text-wrap: pretty`.

### Spacing & layout
- Section padding: `clamp(4.5rem, 9vw, 8.5rem)` vertical.
- Container `max-w-[1240px]`, gutters `1.25rem` mobile / `2.5rem` desktop.
- 12-col grid at `lg`; content columns intentionally asymmetric (e.g. 5/7, 4/6/2).

### Motion (single library: `motion`)
| Pattern | Spec |
|---|---|
| Section reveal | `opacity 0→1`, `y 18→0`, 520ms, `cubic-bezier(.22,.61,.36,1)`, `viewport={{once:true, margin:"-12%"}}` |
| Stagger | 60ms between children, max 6 |
| Headline | word-mask reveal on hero only, 40ms/word, 380ms each |
| Process line | `useScroll` + `scaleY` on a 1px copper rule (no pinning, no hijack) |
| Capability card | translateY(-4px) + hairline brightens on hover/focus-within, 200ms |
| Button | background/translate feedback 160ms; no bounce |
| Arc glow | single 1.6s opacity/scale settle on hero mount only |
| **Never** | parallax on text, scroll hijack, cursor effects, looping background animation, animation on every element |

`prefers-reduced-motion: reduce` → all transforms disabled, opacity-only at ≤100ms or none; process line renders fully drawn; arc glow static at 0.5 opacity. Implemented via a `useReducedMotion()` gate in every client motion component **and** a global `@media` fallback.

---

## 4. Homepage — 7 acts (exact order)

1. **Hero (dark, full-bleed)** — `hero-welding.jpg` with copper arc glow + subtle film grain overlay (CSS, `pointer-events:none`, 3% opacity). Eyebrow: `Technical training · Skilled workforce · Visakhapatnam`. H1 "Skilled Hands. Stronger Industries." Support line from §1. Primary CTA "Discuss Your Workforce Requirement" → `/contact`, secondary "Explore our capabilities" → `/capabilities`. H1 + CTAs are **server-rendered text, visible with JS disabled**, no opacity:0 default. Small scroll cue. Image: `next/image` priority + `sizes="100vw"` + `placeholder="blur"`.
2. **The people behind industry (light/ivory)** — editorial 5/7 split. Headline "Every successful project starts with the people who make it possible." Three numbered editorial panels (01 Technical Skills / 02 Workforce Coordination / 03 Opportunity Readiness). Reveal on scroll.
3. **Capabilities (dark)** — grid of 7 trade cards from `src/content/capabilities.ts`; each: image or icon plate, title, one-line service, 3 skill examples, link to `/capabilities#<slug>`. Stagger entrance. Cards without a confirmed image fall back to a **type-only plate** (no broken image, no fake photo).
4. **Process (dark, continuation)** — 8 compact stages with the copper scroll-progress rule; explicit disambiguation note: "Interview and selection are not deployment. Joining depends on employer confirmation, medical clearance where required, and documentation."
5. **Training (light)** — facility still `facility-corridor.jpg` (labelled as illustrative), list of preparation areas, CTA "Explore training capabilities" → `/training`.
6. **Evidence (dark)** — **empty-state-first design**: since no verified testimonials/logos/metrics exist, this act presents *what MITT can evidence on request* (facility visit, program list, screening method, reference on process) — never fake proof. Code path stays ready for real content via `testimonials: []` and `partners: []` arrays that render real empty states.
7. **Conversion (copper-led, high contrast)** — "Let's understand your workforce requirement." Primary "Submit a workforce requirement" → `/contact`, secondary "Speak with MITT" (placeholder contact). Then footer.

Repeated primary CTA after acts 3, 5 and 7 — same label everywhere.

---

## 5. Enquiry system (real, small, honest)

**Route:** `POST /api/enquiry` (Node runtime, not edge — needs `fs`).

**Schema (zod)** — required: `name` (2–80), `organisation` (2–120), `email` (valid), `orgType` (`employer|agency|other`), `consent` (literal true). Optional: `phone` (7–18 digits/+, loose), `trades` (array of known slugs, max 8), `headcount` (`1-5|6-25|26-100|100+`), `location` (≤120), `employmentType` (`permanent|contract|other`), `timeline` (`immediate|30d|90d|exploring`), `notes` (≤1200). Uppercase `website` = honeypot (must be empty). `renderedAt` (ms) must be > 2500ms old. Reject unknown keys.

**Pipeline:** parse → normalize → honeypot/timing → rate limit (5 per IP per 10 min, in-memory Map with prune; documented as single-instance) → append JSONL to `process.env.MITT_LEAD_DIR ?? "./var/enquiries"` (mkdir 0700, file 0600) → **only then** respond `{ok:true, reference}`.
Reference: `MITT-<YYMMDD>-<6 base32 chars>` — cryptographically random (`crypto.randomUUID`), no PII.
Failure: persist error → `503 {ok:false, error:"store_unavailable"}`. Never a fake success.
Notification: if `MITT_NOTIFY_WEBHOOK` or `MITT_SMTP_*` set, attempt after persist; failure to notify does not fail the request but is logged. **Not configured today → documented launch dependency.**
No form contents are stored in analytics. Log line contains reference + timestamp + orgType only.

**UI:** single column, labels above fields, native `<select>` for orgType (accessible, no custom widget), checkbox group for trades using native inputs, optional fields grouped under "Requirement detail (optional)". Errors: inline, `aria-describedby`, `aria-live="polite"` summary at top after submit attempt, focus moves to first error. Loading state on submit button, disabled during flight. Success → `router.push('/thank-you?ref=MITT-...')`; `/thank-you` reads `ref`, validates format, shows it; no ref → generic confirmation.

---

## 6. File structure (implementer must follow)

```
src/app/{layout,page,globals.css,not-found,sitemap,robots,opengraph-image}
src/app/{for-employers,capabilities,training,our-process,about,contact,privacy,terms,thank-you}/page.tsx
src/app/api/enquiry/route.ts
src/components/layout/{SiteHeader,SiteFooter,MobileNav,Container,Section,SectionHeading,SkipLink}
src/components/marketing/{CapabilityGrid,ProcessTimeline,EditorialPanels,EvidenceEmptyState,CTABand,FAQAccordion,StatRow(omit if no data)}
src/components/cinematic/{ArcGlow,GrainOverlay,Reveal,StaggerGroup,ScrollRule,HeroMedia}
src/components/forms/{EnquiryForm,Field,CheckboxGroup,FormStatus}
src/components/ui/{Button,Badge,Card,Input,Textarea,Select,Checkbox,Label}
src/content/{site,nav,capabilities,process,training,faqs,evidence,legal}.ts
src/lib/{validation,rate-limit,reference,leads,seo,analytics,track}.ts
tests/{unit/*.test.ts,e2e/*.spec.ts}
docs/{BUILD-SPEC,LAUNCH-CHECKLIST,MEDIA-INVENTORY,HANDOVER}.md
```

**Server components by default.** `"use client"` only for: motion wrappers, mobile nav, form, accordion, analytics. No client component may contain page copy that SEO needs.

---

## 7. Accessibility & performance acceptance
- WCAG 2.2 AA: axe clean (zero critical/serious) on `/`, `/for-employers`, `/contact`.
- Keyboard: skip link first tab stop; every interactive element has visible `:focus-visible` ring (2px copper, 2px offset); mobile nav traps focus and restores it; Esc closes.
- One `<h1>` per page; heading levels never skip.
- Form: label↔control bound, `autocomplete` set, error announced, no colour-only error signalling.
- Reduced motion verified in a real browser (`emulateMedia({reducedMotion:'reduce'})`).
- No horizontal overflow at 320/375/768/1024/1440/1920.
- Touch targets ≥44px.
- Lighthouse mobile ≥85 performance, ≥95 accessibility, ≥95 best-practices, ≥95 SEO (measured, not asserted).
- Hero LCP element = `<h1>` text or the hero image; no CLS from fonts (fixed `display:swap` + size-adjust fallback) or images (explicit dimensions).
- Total first-load JS reasonable; no library beyond `motion` for animation.

---

## 8. Definition of done (build stage)

- [ ] `npm run typecheck` clean (strict, `noUncheckedIndexedAccess`).
- [ ] `npm run lint` clean.
- [ ] `npm run build` succeeds; all 11 routes prerender or render as intended.
- [ ] `npm run test` unit tests green (validation, rate limit, reference, normalisation).
- [ ] `npm run test:e2e` green against a running dev server (routes, nav, form validation, successful submit writes to temp dir, axe).
- [ ] Screenshots captured at 375/768/1440 for `/` and `/for-employers`; no clipped or overlapping content.
- [ ] Real submission verified end-to-end: POST → JSONL line on disk → reference shown.
- [ ] Failure path verified: store dir unwritable → honest 503, no success UI.
- [ ] Zero fabricated claims; every placeholder listed in `LAUNCH-CHECKLIST.md`.
