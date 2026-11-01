#!/usr/bin/env bash
# Store MITT's outgoing-mail credentials in the macOS Keychain.
#
#   ./scripts/setup-mail.sh
#
# Why a script: the password must never be typed on a command line (it lands in
# shell history and in `ps`), never written to a plaintext file, and never pasted
# into a chat window. This prompts without echoing and hands the value straight
# to `security`, which encrypts it in the login keychain.
#
# The app reads these at runtime via `security find-generic-password -s mitt-smtp
# -a <account> -w` (see src/lib/notify.ts). Environment variables still win when
# they are set, so a container deployment can ignore the Keychain entirely.
#
# FREE, NO THIRD PARTY: Gmail SMTP with an app password.
#   1. Turn on 2-Step Verification for the Google account.
#   2. https://myaccount.google.com/apppasswords -> create "MITT website"
#   3. Run this script and paste the 16-character app password when asked.
#   Limits: roughly 500 recipients/day on a free Gmail account. Enquiries are far
#   below that; a Workspace account allows ~2000/day.
#   Cost: nothing. No relay service, no API subscription, no domain required.

set -euo pipefail

SERVICE="${MITT_KEYCHAIN_SERVICE:-mitt-smtp}"
DEFAULT_HOST="smtp.gmail.com"
DEFAULT_PORT="465"
DEFAULT_SECURE="true"

put() {  # put <account> <value> [secret]
  local account="$1" value="$2" secret="${3:-}"
  if [ -z "$value" ]; then
    echo "  (skipped $account)"
    return 0
  fi
  if [ "$secret" = "secret" ]; then
    # -w reads the password from the value, still never echoed to the terminal.
    security add-generic-password -U -s "$SERVICE" -a "$account" -w "$value" >/dev/null
  else
    security add-generic-password -U -s "$SERVICE" -a "$account" -w "$value" >/dev/null
  fi
  echo "  stored $account"
}

echo
echo "MITT website - outgoing mail setup"
echo "Keychain service: $SERVICE"
echo

read -r -p "SMTP host [$DEFAULT_HOST]: " HOST;            HOST="${HOST:-$DEFAULT_HOST}"
read -r -p "SMTP port [$DEFAULT_PORT]: " PORT;            PORT="${PORT:-$DEFAULT_PORT}"
read -r -p "Use TLS on connect? (true/false) [$DEFAULT_SECURE]: " SECURE; SECURE="${SECURE:-$DEFAULT_SECURE}"
read -r -p "SMTP username (usually the full Gmail address): " USER
printf 'App password (input hidden): '
read -r -s PASS; echo
read -r -p "From address [${USER}]: " FROM;            FROM="${FROM:-$USER}"
read -r -p "Send enquiries to (comma-separated) [mittvizag@gmail.com]: " TO; TO="${TO:-mittvizag@gmail.com}"

if [ -z "$USER" ] || [ -z "$PASS" ]; then
  echo "username and password are required" >&2
  exit 1
fi

echo
put smtp-host   "$HOST"
put smtp-port   "$PORT"
put smtp-secure "$SECURE"
put smtp-user   "$USER"
put smtp-pass   "$PASS" secret
put smtp-from   "$FROM"
put notify-to   "$TO"

echo
echo "Stored. Verifying the app can read them back (no secret printed):"
node -e '
const { execFileSync } = require("node:child_process");
const svc = process.env.MITT_KEYCHAIN_SERVICE || "mitt-smtp";
const get = (a) => { try { return execFileSync("security", ["find-generic-password","-s",svc,"-a",a,"-w"], {encoding:"utf8"}).trim(); } catch { return null; } };
const host = get("smtp-host"), user = get("smtp-user"), pass = get("smtp-pass"), to = get("notify-to");
console.log("  host       :", host || "MISSING");
console.log("  user       :", user || "MISSING");
console.log("  password   :", pass ? `present (${pass.length} chars)` : "MISSING");
console.log("  notify-to  :", to || "MISSING");
process.exit(host && user && pass && to ? 0 : 1);
'
echo
echo "Next:"
echo "  1. restart the site so the notifier re-reads config:  npm start"
echo "  2. submit a test enquiry on /contact"
echo "  3. check the inbox above for 'New workforce enquiry MITT-...'"
echo "  4. confirm the gate passes:  npm run preflight"
echo
