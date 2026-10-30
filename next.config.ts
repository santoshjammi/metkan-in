import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * `script-src 'self' 'unsafe-inline'` IS REQUIRED, and that is not laziness:
 * Next's App Router emits inline bootstrap and streamed `self.__next_f.push(...)`
 * RSC payload scripts into every document. Without `'unsafe-inline'` the page
 * paints and then never hydrates, which breaks the enquiry form - the one thing
 * this site has to do. Dropping it means per-request nonces, which force every
 * page to be dynamically rendered and forfeit the static optimisation the
 * marketing pages depend on. That trade is not worth it here: this origin serves
 * no user-generated content, loads no third-party script, and has no auth.
 *
 * `connect-src 'self'` keeps fetch/XHR same-origin only; the enquiry form posts
 * to /api/enquiry, so this holds. `frame-ancestors 'none'` plus
 * `X-Frame-Options: DENY` closes framing and clickjacking.
 *
 * DEV-ONLY RELAXATIONS, and why they exist:
 *  - `'unsafe-eval'`: React's *development* build reconstructs cross-environment
 *    callstacks with `eval()`. Under this policy it throws on mount and the page
 *    never hydrates - the form falls back to a native GET. Production React never
 *    calls `eval()`, so the production policy does not need it and does not get it.
 *  - `ws:` / `wss:`: `next dev` opens a hot-reload websocket to the same host.
 *    Production has no HMR, so `connect-src 'self'` is exact there.
 * Both are gated on NODE_ENV so the shipped policy stays strict.
 */
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  isDev ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  /* Two years, subdomains included, preload-eligible. The site is HTTPS-only. */
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  /* Never sniff: a JSON error body must not be guessed into HTML. */
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  /* Full URL same-origin; cross-origin gets the bare origin only. */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Local-only assets under /public/media. No remote patterns are permitted.
    formats: ["image/avif", "image/webp"],
    // Next 16 coerces next/image `quality` to the nearest allowed value;
    // 86 is the grade used for the hero still.
    qualities: [75, 86],
  },
  /**
   * Applied to every route, including /api/*. A single `/:path*` source rather
   * than a per-path list: a header that is easy to forget on a new route is a
   * header missing from the route that needs it.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
