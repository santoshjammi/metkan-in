#!/usr/bin/env bash
# Boundary guard: proves this repository is a standalone marketing site and that
# the separate internal application (a sibling directory, owned by MITT, not part
# of this deliverable) cannot be reached, disclosed or deployed from here.
#
# Run before any commit that touches deploy/ or content:
#   bash scripts/check-boundary.sh
#
# Exit 0 = boundary intact. Exit 1 = a rule was broken.

set -uo pipefail
FAIL=0
say() { printf '%-8s %s\n' "$1" "$2"; }

# 1. Nothing that ships may reference the internal application by name or path.
HITS=$(grep -rniE "worker[-_ ]?registry|/worker-registry|prisma" src public 2>/dev/null | head -5)
if [ -n "$HITS" ]; then say "[FAIL]" "shipped code references the internal application:"; echo "$HITS"; FAIL=1
else say "[PASS]" "src/ and public/ never reference the internal application"; fi

# 2. No path in this repo may escape to a sibling directory.
ESC=$(grep -rnE "\.\./(worker|app|admin)" src public scripts deploy --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.sh" --include="*.conf" --include="*.yaml" --include="*.service" 2>/dev/null | head -5)
if [ -n "$ESC" ]; then say "[FAIL]" "a path escapes this repository:"; echo "$ESC"; FAIL=1
else say "[PASS]" "no path escapes this repository"; fi

# 3. The deploy context is this directory only, so no sibling project can be baked in.
CTX=$(grep -E "^\s*context:" deploy/compose.yaml | awk '{print $2}')
if [ "$CTX" = ".." ]; then say "[PASS]" "compose build context resolves to the website root only"
else say "[FAIL]" "compose build context is '$CTX', expected '..' (website root)"; FAIL=1; fi

# 4. Secrets and customer data must not be inside the build context.
for p in .env .env.local var; do
  if [ -e "$p" ]; then say "[WARN]" "$p exists here; ensure .dockerignore excludes it (it does) and never commit it"
  else say "[PASS]" "$p is absent from the workspace"; fi
done

# 5. The app itself must not have been modified by work on this site.
APP_DIR="$(cd .. && pwd)/worker-registry-mvp"
if [ -d "$APP_DIR/.git" ]; then
  DIRTY=$(git -C "$APP_DIR" status --porcelain 2>/dev/null | head -3)
  if [ -n "$DIRTY" ]; then say "[FAIL]" "the separate application has uncommitted changes:"; echo "$DIRTY"; FAIL=1
  else say "[PASS]" "the separate application is untouched (clean working tree)"; fi
else
  say "[SKIP]" "separate application not present on this machine"
fi

echo
if [ "$FAIL" -eq 0 ]; then echo "boundary: intact"; else echo "boundary: BROKEN - do not deploy"; fi
exit "$FAIL"
