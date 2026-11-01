#!/usr/bin/env bash
# Package the built site as a ZIP for upload into Hostinger's public_html.
#
#   NEXT_PUBLIC_SITE_URL=https://mitt.countrysnews.com ./scripts/package-site.sh
#
# Produces dist/metkan-in-site-<date>.zip with the CONTENTS of out/ at the ZIP
# ROOT, so extracting it inside public_html lands index.html, contact/, _next/,
# enquiry.php and .htaccess directly where Apache serves them.
#
# Why a zip and not the Git deploy: a zip is one deliberate action with a
# reviewable inventory, and it works from hPanel File Manager with no Git
# configuration, no deploy key and no branch to get wrong.
#
# Refuses to package an artifact whose canonicals/sitemap point at localhost: that
# would de-index the live site, and the damage is invisible to the person who
# uploaded it.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DIST="$ROOT/dist"
OUT="$ROOT/out"

die() { echo "package: $*" >&2; exit 1; }
say() { printf '%-8s %s\n' "$1" "$2"; }

# ---- 1. the public origin is mandatory ---------------------------------
SITE_URL="${NEXT_PUBLIC_SITE_URL:-}"
[ -n "$SITE_URL" ] || die "NEXT_PUBLIC_SITE_URL is not set. Canonical tags, sitemap.xml, robots.txt and og:url are baked in at build time; without it they all point at http://localhost:3210 and the live site would be treated as a duplicate of a URL that does not exist.
       Example: NEXT_PUBLIC_SITE_URL=https://mitt.countrysnews.com ./scripts/package-site.sh"
case "$SITE_URL" in
  http://*) say WARN "site URL is plain http - use https so canonicals and HSTS agree" ;;
  *localhost*|*127.0.0.1*|*example.*) die "NEXT_PUBLIC_SITE_URL is a local/placeholder origin ($SITE_URL) - refusing to package it for a customer" ;;
esac
SITE_URL="${SITE_URL%/}"
say PASS "public origin: $SITE_URL"

# ---- 2. build ----------------------------------------------------------
echo "== build"
NEXT_PUBLIC_SITE_URL="$SITE_URL" npm run build:static | tail -6

# ---- 3. verify the artifact (fail before zipping) ----------------------
echo "== verify"
for required in index.html 404.html .htaccess enquiry.php enquiry-config.php contact/index.html _next; do
  [ -e "$OUT/$required" ] || die "out/$required missing - the artifact is incomplete"
done
[ -d "$OUT/api" ] && die "out/api exists - that is a server build, not a static export"
[ -f "$OUT/enquiry.php" ] || die "no PHP endpoint: the form would post to a 404 on the host"

# The whole point of this script: no localhost anywhere in the served metadata.
LOCAL_HITS="$(grep -rl 'http://localhost:3210' "$OUT" --include='*.html' --include='*.xml' --include='*.txt' 2>/dev/null | head -5 || true)"
if [ -n "$LOCAL_HITS" ]; then
  printf '%s\n' "$LOCAL_HITS" | sed 's|^out/|  |' >&2
  die "the build still contains http://localhost:3210 - refusing to package"
fi
ACTUAL_CANONICAL="$(grep -o 'rel="canonical" href="[^"]*"' "$OUT/index.html" | head -1 | sed 's/.*href="//;s/"//')"
[ -n "$ACTUAL_CANONICAL" ] || die "no canonical tag on the homepage"
say PASS "canonical points at $ACTUAL_CANONICAL"
say PASS "$(find "$OUT" -type f | wc -l | tr -d ' ') files, $(du -sh "$OUT" | cut -f1)"

# ---- 4. zip with the contents at the ROOT ------------------------------
echo "== zip"
mkdir -p "$DIST"
STAMP="$(date +%Y%m%d-%H%M%S)"
HOST="$(printf '%s' "$SITE_URL" | sed -E 's#^https?://##; s#/.*$##; s#[^A-Za-z0-9.-]#-#g')"
ZIP="$DIST/metkan-in-$HOST-$STAMP.zip"
rm -f "$ZIP"

# -X strips extra file attributes; -x excludes macOS resource-fork junk that
# would otherwise appear as __MACOSX/ entries on the host.
( cd "$OUT" && zip -q -r -X "$ZIP" . -x '*.DS_Store' -x '__MACOSX/*' )

[ -s "$ZIP" ] || die "zip is empty"
ZIP_FILES="$(unzip -l "$ZIP" | tail -1 | awk '{print $2}')"
say PASS "$(basename "$ZIP") - $ZIP_FILES entries, $(du -h "$ZIP" | cut -f1)"

# ---- 5. prove the zip is right before anyone uploads it ---------------
echo "== zip integrity"
# Capture the listing ONCE into a variable. Do NOT pipe it into `grep -q`:
# under `set -o pipefail`, grep exiting early sends unzip SIGPIPE and the whole
# pipeline returns non-zero, so a PASSING check reports failure.
LISTING="$(unzip -l "$ZIP")" || die "zip is not readable"
for entry in index.html .htaccess enquiry.php contact/index.html; do
  if ! grep -qE "(^|[[:space:]])${entry//./\\.}\$" <<< "$LISTING"; then
    die "zip is missing $entry at the root"
  fi
done
say PASS "root contains index.html, .htaccess, enquiry.php and contact/index.html"

# A checksum lets you verify the upload landed intact.
( cd "$DIST" && shasum -a 256 "$(basename "$ZIP")" > "$(basename "$ZIP").sha256" )
say PASS "sha256 written next to the zip"

cat <<EOF

Upload it:
  1. hPanel -> Files -> File Manager -> open public_html
  2. delete the placeholder index.html / default.php if present
  3. Upload the zip, then right-click -> Extract, choosing public_html as target
  4. turn on "show hidden files" and confirm .htaccess is present
  5. verify: / robots.txt 200, /enquiry-config.php 403, /mitt-leads/ 404
  6. submit one real test enquiry and confirm the email arrives

  zip:    $ZIP
  sha256: $ZIP.sha256
EOF
