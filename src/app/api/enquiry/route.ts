import { NextResponse } from "next/server";
import { persistEnquiry, type EnquiryRecord } from "@/lib/leads";
import { notifyEnquiry, type NotifyResult } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";
import { newReference } from "@/lib/reference";
import { isLikelyBot, parseEnquiry } from "@/lib/validation";

/**
 * POST /api/enquiry — BUILD-SPEC §5.
 *
 * Order is deliberate and matches the contract:
 *   1. JSON parse            → 400 invalid_json
 *   2. honeypot + render age → 400 generic rejection
 *   3. rate limit (per IP)   → 429 + Retry-After
 *   4. schema parse          → 400 with a field-keyed error map
 *   5. durable append        → 503 store_unavailable on failure
 *   6. notify staff          → never changes the status code
 *   7. 201 { ok: true, reference, notified }
 *
 * Design choices, documented rather than implicit:
 *  - Bot traps answer with one generic message and a 400 rather than a fake
 *    success. A silent accept-and-drop would look identical to a real employer's
 *    successful submission from the client's point of view, and this endpoint
 *    must never imply storage that did not happen (BUILD-SPEC §0.4). The message
 *    is generic so a probe cannot tell which trap fired.
 *  - The rate limiter runs before schema validation, so a bot that keeps posting
 *    broken payloads still burns its allowance; the bot traps run before both, so
 *    a bot never consumes a real employer's allowance.
 *  - Notification happens only after the record is durably on disk, and is a
 *    bonus rather than a precondition: if the relay is down the enquiry is still
 *    accepted, because it is already stored and readable. Failing the request
 *    would push the employer to resubmit and store a duplicate.
 *  - The notify step is bounded at 6s so a wedged relay cannot hold the response
 *    open on an employer who is waiting for their reference number.
 *  - No PII in any log line: only the reference, the channel and a short status.
 */

export const runtime = "nodejs";
/** Reads env and writes to disk per request: never cached, never prerendered. */
export const dynamic = "force-dynamic";

const GENERIC_REJECTION =
  "We couldn't accept this submission. Please reload the page and try again.";

const STORE_UNAVAILABLE =
  "Your enquiry could not be saved, so it was not sent. Please try again, or call MITT directly.";

const RATE_LIMITED =
  "Too many enquiries have been sent from this connection. Please wait a few minutes and try again.";

const MALFORMED =
  "We couldn't read that request. Please reload the page and submit the form again.";

/** Total wall-clock budget for the notification step. */
const NOTIFY_BUDGET_MS = 6000;

function reply(
  body: Record<string, unknown>,
  status: number,
  headers?: Record<string, string>,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", ...headers },
  });
}

/**
 * Client key: first hop of `x-forwarded-for`, else `x-real-ip`, else a shared
 * `unknown` bucket. A proxy that does not rewrite the header can be spoofed —
 * see the caveat in `rate-limit.ts`.
 */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstHop = forwarded?.split(",")[0]?.trim();
  if (firstHop && firstHop.length > 0) return firstHop;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && realIp.length > 0) return realIp;

  return "unknown";
}

/**
 * Run the notifier with a hard ceiling. `notifyEnquiry` never rejects, so a
 * losing race leaves no unhandled rejection behind: the loser finishes on its own
 * and its result is simply discarded.
 */
async function notifyWithinBudget(record: EnquiryRecord): Promise<NotifyResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const budget = new Promise<NotifyResult>((resolve) => {
    timer = setTimeout(
      () => resolve({ ok: false, channel: "none", error: "budget_exceeded" }),
      NOTIFY_BUDGET_MS,
    );
  });

  try {
    return await Promise.race([notifyEnquiry(record), budget]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  /* 1 — JSON body ------------------------------------------------------- */
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return reply({ ok: false, error: "invalid_json", message: MALFORMED }, 400);
  }

  /* 2 — honeypot + render delay ----------------------------------------- */
  if (isLikelyBot(payload)) {
    return reply(
      { ok: false, error: "submission_rejected", message: GENERIC_REJECTION },
      400,
    );
  }

  /* 3 — rate limit ------------------------------------------------------ */
  const limit = checkRateLimit(clientKey(request));
  if (!limit.allowed) {
    return reply(
      { ok: false, error: "rate_limited", message: RATE_LIMITED },
      429,
      { "retry-after": String(limit.retryAfterSeconds) },
    );
  }

  /* 4 — schema ---------------------------------------------------------- */
  const parsed = parseEnquiry(payload);
  if (!parsed.ok) {
    if (parsed.reason === "bot_check") {
      return reply(
        { ok: false, error: "submission_rejected", message: GENERIC_REJECTION },
        400,
      );
    }

    return reply(
      {
        ok: false,
        error: "validation_failed",
        message: "Please check the highlighted fields and submit again.",
        fields: parsed.fieldErrors,
      },
      400,
    );
  }

  /* 5 — durable write, then and only then success ----------------------- */
  const reference = newReference();
  const receivedAt = new Date().toISOString();
  const record: EnquiryRecord = {
    ...parsed.data,
    reference,
    receivedAt,
    source: "website",
  };

  try {
    await persistEnquiry(record);
  } catch {
    /* No submitted value, and no path, in the log line. */
    console.error(`[enquiry] store_unavailable ref=${reference} at=${receivedAt}`);
    return reply(
      { ok: false, error: "store_unavailable", message: STORE_UNAVAILABLE },
      503,
    );
  }

  console.info(
    `[enquiry] stored ref=${reference} at=${receivedAt} orgType=${record.orgType}`,
  );

  /* 6 — notify staff. The enquiry is already durable: this cannot fail it. */
  const notification = await notifyWithinBudget(record);

  if (notification.ok) {
    console.info(`[enquiry] notified ref=${reference} channel=${notification.channel}`);
  } else {
    console.warn(
      `[enquiry] notify_failed ref=${reference} channel=${notification.channel} reason=${notification.error ?? "unknown"}`,
    );
  }

  /* 7 — success. `notified` is additive; the rest of the shape is unchanged. */
  return reply({ ok: true, reference, notified: notification.ok }, 201);
}

/** Explicit rather than implicit: this endpoint accepts POST only. */
export function GET(): NextResponse {
  return reply(
    { ok: false, error: "method_not_allowed" },
    405,
    { allow: "POST" },
  );
}

export function PUT(): NextResponse {
  return GET();
}

export function PATCH(): NextResponse {
  return GET();
}

export function DELETE(): NextResponse {
  return GET();
}
