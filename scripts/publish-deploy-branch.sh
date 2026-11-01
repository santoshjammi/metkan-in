#!/usr/bin/env bash
# Publish the BUILT site to a deploy branch, so a host can pull it from GitHub.
#
#   ./scripts/publish-deploy-branch.sh            # build + publish locally
#   PUSH=1 ./scripts/publish-deploy-branch.sh    # build + publish + push to origin
#
# WHY A SEPARATE BRANCH
# Hostinger (and most hosts' Git deployment) does a plain `git pull` into the
# docroot. It does NOT run `npm install` or `npm run build`. So pointing the host
# at the source branch deploys TypeScript, not a website: public_html would
# contain no index.html and the site would return a 500 or a directory listing.
#
# The `deploy` branch therefore contains the CONTENTS of out/ at the repo root:
#   index.html, contact/index.html, _next/, media/, enquiry.php, .htaccess ...
# The source branch (main) stays source. The host tracks `deploy` only.
#
# Nothing is force-pushed and main is never touched: this works in a detached
# worktree, so the working tree you are editing is left exactly as it was.

set -euo pipefail

BRANCH="${DEPLOY_BRANCH:-deploy}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"

cd "$ROOT"

die() { echo "publish: $*" >&2; exit 1; }
say() { printf '%-8s %s\n' "$1" "$2"; }

# ---- 1. build if the artifact is missing or stale ----------------------
if [ ! -f "$OUT/index.html" ]; then
  echo "publish: no build found, running npm run build:static"
  npm run build:static
else
  say INFO "using existing out/ (delete it and re-run to force a rebuild)"
fi

# ---- 2. refuse to publish an incomplete or wrong-shaped artifact -------
for required in index.html 404.html .htaccess enquiry.php enquiry-config.php contact/index.html; do
  [ -e "$OUT/$required" ] || die "out/$required missing - refusing to publish"
done
[ -d "$OUT/api" ] && die "out/api exists - that is a server build, not a static export"
[ -d "$OUT/_next/static" ] || die "out/_next/static missing - CSS/JS would 404 on the host"
PHP_COUNT="$(find "$OUT" -maxdepth 1 -name '*.php' | wc -l | tr -d ' ')"
[ "$PHP_COUNT" -ge 2 ] || die "expected enquiry.php and enquiry-config.php at the root of out/"
say PASS "artifact complete ($(find "$OUT" -type f | wc -l | tr -d ' ') files, $(du -sh "$OUT" | cut -f1))"

# ---- 3. publish into a throwaway worktree ------------------------------
WORK="$(mktemp -d)"
cleanup() {
  git worktree remove --force "$WORK" >/dev/null 2>&1 || rm -rf "$WORK"
  rmdir "$WORK" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git worktree add --force -B "$BRANCH" "$WORK" >/dev/null 2>&1
say PASS "worktree prepared on branch $BRANCH"

# Mirror the build exactly. --delete is safe here: this worktree holds only the
# previous build, never anything hand-edited. It MUST exclude .git, because in a
# linked worktree .git is a FILE - without the exclude, --delete removes it and
# every later git command fails with "not a git repository".
rsync -a --delete --exclude='.git' "$OUT"/ "$WORK"/

# Prove the worktree still has its git link before going further.
[ -e "$WORK/.git" ] || die "worktree lost its .git link during sync"

cd "$WORK"
git add -A
if git diff --cached --quiet; then
  say INFO "no changes since the last publish; nothing to commit"
else
  git -c user.name="MITT deploy" -c user.email="deploy@saiameya.local" \
    commit -q -m "deploy: static build $(date -u +%Y-%m-%dT%H:%M:%SZ)

Generated from $(git -C "$ROOT" rev-parse --short HEAD) on main by
scripts/publish-deploy-branch.sh. Do not edit this branch by hand: it is
overwritten on every publish."
  say PASS "committed $(git rev-parse --short HEAD) on $BRANCH"
fi

FILES="$(git ls-files | wc -l | tr -d ' ')"
say INFO "branch contains $FILES tracked files"

# ---- 4. sanity: this is a website, not source --------------------------
git ls-files | grep -qx "index.html" || die "deploy branch has no index.html - the host would show nothing"
if git ls-files | grep -qE '^(src|app)/|^package\.json$'; then
  die "deploy branch contains source files - it must hold the built output only"
fi
say PASS "branch root is a served website (index.html present, no src/)"

# ---- 4b. refuse to publish localhost canonicals -------------------------
# A build made without NEXT_PUBLIC_SITE_URL bakes http://localhost:3210 into
# canonical tags, the sitemap and og:url. Publishing that tells search engines
# every real page duplicates a URL that does not exist. Block it here as well as
# in build-static.sh, because this is the last gate before a customer sees it.
LOCAL_HITS="$(git grep -l 'http://localhost:3210' -- 'index.html' '*index.html' 'sitemap.xml' 'robots.txt' 2>/dev/null | head -3)"
if [ -n "$LOCAL_HITS" ]; then
  if [ "${MITT_ALLOW_LOCAL_CANONICAL:-0}" = "1" ]; then
    say WARN "publishing localhost canonicals (MITT_ALLOW_LOCAL_CANONICAL=1) - not for customers"
  else
    die "refusing to publish: the build carries http://localhost:3210 canonicals/sitemap.
     Rebuild with NEXT_PUBLIC_SITE_URL set to the live https origin, then publish again.
     Affected: $(printf '%s' "$LOCAL_HITS" | tr '\n' ' ')"
  fi
fi
say PASS "canonicals point at a real origin"

# ---- 5. push -----------------------------------------------------------
if [ "${PUSH:-0}" = "1" ]; then
  git push -u origin "$BRANCH"
  say PASS "pushed $BRANCH to origin"
else
  echo
  say INFO "not pushed. Review it, then run: PUSH=1 ./scripts/publish-deploy-branch.sh"
fi
