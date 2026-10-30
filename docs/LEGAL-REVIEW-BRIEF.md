# MITT Website - Legal Review Brief

**Document status:** draft prepared for a reviewing lawyer. Not legal advice.
**Prepared:** 30 October 2026
**Pages in scope:** `/privacy` (privacy notice), `/terms` (website terms of use)
**Site:** MITT marketing website, Next.js, repository `MITT/website`

---

## 1. What the organisation is, and what the site does

Metkan Institute for Technical Training ("MITT") is a technical training and
skilled-workforce coordination organisation at A-3, B Block, Autonagar,
Visakhapatnam 530012, Andhra Pradesh, India. Published telephone: +91 74163
42020. No enquiries email address is published; contact is by telephone or post.

The site is a static-style marketing website with exactly one data-collecting
interaction: an employer enquiry form at `/contact`, which posts to
`POST /api/enquiry`. Its public pages describe MITT, the trades it works with,
its training capability and its process. There is no login, no dashboard, no
worker registration, no candidate portal, no payment flow and no newsletter.

The site deliberately publishes **no** testimonials, no client logos, no
placement percentages, no certification or accreditation claims and no overseas
recruitment authorisation claim, because none has been verified or permissioned.

## 2. Personal data the site actually collects

One enquiry record per accepted submission, stored as a JSON line on the server
(`var/enquiries/enquiries-YYYY-MM.jsonl`, directory mode 0700, file mode 0600):

| Field | Required | Notes |
|---|---|---|
| name | yes | trimmed, 2-80 chars |
| organisation | yes | trimmed, 2-120 chars |
| email | yes | trimmed, lower-cased, format-validated |
| phone | no | digits, spaces, `+`, `-` only |
| orgType | yes | employer / agency / other |
| trades | no | up to 8 values from a fixed list |
| headcount | no | banded: 1-5 / 6-25 / 26-100 / 100+ |
| location | no | free text, max 120 chars |
| employmentType | no | permanent / contract / other |
| timeline | no | immediate / 30 days / 90 days / exploring |
| notes | no | free text |
| consent | yes | must be `true`; the record also carries `receivedAt` (ISO timestamp) and a reference `MITT-YYMMDD-XXXXXX` |

Technical detail relevant to review:

- Unknown fields are rejected by a strict server-side schema; values are
  normalised (trimmed, email lower-cased) before storage.
- Anti-automation: a honeypot field and a minimum render delay. Neither stores
  personal data.
- Rate limiting is per client IP, **in-memory and single-instance only**. It is
  bypassable behind a proxy that does not rewrite `X-Forwarded-For`, and does
  not survive a restart. This is documented in `src/lib/rate-limit.ts`; a
  shared store is required for multi-instance deployment.
- Logs carry reference, timestamp and orgType only. No name, email or message
  content is logged.
- Analytics (`src/lib/analytics.ts`) is a local event array with an allow-list
  of coarse values; nothing is transmitted unless a third-party domain is
  configured, and no field value can be sent.
- No cookies are set by the application; no third-party analytics or advertising
  script is loaded by default.

## 3. Every bracketed placeholder on the two pages

Six placeholders exist. All are visible on the rendered pages, set in a bordered
callout so they cannot be missed, and all are repeated below.

| # | Placeholder (exact text) | Page | Section | What the reviewer must supply |
|---|---|---|---|---|
| 1 | `[RETENTION SCHEDULE - TO BE CONFIRMED]` | /privacy | How long it is kept | Retention periods for open, closed and dormant enquiries, and any statutory retention that overrides deletion |
| 2 | `[PROCESSOR AGREEMENTS - TO BE CONFIRMED]` | /privacy | Who can see it | Whether DPDP-compliant processor contracts are required for the hosting and email/notification providers, and what they must contain |
| 3 | `[CROSS-BORDER POSITION - TO BE CONFIRMED]` | /privacy | Where it is stored | Whether any hosting or delivery provider stores data outside India, and the effect of DPDP Act restrictions / any notified negative list |
| 4 | `[RESPONSE TIMELINE - TO BE CONFIRMED]` | /privacy | Your rights as a data principal | The statutory or internal period within which a data principal request must be answered |
| 5 | `[GRIEVANCE OFFICER - TO BE CONFIRMED]` | /privacy | Grievance redressal | Name, direct telephone number and postal address of the grievance contact (or confirmation that another mechanism satisfies the Act) |
| 6 | `[JURISDICTION WORDING - TO BE CONFIRMED]` | /terms | Governing law and jurisdiction | Whether exclusive jurisdiction should be claimed, and the precise court description for Visakhapatnam, Andhra Pradesh |

Related open items that are stated on the pages as facts (not placeholders) but
need confirmation:

- MITT is described as the **data fiduciary** and the notice as a notice under
  the DPDP Act, 2023. Confirm the entity that is legally the fiduciary (see 6).
- The pages state that no enquiries email is published.
- The terms credit Sai Ameya Technologies LLP as technology partner and state
  that the credit is not a transfer of ownership.
- The terms describe the site as governed by Indian law with jurisdiction
  intended at Visakhapatnam.

## 4. DPDP Act questions that need answering

1. **Grievance officer.** Who is the named contact, what is their direct
   telephone number and postal address, and is publishing a role mailbox (once
   an enquiries email exists) an acceptable alternative? Does the Act require the
   name of an individual, or is a designated role sufficient?
2. **Retention schedule.** What retention period is defensible for (a) an
   enquiry that becomes an active commercial relationship, (b) an enquiry that is
   declined or goes dormant, (c) the consent record itself? Is a per-purpose
   schedule required to be published, or is a stated principle plus a period on
   request sufficient?
3. **Processor agreements.** Which providers are processors rather than
   fiduciaries, and what contractual terms does the Act require MITT to impose
   before live data is processed? Is a hosting provider's standard DPA adequate?
4. **Cross-border.** Does any notified restriction apply to enquiry data, and
   what must the notice say if hosting sits outside India? Is a sectoral
   restriction relevant given the training/workforce context?
5. **Consent as the sole basis for B2B enquiries.** Is checkbox consent
   adequate and appropriate for an employer's representative submitting a
   business enquiry, or should MITT rely on a legitimate use instead? If consent
   is retained, is the current withdrawal route (telephone/post, no email) and
   the deletion-on-withdrawal promise workable, including where a commercial
   record must survive?
6. **Response timeline.** What period must MITT meet for access, correction,
   erasure and grievance requests, and must that period be published?
7. **Child data.** The notice states the site is not directed at children and
   operates no age gate. Is that position defensible for a B2B-only form, and
   does anything in section 9 of the Act require a different treatment?
8. **Unsolicited special-category material.** If a person sends identity,
   medical, biometric or emigration documents through the notes field or by
   post, what must MITT do, and should the notice state a handling rule?
9. **Complaint route.** Should the notice name the Data Protection Board of
   India and describe how to complain to it now, or wait until the Board's
   procedure is settled?
10. **IT Act overlay.** Is the reference to reasonable security practices under
    the IT Act, 2000 and the SPDI Rules, 2011 accurate for this data, given that
    enquiry data is business contact data rather than sensitive personal data?

## 5. Non-DPDP items for the same review

- **Entity and registration.** The site publishes only the trading/legal name.
  No company registration number, LLP/trust/society identifier, GSTIN or
  registered-office distinction is published. Confirm what must appear, and
  whether the name as published is the correct legal entity.
- **Jurisdiction clause** (placeholder 6) and whether an exclusive-jurisdiction
  claim is appropriate for a free, informational website.
- **Limitation of liability** wording: confirm it does not purport to exclude
  rights that cannot be excluded, and that it is appropriately scoped to the
  website rather than to any engagement.
- **Attribution.** Confirm the technology-partner credit does not create an
  agency, partnership or representation.
- **Overseas activity.** The terms state international activity is coordinated
  through authorised partners with no promise of visas or approvals. Confirm
  this is sufficient given the Emigration Act, 1983 and Recruitment Agent
  licensing, and whether any RA licence reference must appear.
- **Fee position.** The pages state no worker fees are collected through the
  website. Confirm whether a broader fee-disclosure statement is required.

## 6. Sign-off

The DRAFT chip on both pages is driven by a single flag,
`legalReviewPending` in `src/content/site.ts` (currently `true`). **The chip
stays until this table is completed and signed.** When sign-off is recorded, the
reviewed wording is applied, the placeholders are replaced with confirmed text,
and only then is the flag set to `false` and the last-updated line changed. The
flag controls the chip; editing the page copy alone does not remove it.

| Field | Entry |
|---|---|
| Reviewed by (name) | |
| Firm / capacity | |
| Bar / enrolment reference (if applicable) | |
| Date of review | |
| Pages and version reviewed (commit) | |
| Decision | Approve / Approve with changes / Reject - delete as applicable |
| Conditions or required changes | |
| Placeholders resolved (list numbers from section 3) | |
| Placeholders outstanding after review | |
| Flag change authorised (`legalReviewPending` -> false) | Yes / No |
| Signature | |

A second row should be added for each subsequent review; this brief is versioned
with the repository rather than overwritten.
