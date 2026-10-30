# MITT Website - Evidence Intake

**Purpose:** the practical route from "no proof published" to "credible, permissioned proof published", without ever publishing a claim before it exists.

**Current state:** `src/content/evidence.ts` ships with `testimonials` and
`partners` deliberately empty, and the homepage renders an honest empty state
that says permissioned references are shared directly. That is not a gap to be
papered over with stock copy. It is the correct state until material arrives.

**One rule governs everything below:** nothing is published until the evidence
and the permission both exist, in writing, on file. A blank is honest; an
invented claim is a liability.

---

## 1. What MITT must supply, in priority order

| # | Item | Why it is ranked here | Form it must arrive in |
|---|---|---|---|
| 1 | **One named employer reference** with written permission | The single strongest credibility signal, and the only one that cannot be manufactured. One is enough to change how the site reads. | Signed or emailed permission (see section 2), the quote text in the employer's own words, attribution as they wish to be described, and the date permission was given |
| 2 | **Six facility / workshop photographs** | Proves MITT is a physical operation with real bays, benches and candidates. Replaces the illustrative image that currently carries a visible "not a photograph of a MITT facility" caption. | Six originals, landscape, at least 3000 px wide (see section 3) |
| 3 | **Programme list** | Lets an employer see what preparation actually covers, and lets the site stop saying programme detail is only available on request. | Plain list: programme name, what it covers, rough duration, who it is for, whether any assessment or certificate is issued at the end |
| 4 | **Screening method description** | The existing "Screening method" evidence point is generic. A real description (stages, who assesses, what a candidate must demonstrate) is proof of method, not of outcomes, so it is publishable today. | Half a page: the stages in order, the practical test used per trade, pass/fail criteria, who signs off |
| 5 | **Any certification, licence or accreditation MITT actually holds** | Publishable only if the certificate exists, is current, and the issuing body permits the claim. If MITT holds none, this item is closed and the site keeps claiming none. | Scanned certificate with issuing body, number, scope and validity dates; plus confirmation that the claim may be published |

Two notes on items 3 and 5:

- A programme list turns `/training` from capability language into a catalogue.
  That is a copy change, not just data: `trainingNote` in
  `src/content/training.ts` currently says "Programme schedules, eligibility and
  fees are confirmed with MITT directly. No certification or affiliation is
  claimed on this website." It must be revised in the same commit that adds a
  catalogue, or the page contradicts itself.
- Item 5 has no field in the codebase today. A certification claim needs both a
  new content array and a component to render it, and should not be bolted onto
  an existing array as free text. Do not add it as a badge.

## 2. Permission request email (exact wording)

Send from a MITT-controlled mailbox so the reply is auditable and can be filed
against the record. The site publishes no email address yet; create the mailbox
before sending, so the permission trail does not sit in a personal inbox.

**Subject:** Permission to quote ACME Engineering on the MITT website

> Dear [Name],
>
> Thank you for the conversation about [requirement / engagement] and for
> agreeing in principle to be quoted.
>
> We would like to publish the following on the MITT website, mitt[domain], on
> the employer-facing pages:
>
> 1. A short quotation, attributed to you and to [Employer legal name], about
>    working with MITT. The wording we propose is:
>
>    "[proposed quote]"
>
>    You are free to change, shorten or rewrite this. We will publish only the
>    final wording you approve in writing.
>
> 2. Your name, your role and [Employer legal name] as the attribution. If you
>    would rather be described differently - for example by role and sector only
>    - tell us and we will use that instead.
>
> 3. Optionally, [Employer legal name]'s logo, displayed at small size as a
>    client or partner mark. If you would rather not have the logo used, we will
>    publish the name in text only.
>
> Separately, we would like to use photographs taken at [facility / training
> centre] during [visit / session], showing workshop areas, equipment and
> training activity. No photograph will be published in which any person is
> identifiable unless that person has given their own consent, and we will not
> include any other company's branding, drawings or signage in the frame.
>
> What this permission covers: publication on the MITT website and in material
> MITT sends directly to prospective employer clients. It does not cover paid
> advertising, press releases, or use by any third party, and it does not give
> MITT any ownership of your quotation, your name or your logo.
>
> There is no payment for this, in either direction.
>
> **Withdrawal:** you can withdraw this permission at any time, for any reason
> or none, by replying to this email or calling +91 74163 42020. On withdrawal we
> will remove the quotation, attribution and logo from the site within five
> working days, and will confirm in writing when it is done. Withdrawal does not
> affect anything published before it.
>
> If you are happy with the wording above, please reply confirming:
>
> - the final quotation text you approve;
> - the attribution exactly as you would like it to read;
> - whether the logo may be used (yes / no);
> - the date from which the permission applies.
>
> A one-line reply such as "Approved as set out above, from [date]" is enough.
>
> With thanks,
> [Name], Metkan Institute for Technical Training

**On receipt, record before publishing:** who granted it, their role, the exact
approved quote text, the approved attribution, logo yes/no, the date, and a copy
of the email in the project's evidence folder. The `permissionedOn` field in
`src/content/evidence.ts` takes that date as `YYYY-MM-DD`. A permission without
a date is not usable.

## 3. Facility photograph shot list

Six frames are enough to make the operation real. Shoot all six in one session,
landscape, in natural light.

| # | Shot | What it must show | Why |
|---|---|---|---|
| 1 | Welding bay, action | A welder mid-run, arc lit, sparks visible, machine and bench in frame | The image that says "this is a working shop", not a render |
| 2 | Fitting bench | Hands, tools and a workpiece laid out; measurable work in progress | Shows hand skill and the standard of work |
| 3 | Assessment in progress | An assessor observing a candidate working; clipboard/tablet, not posed smiling at camera | Proof of method, which is the thing MITT can evidence |
| 4 | Instructor with candidates | Instructor demonstrating at a bench to two or three candidates | Proof of training actually happening |
| 5 | Signage / exterior | MITT name board or facade with the street readable | Proof of place and identity |
| 6 | Tools / detail | A tight frame of tools, jigs, gauges or a finished weld bead | Texture for section backgrounds, and evidence of equipment |

**Technical guidance:**

- Landscape orientation, minimum 3000 px on the long edge. Deliver originals;
  do not send screenshots or WhatsApp-compressed copies.
- Natural or existing workshop light. No flash, no HDR, no filters, no heavy
  colour grading, no vignette.
- Shoot at eye level or slightly below. Avoid wide-angle distortion of faces and
  equipment; step back rather than zoom out.
- No identifiable faces without that person's own written consent (a one-line
  release per person is enough). Where consent is absent, frame hands, backs,
  over-shoulder or PPE-obscured faces - and do not rely on blur to fix it.
- No other companies' logos, brand names, drawings, job cards or signage in
  frame. Clear the bench before shooting; check the background, not just the
  subject.
- No visible safety violations: no one welding without a shield, no unguarded
  grinding, no missing PPE. A safety breach in a published photograph undercuts
  every claim MITT makes about workplace discipline.
- Export as JPEG, quality 80-85, sRGB, long edge 3000 px for the master and
  2000 px for web delivery. Keep the master; the site only needs the web copy.
- Name files descriptively: `mitt-welding-bay-01.jpg`, `mitt-fitting-bench-01.jpg`
  and so on, so the mapping to the shot list survives.

## 4. Exactly where each item goes

Everything below is a content or asset change. No layout change is needed for
items 1 and 2 - the components already render real data the moment the arrays
are non-empty.

| Item | File and field | Rendered by | Change required |
|---|---|---|---|
| Employer reference | `src/content/evidence.ts` -> `testimonials` array | `EvidencePanel` (`src/components/marketing/EvidencePanel.tsx`), used in `src/app/page.tsx` | Add one object to the array. The empty state disappears automatically. |
| Client / partner name and logo | `src/content/evidence.ts` -> `partners` array | `EvidencePanel`, same act | Add one object per partner. The empty state disappears automatically. |
| Logo file | `public/media/partners/<slug>.png` | `EvidencePanel` via `next/image`, rendered at 96x40 | Provide PNG with transparent background at 2x (about 192x80). An SVG needs `images.dangerouslyAllowSVG` added to `next.config.ts`, which is a config change - use PNG unless that is deliberately approved. |
| Photographs | `public/media/` | see below | Copy the file in, then point the content field at it. |
| Facility photograph in the training act | `src/content/training.ts` -> `trainingImage` (`src`, `alt`, `width`, `height`, `disclosure`) | `TrainingPanel` (homepage) and `src/app/training/page.tsx` | Replace `src` with the new file and set real `width`/`height`. Then remove the `disclosure` line "Illustrative image - not a photograph of a MITT facility", which is required only while the image is not real. |
| Photograph per trade | `src/content/capabilities.ts` -> each entry's optional `image` (`src`, `alt`, `width`, `height`) | `CapabilityGrid` (`src/components/marketing/CapabilityGrid.tsx`) | Add the `image` object to the trades that have a real photograph. Trades without one keep the type-only plate - that is fine and needs no change. |
| Hero still | `src/content/evidence.ts` -> `heroMedia` (`src`, `alt`, `width`, `height`, `disclaimer`) | `HeroMedia` (`src/components/cinematic/HeroMedia.tsx`), Open Graph in `src/app/layout.tsx`, and the disclaimer in `SiteFooter` | Replace `src` and `alt` with a MITT-owned frame. Also update `disclaimer` in the footer, because "representative of trade work" stops being true once it is MITT's own photograph. |
| Programme list | `src/content/training.ts` -> `trainingAreas` (`title`, `body`), plus `trainingNote` | `TrainingPanel` and `src/app/training/page.tsx` | Rewrite the entries with real programme names and content, and revise `trainingNote` so it no longer says programme detail is unavailable. |
| Screening method | `src/content/evidence.ts` -> `evidencePoints` (replace the generic "Screening method" entry) | `EvidencePanel` | Replace the `body` with the real stages. Keep it to process, not outcomes. |
| Certification MITT holds | No field exists | Nothing renders it | Requires a new content array plus a component, and a decision on where the claim belongs. Do not add it to `evidencePoints` as free text. |

Minimal example for item 1 - this is the entire change:

```ts
export const testimonials: Testimonial[] = [
  {
    quote: "Approved quotation text, exactly as the employer wrote it.",
    attribution: "Name, Role",
    organisation: "Employer legal name",
    permissionedOn: "2026-11-14",
  },
];
```

## 5. What must NEVER be published without evidence

Publish nothing from this list until the underlying proof exists, is current,
and is permissioned in writing. If someone asks for one of these "just for the
demo", the answer is no.

- **Placement percentages or counts** - "94% placement", "1,200 workers placed",
  "3x faster joining". These are the fastest way to lose an employer's trust and
  the hardest claim to defend.
- **Mobilisation timelines** - "workers deployed in 15 days", "48-hour
  shortlists". Any timeline depends on trade, location, documentation and the
  employer's own process, and no timeline is evidenced today.
- **Client or partner logo walls** - every mark needs its own written
  permission. One unlicensed logo is a trademark problem and a credibility
  problem at the same time.
- **"ISO certified", "MSME registered", "NSDC affiliated", "government
  approved"** and any similar accreditation claim - only with the certificate in
  hand, in date, and with the issuing body's permission to state it.
- **Overseas authorisation or visa claims** - "licensed recruitment agent",
  "direct overseas placement", "visa guaranteed". Overseas recruitment is
  regulated under the Emigration Act, 1983; no authorisation is claimed on this
  site today, and none may be added without the licence.
- **Worker or candidate counts** - "5,000 workers in our database". Unverifiable
  inventory claims invite exactly the scrutiny they cannot survive.
- **Named employer relationships without permission** - even "we have worked with
  [large company]" is a claim about a third party that only they can authorise.
- **Testimonials edited for effect** - a quote may be shortened only with the
  author's approval of the final wording, and never rewritten to say something
  they did not say.

## 6. Intake log

Keep this table current as items arrive. An item is not "received" until the
permission date and the file path are both filled in.

| Item | Received from | Received on | Permission granted on | Scope / conditions | File path | Live in commit |
|---|---|---|---|---|---|---|
| Employer reference | | | | | `src/content/evidence.ts` | |
| Photographs (6) | | | | | `public/media/` | |
| Programme list | | | | | `src/content/training.ts` | |
| Screening method | | | | | `src/content/evidence.ts` | |
| Certification | | | | | - | |
