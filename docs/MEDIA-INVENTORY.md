# MITT Website — Media Inventory

**Updated 2026-11-01** after MITT supplied its published flyer.
**Status:** the site now carries **real MITT photographs, the institute's mark and its brochure**. The hero
image remains an unverified placeholder and is the one asset that must still be replaced.

---

## Real MITT assets (publishable)

| File | Source | Dimensions | Notes |
|---|---|---|---|
| `public/media/facility/workshop-overview.jpg` | Flyer p.3 (embedded image) | 486×567 | Genuine workshop floor, booth line. Native size only. |
| `public/media/facility/booths-aisle.jpg` | Flyer p.3 | 363×363 | Booths along the aisle with safety charts. |
| `public/media/facility/booth-closeup.jpg` | Flyer p.3 | 363×363 | A single numbered booth. |
| `public/media/facility/interview-room.jpg` | Flyer p.3 | 458×389 | Interview / client meeting room. |
| `public/media/facility/campus-exterior.jpg` | Flyer p.1 | 1600×650 | The institute building in Autonagar. The only image wide enough for a band. |
| `public/media/logo-symbol.png` | Flyer logo, extracted and de-plated | 746×496 RGBA | Blue mark, transparent plate. Clean at header size. |
| `public/media/logo-symbol-reverse.png` | Same, reversed | 746×496 RGBA | Ivory mark for dark surfaces. |
| `public/media/mitt-brochure.pdf` | Supplied by owner | 4 pages, 699 KB | Published as a real download; it is the source of every attributed claim. |

**Constraint that must not be broken:** the facility photographs are 363–486px wide (exterior 1600px).
They are displayed at or below native width. Upscaling them to full-bleed would make MITT look amateur —
worse than having no photograph at all. No identifiable people appear, so no model release is required.

## Still placeholder

| File | Status | Action |
|---|---|---|
| `public/media/hero-welding.jpg` (+ `-md`, `-sm`) | **Placeholder.** A dramatic welding arc image; almost certainly AI-generated or licensed stock. Disclosed in the footer as not a MITT photograph. | Replace with an MITT-approved hero photograph, or licensed footage still. This is the biggest remaining visual gap. |
| `public/media/facility-corridor.jpg` | **Placeholder.** A render-like industrial corridor, not a MITT facility. | No longer used in evidence contexts (real photographs replaced it). Safe to delete once nothing imports it. |

## Missing production assets

1. **A real hero photograph** — one strong, well-lit MITT workshop or worker image at 2400px+ wide. This
   is the last thing between the site and a premium first impression.
2. **Vector logo (SVG/AI)** — the current mark is a 4× upscale of a 239×179 raster. Ask whoever designed
   the flyer for the master file.
3. **Higher-resolution facility photography** — the existing set proves authenticity but cannot be used
   large. Six new shots at 3000px wide (shot list in `docs/EVIDENCE-INTAKE.md`) would let the facility
   section carry real visual weight.
4. **Photographs of people** — trainees at work, an instructor demonstrating. Only with written consent;
   this is what turns a facility page into a human one.
5. **Permissioned employer references** — still none. The `testimonials` array in
   `src/content/evidence.ts` remains empty and the UI renders an honest empty state.
6. **Brand-approved short film or looped b-roll** (20–30s, silent, 1080p, <4 MB WebM + MP4 + poster) — if
   supplied it replaces the static hero via `HeroMedia`. The site works fully without it.

## Licensing note

The flyer and everything extracted from it is MITT's own material, supplied by the owner for use on
MITT's own website. The hero image's provenance is unverified — if it is stock, confirm the licence covers
commercial web use, or replace it.

## What this means for a demo

The site is now demonstrably MITT's: real numbers, real programmes, real photographs of the actual
workshop, the real building, the real mark, the real brochure and the real contact details. The only
visibly unverified asset left is the hero photograph.
