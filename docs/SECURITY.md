# MITT website - security notes

Scope: the public marketing site in this repository and its single write endpoint,
`POST /api/enquiry`. Last reviewed 2026-10-30.

## Threat model

This is a public marketing surface. There is no login, no session, no admin UI, no
database and no worker data anywhere in this codebase. The only state the
application creates is one line appended to a JSONL lead file per enquiry. That
narrows the realistic attacks to four:

1. **Lead loss or lead fabrication.** An enquiry that reports success but was not
   stored destroys an employer's trust, and an enquiry that is stored but never
   read is equally lost. Both are treated as security problems, not UX problems.
2. **Automated spam and junk submission.** Contact forms are scanned continuously.
   The goal is to keep junk out of the lead file without turning real employers
   away or handing a scanner a cheap way to fill the disk.
3. **Personally identifiable information exposure.** An enquiry carries a name, a
   work email, an optional phone number and free-text notes. That is employee-level
   personal data of people at other companies. It must not appear in logs, error
   responses or analytics, and it must not be readable by other users on the host.
4. **Browser-side injection and framing.** Even a static site is worth defacing or
   framing inside a lookalike page in a recruitment-fraud campaign, because the
   brand is the asset.

Explicitly out of scope: anything requiring worker or candidate records. MITT holds
none on this site; if that changes, this document is invalid and a fresh assessment
is required before the first record is stored.

## What is implemented

**Input handling.** The payload is parsed as JSON and rejected with `400` if it is
not JSON. Only the documented fields are accepted - the schema is `strict()`, so an
unexpected key fails the request rather than being silently stored. Every string is
trimmed and the email is lower-cased, so the stored record is normalised. All limits
are enforced server-side (name 2-80, organisation 2-120, notes 1200, up to 8 trades
from a fixed enum, phone restricted to digits, spaces, `+` and `-`). Client-side
validation exists for feedback only and is not trusted.

**Bot suppression.** A honeypot field (`website`) that no human can see or tab to,
plus a render-timing guard that rejects a submission returned faster than 2.5s after
the form mounted. Both traps answer with one generic message so a probe cannot learn
which one fired, and both run before the rate limiter so a bot never burns a real
employer's allowance.

**Rate limiting.** A fixed window of 5 submits per 10 minutes per client IP
(`MITT_RATE_LIMIT_MAX`, `MITT_RATE_LIMIT_WINDOW_MS`), answering `429` with
`Retry-After`. Single-instance and in-memory - see the caveats below.

**Fail-closed persistence.** The record is written to disk before any success is
reported. If the append fails, the response is `503 store_unavailable` and no
reference is issued, because a reference implies a retrievable enquiry. Monthly
`enquiries-YYYY-MM.jsonl` files, one newline-terminated line per enquiry, so a crash
truncates at worst the last line.

**File permissions.** The lead directory is created `0700` and files `0600`. The
data is readable only by the process user on the host. The `var/` directory is
git-ignored, so enquiries cannot be committed by accident.

**Notification fail-open, persistence fail-closed.** After a successful write the
enquiry is pushed to staff over a webhook and/or SMTP, bounded at 6s, and the result
is reported to the client as `notified: true|false`. A notification failure never
fails an accepted enquiry - it is already stored and readable - but it is logged so
the gap is visible.

**Security headers**, applied to every route from `next.config.ts`:
`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`,
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`,
`Cross-Origin-Opener-Policy: same-origin`, and `poweredByHeader: false` so the
framework is not advertised.

**Content-Security-Policy** (the shipped, production policy): `default-src 'self'`;
`script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline'`; `img-src
'self' data: blob:`; `font-src 'self' data:`; `connect-src 'self'`;
`frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`;
`object-src 'none'`. `unsafe-inline` for scripts is required: Next's App Router
streams its RSC payload as inline bootstrap scripts, and without it the pages paint
but never hydrate - which silently breaks the enquiry form. Removing it needs
per-request nonces, which force every page to be dynamic. There is no third-party
script, no inline user content and no auth on this origin, so the residual risk is a
self-XSS at worst. `connect-src 'self'` is what actually contains an injected
script: it cannot exfiltrate the form to another host.

`next dev` needs two extra sources that production does not get: `'unsafe-eval'`
(React's development build reconstructs callstacks with `eval()`, and without it
the dev client never mounts) and `ws:` for the hot-reload socket. Both are gated on
`NODE_ENV !== "production"` in `next.config.ts`, so the policy above is what ships.
The policy was verified against a real production build in Chrome: zero console
errors and zero CSP violations on `/` and `/contact`, client-side navigation
hydrating, and the enquiry form submitting to `/api/enquiry` and rendering its
reference.

**No PII in logs or errors.** Log lines carry the reference, the timestamp, the
`orgType`, the notification channel and a short status. Never a name, email, phone,
notes or the store path. Validation errors are keyed by field name and carry a
message, never the submitted value. The health endpoint emits booleans only.

**Health probe.** `GET /api/health` reports `leadStoreWritable` by probing the
directory (create-if-missing, then `W_OK`) without writing a test enquiry, and
returns `503` when the store is not writable. It exposes no env values.

## What is deliberately not implemented, and why

- **No WAF or bot-detection service.** A marketing site with one form does not
  justify the operational surface, the false positives or the third-party script
  (which would also force a CSP exception). The honeypot, timing guard and limiter
  cover the realistic volume; if the site is actually flooded, the answer is a
  proxy-level rule at the edge, not application code.
- **Rate limiting is single-instance and in-memory.** It does not survive a restart
  and is not shared between processes. It is also spoofable by anyone who controls
  `X-Forwarded-For` unless a reverse proxy rewrites that header, which it must. A
  multi-instance deployment needs a shared store (Redis/Upstash) or the platform's
  own limiter in front of this one. The limitation is documented in
  `src/lib/rate-limit.ts` rather than papered over.
- **No CSRF token.** The endpoint is unauthenticated and carries no session, so
  there is no authority for an attacker to borrow: a forged request produces a junk
  enquiry with the sender's own details, which is exactly what the rate limiter and
  bot traps already price in. The operation is effectively idempotent from the
  attacker's point of view - it can only create leads, never read, modify or delete
  them. Adding a token would require a session, which would be a larger attack
  surface than the one it removes.
- **No CAPTCHA.** It would add a third-party dependency, a CSP exception and a
  measurable drop in genuine employer conversions, to solve a problem the honeypot
  and timing guard already handle at this volume.
- **No encryption at rest for the lead file.** Filesystem permissions and host
  access control are the boundary. Full-disk encryption on the host is the right
  control and is a deployment decision, not application code. If the lead store ever
  moves to shared storage, encrypt it there.
- **No automatic PII retention deletion.** A monthly file is easy to rotate by hand;
  a scheduled deleter that silently eats leads is not. Retention is an operator
  task, listed below.

## Launch checklist - human steps that remain

1. **Legal review.** `/privacy` and `/terms` are drafts written against the DPDP Act
   2023 and the IT Act; `site.legalReviewPending` is `true` and renders a visible
   DRAFT chip. Counsel must review, then the flag flips. `scripts/preflight.mjs`
   reports this as a warning, not a blocker, because it is a human dependency.
2. **Real contact details.** `site.email.placeholder` must be `false` with a working
   inbox before launch; preflight blocks on it.
3. **Notification channel.** Set `MITT_NOTIFY_WEBHOOK` or the full `MITT_SMTP_*`
   block plus `MITT_NOTIFY_TO`, then send one real test enquiry end to end and
   confirm a human receives it. Preflight blocks on this. A configured channel that
   nobody reads is not a solved problem.
4. **Reverse proxy.** Terminate TLS, set HSTS-consistent redirects on the host, and
   rewrite `X-Forwarded-For` so the rate limiter keys on the real client.
5. **Lead directory.** Point `MITT_LEAD_DIR` at a persistent volume outside the
   deploy directory (a deploy that wipes the checkout must not wipe enquiries),
   confirm the node user owns it, and back it up on a schedule.
6. **Retention and access.** Decide who may read the lead file, for how long, and
   delete expired months. Record that decision somewhere the operator will find it.
7. **Media licensing.** Both published stills are development placeholders with
   unverified provenance - replace them or confirm the licence. Preflight warns.
8. **Probe monitoring.** Point an uptime check at `/api/health`; a `503` there means
   enquiries are being refused, which is silent otherwise.
