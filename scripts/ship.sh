#!/usr/bin/env bash
# Ship MITT: verify -> commit -> push source -> publish the built site -> push deploy.
#
#   ./scripts/ship.sh "fix: what changed"          # code + live site
#   ./scripts/ship.sh "wip: notes" --no-deploy     # code only, site untouched
#
# Standing rule for this project: every update ends up in GitHub. `main` carries
# the source and is what a person reads; `deploy` carries the built site and is
# what the host pulls. Nothing is force-pushed, ever.
#
# Gates run FIRST. A failing gate means no commit and no push, so the repository
# never accumulates code that was never verified.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MESSAGE="${1:-}"
DEPLOY=1
[ "${2:-}" = "--no-deploy" ] && DEPLOY=0

die() { echo "ship: $*" >&2; exit 1; }
say() { printf '%-8s %s\n' "$1" "$2"; }

[ -n "$MESSAGE" ] || die "usage: ./scripts/ship.sh \"commit message\" [--no-deploy]"
git rev-parse --verify HEAD >/dev/null 2>&1 || die "not a git repository"

BRANCH="$(git branch --show-current)"
[ "$BRANCH" = "main" ] || die "on branch '$BRANCH' - switch to main before shipping"
git remote get-url origin >/dev/null 2>&1 || die "no origin remote configured"

# ---- 1. gates (no pass, no push) ---------------------------------------
echo "== gates"
npx tsc --noEmit || die "typecheck failed - nothing committed"
npm run lint >/dev/null 2>&1 || die "lint failed - nothing committed"
# Use EXIT CODES, not output matching: vitest colourises its summary, so a text
# grep for "N passed" misses and reports a false failure.
npm run test >/tmp/mitt-ship-test.log 2>&1 || { tail -5 /tmp/mitt-ship-test.log; die "unit tests failed - nothing committed"; }
say PASS "tsc, lint, unit tests"
npm run boundary >/dev/null 2>&1 || die "boundary guard failed (see npm run boundary)"
say PASS "boundary guard"

# ---- 2. commit ---------------------------------------------------------
echo "== commit"
# Tell the post-commit hook to stand down: this script pushes immediately below,
# and letting both push races the same ref, which logs a spurious FAILED line.
export MITT_SHIPPING=1
if [ -z "$(git status --porcelain)" ]; then
  say INFO "working tree clean, nothing new to commit"
else
  git add -A
  git -c user.name="${GIT_AUTHOR_NAME:-Hermes}" -c user.email="${GIT_AUTHOR_EMAIL:-hermes@saiameya.local}" \
    commit -q -m "$MESSAGE"
  say PASS "committed $(git rev-parse --short HEAD)"
fi

# ---- 3. push source ----------------------------------------------------
echo "== push source"
git push -u origin main
say PASS "main pushed to origin"

# ---- 4. publish the built site ----------------------------------------
if [ "$DEPLOY" = "1" ]; then
  echo "== publish deploy branch"
  npm run build:static >/dev/null 2>&1 || die "static build failed - deploy branch NOT updated"
  PUSH=1 ./scripts/publish-deploy-branch.sh | tail -6
  say PASS "deploy branch pushed"
else
  say INFO "skipped deploy publish (--no-deploy)"
fi

echo
say DONE "$(git rev-parse --short HEAD) on main${DEPLOY:+, deploy published}"
echo "       host pulls branch 'deploy' - see docs/DEPLOY-SHARED-HOSTING.md"
