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

/**
 * Artifact mode. Only the exact string "export" switches the build to a static
 * artifact; anything else (unset, "server", a typo) keeps the Node server
 * build, so a misconfigured environment cannot silently ship a host artifact
 * that has no working enquiry endpoint behind it.
 */
const isStaticExport = process.env.NEXT_OUTPUT === "export";

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
  /**
   * DUAL ARTIFACT SWITCH — one env var, two ship targets.
   *
   * Unset (or any other value): the historical Node server build. `next build`
   * + `next start`, with the /api route handlers live.
   *
   * NEXT_OUTPUT=export: a static artifact for Apache shared hosting, which has
   * no Node process. That mode:
   *  - sets `output: "export"`, which DROPS every app/api route handler (the
   *    host serves /enquiry.php instead, shipped under public/);
   *  - sets `images.unoptimized`, because there is no image optimizer on the
   *    host and next/image would otherwise point at /_next/image and 404;
   *  - sets `trailingSlash`, so `/contact` resolves to `/contact/index.html`
   *    on Apache instead of falling through to a directory listing.
   *
   * Never add `rewrites()`: static export forbids them, and the endpoint is
   * chosen at build time (NEXT_PUBLIC_ENQUIRY_ENDPOINT) instead.
   */
  ...(isStaticExport
    ? {
        output: "export" as const,
        trailingSlash: true,
        /**
         * Route handlers cannot be part of a static artifact at all: a
         * `route.ts` that declares `dynamic = "force-dynamic"` makes
         * `next build` fail outright under `output: "export"` ("cannot be used
         * with output: export"), and a static host has no Node process to run
         * them anyway. src/app/api must therefore not be collected as a route
         * in this mode.
         *
         * Narrowing `pageExtensions` does exactly that, without editing the
         * handlers: every page, layout and metadata route in this app is
         * `.tsx` (or the `.svg` icon), while the two API handlers are `.ts`.
         * Omitting `ts` from this list drops only them - and they are absent
         * from the artifact by design, since the host serves /enquiry.php.
         *
         * This list is used ONLY in static-export mode; the server build keeps
         * Next's default extensions and all of /api.
         */
        pageExtensions: ["tsx"],
      }
    : {}),
  images: {
    // Local-only assets under /public/media. No remote patterns are permitted.
    formats: ["image/avif", "image/webp"],
    // Next 16 coerces next/image `quality` to the nearest allowed value;
    // 86 is the grade used for the hero still.
    qualities: [75, 86],
    // Static export serves the files as they sit in public/: no optimizer.
    ...(isStaticExport ? { unoptimized: true } : {}),
  },
  /**
   * Applied to every route, including /api/*. A single `/:path*` source rather
   * than a per-path list: a header that is easy to forget on a new route is a
   * header missing from the route that needs it.
   *
   * In static-export mode Next has no server to attach these to and ignores
   * them; public/.htaccess carries the equivalent defensive headers on the
   * host. The block stays here in both modes so the server build never loses
   * a header because of how the artifact was produced.
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
