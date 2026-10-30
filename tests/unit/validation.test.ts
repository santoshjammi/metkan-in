import { describe, expect, it } from "vitest";
import {
  EMPLOYMENT_TYPES,
  HEADCOUNT_BANDS,
  HONEYPOT_FIELD,
  MAX_TRADES,
  MIN_RENDER_DELAY_MS,
  ORG_TYPES,
  REFERENCE_PATTERN,
  TIMELINES,
  enquiryFieldsSchema,
  enquirySchema,
  isLikelyBot,
  isValidReference,
  parseEnquiry,
} from "@/lib/validation";
import { capabilities, tradeSlugs } from "@/content/capabilities";
import {
  employmentTypes,
  headcountBands,
  orgTypes,
  timelines,
} from "@/content/site";

/** A payload a real browser form would send. */
function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Ravi Kumar",
    organisation: "Autonagar Fabrication Works",
    email: "ravi@example.com",
    orgType: "employer",
    consent: true,
    website: "",
    renderedAt: Date.now() - 10_000,
    ...overrides,
  };
}

describe("enquiry schema — accepted input", () => {
  it("accepts a minimal payload (required fields only)", () => {
    const result = parseEnquiry(validPayload());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data).toEqual({
      name: "Ravi Kumar",
      organisation: "Autonagar Fabrication Works",
      email: "ravi@example.com",
      orgType: "employer",
      consent: true,
    });
    /* Bot-trapping fields never reach the record. */
    expect("website" in result.data).toBe(false);
    expect("renderedAt" in result.data).toBe(false);
  });

  it("accepts a fully populated payload and every known trade slug", () => {
    const result = parseEnquiry(
      validPayload({
        phone: "+91 74163 42020",
        trades: [...tradeSlugs],
        headcount: "26-100",
        location: "Visakhapatnam",
        employmentType: "contract",
        timeline: "30d",
        notes: "Two shifts, structural welding.",
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.trades).toHaveLength(tradeSlugs.length);
    expect(result.data.headcount).toBe("26-100");
    expect(result.data.timeline).toBe("30d");
  });

  it("treats empty optional controls as 'not provided'", () => {
    const parsed = enquiryFieldsSchema.safeParse({
      name: "Ravi Kumar",
      organisation: "Autonagar Fabrication Works",
      email: "ravi@example.com",
      orgType: "agency",
      consent: true,
      phone: "",
      headcount: "",
      location: "   ",
      employmentType: "",
      timeline: "",
      notes: "",
      trades: [],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.phone).toBeUndefined();
    expect(parsed.data.notes).toBeUndefined();
    expect(parsed.data.location).toBeUndefined();
    expect(parsed.data.headcount).toBeUndefined();
  });
});

describe("enquiry schema — rejected input", () => {
  for (const field of [
    "name",
    "organisation",
    "email",
    "orgType",
    "consent",
  ] as const) {
    it(`rejects a payload with no ${field}`, () => {
      const payload = validPayload();
      delete (payload as Record<string, unknown>)[field];

      const result = parseEnquiry(payload);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe("validation");
      expect(result.fieldErrors[field]).toBeTruthy();
    });
  }

  it("rejects unknown keys", () => {
    const result = parseEnquiry(validPayload({ salary: "50000" }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("validation");
    /* The key itself is not echoed back — only a form-level message. */
    expect(JSON.stringify(result.fieldErrors)).not.toContain("salary");
  });

  it("rejects a malformed email", () => {
    for (const email of ["not-an-email", "a@b", "@example.com", "a b@example.com"]) {
      const result = parseEnquiry(validPayload({ email }));
      expect(result.ok, email).toBe(false);
      if (result.ok) continue;
      expect(result.fieldErrors.email).toBeTruthy();
    }
  });

  it("rejects consent that is false, missing or a string", () => {
    for (const consent of [false, undefined, "true", 1]) {
      const result = parseEnquiry(validPayload({ consent }));
      expect(result.ok, String(consent)).toBe(false);
      if (result.ok) continue;
      expect(result.fieldErrors.consent).toBeTruthy();
    }
  });

  it("rejects an unknown orgType, headcount band, employment type or timeline", () => {
    const cases: Record<string, unknown>[] = [
      { orgType: "contractor" },
      { headcount: "5-10" },
      { employmentType: "gig" },
      { timeline: "next year" },
    ];

    for (const overrides of cases) {
      const result = parseEnquiry(validPayload(overrides));
      expect(result.ok, JSON.stringify(overrides)).toBe(false);
    }
  });

  it("rejects a trade slug that is not a known capability", () => {
    const result = parseEnquiry(validPayload({ trades: ["welding", "astronaut"] }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.trades).toBeTruthy();
  });

  it(`rejects more than ${MAX_TRADES} trades`, () => {
    const tooMany = Array.from({ length: MAX_TRADES + 1 }, () => "welding");
    const result = parseEnquiry(validPayload({ trades: tooMany }));
    expect(result.ok).toBe(false);
  });

  it("rejects a phone number with letters, or one that is too short", () => {
    for (const phone of ["call me", "123", "+91 74163 42020 x"]) {
      const result = parseEnquiry(validPayload({ phone }));
      expect(result.ok, phone).toBe(false);
    }
  });

  it("rejects notes over 1200 characters", () => {
    const result = parseEnquiry(validPayload({ notes: "x".repeat(1201) }));
    expect(result.ok).toBe(false);
  });

  it("never echoes a submitted value in a field error", () => {
    const secret = "Ramesh-PII-1234";
    const result = parseEnquiry(validPayload({ name: secret, email: "bad" }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(JSON.stringify(result.fieldErrors)).not.toContain(secret);
  });
});

describe("enquiry schema — normalisation", () => {
  it("trims text fields and lower-cases the email", () => {
    const result = parseEnquiry(
      validPayload({
        name: "  Ravi Kumar  ",
        organisation: "  Autonagar Fabrication Works ",
        email: "  Ravi.Kumar@Example.COM  ",
        location: "  Visakhapatnam  ",
        notes: "  Two shifts.  ",
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.name).toBe("Ravi Kumar");
    expect(result.data.organisation).toBe("Autonagar Fabrication Works");
    expect(result.data.email).toBe("ravi.kumar@example.com");
    expect(result.data.location).toBe("Visakhapatnam");
    expect(result.data.notes).toBe("Two shifts.");
  });

  it("deduplicates repeated trades", () => {
    const result = parseEnquiry(
      validPayload({ trades: ["welding", "welding", "plumbing"] }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.trades).toEqual(["welding", "plumbing"]);
  });

  it("measures length after trimming, not before", () => {
    /* 3 characters padded to 10 — still under the 2-character minimum. */
    expect(parseEnquiry(validPayload({ name: "       a  " })).ok).toBe(false);
  });
});

describe("enquiry schema — bot traps", () => {
  it(`rejects a filled ${HONEYPOT_FIELD} field`, () => {
    const result = parseEnquiry(validPayload({ [HONEYPOT_FIELD]: "https://spam.example" }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bot_check");
    /* No field map: the route answers with one generic message. */
    expect(result.fieldErrors).toEqual({});
  });

  it("accepts an absent honeypot", () => {
    const payload = validPayload();
    delete (payload as Record<string, unknown>)[HONEYPOT_FIELD];
    expect(parseEnquiry(payload).ok).toBe(true);
  });

  it(`rejects a form rendered for less than ${MIN_RENDER_DELAY_MS}ms`, () => {
    const result = parseEnquiry(validPayload({ renderedAt: Date.now() - 100 }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bot_check");
  });

  it("rejects a renderedAt in the future", () => {
    const result = parseEnquiry(validPayload({ renderedAt: Date.now() + 60_000 }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bot_check");
  });

  it("reports traps through isLikelyBot() for the pre-rate-limit check", () => {
    expect(isLikelyBot(validPayload())).toBe(false);
    expect(isLikelyBot(validPayload({ [HONEYPOT_FIELD]: "spam" }))).toBe(true);
    expect(isLikelyBot(validPayload({ renderedAt: Date.now() }))).toBe(true);
    /* Unreadable payloads are a schema problem, not a bot signal. */
    expect(isLikelyBot(null)).toBe(false);
    expect(isLikelyBot("nope")).toBe(false);
  });
});

describe("enquiry schema — contract integrity", () => {
  it("keeps its enums identical to src/content/site.ts", () => {
    expect(orgTypes.map((option) => option.value)).toEqual([...ORG_TYPES]);
    expect(headcountBands.map((band) => band.value)).toEqual([...HEADCOUNT_BANDS]);
    expect(employmentTypes.map((option) => option.value)).toEqual([
      ...EMPLOYMENT_TYPES,
    ]);
    expect(timelines.map((option) => option.value)).toEqual([...TIMELINES]);
  });

  it("keeps its trade enum identical to src/content/capabilities.ts", () => {
    const options = enquirySchema.shape.trades;
    expect(options).toBeTruthy();
    expect(tradeSlugs).toHaveLength(capabilities.length);
    expect(tradeSlugs).toContain("welding");
  });
});

describe("reference format guard", () => {
  it("accepts a well-formed reference and rejects near misses", () => {
    expect(isValidReference("MITT-261030-K3M5QW")).toBe(true);
    /* Base32 excludes 0, 1, 8 and 9 — a reference containing them is not ours. */
    expect(isValidReference("MITT-261030-K3M9QW")).toBe(false);
    expect(isValidReference("MITT-261030-K3M0QW")).toBe(false);
    expect(isValidReference("MITT-261030-k3m5qw")).toBe(false);
    expect(isValidReference("MITT-261030-K3M5Q")).toBe(false);
    expect(isValidReference("MITT-2610301-K3M5QW")).toBe(false);
    expect(isValidReference("MIT-261030-K3M5QW")).toBe(false);
    expect(isValidReference(undefined)).toBe(false);
    expect(isValidReference(["MITT-261030-K3M5QW"])).toBe(false);
    expect(REFERENCE_PATTERN.source).toBe("^MITT-\\d{6}-[A-Z2-7]{6}$");
  });
});
