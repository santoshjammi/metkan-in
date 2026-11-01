#!/usr/bin/env bash
#
# Verify public/enquiry.php in a throwaway PHP 8.2 / Apache container.
#
#   bash tests/php/verify-enquiry.sh
#
# What it proves, with real HTTP calls against a real Apache + mod_php:
#   - both PHP files lint;
#   - a valid POST returns 201 + a MITT-YYMMDD-XXXXXX reference, the lead is
#     appended as exactly one parseable JSON line, and the mail the endpoint tried
#     to send is captured with that reference and the submitter's Reply-To;
#   - a config gap (from_email unset) still stores the lead and still returns 201,
#     with notified=false and no mail attempted - a config gap never loses a lead;
#   - invalid input returns 400 with a fields map and appends nothing;
#   - the 6th rapid POST returns 429 with Retry-After; GET returns 405; OPTIONS 204;
#   - honeypot, too-fresh renderedAt and an unknown key are all rejected;
#   - the lead directory is created OUTSIDE the mounted webroot with mode 700.
#
# Safety: the container mounts public/ read-through but the lead and rate-limit
# directories are redirected into /tmp inside the container (MITT_LEAD_DIR /
# MITT_RATE_LIMIT_DIR env), so a real lead store on this machine is never touched.
# The container is destroyed on exit and the script is safe to re-run.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PUBLIC_DIR="$ROOT/public"
CONTAINER="mitt-php"
PORT="${MITT_PHP_TEST_PORT:-8101}"
BASE="http://127.0.0.1:$PORT"

LEAD_DIR="/tmp/mitt-leads-verify"
RATE_DIR="/tmp/mitt-rate-verify"
MAIL_FILE="/tmp/sent-mail.txt"
WEBROOT="/var/www/html"

PASSED=0
FAILED=0

TMP="$(mktemp -d "${TMPDIR:-/tmp}/mitt-php-verify.XXXXXX")"
BODY="$TMP/body.json"
HEADERS="$TMP/headers.txt"
STATUS=""

# ---------------------------------------------------------------- reporting ---

pass() { printf 'PASS  %s\n' "$1"; PASSED=$((PASSED + 1)); }
fail() { printf 'FAIL  %s\n' "$1"; FAILED=$((FAILED + 1)); }

expect_eq() { # label expected actual
    if [ "$2" = "$3" ]; then
        pass "$1"
    else
        fail "$1 (expected [$2], got [$3])"
    fi
}

expect_match() { # label value regex
    if [[ "$2" =~ $3 ]]; then
        pass "$1"
    else
        fail "$1 (value [$2] does not match /$3/)"
    fi
}

expect_contains() { # label haystack needle
    case "$2" in
        *"$3"*) pass "$1" ;;
        *) fail "$1 (missing [$3])" ;;
    esac
}

cleanup() {
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
    rm -rf "$TMP"
}
trap cleanup EXIT

# ------------------------------------------------------------- prerequisites ---

if ! command -v docker >/dev/null 2>&1; then
    echo "FAIL  docker is not available on this machine; cannot verify the endpoint"
    echo "RESULT: FAIL (0 checks run)"
    exit 2
fi

if ! docker info >/dev/null 2>&1; then
    echo "FAIL  the docker daemon is not reachable; cannot verify the endpoint"
    echo "RESULT: FAIL (0 checks run)"
    exit 2
fi

if [ ! -f "$PUBLIC_DIR/enquiry.php" ] || [ ! -f "$PUBLIC_DIR/enquiry-config.php" ]; then
    echo "FAIL  public/enquiry.php or public/enquiry-config.php is missing"
    echo "RESULT: FAIL (0 checks run)"
    exit 2
fi

# Port 8101 is the documented default. If something else already owns it, testing
# on it would exercise THAT server and report nonsense, so refuse unless the caller
# named the port explicitly, in which case pick the next free one and say so.
port_in_use() {
    (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null || return 1
    exec 3<&- 2>/dev/null
    exec 3>&- 2>/dev/null
    return 0
}

if port_in_use "$PORT"; then
    if [ -n "${MITT_PHP_TEST_PORT:-}" ]; then
        echo "FAIL  port $PORT is already in use; refusing to test the wrong server"
        echo "RESULT: FAIL (0 checks run)"
        exit 2
    fi

    original_port="$PORT"
    for candidate in $(seq $((PORT + 1)) $((PORT + 20))); do
        if ! port_in_use "$candidate"; then
            PORT="$candidate"
            break
        fi
    done

    if [ "$PORT" = "$original_port" ]; then
        echo "FAIL  port $original_port is in use and no free port was found nearby"
        echo "RESULT: FAIL (0 checks run)"
        exit 2
    fi

    echo "NOTE  port $original_port is already in use by another local process;"
    echo "NOTE  running this verification on port $PORT instead"
fi

BASE="http://127.0.0.1:$PORT"

# --------------------------------------------------------------- container ---

docker rm -f "$CONTAINER" >/dev/null 2>&1 || true

if ! docker run -d --name "$CONTAINER" -p "$PORT:80" \
        -e "MITT_LEAD_DIR=$LEAD_DIR" \
        -e "MITT_RATE_LIMIT_DIR=$RATE_DIR" \
        -v "$PUBLIC_DIR":/var/www/html \
        php:8.2-apache >/dev/null; then
    echo "FAIL  could not start the php:8.2-apache container"
    echo "RESULT: FAIL (0 checks run)"
    exit 2
fi

# Fake MTA: mail() hands the message to sendmail_path on stdin. Capture it so the
# test can read the real headers and body the endpoint produced.
docker exec -i "$CONTAINER" sh -c "cat > /usr/local/bin/fake-sendmail" <<'FAKE'
#!/bin/sh
# Test-only MTA: accept every message and keep it for inspection.
cat >> /tmp/sent-mail.txt
exit 0
FAKE

docker exec "$CONTAINER" sh -c "chmod 0755 /usr/local/bin/fake-sendmail" >/dev/null
docker exec "$CONTAINER" sh -c "printf 'sendmail_path = /usr/local/bin/fake-sendmail -t -i\n' > /usr/local/etc/php/conf.d/mail.ini" >/dev/null

# Wait for OUR endpoint to answer (a cold container takes a moment). A 405 from a
# GET is the signature of this script: anything else mean something other than the
# container is answering on this port.
ready=0
for _ in $(seq 1 40); do
    code="$(curl -s -o "$TMP/ready" -w '%{http_code}' --max-time 2 "$BASE/enquiry.php" 2>/dev/null)"
    if [ "$code" = "405" ]; then
        ready=1
        break
    fi
    sleep 0.5
done

if [ "$ready" -ne 1 ]; then
    echo "FAIL  enquiry.php in the container did not answer with 405 on port $PORT"
    echo "RESULT: FAIL (0 checks run)"
    exit 2
fi

# --------------------------------------------------------------- utilities ---

dphp() { docker exec "$CONTAINER" php "$@"; }

lead_lines() {
    docker exec "$CONTAINER" sh -c "cat $LEAD_DIR/enquiries-*.jsonl 2>/dev/null" | wc -l | tr -d ' '
}

now_ms() { echo $(( $(date +%s) * 1000 )); }

post_json() { # payload -> STATUS, $BODY, $HEADERS
    STATUS="$(curl -sS --max-time 20 -o "$BODY" -D "$HEADERS" -w '%{http_code}' \
        -H 'Content-Type: application/json' --data-binary "$1" "$BASE/enquiry.php")"
}

get_field() { # file key -> value (string, or JSON for arrays)
    docker exec -i -e MITT_FIELD="$2" "$CONTAINER" php -r '
        $raw = stream_get_contents(STDIN);
        $data = json_decode((string) $raw, true);
        $key = (string) getenv("MITT_FIELD");
        if (!is_array($data) || !array_key_exists($key, $data)) { exit(0); }
        $value = $data[$key];
        if (is_bool($value)) { echo $value ? "true" : "false"; }
        elseif (is_scalar($value)) { echo (string) $value; }
        elseif ($value === null) { echo "null"; }
        else { echo json_encode($value); }
    ' < "$1"
}

count_field_keys() { # file -> number of keys under "fields"
    docker exec -i "$CONTAINER" php -r '
        $data = json_decode((string) stream_get_contents(STDIN), true);
        echo (is_array($data) && isset($data["fields"]) && is_array($data["fields"]))
            ? (string) count($data["fields"]) : "0";
    ' < "$1"
}

header_value() { # headers file name
    awk -v want="$(printf '%s' "$2" | tr 'A-Z' 'a-z')" '
        BEGIN { IGNORECASE = 1 }
        { sub(/\r$/, "") }
        index(tolower($0), want ": ") == 1 { print substr($0, length(want) + 3) }
    ' "$1" | tail -n 1
}

jsonl_last_reference() { # file -> reference of the final line, or PARSE_FAIL
    docker exec -i -e MITT_LEADFILE="$1" "$CONTAINER" php -r '
        $path = (string) getenv("MITT_LEADFILE");
        $lines = is_file($path) ? file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
        if ($lines === []) { echo "NO_LINES"; exit(0); }
        $record = json_decode((string) end($lines), true);
        if (!is_array($record)) { echo "PARSE_FAIL"; exit(0); }
        echo isset($record["reference"]) ? (string) $record["reference"] : "NO_REFERENCE";
    '
}

jsonl_field() { # file key -> value of the last record
    docker exec -i -e MITT_LEADFILE="$1" -e MITT_FIELD="$2" "$CONTAINER" php -r '
        $path = (string) getenv("MITT_LEADFILE");
        $key = (string) getenv("MITT_FIELD");
        $lines = is_file($path) ? file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
        if ($lines === []) { echo "NO_LINES"; exit(0); }
        $record = json_decode((string) end($lines), true);
        if (!is_array($record) || !array_key_exists($key, $record)) { echo "MISSING"; exit(0); }
        $value = $record[$key];
        if (is_bool($value)) { echo $value ? "true" : "false"; }
        elseif (is_scalar($value)) { echo (string) $value; }
        elseif ($value === null) { echo "null"; }
        else { echo json_encode($value); }
    '
}

# ------------------------------------------------------------------- 1. lint ---

lint="$(dphp -l "$WEBROOT/enquiry.php" 2>&1)"
case "$lint" in
    "No syntax errors"*) pass "php -l public/enquiry.php" ;;
    *) fail "php -l public/enquiry.php ($lint)" ;;
esac

lint="$(dphp -l "$WEBROOT/enquiry-config.php" 2>&1)"
case "$lint" in
    "No syntax errors"*) pass "php -l public/enquiry-config.php" ;;
    *) fail "php -l public/enquiry-config.php ($lint)" ;;
esac

# ------------------------------------------------------- 2. method + preflight ---

STATUS="$(curl -sS -o "$BODY" -D "$HEADERS" -w '%{http_code}' "$BASE/enquiry.php")"
expect_eq "GET returns 405" "405" "$STATUS"
expect_eq "GET body is ok:false error:method_not_allowed" \
    "method_not_allowed" "$(get_field "$BODY" error)"
expect_contains "GET advertises Allow: POST" "$(cat "$HEADERS")" "Allow: POST"

STATUS="$(curl -sS -o "$BODY" -D "$HEADERS" -w '%{http_code}' -X OPTIONS \
    -H "Origin: $BASE" "$BASE/enquiry.php")"
expect_eq "OPTIONS returns 204 (CORS preflight)" "204" "$STATUS"
expect_contains "OPTIONS sends CORS allow-methods" "$(cat "$HEADERS")" "Access-Control-Allow-Methods"

expect_eq "a non-JSON body returns 400" "400" \
    "$(curl -sS -o "$BODY" -w '%{http_code}' -H 'Content-Type: application/json' \
        --data-binary 'this is not json' "$BASE/enquiry.php")"
expect_eq "malformed body reports invalid_json" "invalid_json" "$(get_field "$BODY" error)"

# ------------------------------------------------------ 3. invalid submission ---

lines_before="$(lead_lines)"

post_json '{"name":"A","organisation":"X","email":"not-an-email","orgType":"nope","consent":false,"renderedAt":'"$(( $(now_ms) - 6000 ))"'}'
expect_eq "invalid POST returns 400" "400" "$STATUS"
expect_eq "invalid POST reports validation_failed" "validation_failed" "$(get_field "$BODY" error)"
fields_count="$(count_field_keys "$BODY")"
if [ "$fields_count" -ge 4 ]; then
    pass "invalid POST returns a fields map ($fields_count entries)"
else
    fail "invalid POST returns a fields map (got $fields_count entries)"
fi
expect_eq "invalid POST adds no lead line" "$lines_before" "$(lead_lines)"

# ------------------------------------------------------------- 4. bot traps ---

post_json '{"name":"Spam Bot","organisation":"Bot Ltd","email":"bot@example.test","orgType":"other","consent":true,"website":"http://spam.example","renderedAt":'"$(( $(now_ms) - 6000 ))"'}'
expect_eq "filled website honeypot returns 400" "400" "$STATUS"
expect_eq "honeypot uses the generic rejection" "submission_rejected" "$(get_field "$BODY" error)"

post_json '{"name":"Fast Bot","organisation":"Fast Ltd","email":"fast@example.test","orgType":"other","consent":true,"renderedAt":'"$(( $(now_ms) + 5000 ))"'}'
expect_eq "too-fresh renderedAt returns 400" "400" "$STATUS"
expect_eq "too-fresh renderedAt uses the generic rejection" "submission_rejected" "$(get_field "$BODY" error)"

post_json '{"name":"Key Bot","organisation":"Key Ltd","email":"key@example.test","orgType":"other","consent":true,"admin":true,"renderedAt":'"$(( $(now_ms) - 6000 ))"'}'
expect_eq "unknown key returns 400" "400" "$STATUS"
expect_eq "unknown key reports validation_failed" "validation_failed" "$(get_field "$BODY" error)"

expect_eq "bot traps add no lead line" "$lines_before" "$(lead_lines)"

# ------------------------------------- 5. config gap: from_email is still unset ---

# The committed config deliberately leaves from_email empty. The endpoint must
# still store the lead and still answer 201, with notified=false.
lines_before="$(lead_lines)"
valid_payload() { # renderedAt
    printf '%s' '{"name":"Ravi Kumar","organisation":"Vizag Marine Services","email":"Ravi.Kumar@Example.Test","orgType":"employer","consent":true,"phone":"+91 98765 43210","trades":["welding","fitting-and-fabrication"],"headcount":"6-25","location":"Visakhapatnam","employmentType":"permanent","timeline":"immediate","notes":"Need six coded welders for a shipyard contract.","website":"","renderedAt":'"$1"'}'
}

post_json "$(valid_payload "$(( $(now_ms) - 6000 ))")"
gap_reference="$(get_field "$BODY" reference)"

expect_eq "config gap (no from_email): valid POST still returns 201" "201" "$STATUS"
expect_eq "config gap: notified is false" "false" "$(get_field "$BODY" notified)"
expect_match "config gap: reference matches the MITT pattern" "$gap_reference" '^MITT-[0-9]{6}-[A-Z2-7]{6}$'
expect_eq "config gap: the lead is still stored (+1 line)" "$(( lines_before + 1 ))" "$(lead_lines)"
expect_eq "config gap: no mail was attempted" "0" \
    "$(docker exec "$CONTAINER" sh -c "test -f $MAIL_FILE && wc -c < $MAIL_FILE || echo 0" | tr -d ' ')"

# ------------------------------------------- 6. mail path: set from_email at deploy ---

# A from address on the deployed domain is a deployment value, not a repo value.
# Redirect it for this run only, through Apache, exactly as a host operator would.
docker exec "$CONTAINER" sh -c "printf 'SetEnv MITT_FROM_EMAIL enquiries@mitt.test\n' > /etc/apache2/conf-enabled/mitt-test.conf" >/dev/null
docker exec "$CONTAINER" apache2ctl -k graceful >/dev/null 2>&1
sleep 1

lines_before="$(lead_lines)"
post_json "$(valid_payload "$(( $(now_ms) - 6000 ))")"
reference="$(get_field "$BODY" reference)"

expect_eq "valid POST returns 201" "201" "$STATUS"
expect_eq "valid POST reports notified true" "true" "$(get_field "$BODY" notified)"
expect_eq "valid POST body has ok true" "true" "$(get_field "$BODY" ok)"
expect_match "reference matches MITT-YYMMDD-XXXXXX" "$reference" '^MITT-[0-9]{6}-[A-Z2-7]{6}$'
expect_contains "Content-Type is JSON" "$(cat "$HEADERS")" "application/json"
expect_contains "Cache-Control is no-store" "$(cat "$HEADERS")" "no-store"

# Monthly file name uses the IST month, so the host clock's timezone is irrelevant.
lead_month="$(docker exec "$CONTAINER" php -r 'echo gmdate("Y-m", time() + 19800);')"
lead_file="$LEAD_DIR/enquiries-$lead_month.jsonl"

expect_eq "the lead line parses and carries the same reference" \
    "$reference" "$(jsonl_last_reference "$lead_file")"
expect_eq "exactly one lead line was added" "$(( lines_before + 1 ))" "$(lead_lines)"
expect_eq "the stored email is lower-cased" "ravi.kumar@example.test" "$(jsonl_field "$lead_file" email)"
expect_eq "the stored record has source website" "website" "$(jsonl_field "$lead_file" source)"
expect_eq "the stored record keeps consent true" "true" "$(jsonl_field "$lead_file" consent)"
expect_eq "the stored record carries the trades array" \
    '["welding","fitting-and-fabrication"]' "$(jsonl_field "$lead_file" trades)"

mail_body_captured="$(docker exec "$CONTAINER" sh -c "cat $MAIL_FILE 2>/dev/null" || true)"
expect_contains "the mail body carries the reference" "$mail_body_captured" "$reference"
expect_contains "the mail sets Reply-To to the submitter" \
    "$mail_body_captured" "Reply-To: ravi.kumar@example.test"
expect_contains "the mail sets a From header" "$mail_body_captured" "From: MITT website <enquiries@mitt.test>"
expect_contains "the mail subject carries the reference" "$mail_body_captured" "Subject: New workforce enquiry $reference"
expect_contains "the mail is plain text UTF-8" "$mail_body_captured" "Content-Type: text/plain; charset=UTF-8"
expect_contains "the mail tells staff to reply" "$mail_body_captured" "Reply to the sender at"

# ------------------------------------------------------------ 7. rate limiting ---

docker exec "$CONTAINER" sh -c "rm -rf $RATE_DIR" >/dev/null 2>&1

rate_statuses=""
for i in $(seq 1 6); do
    post_json '{"name":"x","renderedAt":'"$(( $(now_ms) - 6000 ))"'}'
    rate_statuses="$rate_statuses $STATUS"
    if [ "$i" -eq 6 ]; then
        sixth_status="$STATUS"
        sixth_retry="$(header_value "$HEADERS" Retry-After)"
        sixth_error="$(get_field "$BODY" error)"
    fi
done

expect_eq "the 5th rapid POST is still processed (not 429)" "400" \
    "$(echo "$rate_statuses" | awk '{print $5}')"
expect_eq "the 6th rapid POST returns 429" "429" "$sixth_status"
expect_eq "the 429 body reports rate_limited" "rate_limited" "$sixth_error"
if [ -n "$sixth_retry" ] && [ "$sixth_retry" -gt 0 ] 2>/dev/null; then
    pass "the 429 sends a positive Retry-After ($sixth_retry s)"
else
    fail "the 429 sends a positive Retry-After (got [$sixth_retry])"
fi

# ------------------------------------------------- 8. lead store location/mode ---

lead_dir_container="$(docker exec "$CONTAINER" sh -c "readlink -f $LEAD_DIR" | tr -d ' ')"
case "$lead_dir_container" in
    "$WEBROOT"|"$WEBROOT"/*) fail "the lead directory is outside the webroot (got $lead_dir_container)" ;;
    *) pass "the lead directory is outside the webroot ($lead_dir_container)" ;;
esac

expect_eq "the lead directory is mode 700" "700" \
    "$(docker exec "$CONTAINER" stat -c '%a' "$LEAD_DIR" | tr -d ' ')"

lead_file_mode="$(docker exec "$CONTAINER" stat -c '%a' "$lead_file" 2>/dev/null | tr -d ' ')"
expect_eq "the lead file is mode 600" "600" "$lead_file_mode"

if docker exec "$CONTAINER" sh -c "ls $WEBROOT/*.jsonl $WEBROOT/mitt-leads 2>/dev/null" | grep -q .; then
    fail "no lead data is reachable under the webroot"
else
    pass "no lead data is reachable under the webroot"
fi

rate_dir_mode="$(docker exec "$CONTAINER" stat -c '%a' "$RATE_DIR" 2>/dev/null | tr -d ' ')"
expect_eq "the rate-limit directory is mode 700" "700" "$rate_dir_mode"

# ------------------------------------------------------------- 9. no PII leak ---

if grep -qiE 'Ravi Kumar|ravi\.kumar|98765' "$BODY" 2>/dev/null; then
    fail "the success response echoes no submitted value"
else
    pass "the success response echoes no submitted value"
fi

# ----------------------------------------------------------------- summary ---

printf '\n%d passed, %d failed\n' "$PASSED" "$FAILED"

if [ "$FAILED" -ne 0 ]; then
    printf 'RESULT: FAIL\n'
    exit 1
fi

printf 'RESULT: PASS\n'
exit 0
