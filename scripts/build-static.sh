#!/usr/bin/env bash
#
# Build the STATIC artifact for Apache shared hosting (Hostinger).
#
# The same codebase ships two ways:
#   npm run build        -> .next/ + `next start` (Node server, /api/* live)
#   npm run build:static -> out/  (static files + PHP endpoints, no Node at all)
#
# This script sets the two build-time switches and then PROVES the artifact
# instead of trusting `next build`'s exit code, because the failure modes here
# are silent: a missing PHP endpoint or a dropped sitemap still exits 0 and only
# shows up as a dead form or a 404 in Search Console after deploy.
#
# Exit 1 on the first failed check. Nothing is deployed by this script.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/out"

fail() {
  printf '\nSTATIC BUILD FAILED: %s\n' "$*" >&2
  exit 1
}

step() {
  printf '\n== %s\n' "$*"
}

# ---------------------------------------------------------------------------
# 1. Build switches. NEXT_OUTPUT=export is what next.config.ts reads to set
#    output: "export", images.unoptimized, trailingSlash and the narrowed
#    pageExtensions that keeps the two /api route handlers out of the artifact.
#    NEXT_PUBLIC_ENQUIRY_ENDPOINT is inlined into the client bundle, so the form
#    posts to the PHP endpoint instead of the Node route handler that will not
#    exist on the host.
# ---------------------------------------------------------------------------
export NEXT_OUTPUT=export
export NEXT_PUBLIC_ENQUIRY_ENDPOINT=/enquiry.php

step "mode"
printf 'NEXT_OUTPUT=%s\nNEXT_PUBLIC_ENQUIRY_ENDPOINT=%s\n' \
  "$NEXT_OUTPUT" "$NEXT_PUBLIC_ENQUIRY_ENDPOINT"

[ -x "$ROOT/node_modules/.bin/next" ] || fail "node_modules/.bin/next not found - run npm install first"

# The canonical origin is baked into robots.txt, sitemap.xml, canonical tags and
# the Open Graph URLs at BUILD time. Without it they all point at the local
# preview origin (http://localhost:3210) - fine locally, wrong on the host.
#
# This is a HARD FAIL rather than a warning: an artifact whose canonicals point at
# localhost tells Google every real page is a duplicate of a URL that does not
# exist, which de-indexes the site while looking perfectly fine to a human. A
# build you cannot deploy is better than a build that silently destroys rankings.
# For local verification of the artifact, override deliberately:
#   MITT_LOCAL_URL_OK=1 npm run build:static
SITE_URL="${NEXT_PUBLIC_SITE_URL:-}"
if [ -z "$SITE_URL" ]; then
  if [ "${MITT_LOCAL_URL_OK:-0}" = "1" ]; then
    printf 'WARNING: NEXT_PUBLIC_SITE_URL unset (MITT_LOCAL_URL_OK=1). Canonicals, sitemap\n' >&2
    printf '         and Open Graph URLs point at the local preview origin. This artifact\n' >&2
    printf '         MUST NOT be published to the host.\n' >&2
  else
    fail "NEXT_PUBLIC_SITE_URL is not set. Canonicals, sitemap and Open Graph URLs would bake in http://localhost:3210, which de-indexes the live site. Export the real https origin, or pass MITT_LOCAL_URL_OK=1 for a local-only artifact."
  fi
fi
case "$SITE_URL" in
  *localhost*|*127.0.0.1*|*example.com*|*example.in*)
    if [ "${MITT_LOCAL_URL_OK:-0}" != "1" ]; then
      fail "NEXT_PUBLIC_SITE_URL is '$SITE_URL' - a placeholder/local origin. Set the real https domain before building the deployable artifact."
    fi
    ;;
esac

# The PHP endpoint is written by another track; if it is not here, the static
# build would ship a form that posts to /enquiry.php and gets a 404. Refuse.
if [ ! -f "$ROOT/public/enquiry.php" ]; then
  fail "public/enquiry.php is missing. The static artifact has no Node API, so the enquiry form would post to a 404 and every lead would be lost. Ship the PHP endpoint (public/enquiry.php) before building."
fi

# A stale out/ from an earlier run must never be mistaken for this build's
# output - in particular a leftover out/api would contradict the checks below.
rm -rf "$OUT"

# ---------------------------------------------------------------------------
# 2. Build.
# ---------------------------------------------------------------------------
step "next build (static export)"
"$ROOT/node_modules/.bin/next" build || fail "next build exited non-zero in static-export mode"

# ---------------------------------------------------------------------------
# 3. Prove the artifact. Every path below is relative to out/.
# ---------------------------------------------------------------------------
step "asserting artifact"

[ -f "$OUT/index.html" ] || fail "out/index.html missing"
[ -f "$OUT/contact/index.html" ] || fail "out/contact/index.html missing"
[ -f "$OUT/training/index.html" ] || fail "out/training/index.html missing"
[ -f "$OUT/404.html" ] || fail "out/404.html missing (ErrorDocument target)"

# Static export drops route handlers; if one is present something is wrong with
# the export mode itself, not with this script.
if [ -e "$OUT/api" ]; then
  fail "out/api exists - static export must not contain route handlers"
fi

if [ ! -f "$OUT/enquiry.php" ]; then
  fail "out/enquiry.php missing - the form would post to a dead endpoint on the host"
fi

if [ ! -f "$OUT/.htaccess" ]; then
  fail "out/.htaccess missing - no 404 document, no header rules, no private-file denies"
fi

# Metadata routes. These are .tsx (see next.config.ts) and are prerendered by
# `export const dynamic = "force-static"`.
[ -f "$OUT/sitemap.xml" ] || fail "out/sitemap.xml missing - robots.txt would point at a 404"
[ -f "$OUT/robots.txt" ] || fail "out/robots.txt missing - the host serves no dynamic route"
[ -f "$OUT/opengraph-image" ] || fail "out/opengraph-image missing - social card would 404"

# The endpoint switch has to be in the shipped bundle, not just in this shell.
if ! grep -rqF "/enquiry.php" "$OUT/_next/static"; then
  fail "no client chunk mentions /enquiry.php - the form is still posting to /api/enquiry, which does not exist on the host"
fi

# ---------------------------------------------------------------------------
# 4. Inventory.
# ---------------------------------------------------------------------------
step "inventory"

FILE_COUNT="$(find "$OUT" -type f | wc -l | tr -d ' ')"
HTML_COUNT="$(find "$OUT" -name '*.html' -type f | wc -l | tr -d ' ')"
TOTAL_SIZE="$(du -sh "$OUT" | cut -f 1)"
TOTAL_KIB="$(du -sk "$OUT" | cut -f 1)"

printf 'files:  %s total, %s html\n' "$FILE_COUNT" "$HTML_COUNT"
printf 'size:   %s (%s KiB)\n' "$TOTAL_SIZE" "$TOTAL_KIB"
printf 'target: %s\n' "$OUT"
printf 'sitemap: %s\n' "${OUT#"$ROOT"/}/sitemap.xml"
printf 'robots:  %s\n' "${OUT#"$ROOT"/}/robots.txt"
printf 'og image: %s\n' "${OUT#"$ROOT"/}/opengraph-image"

printf '\nSTATIC BUILD OK\n'
