/**
 * Fixed-window rate limiter for the enquiry endpoint.
 *
 * SCOPE — READ THIS BEFORE RELYING ON IT:
 * this limiter is **single-instance and in-memory only**. It protects a
 * single-process deployment (one `next start`, one Node process) from a trivial
 * flood. It does not survive a restart, it is not shared between instances, and
 * it is bypassable by anyone who controls the `X-Forwarded-For` header unless a
 * reverse proxy rewrites it. A multi-instance or publicly exposed deployment
 * needs a shared store (Redis, Upstash, or the platform's own limiter) in front
 * of this one. BUILD-SPEC §5 asks for exactly this trade-off, documented.
 *
 * Window semantics: the first request from a key opens a window of
 * `MITT_RATE_LIMIT_WINDOW_MS`; every request inside it counts, including ones
 * that are later rejected by validation. The window is not extended by use.
 */

const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_MS = 10 * 60 * 1000;

/** Prune once the map grows past this, so a long-lived process stays bounded. */
const PRUNE_THRESHOLD = 500;

interface Window {
  count: number;
  /** Epoch ms at which this window expires and the count resets. */
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Requests still available in the current window (0 once blocked). */
  remaining: number;
  /** Seconds until the window resets. 0 when the request was allowed. */
  retryAfterSeconds: number;
}

function positiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Read at call time, not at import time, so `MITT_RATE_LIMIT_MAX` /
 * `MITT_RATE_LIMIT_WINDOW_MS` can be set per environment (and per test).
 */
export function rateLimitConfig(): RateLimitConfig {
  return {
    max: positiveInt(process.env.MITT_RATE_LIMIT_MAX, DEFAULT_MAX),
    windowMs: positiveInt(process.env.MITT_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  };
}

/** Drop windows that have already expired. */
export function pruneExpired(now: number = Date.now()): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/**
 * Count one request against `key` (the client IP) and report the verdict.
 * `now` is injectable so tests do not have to wait ten minutes.
 */
export function checkRateLimit(
  key: string,
  now: number = Date.now(),
): RateLimitResult {
  const { max, windowMs } = rateLimitConfig();

  if (windows.size >= PRUNE_THRESHOLD) pruneExpired(now);

  const existing = windows.get(key);
  const window =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + windowMs };

  window.count += 1;
  windows.set(key, window);

  const allowed = window.count <= max;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((window.resetAt - now) / 1000),
  );

  return {
    allowed,
    remaining: Math.max(0, max - window.count),
    retryAfterSeconds: allowed ? 0 : retryAfterSeconds,
  };
}

/** Test/ops hook: forget every window. */
export function resetRateLimitStore(): void {
  windows.clear();
}
