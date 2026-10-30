import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  pruneExpired,
  rateLimitConfig,
  resetRateLimitStore,
} from "@/lib/rate-limit";

const ORIGINAL_MAX = process.env.MITT_RATE_LIMIT_MAX;
const ORIGINAL_WINDOW = process.env.MITT_RATE_LIMIT_WINDOW_MS;

beforeEach(() => {
  resetRateLimitStore();
});

afterEach(() => {
  resetRateLimitStore();
  if (ORIGINAL_MAX === undefined) delete process.env.MITT_RATE_LIMIT_MAX;
  else process.env.MITT_RATE_LIMIT_MAX = ORIGINAL_MAX;

  if (ORIGINAL_WINDOW === undefined) delete process.env.MITT_RATE_LIMIT_WINDOW_MS;
  else process.env.MITT_RATE_LIMIT_WINDOW_MS = ORIGINAL_WINDOW;
});

describe("checkRateLimit()", () => {
  it("defaults to 5 requests per 10 minutes", () => {
    delete process.env.MITT_RATE_LIMIT_MAX;
    delete process.env.MITT_RATE_LIMIT_WINDOW_MS;
    expect(rateLimitConfig()).toEqual({ max: 5, windowMs: 600_000 });
  });

  it("allows N requests then blocks, reporting retryAfter", () => {
    process.env.MITT_RATE_LIMIT_MAX = "3";
    process.env.MITT_RATE_LIMIT_WINDOW_MS = "60000";

    const start = 1_000_000;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const result = checkRateLimit("203.0.113.7", start + attempt);
      expect(result.allowed, `attempt ${attempt}`).toBe(true);
      expect(result.remaining).toBe(3 - attempt);
      expect(result.retryAfterSeconds).toBe(0);
    }

    const blocked = checkRateLimit("203.0.113.7", start + 4);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    /* Window opened at start+1 and expires 60s later: 59.997s rounds up to 60. */
    expect(blocked.retryAfterSeconds).toBe(60);
  });

  it("keeps separate budgets per key", () => {
    process.env.MITT_RATE_LIMIT_MAX = "2";

    expect(checkRateLimit("198.51.100.1").allowed).toBe(true);
    expect(checkRateLimit("198.51.100.1").allowed).toBe(true);
    expect(checkRateLimit("198.51.100.1").allowed).toBe(false);

    expect(checkRateLimit("198.51.100.2").allowed).toBe(true);
  });

  it("resets once the window has elapsed", () => {
    process.env.MITT_RATE_LIMIT_MAX = "1";
    process.env.MITT_RATE_LIMIT_WINDOW_MS = "1000";

    expect(checkRateLimit("192.0.2.9", 5_000).allowed).toBe(true);
    expect(checkRateLimit("192.0.2.9", 5_500).allowed).toBe(false);
    expect(checkRateLimit("192.0.2.9", 6_001).allowed).toBe(true);
  });

  it("falls back to the default when the env value is not a positive integer", () => {
    process.env.MITT_RATE_LIMIT_MAX = "0";
    process.env.MITT_RATE_LIMIT_WINDOW_MS = "not-a-number";
    expect(rateLimitConfig()).toEqual({ max: 5, windowMs: 600_000 });
  });

  it("prunes expired windows without touching live ones", () => {
    process.env.MITT_RATE_LIMIT_MAX = "1";
    process.env.MITT_RATE_LIMIT_WINDOW_MS = "1000";

    checkRateLimit("old", 1_000);
    checkRateLimit("live", 10_000);
    expect(checkRateLimit("old", 10_000).allowed).toBe(true); // expired → fresh window
    expect(checkRateLimit("live", 10_500).allowed).toBe(false);

    pruneExpired(20_000);
    /* After the sweep, the previously blocked key starts clean. */
    expect(checkRateLimit("live", 20_000).allowed).toBe(true);
  });
});
