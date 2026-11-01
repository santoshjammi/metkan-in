#!/usr/bin/env bash
# Install a post-commit hook that mirrors every commit to GitHub.
#
#   ./scripts/install-git-hooks.sh        # install
#   ./scripts/install-git-hooks.sh --remove
#
# Why: the standing rule for this project is that an update never exists only on
# this machine. The hook pushes `main` after every commit, so a local-only commit
# cannot accumulate. It does NOT publish the `deploy` branch: making a change
# visible to customers stays a deliberate act (`./scripts/ship.sh` or
# `PUSH=1 ./scripts/publish-deploy-branch.sh`).
#
# The hook pushes in the background and logs failures to .git/push-hook.log, so a
# network hiccup can never block a commit or corrupt the working tree.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
HOOK=".git/hooks/post-commit"

if [ "${1:-}" = "--remove" ]; then
  rm -f "$HOOK"
  echo "hook removed"
  exit 0
fi

[ -d .git ] || { echo "not a git repository" >&2; exit 1; }

cat > "$HOOK" <<'HOOKEOF'
#!/usr/bin/env bash
# Installed by scripts/install-git-hooks.sh
# Mirror the commit to origin/main without ever blocking or failing the commit.
branch="$(git branch --show-current 2>/dev/null || echo)"
[ "$branch" = "main" ] || exit 0
git remote get-url origin >/dev/null 2>&1 || exit 0

(
  if git push origin main >/dev/null 2>>.git/push-hook.log; then
    echo "$(date -u +%FT%TZ) pushed $(git rev-parse --short HEAD)" >> .git/push-hook.log
  else
    echo "$(date -u +%FT%TZ) FAILED $(git rev-parse --short HEAD) - run: git push origin main" >> .git/push-hook.log
  fi
) >/dev/null 2>&1 &

exit 0
HOOKEOF

chmod +x "$HOOK"
echo "installed $HOOK"
echo "  - pushes main after every commit, in the background"
echo "  - failures land in .git/push-hook.log, never block a commit"
echo "  - does NOT publish the deploy branch (that stays deliberate)"
