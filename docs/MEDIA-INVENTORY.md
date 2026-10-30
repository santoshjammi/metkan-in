# MITT Website — Media Inventory

**Status:** all media on this site is **development placeholder**. Nothing here is approved for public launch.

| File | Dimensions | Type | Source | Status | Action before launch |
|---|---|---|---|---|---|
| `public/media/hero-welding.jpg` | 2000×1125 | JPEG q82 | Supplied by owner in this session (dashboard attachment) | **Placeholder — licence unverified** | Replace with MITT-approved hero photography or licensed footage still. Must not imply these are MITT workers. |
| `public/media/hero-welding-md.jpg` | 1200×675 | JPEG q80 | Downscale of above | Placeholder | Regenerated automatically from the replacement hero. |
| `public/media/hero-welding-sm.jpg` | 900×506 | JPEG q80 | Downscale of above | Placeholder | Same. |
| `public/media/facility-corridor.jpg` | 2000×1142 | JPEG q82 | Supplied by owner in this session | **Placeholder — licence unverified**, and it is an AI-looking render, not a real facility | Replace with a real photograph of MITT premises, else keep the visible disclosure caption ("Illustrative image — not a photograph of a MITT facility"). |
| `public/media/facility-corridor.jpg` (used on `/training` and homepage act 5) | — | — | — | Illustration only | Same as above. |

## Missing production assets (blocking public launch)

1. **MITT logo** — vector (SVG) plus monochrome and reversed variants. Currently the site uses a typographic wordmark ("MITT") set in Space Grotesk. That is a deliberate, presentable stand-in, not a brand asset.
2. **MITT façade / signage photograph** — needed for `/about` credibility.
3. **Workshop / training photographs** (minimum 6) — welding bays, fitting benches, assessment in progress, instructor with candidates. Needed for acts 2, 3 and 5 and for `/training`.
4. **Employer-approved references or testimonials** (with written permission, and the permission date recorded) — the `testimonials` array in `src/content/evidence.ts` is empty and the UI renders an honest empty state until this exists.
5. **Partner / client logos** (with written permission) — `partners` array is empty for the same reason.
6. **Brand-approved short film or looped b-roll** (20–30s, silent, 1080p, <4 MB WebM + MP4 + poster) — if supplied, it replaces the static hero via `HeroMedia`. The site is built to work fully without it.
7. **Verified contact details** — real phone, real enquiries email, WhatsApp business number (if one exists), full street address, Google Maps location. All are non-routable placeholders today; `src/content/site.ts` is the single place to change them.

## What this means for a demo

The site is fully demonstrable with the placeholders: layout, copy, motion, conversion flow and mobile behaviour are all real. The two things a visitor will notice as unfinished are the dotted-underline contact placeholders and the illustrative-photo caption. Both are intentional and removable in one edit each.
