/**
 * Enquiry references.
 *
 * Format: `MITT-<YYMMDD>-<6 base32 chars>`, e.g. `MITT-261030-K3M9QW`.
 *
 * - Entropy comes from `crypto.randomUUID()`: no `Math.random`, no counter, no
 *   PII, no database round-trip. 30 bits are drawn from the UUID nibbles, which
 *   is enough to make collisions irrelevant for a lead sheet and keeps the
 *   reference short enough to read over the phone.
 * - The date part is the IST calendar date, because the office and the operators
 *   reading these references are in Visakhapatnam. It is computed by a fixed
 *   offset (India has no DST), so the output does not depend on the server's TZ.
 */

import { randomUUID } from "node:crypto";

/** RFC 4648 base32 alphabet, uppercase, without padding. */
export const REFERENCE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Characters drawn from the UUID. */
const REFERENCE_BODY_LENGTH = 6;

/** IST = UTC+05:30, no daylight saving. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export interface IstParts {
  /** `YYMMDD`, for the reference. */
  yymmdd: string;
  /** `YYYY-MM`, for the monthly lead file. */
  yyyymm: string;
}

/** Calendar parts of an instant, in IST. Deterministic for a given Date. */
export function istParts(date: Date): IstParts {
  if (Number.isNaN(date.getTime())) {
    throw new TypeError("istParts() requires a valid Date");
  }

  const iso = new Date(date.getTime() + IST_OFFSET_MS).toISOString();

  return {
    yymmdd: `${iso.slice(2, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}`,
    yyyymm: iso.slice(0, 7),
  };
}

/** Six base32 characters carrying 30 bits of UUID entropy. */
function randomBody(): string {
  const hex = randomUUID().replace(/-/g, "");

  let buffer = 0;
  let bits = 0;
  let body = "";

  for (const digit of hex) {
    buffer = (buffer << 4) | Number.parseInt(digit, 16);
    bits += 4;

    while (bits >= 5 && body.length < REFERENCE_BODY_LENGTH) {
      bits -= 5;
      const index = (buffer >> bits) & 0b11111;
      body += REFERENCE_ALPHABET[index] ?? "A";
    }

    if (body.length === REFERENCE_BODY_LENGTH) break;
  }

  return body;
}

/** `MITT-<YYMMDD>-<6 base32 chars>`. Injectable clock keeps it testable. */
export function newReference(now: Date = new Date()): string {
  return `MITT-${istParts(now).yymmdd}-${randomBody()}`;
}
