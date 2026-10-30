/**
 * Enquiry contract — BUILD-SPEC §5, implemented once and shared by the form,
 * the route handler and the tests.
 *
 * Rules enforced here:
 *  - only the documented fields are accepted (`strict()` rejects unknown keys);
 *  - every string field is trimmed, email is lower-cased, so the stored record is
 *    normalised rather than raw;
 *  - the honeypot (`website`) and the render-delay (`renderedAt`) are part of the
 *    same schema, so a bot submission cannot reach the field-error path;
 *  - parsing never throws: `parseEnquiry` returns a discriminated result.
 *
 * This module is safe on both sides of the wire (no node built-ins). The form
 * imports `enquiryFieldsSchema` for inline validation and the route imports
 * `enquirySchema` (fields + bot traps) for the authoritative check.
 */

import { z } from "zod";
import { tradeSlugs } from "@/content/capabilities";

/* ── shared constants ────────────────────────────────────────────────────── */

/** Honeypot field name. Uppercase-by-convention `website`; must be absent or empty. */
export const HONEYPOT_FIELD = "website";

/** A submission rendered for less than this long is treated as automated. */
export const MIN_RENDER_DELAY_MS = 2500;

/** Hard ceiling on trades per requirement. */
export const MAX_TRADES = 8;

/**
 * Reference format: `MITT-<YYMMDD>-<6 base32 chars>`.
 * Lives here (not in reference.ts) so read-only pages such as /thank-you can
 * validate a reference without importing server-only crypto code.
 */
export const REFERENCE_PATTERN = /^MITT-\d{6}-[A-Z2-7]{6}$/;

/**
 * Enum members mirror `src/content/site.ts`. Kept as literals so the union types
 * are exact; `tests/unit/validation.test.ts` asserts the two never drift.
 */
export const ORG_TYPES = ["employer", "agency", "other"] as const;
export const HEADCOUNT_BANDS = ["1-5", "6-25", "26-100", "100+"] as const;
export const EMPLOYMENT_TYPES = ["permanent", "contract", "other"] as const;
export const TIMELINES = ["immediate", "30d", "90d", "exploring"] as const;

/** Digits, spaces, `+` and `-` only — BUILD-SPEC §5. */
const PHONE_PATTERN = /^[0-9+\-\s]+$/;

/* ── helpers ─────────────────────────────────────────────────────────────── */

/** An untouched optional control submits "" — that means "not provided", not "invalid". */
function blankToUndefined(value: unknown): unknown {
  if (value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function optionalText(max: number, message: string) {
  return z.preprocess(
    blankToUndefined,
    z.string().trim().max(max, message).optional(),
  );
}

const tradeSchema = z.enum(tradeSlugs, {
  error: "Choose a trade from the list, or leave this blank.",
});

const fieldsShape = {
  name: z
    .string({ error: "Please enter your name." })
    .trim()
    .min(2, "Please enter at least 2 characters.")
    .max(80, "Please use 80 characters or fewer."),
  organisation: z
    .string({ error: "Please enter your organisation." })
    .trim()
    .min(2, "Please enter at least 2 characters.")
    .max(120, "Please use 120 characters or fewer."),
  email: z
    .string({ error: "Please enter an email address." })
    .trim()
    .toLowerCase()
    .pipe(z.email("Please enter a valid email address.")),
  orgType: z.enum(ORG_TYPES, {
    error: "Please choose the type of organisation.",
  }),
  consent: z.literal(true, {
    error: "Please confirm you agree to MITT using these details to reply.",
  }),
  phone: z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .min(7, "Please enter a phone number with at least 7 characters.")
      .max(18, "Please use 18 characters or fewer.")
      .regex(PHONE_PATTERN, "Use digits, spaces, + or - only.")
      .optional(),
  ),
  trades: z.preprocess(
    (value: unknown) => {
      const blanked = blankToUndefined(value);
      if (typeof blanked === "string") {
        return blanked
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length > 0);
      }
      return blanked;
    },
    z
      .array(tradeSchema, { error: "Choose trades from the list." })
      .max(MAX_TRADES, `Please choose up to ${MAX_TRADES} trades.`)
      .transform((values) => [...new Set(values)])
      .optional(),
  ),
  headcount: z.preprocess(
    blankToUndefined,
    z.enum(HEADCOUNT_BANDS, { error: "Please choose a volume band." }).optional(),
  ),
  location: optionalText(120, "Please use 120 characters or fewer."),
  employmentType: z.preprocess(
    blankToUndefined,
    z
      .enum(EMPLOYMENT_TYPES, { error: "Please choose an employment type." })
      .optional(),
  ),
  timeline: z.preprocess(
    blankToUndefined,
    z.enum(TIMELINES, { error: "Please choose a timeline." }).optional(),
  ),
  notes: optionalText(1200, "Please use 1200 characters or fewer."),
} as const;

/** The business fields, exactly as the form submits them. */
export const enquiryFieldsSchema = z.object(fieldsShape).strict();

/** The full wire payload, including the two bot traps. */
export const enquirySchema = z
  .object({
    ...fieldsShape,
    [HONEYPOT_FIELD]: z
      .string({ error: "Submission rejected." })
      .max(0, "Submission rejected.")
      .optional(),
    renderedAt: z
      .number({ error: "Submission rejected." })
      .refine((value) => Number.isFinite(value), "Submission rejected.")
      .refine((value) => value <= Date.now(), "Submission rejected.")
      .refine(
        (value) => Date.now() - value >= MIN_RENDER_DELAY_MS,
        "Submission rejected.",
      ),
  })
  .strict();

export type EnquiryFields = z.output<typeof enquiryFieldsSchema>;
export type EnquirySubmission = z.output<typeof enquirySchema>;

export type EnquiryFieldErrors = Record<string, string>;

export type ParseEnquiryResult =
  | { ok: true; data: EnquiryFields }
  | { ok: false; reason: "bot_check" | "validation"; fieldErrors: EnquiryFieldErrors };

const FALLBACK_FORM_ERROR =
  "We couldn't read this enquiry. Please reload the page and try again.";

/** One message per field, first issue wins. Submitted values are never echoed. */
function collectFieldErrors(error: z.ZodError): EnquiryFieldErrors {
  const errors: EnquiryFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || key.length === 0) continue;
    if (key === HONEYPOT_FIELD || key === "renderedAt") continue;
    if (errors[key]) continue;
    errors[key] = issue.message;
  }

  if (Object.keys(errors).length === 0) errors.form = FALLBACK_FORM_ERROR;
  return errors;
}

/**
 * Cheap pre-check used before the rate limiter runs, so a bot never consumes a
 * real employer's allowance. Deliberately conservative: a payload we cannot read
 * is *not* treated as a bot here — the schema reports that as a field error.
 */
export function isLikelyBot(input: unknown): boolean {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }

  const record = input as Record<string, unknown>;

  const honeypot = record[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim().length > 0) return true;

  const renderedAt = record.renderedAt;
  if (typeof renderedAt !== "number" || !Number.isFinite(renderedAt)) return false;

  // A future timestamp yields a negative age and fails this the same way.
  return Date.now() - renderedAt < MIN_RENDER_DELAY_MS;
}

/**
 * Authoritative parse. Returns, never throws.
 *
 * `reason: "bot_check"` carries no field errors on purpose — the route answers
 * with one generic message so a probe learns nothing about which trap fired.
 */
export function parseEnquiry(input: unknown): ParseEnquiryResult {
  const parsed = enquirySchema.safeParse(input);

  if (parsed.success) {
    /*
     * Copied field by field rather than spread-with-rest: the record shape is
     * then stated in one place, so a future field cannot leak into storage (or
     * into a webhook) just because it was added to the schema.
     */
    const value = parsed.data;
    const data: EnquiryFields = {
      name: value.name,
      organisation: value.organisation,
      email: value.email,
      orgType: value.orgType,
      consent: value.consent,
      phone: value.phone,
      trades: value.trades,
      headcount: value.headcount,
      location: value.location,
      employmentType: value.employmentType,
      timeline: value.timeline,
      notes: value.notes,
    };
    return { ok: true, data };
  }

  const botTrapFired = parsed.error.issues.some((issue) => {
    const key = issue.path[0];
    return key === HONEYPOT_FIELD || key === "renderedAt";
  });

  if (botTrapFired) return { ok: false, reason: "bot_check", fieldErrors: {} };

  return {
    ok: false,
    reason: "validation",
    fieldErrors: collectFieldErrors(parsed.error),
  };
}

/** /thank-you accepts `?ref=` only when it matches the issued format. */
export function isValidReference(value: unknown): value is string {
  return typeof value === "string" && REFERENCE_PATTERN.test(value);
}
