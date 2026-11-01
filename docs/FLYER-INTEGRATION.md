# How the MITT flyer is being integrated

**Source:** `METKAN Flyer (preview).pdf` (4 pages), supplied 2026-11-01.
**Fact register:** `docs/FACTS-FROM-FLYER.md` — every published fact traces to a line in that file.

---

## What the flyer gave us that the site did not have

The site was built from a brief that contained **no verifiable evidence**: no history, no numbers, no
programmes, no photographs, no email. It handled that honestly — attributed nothing, invented nothing,
and rendered real empty states instead of fake proof. The flyer changes that materially:

| Added | Where it goes | Why it matters |
|---|---|---|
| **"Formerly St. Patrick Welding Institute", 23+ years** | Homepage between capabilities and process; `/about` | The single strongest trust fact the site now has. It converts an unknown institute into an established one. |
| **23+ years · 100,000+ placed · 14 booths · 80% practical** | New `StatBand` directly under the hero | Answers "how big is this operation" instantly. Attributed on each cell, never as our own measurement. |
| **5 real programmes** (structural welding, pipe welding, pipe fitting, structural fitting, corporate upskilling) | `/training` replaces invented "training areas" | Now a real training prospect can see exactly what is taught, for how long, at what level. |
| **Real facility photographs** (14 booths, aisle, interview room, building) | Homepage gallery, `/training`, `/about`, `/for-employers` | Replaces the AI-generated placeholder in evidence contexts. Genuine, documentary, and checkable on a visit. |
| **Trade-testing capability** | `/for-employers` `TestingPanel` | This is the employer's actual objection — "can I see them work before I commit?" Now answered. |
| **Leadership: K. V. Srikanth + 25-year manning team** | `/about` | Names and roles, as published. |
| **Two real emails, two more phone numbers** | Footer, `/contact`, `/about` | Closes the last visible contact gap. |
| **The brochure itself** | `BrochureCard` on homepage + `/for-employers` | A real asset an employer can forward internally. |
| **The institute's own tagline** — "Forging Futures. Building Careers." | Footer / brand line | Replaces the tagline I invented. |

## What the flyer does *not* let us do

- **It is not verification.** "100,000+ placed" is MITT's own published figure. The site says so on the
  cell, and repeats MITT's own disclaimer ("placement performance may vary…") beneath the band. If MITT
  has deployment records, publishing a documented number is stronger than an attributed one.
- **Overseas placement and visa support is legally loaded.** The flyer advertises overseas placement and
  "visa processing and related formalities". India regulates overseas recruitment advertising and
  recruiting-agent licensing. The site describes this as MITT's stated service, coordinated through
  travel-agency partners, with the caveat that no visa or approval is promised — and **claims no licence
  or authorisation**, because none has been evidenced. This stays flagged for owner/legal sign-off.
- **The photographs are low resolution.** They are genuine (363–1600px wide), so they are published at
  or below native size as documentary evidence. They are **not** hero material and are never upscaled —
  a blurry photo would cost more credibility than no photo.
- **The logo is a 239×179 raster.** I extracted it, removed the white plate, and produced a clean
  transparent pair (blue on light, ivory on dark). It is not vector; a proper SVG/AI file is still worth
  requesting from whoever designed the flyer.

## Design decision worth your call

The flyer's palette is **navy / bright blue / orange**. The site is **charcoal / copper**. I kept the
site's palette: it reads more premium at screen size, and the flyer is a print piece. But one of these
should probably win for brand consistency:

1. Keep charcoal + copper (current), use the flyer only for content, or
2. Shift the accent to MITT's orange `#F28C28` and the dark base toward navy `#0B1F4E`.

Say the word and option 2 is a token change in one file.

## Also worth deciding

The flyer leads with **METKAN** everywhere; the site leads with **MITT**. Both are the same institute.
The site currently uses `MITT` as the wordmark with `Metkan Institute for Technical Training` beneath,
and I extracted the **METKAN mark** as the logo symbol. If you would rather the site say `METKAN` in the
header, that is a one-line change in `src/content/site.ts`.
