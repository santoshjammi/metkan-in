#!/usr/bin/env bash
# Deploy the MITT static export to Hostinger shared hosting.
#
#   MITT_DOCROOT='~/domains/mitt.countrysnews.com/public_html' ./scripts/deploy-shared.sh
#
# Credentials come from the macOS Keychain ONLY (service hermes-secret):
#   HOSTINGER_SSH_HOST, HOSTINGER_SSH_PORT, HOSTINGER_SSH_KEY
# Nothing is echoed. If a key is missing the script exits naming the key and the
# command to store it - it never falls through with an empty credential.
#
# Safety rules baked in:
#   - refuses to run unless out/ looks like a complete static build
#   - takes a remote snapshot BEFORE uploading, and aborts if the snapshot is empty
#   - uploads additively (rsync -az, never --delete) so server-only files survive
#   - verifies the live routes afterwards and reports, it does not assume

set -euo pipefail

DOCROOT="${MITT_DOCROOT:-}"
SITE_URL="${MITT_SITE_URL:-}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/out"

die() { echo "deploy: $*" >&2; exit 1; }
say() { printf '%-8s %s\n' "$1" "$2"; }

get_secret() {
  local key="$1" value
  value="$(security find-generic-password -a "$key" -s hermes-secret -w 2>/dev/null || true)"
  if [ -z "$value" ]; then
    die "missing Keychain secret '$key'. Store it with:
         security add-generic-password -a $key -s hermes-secret -U -w"
  fi
  printf '%s' "$value"
}

# ---- 1. precondition: a complete artifact -------------------------------
[ -d "$OUT_DIR" ] || die "out/ not found. Run: npm run build:static"
for required in index.html 404.html .htaccess enquiry.php contact/index.html; do
  [ -e "$OUT_DIR/$required" ] || die "out/$required missing - the export is incomplete, refusing to deploy"
done
[ -d "$OUT_DIR/api" ] && die "out/api exists - this looks like a server build, not a static export"
say PASS "artifact complete ($(find "$OUT_DIR" -type f | wc -l | tr -d ' ') files)"

# ---- 2. precondition: an explicit target --------------------------------
[ -n "$DOCROOT" ] || die "set MITT_DOCROOT to the remote docroot, e.g. '~/domains/<domain>/public_html'"
case "$DOCROOT" in
  *public_html*) : ;;
  *) die "MITT_DOCROOT does not look like a docroot (expected something/...public_html): $DOCROOT" ;;
esac
say PASS "target: $DOCROOT"

# ---- 3. credentials -----------------------------------------------------
HOST="$(get_secret HOSTINGER_SSH_HOST)"
PORT="$(get_secret HOSTINGER_SSH_PORT)"
KEY="$(get_secret HOSTINGER_SSH_KEY)"
USER_NAME="${MITT_SSH_USER:-}"
[ -n "$USER_NAME" ] || die "set MITT_SSH_USER to the hosting account user name"
SSH=(ssh -p "$PORT" -i "$KEY" -o BatchMode=yes -o ConnectTimeout=12 "$USER_NAME@$HOST")
say PASS "transport: ssh port $PORT as $USER_NAME"

# ---- 4. prove the target exists ----------------------------------------
"${SSH[@]}" "test -d $DOCROOT" || die "remote docroot not found: $DOCROOT"
LIVE_COUNT="$("${SSH[@]}" "find $DOCROOT -maxdepth 1 -type f | wc -l" | tr -d ' ')"
say INFO "live docroot file count (top level): $LIVE_COUNT"

# ---- 5. snapshot before touching anything ------------------------------
STAMP="$(date +%Y%m%d-%H%M%S)"
SNAP_DIR="${MITT_BACKUP_DIR:-$HOME/backups}"
mkdir -p "$SNAP_DIR"
SNAP="$SNAP_DIR/mitt-docroot-$STAMP.tar.gz"
"${SSH[@]}" "tar czf - -C $DOCROOT ." > "$SNAP"
SNAP_FILES="$(tar tzf "$SNAP" | wc -l | tr -d ' ')"
[ "$SNAP_FILES" -gt 0 ] || die "snapshot is empty - aborting before any upload"
say PASS "snapshot: $SNAP ($SNAP_FILES entries)"

# ---- 6. upload, additively --------------------------------------------
rsync -az --human-readable \
  -e "ssh -p $PORT -i $KEY -o BatchMode=yes" \
  "$OUT_DIR/" "$USER_NAME@$HOST:$DOCROOT/"
say PASS "uploaded"

# ---- 7. verify live ----------------------------------------------------
if [ -n "$SITE_URL" ]; then
  echo
  echo "Live checks (paced):"
  for path in / /contact/ /training/ /our-process/ /for-employers/ /about/ /privacy/ /terms/ /robots.txt /sitemap.xml; do
    code="$(curl -sSL -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL$path" || echo 000)"
    printf '  %-18s %s\n' "$path" "$code"
    sleep 2
  done
  for path in /enquiry-config.php /mitt-leads/; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL$path" || echo 000)"
    printf '  %-18s %s (expect 403/404)\n' "$path" "$code"
    sleep 2
  done
else
  echo
  echo "MITT_SITE_URL not set - skipping live checks. Verify manually per docs/DEPLOY-SHARED-HOSTING.md"
fi

echo
say DONE "rollback: tar xzf $SNAP -C $DOCROOT"
