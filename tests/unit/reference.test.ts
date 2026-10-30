import { describe, expect, it } from "vitest";
import { istParts, newReference } from "@/lib/reference";
import { REFERENCE_PATTERN } from "@/lib/validation";

describe("newReference()", () => {
  it("matches MITT-<YYMMDD>-<6 base32 chars>", () => {
    const reference = newReference();
    expect(reference).toMatch(REFERENCE_PATTERN);
    expect(reference.startsWith("MITT-")).toBe(true);
    expect(reference.split("-")).toHaveLength(3);
  });

  it("uses the IST calendar date for the date part", () => {
    /* 2026-10-29T20:00:00Z is 2026-10-30 01:30 IST — the next day in India. */
    const lateUtc = new Date("2026-10-29T20:00:00.000Z");
    expect(newReference(lateUtc)).toMatch(/^MITT-261030-[A-Z2-7]{6}$/);

    /* 2026-10-30T18:29:00Z is 2026-10-30 23:59 IST — still the same day. */
    expect(newReference(new Date("2026-10-30T18:29:00.000Z"))).toMatch(
      /^MITT-261030-[A-Z2-7]{6}$/,
    );

    /* 2026-10-30T18:31:00Z is 2026-10-31 00:01 IST. */
    expect(newReference(new Date("2026-10-30T18:31:00.000Z"))).toMatch(
      /^MITT-261031-[A-Z2-7]{6}$/,
    );
  });

  it("is stable across time zones", () => {
    const instant = new Date("2026-01-01T00:30:00.000Z");
    expect(istParts(instant).yymmdd).toBe("260101");
    expect(istParts(instant).yyyymm).toBe("2026-01");
  });

  it("refuses an invalid Date", () => {
    expect(() => istParts(new Date("nope"))).toThrow(TypeError);
  });

  it("is unique across 500 calls", () => {
    const seen = new Set<string>();
    for (let index = 0; index < 500; index += 1) {
      seen.add(newReference());
    }
    expect(seen.size).toBe(500);
  });

  it("carries 6 body characters with no ambiguous padding", () => {
    const body = newReference().split("-")[2] ?? "";
    expect(body).toHaveLength(6);
    /* RFC 4648 base32: A–Z and 2–7 only. */
    expect(body).toMatch(/^[A-Z2-7]{6}$/);
  });
});
