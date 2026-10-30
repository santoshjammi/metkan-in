# MITT Website — Outstanding Approval & Launch Checklist

Nothing on this list is optional. The site is **not launchable** until every item is resolved or explicitly waived in writing by MITT. Items marked **BLOCKER** must be resolved before the site is publicly reachable.

## A. Legal / commercial claims (owner sign-off required)

| # | Item | Why it matters | Status |
|---|---|---|---|
| A1 | Confirm the trading name to be published: "MITT" / "Metkan Institute for Technical Training" and whether a legal suffix (Pvt Ltd / LLP / Trust / Society) must appear in the footer | Publishing an incomplete legal name is a compliance and trust problem | **BLOCKER** — not verified from a primary source. A `Metkan-Letterhead.docx` exists in Google Drive but the file provider returned `Resource deadlock avoided` on every read attempt, so it could not be inspected. |
| A2 | Confirm which trade categories MITT can *actually* supply today (the site lists 7 and marks all as "confirm-required") | Listing a category implies capability | **BLOCKER** for confident copy; site currently hedges explicitly |
| A3 | Confirm the published process (8 stages) matches actual practice, especially stages 06–08 | Misstating process invites disputes | Required |
| A4 | Confirm there are no certification, affiliation, government-scheme or accreditation claims to publish (none are published today) | Unsupported accreditation claims are a regulatory risk in India | Required — currently **nothing** is claimed |
| A5 | Confirm position on overseas recruitment: any content referencing it must name the authorised partner arrangement and be legally reviewed | Overseas recruitment advertising is regulated (Emigration Act, RA licensing) | Required — site currently says international activity is via authorised partners only, with no promise of visas/approvals |
| A6 | Confirm fee disclosure position (does MITT charge employers, workers, or neither?) | Fee-related statements are regulated and frequently complained about | Required — site currently states it collects no fees through the website |
| A7 | Approve the tagline "Skilled Hands. Stronger Industries." and brand line "Connecting skilled people with real opportunities." | Both are proposed marketing language, not approved brand | Required |
| A8 | Approve the "Website engineered by Sai Ameya Technologies LLP" footer attribution | Sai Ameya is the technology partner, not MITT's parent brand | Required |

## B. Contact & identity (BLOCKERs)

| # | Item | Current state |
|---|---|---|
| B1 | Verified phone number | **RESOLVED 2026-10-30** — owner supplied `+91 74163 42020` (renders as `tel:+917416342020`). Recorded in `src/content/site.ts`. |
| B2 | Verified enquiries email (and whether it is monitored daily) | **Outstanding** — renders as "Enquiries email pending confirmation". The enquiry form does not depend on it (submissions persist server-side), but a public inbox is expected on a B2B site. |
| B3 | Full street address + Google Maps location, if it may be published | **RESOLVED 2026-10-30** — `A-3, B Block, Autonagar, Visakhapatnam 530012, Andhra Pradesh, India`. Pincode↔locality verified against public postal records. Held structurally in `site.address`; Maps link is a search URL, not a claimed verified pin. |
| B4 | WhatsApp business number, if approved | Omitted entirely (no placeholder link is rendered). The new landline/mobile has **not** been confirmed as a WhatsApp Business line — do not add a `wa.me` link until MITT says so. |
| B5 | Logo files (SVG + reversed) | Typographic wordmark used instead |
| B6 | Domain name | Not yet known; `NEXT_PUBLIC_SITE_URL` must be set before SEO metadata is correct |

## C. Enquiry handling (operational, BLOCKER)

| # | Item | Current state |
|---|---|---|
| C1 | Who receives a new enquiry, and how fast must they respond? | **Undecided — the biggest operational gap.** Every accepted enquiry is persisted to `var/enquiries/*.jsonl`, and the UI truthfully shows a reference. **Nobody is emailed.** |
| C2 | Configure a notification channel | **Not configured.** Implemented: `MITT_NOTIFY_WEBHOOK` (HTTPS endpoint, POST after a successful persist, 5s timeout, non-fatal on failure). **Not implemented: SMTP** — the earlier plan named `MITT_SMTP_*`; only the webhook exists. Either point the webhook at a mail-relay endpoint, or commission the SMTP path. |
| C3 | Define the working response SLA to state on `/contact` | **No promise is made anywhere** — deliberate, because none is agreed. If MITT commits to a window, add it in `src/content/site.ts` and surface it on `/contact`. |
| C4 | Decide retention period for stored enquiries and who may read them | Not decided. The privacy notice states retention while the relationship is active, deleted on request — no invented day count. |
| C5 | Single-instance rate limiter acceptable? | **Verified limitation.** In-memory: 5 requests / 10 min per IP, resets on restart, no cross-instance state. Fine for one VPS; not for horizontal scaling. |
| C6 | Back up the lead store before real traffic | Not scheduled. `var/` is git-ignored and not replicated. |

## D. Privacy & terms (BLOCKER)

| # | Item | Current state |
|---|---|---|
| D1 | Legal review of `/privacy` against the DPDP Act 2023 and the IT Act | Draft written; a visible "DRAFT — pending review" chip is rendered because `site.legalReviewPending = true` |
| D2 | Legal review of `/terms` | Same |
| D3 | Nominate a grievance/consent contact (name + email) for the privacy notice | Placeholder |
| D4 | Decide analytics: enable or not. The site ships with **no third-party analytics**; a Plausible-compatible hook activates only if `NEXT_PUBLIC_ANALYTICS_DOMAIN` is set | Off by default |

## E. Media & IP

See `docs/MEDIA-INVENTORY.md`. Summary: replace both placeholder images, or keep the visible disclosure captions; supply logo and facility photography. Confirm the two supplied stills are licensed for commercial web use — their provenance is unverified.

## F. Technical pre-launch

| # | Item | Notes |
|---|---|---|
| F1 | Set `NEXT_PUBLIC_SITE_URL` to the production origin | Canonicals, sitemap, OG URLs derive from it |
| F2 | Decide hosting target and set it up (Node server required — the enquiry API is a Node route handler and cannot run on static hosting) | Not deployed |
| F3 | Add security headers / CSP at the host or in `next.config.ts` once the final third-party surface is known | Baseline headers are implemented; CSP should be tightened at launch |
| F4 | Verify `robots.txt` disallows `/thank-you` and the API | Implemented in `src/app/robots.ts` |
| F5 | Re-run Lighthouse mobile on production hardware | Local numbers only so far |
| F6 | Back up the lead store before first real traffic | Manual step |

## G. Deliberately not built (and why)

- **`/for-workers`** — the brief allows this only when approved public worker-facing information and a follow-up process exist. Neither does. Shipping a worker page with a dead end would be worse than not shipping it.
- **Video hero** — no licensed footage exists. The hero is a still with motion, and the design is built so video can drop in later without a redesign.
- **Testimonials, client logos, placement statistics** — not verified, not permissioned, therefore not published. The components exist and render an honest empty state.
- **Any worker registration, candidate search, dashboard or worker data of any kind** — out of scope by design; this is a marketing website, not the recruitment platform.
