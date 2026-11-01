<?php
/**
 * POST /enquiry.php - workforce enquiry endpoint for the MITT site on Hostinger
 * shared hosting (Apache + PHP, no Node process).
 *
 * This file is the PHP twin of src/app/api/enquiry/route.ts and must stay
 * contract-identical to it (BUILD-SPEC section 5):
 *
 *   1. JSON body from php://input      -> 400 invalid_json
 *   2. honeypot + render age           -> 400 submission_rejected (one generic message)
 *   3. rate limit per client IP        -> 429 + Retry-After
 *   4. schema validation               -> 400 validation_failed + fields map
 *   5. durable JSONL append            -> 503 store_unavailable (fail closed)
 *   6. staff mail                      -> never changes the status code
 *   7. 201 { ok: true, reference, notified }
 *
 * The order is deliberate, same as the Node route:
 *  - bot traps run before the limiter, so a bot never burns a real employer's
 *    allowance;
 *  - the limiter runs before validation, so repeated junk still counts;
 *  - the record is written BEFORE any success is reported, and a failed write is
 *    never reported as success;
 *  - mail is a bonus, not a precondition: a stored enquiry returns 201 even when
 *    the send fails, because resubmitting would only create a duplicate.
 *
 * Privacy: no submitted value is ever echoed in a response, written to a log
 * line, or placed in an error message. Log lines carry a reference and a status
 * only.
 *
 * ASCII only, no dependencies, PHP 8.0+.
 */

declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

require __DIR__ . '/enquiry-config.php';

/* --------------------------------------------------------------- contract --- */

/** One message for every bot trap, so a probe cannot tell which one fired. */
const MITT_GENERIC_REJECTION =
    "We couldn't accept this submission. Please reload the page and try again.";

const MITT_STORE_UNAVAILABLE =
    'Your enquiry could not be saved, so it was not sent. Please try again, or call MITT directly.';

const MITT_RATE_LIMITED =
    'Too many enquiries have been sent from this connection. Please wait a few minutes and try again.';

const MITT_MALFORMED =
    "We couldn't read that request. Please reload the page and submit the form again.";

const MITT_FIELD_SUMMARY =
    'Please check the highlighted fields and submit again.';

const MITT_FALLBACK_FORM_ERROR =
    "We couldn't read this enquiry. Please reload the page and try again.";

const MITT_SERVER_ERROR =
    'Something went wrong on our side, so this enquiry was not saved. Please try again, or call MITT directly.';

/** Mirrors src/lib/validation.ts. */
const MITT_ORG_TYPES = ['employer', 'agency', 'other'];
const MITT_HEADCOUNT_BANDS = ['1-5', '6-25', '26-100', '100+'];
const MITT_EMPLOYMENT_TYPES = ['permanent', 'contract', 'other'];
const MITT_TIMELINES = ['immediate', '30d', '90d', 'exploring'];
const MITT_TRADE_SLUGS = [
    'welding',
    'fitting-and-fabrication',
    'electrical-trades',
    'mechanical-and-industrial-support',
    'plumbing',
    'construction-trades',
    'general-industrial-workforce',
];
const MITT_MAX_TRADES = 8;
const MITT_MIN_RENDER_DELAY_MS = 2500;

/** Mirrors src/lib/leads.ts + src/lib/reference.ts. */
const MITT_LEAD_STORE_VERSION = 1;
const MITT_REFERENCE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const MITT_REFERENCE_BODY_LENGTH = 6;

/** IST = UTC+05:30, no daylight saving. Never depend on the server timezone. */
const MITT_IST_OFFSET_SECONDS = 19800;

/** A well-formed enquiry is under 4 KiB; this only bounds abuse. */
const MITT_MAX_BODY_BYTES = 32768;

/** JSON keys accepted on the wire. Anything else is rejected, as zod's strict(). */
const MITT_ALLOWED_KEYS = [
    'name',
    'organisation',
    'email',
    'orgType',
    'consent',
    'phone',
    'trades',
    'headcount',
    'location',
    'employmentType',
    'timeline',
    'notes',
    'website',
    'renderedAt',
];

/* ------------------------------------------------------------ fatal safety --- */

/** Set the moment a response is emitted, so the shutdown guard stays quiet. */
$GLOBALS['mitt_response_sent'] = false;

/**
 * A fatal error (a parse error in a future edit, an out-of-memory, a missing
 * extension) would otherwise emit an HTML error page or an empty 200 to a form
 * that expects JSON. This turns it into an honest 500 JSON body instead.
 */
register_shutdown_function(static function (): void {
    if (!empty($GLOBALS['mitt_response_sent'])) {
        return;
    }

    $last = error_get_last();
    $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR];
    if ($last === null || !in_array($last['type'], $fatalTypes, true)) {
        return;
    }

    if (headers_sent()) {
        return;
    }

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode(
        ['ok' => false, 'error' => 'server_error', 'message' => MITT_SERVER_ERROR],
        JSON_UNESCAPED_SLASHES
    );
    $GLOBALS['mitt_response_sent'] = true;
});

/* ----------------------------------------------------------------- output --- */

/** Strip CR, LF and NUL so no header-bound value can inject a header line. */
function sanitize_header(string $value): string
{
    $clean = str_replace(["\r", "\n", "\0"], ' ', $value);
    return trim(preg_replace('/[ \t]+/', ' ', $clean) ?? '');
}

/**
 * Emit one JSON response and stop. Every exit from this script goes through
 * here, so content type and cache policy can never drift between branches.
 *
 * @param array<string, mixed>  $body
 * @param array<string, string> $headers
 */
function json_out(int $status, array $body, array $headers = []): void
{
    $GLOBALS['mitt_response_sent'] = true;

    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');

        foreach ($headers as $name => $value) {
            header($name . ': ' . sanitize_header($value));
        }
    }

    /* 204 has no body by definition. */
    if ($status !== 204 && $status !== 304) {
        echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    exit;
}

/* ------------------------------------------------------------ environment --- */

/** Current epoch milliseconds, the unit renderedAt arrives in. */
function now_ms(): float
{
    return microtime(true) * 1000.0;
}

/**
 * Environment override first, committed constant second. An empty environment
 * value means "not set", so a deliberate blank in the config (an unset
 * from_email, for instance) is not silently replaced.
 */
function config_string(string $envName, string $constantName): string
{
    $fromEnv = getenv($envName);
    if ($fromEnv === false && isset($_SERVER[$envName]) && is_string($_SERVER[$envName])) {
        $fromEnv = $_SERVER[$envName];
    }

    if (is_string($fromEnv) && trim($fromEnv) !== '') {
        return trim($fromEnv);
    }

    return (string) constant($constantName);
}

function config_int(string $envName, string $constantName, int $fallback): int
{
    $raw = config_string($envName, $constantName);
    if ($raw === '' || !preg_match('/^[0-9]+$/', $raw)) {
        return $fallback;
    }

    $value = (int) $raw;
    return $value > 0 ? $value : $fallback;
}

/** Absolute path of a writable directory that must live outside the webroot. */
function resolve_directory(string $configured, string $defaultName): string
{
    $base = $configured !== '' ? $configured : dirname(__DIR__) . '/' . $defaultName;

    /* Trailing separators make the JSONL path double-slash; harmless but ugly. */
    return rtrim($base, '/\\');
}

/** @return array{to_email:string,from_email:string,from_name:string,subject_prefix:string,lead_dir:string,rate_dir:string,rate_max:int,rate_window:int,smtp_host:string,smtp_port:int,smtp_user:string,smtp_password:string} */
function load_config(): array
{
    return [
        'to_email' => config_string('MITT_TO_EMAIL', 'MITT_TO_EMAIL'),
        'from_email' => config_string('MITT_FROM_EMAIL', 'MITT_FROM_EMAIL'),
        'from_name' => config_string('MITT_FROM_NAME', 'MITT_FROM_NAME'),
        'subject_prefix' => config_string('MITT_SUBJECT_PREFIX', 'MITT_SUBJECT_PREFIX'),
        'lead_dir' => resolve_directory(
            config_string('MITT_LEAD_DIR', 'MITT_LEAD_DIR'),
            'mitt-leads'
        ),
        'rate_dir' => resolve_directory(
            config_string('MITT_RATE_LIMIT_DIR', 'MITT_RATE_LIMIT_DIR'),
            'mitt-rate-limit'
        ),
        'rate_max' => config_int('MITT_RATE_LIMIT_MAX', 'MITT_RATE_LIMIT_MAX', 5),
        'rate_window' => config_int('MITT_RATE_LIMIT_WINDOW', 'MITT_RATE_LIMIT_WINDOW', 600),
        'smtp_host' => config_string('MITT_SMTP_HOST', 'MITT_SMTP_HOST'),
        'smtp_port' => config_int('MITT_SMTP_PORT', 'MITT_SMTP_PORT', 0),
        'smtp_user' => config_string('MITT_SMTP_USER', 'MITT_SMTP_USER'),
        'smtp_password' => config_string('MITT_SMTP_PASSWORD', 'MITT_SMTP_PASSWORD'),
    ];
}

/* ------------------------------------------------------------- rate limit --- */

/**
 * Client key for the limiter: REMOTE_ADDR only.
 *
 * X-Forwarded-For is NOT read here. On this host Apache faces the internet with
 * no proxy in front of it, so that header is whatever the client chose to type -
 * using it would let a single attacker mint unlimited limiter keys.
 *
 * If a load balancer or CDN is ever added, the fix belongs in Apache, not here:
 *   LoadModule remoteip_module modules/mod_remoteip.so
 *   RemoteIPHeader X-Forwarded-For
 *   RemoteIPTrustedProxy 10.0.0.0/8
 * mod_remoteip then rewrites REMOTE_ADDR itself and this function stays correct.
 */
function client_ip(): string
{
    $ip = isset($_SERVER['REMOTE_ADDR']) ? trim((string) $_SERVER['REMOTE_ADDR']) : '';

    if ($ip === '' || strlen($ip) > 45) {
        return 'unknown';
    }

    return filter_var($ip, FILTER_VALIDATE_IP) !== false ? $ip : 'unknown';
}

/** mkdir 0700 (umask-independent), recursive, and never world-readable. */
function ensure_directory(string $dir): bool
{
    if (is_dir($dir)) {
        return true;
    }

    if (!@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return false;
    }

    @chmod($dir, 0700);
    return true;
}

/** Drop limiter files whose window closed long ago, so the directory cannot grow forever. */
function prune_rate_limit_dir(string $dir, int $now, int $window): void
{
    $handle = @opendir($dir);
    if ($handle === false) {
        return;
    }

    $cutoff = $now - ($window * 2);

    while (($entry = readdir($handle)) !== false) {
        if (!preg_match('/^rl-[0-9a-f]{40}\.json$/', $entry)) {
            continue;
        }

        $path = $dir . '/' . $entry;
        $mtime = @filemtime($path);
        if ($mtime !== false && $mtime < $cutoff) {
            @unlink($path);
        }
    }

    closedir($handle);
}

/**
 * Fixed-window limiter, one locked file per client key.
 *
 * The window opens on the first request and is not extended by use: every request
 * inside it counts, including ones validation later rejects, which is the same
 * semantics as src/lib/rate-limit.ts.
 *
 * If the limiter store itself is unavailable the request is ALLOWED and the
 * degradation is logged. Rationale: the limiter is flood mitigation, whereas
 * failing closed would take the enquiry form down for every real employer. Lead
 * durability is the invariant that actually matters, and that lives in persist().
 *
 * @return array{allowed:bool,retry_after:int}
 */
function rate_limit(string $dir, string $key, int $max, int $window): array
{
    $now = time();

    if (!ensure_directory($dir)) {
        error_log('[enquiry] rate_limit_unavailable status=degraded');
        return ['allowed' => true, 'retry_after' => 0];
    }

    prune_rate_limit_dir($dir, $now, $window);

    $path = $dir . '/rl-' . sha1($key) . '.json';
    $handle = @fopen($path, 'c+');
    if ($handle === false) {
        error_log('[enquiry] rate_limit_unavailable status=degraded');
        return ['allowed' => true, 'retry_after' => 0];
    }

    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        error_log('[enquiry] rate_limit_unavailable status=degraded');
        return ['allowed' => true, 'retry_after' => 0];
    }

    $raw = stream_get_contents($handle);
    $state = is_string($raw) ? json_decode($raw, true) : null;

    $count = is_array($state) && isset($state['count']) ? (int) $state['count'] : 0;
    $resetAt = is_array($state) && isset($state['resetAt']) ? (int) $state['resetAt'] : 0;

    if ($resetAt <= $now) {
        $count = 0;
        $resetAt = $now + $window;
    }

    if ($count >= $max) {
        $retryAfter = max(1, $resetAt - $now);
        flock($handle, LOCK_UN);
        fclose($handle);
        return ['allowed' => false, 'retry_after' => $retryAfter];
    }

    $count += 1;
    $encoded = (string) json_encode(['count' => $count, 'resetAt' => $resetAt]);

    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, $encoded);
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    @chmod($path, 0600);

    return ['allowed' => true, 'retry_after' => 0];
}

/* -------------------------------------------------------------- validation --- */

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? (int) mb_strlen($value, 'UTF-8') : strlen($value);
}

/** "" and null both mean "this optional control was left untouched". */
function blank_to_absent(mixed $value): mixed
{
    if ($value === null) {
        return null;
    }

    if (is_string($value) && trim($value) === '') {
        return null;
    }

    return $value;
}

/**
 * Honeypot and render-delay check. Both answer with ONE generic message, so a
 * probe cannot learn which trap it tripped (mirrors isLikelyBot()).
 *
 * `renderedAt` must be a JSON number (what the form sends). A numeric string is
 * rejected like any other non-number - the Node schema is equally strict, and the
 * message stays generic.
 */
function is_likely_bot(array $payload): bool
{
    if (array_key_exists('website', $payload)) {
        $honeypot = $payload['website'];
        if (!is_string($honeypot) || trim($honeypot) !== '') {
            return true;
        }
    }

    if (!array_key_exists('renderedAt', $payload)) {
        return true;
    }

    $renderedAt = $payload['renderedAt'];
    if (!is_int($renderedAt) && !is_float($renderedAt)) {
        return true;
    }

    if (!is_finite((float) $renderedAt)) {
        return true;
    }

    /* A future timestamp yields a negative age and fails here the same way. */
    return (now_ms() - (float) $renderedAt) < MITT_MIN_RENDER_DELAY_MS;
}

/**
 * Authoritative validation. Returns every field error at once so the form can
 * highlight them, and never returns or logs a submitted value.
 *
 * @return array{ok:bool,fields:array<string,string>,data:array<string,mixed>}
 */
function validate(array $payload): array
{
    /* Unknown keys: zod's strict() rejects the whole object. */
    foreach (array_keys($payload) as $key) {
        if (!in_array((string) $key, MITT_ALLOWED_KEYS, true)) {
            return ['ok' => false, 'fields' => ['form' => MITT_FALLBACK_FORM_ERROR], 'data' => []];
        }
    }

    $fields = [];
    $data = [];

    /* name: 2-80 after trim. */
    $name = array_key_exists('name', $payload) && is_string($payload['name'])
        ? trim($payload['name'])
        : null;

    if ($name === null) {
        $fields['name'] = 'Please enter your name.';
    } elseif (text_length($name) < 2) {
        $fields['name'] = 'Please enter at least 2 characters.';
    } elseif (text_length($name) > 80) {
        $fields['name'] = 'Please use 80 characters or fewer.';
    } else {
        $data['name'] = $name;
    }

    /* organisation: 2-120 after trim. */
    $organisation = array_key_exists('organisation', $payload) && is_string($payload['organisation'])
        ? trim($payload['organisation'])
        : null;

    if ($organisation === null) {
        $fields['organisation'] = 'Please enter your organisation.';
    } elseif (text_length($organisation) < 2) {
        $fields['organisation'] = 'Please enter at least 2 characters.';
    } elseif (text_length($organisation) > 120) {
        $fields['organisation'] = 'Please use 120 characters or fewer.';
    } else {
        $data['organisation'] = $organisation;
    }

    /* email: trimmed, lower-cased, filter_var validated, length capped. */
    $email = array_key_exists('email', $payload) && is_string($payload['email'])
        ? strtolower(trim($payload['email']))
        : null;

    if ($email === null) {
        $fields['email'] = 'Please enter an email address.';
    } elseif (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $fields['email'] = 'Please enter a valid email address.';
    } else {
        $data['email'] = $email;
    }

    $orgType = $payload['orgType'] ?? null;
    if (!is_string($orgType) || !in_array($orgType, MITT_ORG_TYPES, true)) {
        $fields['orgType'] = 'Please choose the type of organisation.';
    } else {
        $data['orgType'] = $orgType;
    }

    /* consent must be literally true, not "true", 1 or "on". */
    if (($payload['consent'] ?? null) !== true) {
        $fields['consent'] = 'Please confirm you agree to MITT using these details to reply.';
    } else {
        $data['consent'] = true;
    }

    /* phone: optional, 7-18 characters of digits, spaces, + and -. */
    if (array_key_exists('phone', $payload)) {
        $phone = blank_to_absent($payload['phone']);

        if ($phone !== null) {
            if (!is_string($phone)) {
                $fields['phone'] = 'Please enter a phone number with at least 7 characters.';
            } else {
                $phone = trim($phone);

                if (text_length($phone) < 7) {
                    $fields['phone'] = 'Please enter a phone number with at least 7 characters.';
                } elseif (text_length($phone) > 18) {
                    $fields['phone'] = 'Please use 18 characters or fewer.';
                } elseif (preg_match('/^[0-9+\-\s]+$/', $phone) !== 1) {
                    $fields['phone'] = 'Use digits, spaces, + or - only.';
                } else {
                    $data['phone'] = $phone;
                }
            }
        }
    }

    /*
     * trades: the form posts an array. A comma-separated string is also accepted
     * because src/lib/validation.ts normalises one, so an older client keeps
     * working. Values are de-duplicated only after the max-count check, exactly
     * like the zod pipeline.
     */
    if (array_key_exists('trades', $payload)) {
        $trades = blank_to_absent($payload['trades']);

        if (is_string($trades)) {
            $parts = array_map('trim', explode(',', $trades));
            $trades = array_values(array_filter($parts, static fn (string $p): bool => $p !== ''));
        }

        if ($trades !== null) {
            if (!is_array($trades)) {
                $fields['trades'] = 'Choose trades from the list.';
            } elseif (count($trades) > MITT_MAX_TRADES) {
                $fields['trades'] = 'Please choose up to 8 trades.';
            } else {
                $clean = [];
                $unknown = false;

                foreach ($trades as $slug) {
                    if (!is_string($slug) || !in_array($slug, MITT_TRADE_SLUGS, true)) {
                        $unknown = true;
                        break;
                    }
                    $clean[] = $slug;
                }

                if ($unknown) {
                    $fields['trades'] = 'Choose a trade from the list, or leave this blank.';
                } elseif ($clean !== []) {
                    $data['trades'] = array_values(array_unique($clean));
                }
            }
        }
    }

    $headcount = array_key_exists('headcount', $payload)
        ? blank_to_absent($payload['headcount'])
        : null;
    if ($headcount !== null) {
        if (!is_string($headcount) || !in_array($headcount, MITT_HEADCOUNT_BANDS, true)) {
            $fields['headcount'] = 'Please choose a volume band.';
        } else {
            $data['headcount'] = $headcount;
        }
    }

    $location = array_key_exists('location', $payload) ? blank_to_absent($payload['location']) : null;
    if ($location !== null) {
        if (!is_string($location)) {
            $fields['location'] = 'Please use 120 characters or fewer.';
        } elseif (text_length(trim($location)) > 120) {
            $fields['location'] = 'Please use 120 characters or fewer.';
        } else {
            $data['location'] = trim($location);
        }
    }

    $employmentType = array_key_exists('employmentType', $payload)
        ? blank_to_absent($payload['employmentType'])
        : null;
    if ($employmentType !== null) {
        if (!is_string($employmentType) || !in_array($employmentType, MITT_EMPLOYMENT_TYPES, true)) {
            $fields['employmentType'] = 'Please choose an employment type.';
        } else {
            $data['employmentType'] = $employmentType;
        }
    }

    $timeline = array_key_exists('timeline', $payload) ? blank_to_absent($payload['timeline']) : null;
    if ($timeline !== null) {
        if (!is_string($timeline) || !in_array($timeline, MITT_TIMELINES, true)) {
            $fields['timeline'] = 'Please choose a timeline.';
        } else {
            $data['timeline'] = $timeline;
        }
    }

    $notes = array_key_exists('notes', $payload) ? blank_to_absent($payload['notes']) : null;
    if ($notes !== null) {
        if (!is_string($notes)) {
            $fields['notes'] = 'Please use 1200 characters or fewer.';
        } elseif (text_length(trim($notes)) > 1200) {
            $fields['notes'] = 'Please use 1200 characters or fewer.';
        } else {
            $data['notes'] = trim($notes);
        }
    }

    if ($fields !== []) {
        return ['ok' => false, 'fields' => $fields, 'data' => []];
    }

    return ['ok' => true, 'fields' => [], 'data' => $data];
}

/* ---------------------------------------------------------------- records --- */

/**
 * `MITT-<YYMMDD>-<6 base32 chars>`, date part in IST (UTC+05:30).
 *
 * Entropy: six bytes from random_bytes. The reference alphabet is 32 symbols and
 * 256 is an exact multiple of 32, so `byte % 32` is uniform - no modulo bias, no
 * rejection loop. 30 bits, no PII, no counter, nothing to collide with a
 * concurrent request.
 */
function make_reference(?int $now = null): string
{
    $now = $now ?? time();
    $dayPart = gmdate('ymd', $now + MITT_IST_OFFSET_SECONDS);

    $bytes = random_bytes(MITT_REFERENCE_BODY_LENGTH);
    $body = '';
    for ($i = 0; $i < MITT_REFERENCE_BODY_LENGTH; $i++) {
        $body .= MITT_REFERENCE_ALPHABET[ord($bytes[$i]) % 32];
    }

    return 'MITT-' . $dayPart . '-' . $body;
}

/** ISO-8601 UTC with milliseconds, identical in shape to `Date.toISOString()`. */
function iso8601_utc(float $epochMs): string
{
    $seconds = (int) floor($epochMs / 1000.0);
    $millis = (int) round($epochMs - ($seconds * 1000.0));

    if ($millis >= 1000) {
        $seconds += 1;
        $millis -= 1000;
    }

    return gmdate('Y-m-d\TH:i:s', $seconds) . sprintf('.%03dZ', $millis);
}

/** `enquiries-YYYY-MM.jsonl` for the IST month of the instant. */
function lead_file_name(float $epochMs): string
{
    $month = gmdate('Y-m', (int) floor($epochMs / 1000.0) + MITT_IST_OFFSET_SECONDS);
    return 'enquiries-' . $month . '.jsonl';
}

/**
 * Append one enquiry as a single JSON line. Throws on any failure - the caller
 * turns that into a 503, because a write that did not happen must never be
 * reported as success.
 *
 * flock(LOCK_EX) serialises concurrent appends, so two employers submitting at
 * the same second cannot interleave halves of a line. Directory 0700, file 0600:
 * the lead store holds personal data and lives outside the webroot.
 */
function persist(array $record, string $dir, string $fileName): string
{
    if (!ensure_directory($dir)) {
        throw new RuntimeException('lead_dir_unavailable');
    }

    $path = $dir . '/' . $fileName;
    $line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($line)) {
        throw new RuntimeException('encode_failed');
    }

    $handle = @fopen($path, 'ab');
    if ($handle === false) {
        throw new RuntimeException('open_failed');
    }

    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        throw new RuntimeException('lock_failed');
    }

    $written = fwrite($handle, $line . "\n");
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    if ($written === false || $written !== strlen($line) + 1) {
        throw new RuntimeException('short_write');
    }

    @chmod($path, 0600);

    return $path;
}

/* ------------------------------------------------------------------- mail --- */

function dash(?string $value): string
{
    $trimmed = $value !== null ? trim($value) : '';
    return $trimmed !== '' ? $trimmed : 'Not provided';
}

/**
 * Plain-text body, one label per line, same fields as the Node notifier. Staff
 * read this on a phone between site visits.
 */
function mail_body(array $record): string
{
    $trades = isset($record['trades']) && is_array($record['trades']) && $record['trades'] !== []
        ? implode(', ', $record['trades'])
        : null;

    $lines = [
        'A new workforce enquiry was submitted on the MITT website.',
        '',
        'Reference:         ' . $record['reference'],
        'Received (UTC):    ' . $record['receivedAt'],
        '',
        'Organisation:      ' . $record['organisation'],
        'Organisation type: ' . $record['orgType'],
        'Trades:            ' . dash($trades),
        'Headcount:         ' . dash($record['headcount'] ?? null),
        'Location:          ' . dash($record['location'] ?? null),
        'Timeline:          ' . dash($record['timeline'] ?? null),
        'Employment type:   ' . dash($record['employmentType'] ?? null),
        '',
        'Contact name:      ' . $record['name'],
        'Contact email:     ' . $record['email'],
        'Contact phone:     ' . dash($record['phone'] ?? null),
    ];

    $notes = isset($record['notes']) ? trim((string) $record['notes']) : '';
    if ($notes !== '') {
        $lines[] = '';
        $lines[] = 'Notes from the employer:';
        $lines[] = $notes;
    }

    $lines[] = '';
    $lines[] = 'Reply to the sender at ' . $record['email'] . ' to respond to this enquiry.';
    $lines[] = 'The employer agreed to be contacted about this enquiry when submitting the form.';
    $lines[] = '';
    $lines[] = 'This message was generated automatically by the MITT website. The stored copy';
    $lines[] = 'of the enquiry is in the lead store under the reference above.';

    return implode("\n", $lines) . "\n";
}

/**
 * Minimal SMTP client: implicit TLS on 465/994, STARTTLS on 587, plaintext
 * otherwise. Only used when a password is configured, which today it is not -
 * mail() through the host MTA is the deployment path.
 *
 * Deliberately small: one recipient, AUTH LOGIN, 5s timeouts, cert verification
 * on. It returns false rather than throwing, so a mail problem never changes the
 * response status.
 */
function smtp_send(array $cfg, string $from, string $to, string $subject, string $headers, string $body): bool
{
    $host = $cfg['smtp_host'];
    $port = (int) $cfg['smtp_port'];
    $user = $cfg['smtp_user'];
    $password = $cfg['smtp_password'];

    if ($host === '' || $port <= 0) {
        return false;
    }

    $implicitTls = ($port === 465 || $port === 994);
    $startTls = ($port === 587);
    $remote = ($implicitTls ? 'ssl://' : 'tcp://') . $host . ':' . $port;

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'SNI_enabled' => true,
        ],
    ]);

    $errno = 0;
    $errstr = '';
    $socket = @stream_socket_client($remote, $errno, $errstr, 5, STREAM_CLIENT_CONNECT, $context);
    if (!is_resource($socket)) {
        return false;
    }

    stream_set_timeout($socket, 5);

    /* Read one (possibly multi-line) SMTP reply and return its numeric code. */
    $readCode = static function ($socket): int {
        for ($i = 0; $i < 40; $i++) {
            $line = fgets($socket, 2048);
            if ($line === false) {
                return 0;
            }

            $trimmed = rtrim($line, "\r\n");
            if (preg_match('/^([0-9]{3})([ -])/', $trimmed, $m) !== 1) {
                return 0;
            }

            if ($m[2] === ' ') {
                return (int) $m[1];
            }
        }

        return 0;
    };

    $send = static function ($socket, string $data): bool {
        $total = strlen($data);
        $sent = 0;

        while ($sent < $total) {
            $chunk = @fwrite($socket, substr($data, $sent));
            if ($chunk === false || $chunk === 0) {
                return false;
            }
            $sent += $chunk;
        }

        return true;
    };

    $close = static function ($socket, bool $ok): bool {
        @fwrite($socket, "QUIT\r\n");
        @fclose($socket);
        return $ok;
    };

    if ($readCode($socket) !== 220) {
        return $close($socket, false);
    }

    $ehlo = "EHLO mitt-website\r\n";
    if (!$send($socket, $ehlo) || $readCode($socket) !== 250) {
        return $close($socket, false);
    }

    if ($startTls) {
        if (!$send($socket, "STARTTLS\r\n") || $readCode($socket) !== 220) {
            return $close($socket, false);
        }

        if (!@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            return $close($socket, false);
        }

        if (!$send($socket, $ehlo) || $readCode($socket) !== 250) {
            return $close($socket, false);
        }
    }

    if ($user !== '' && $password !== '') {
        if (!$send($socket, "AUTH LOGIN\r\n") || $readCode($socket) !== 334) {
            return $close($socket, false);
        }
        if (!$send($socket, base64_encode($user) . "\r\n") || $readCode($socket) !== 334) {
            return $close($socket, false);
        }
        if (!$send($socket, base64_encode($password) . "\r\n") || $readCode($socket) !== 235) {
            return $close($socket, false);
        }
    }

    $fromAddress = filter_var($from, FILTER_VALIDATE_EMAIL) !== false ? $from : '';

    if (!$send($socket, 'MAIL FROM:<' . $fromAddress . ">\r\n")) {
        return $close($socket, false);
    }
    $mailCode = $readCode($socket);
    if ($mailCode !== 250 && $mailCode !== 251) {
        return $close($socket, false);
    }

    if (!$send($socket, 'RCPT TO:<' . $to . ">\r\n")) {
        return $close($socket, false);
    }
    $rcptCode = $readCode($socket);
    if ($rcptCode !== 250 && $rcptCode !== 251) {
        return $close($socket, false);
    }

    if (!$send($socket, "DATA\r\n") || $readCode($socket) !== 354) {
        return $close($socket, false);
    }

    /* Dot-stuffing (RFC 5321 4.5.2): a body line of "." must not end the DATA block. */
    $message = $headers . "\r\n\r\n" . $body;
    $normalized = str_replace(["\r\n", "\r"], "\n", $message);
    $messageLines = explode("\n", rtrim($normalized, "\n"));
    foreach ($messageLines as $index => $line) {
        if (isset($line[0]) && $line[0] === '.') {
            $messageLines[$index] = '.' . $line;
        }
    }

    if (!$send($socket, implode("\r\n", $messageLines) . "\r\n.\r\n")) {
        return $close($socket, false);
    }

    $dataCode = $readCode($socket);
    if ($dataCode !== 250) {
        return $close($socket, false);
    }

    return $close($socket, true);
}

/**
 * Deliver one stored enquiry to staff. Returns the REAL outcome: true only when
 * the message was accepted by the transport.
 *
 * Every header-bound value passes through sanitize_header(): a submitted name or
 * email containing CR/LF must never be able to add headers of its own.
 */
function send_mail(array $record, array $cfg): bool
{
    $reference = (string) $record['reference'];

    $to = trim($cfg['to_email']);
    if ($to === '' || filter_var($to, FILTER_VALIDATE_EMAIL) === false) {
        error_log('[enquiry] notify_skipped ref=' . $reference . ' status=to_email_invalid');
        return false;
    }

    $from = trim($cfg['from_email']);

    /*
     * Configuration gap, not a request failure: store the lead, keep the 201, and
     * report notified=false. Sending from an address on a domain the host does not
     * own fails SPF/DMARC alignment and lands the alert in spam, so this must not
     * pretend to have notified anyone.
     */
    if ($from === '' || filter_var($from, FILTER_VALIDATE_EMAIL) === false) {
        error_log('[enquiry] notify_skipped ref=' . $reference . ' status=from_email_unset');
        return false;
    }

    $fromName = sanitize_header((string) $cfg['from_name']);
    $replyTo = sanitize_header((string) $record['email']);
    $subject = sanitize_header($cfg['subject_prefix'] . $reference);

    $headers = 'From: ' . ($fromName !== '' ? $fromName . ' <' . $from . '>' : $from) . "\r\n"
        . 'Reply-To: ' . $replyTo . "\r\n"
        . 'MIME-Version: 1.0' . "\r\n"
        . 'Content-Type: text/plain; charset=UTF-8' . "\r\n"
        . 'Content-Transfer-Encoding: 8bit' . "\r\n"
        . 'X-Enquiry-Reference: ' . sanitize_header($reference);

    $body = mail_body($record);

    try {
        if ($cfg['smtp_password'] !== '' && $cfg['smtp_host'] !== '') {
            return smtp_send($cfg, $from, $to, $subject, $headers, $body);
        }

        /*
         * mail() without the `-f` parameter: on shared hosting the MTA often
         * rejects a forced envelope sender, and a rejected -f turns a deliverable
         * message into a false. The From header already carries the address.
         */
        return @mail($to, $subject, $body, $headers) === true;
    } catch (Throwable $error) {
        error_log('[enquiry] notify_failed ref=' . $reference . ' status=exception');
        return false;
    }
}

/* ------------------------------------------------------------------- main --- */

/**
 * Same-origin CORS only: the form posts to its own host, so a cross-origin
 * request has no reason to be allowed. Echoing an arbitrary Origin back would
 * turn this endpoint into a relay any page could use.
 */
function allowed_origin(): ?string
{
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? trim((string) $_SERVER['HTTP_ORIGIN']) : '';
    $host = isset($_SERVER['HTTP_HOST']) ? strtolower(trim((string) $_SERVER['HTTP_HOST'])) : '';

    if ($origin === '' || $host === '') {
        return null;
    }

    $scheme = parse_url($origin, PHP_URL_SCHEME);
    $originHost = parse_url($origin, PHP_URL_HOST);
    $originPort = parse_url($origin, PHP_URL_PORT);

    if (!is_string($scheme) || !is_string($originHost) || $originHost === '') {
        return null;
    }

    if ($scheme !== 'https' && $scheme !== 'http') {
        return null;
    }

    $candidate = strtolower($originHost) . (is_int($originPort) ? ':' . $originPort : '');

    return $candidate === $host ? $origin : null;
}

function read_payload(): array
{
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || strlen($raw) > MITT_MAX_BODY_BYTES) {
        json_out(400, ['ok' => false, 'error' => 'invalid_json', 'message' => MITT_MALFORMED]);
    }

    $trimmed = ltrim($raw);
    if ($trimmed === '') {
        json_out(400, ['ok' => false, 'error' => 'invalid_json', 'message' => MITT_MALFORMED]);
    }

    /*
     * Decode once as an object to tell "not JSON at all" apart from "valid JSON
     * that is not an object". The Node route reports those two differently: a
     * parse failure is invalid_json, while an array or scalar reaches the schema
     * and comes back as a form-level validation error.
     */
    $asObject = json_decode($raw);

    if (json_last_error() !== JSON_ERROR_NONE) {
        json_out(400, ['ok' => false, 'error' => 'invalid_json', 'message' => MITT_MALFORMED]);
    }

    if (!is_object($asObject)) {
        json_out(400, [
            'ok' => false,
            'error' => 'validation_failed',
            'message' => MITT_FIELD_SUMMARY,
            'fields' => ['form' => MITT_FALLBACK_FORM_ERROR],
        ]);
    }

    /* Associative copy for the validator. Same bytes, so it cannot disagree. */
    $decoded = json_decode($raw, true);

    if (!is_array($decoded)) {
        json_out(400, ['ok' => false, 'error' => 'invalid_json', 'message' => MITT_MALFORMED]);
    }

    return $decoded;
}

try {
    $method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';

    /* Preflight. Same-origin posts never trigger one, but a future XHR might. */
    if ($method === 'OPTIONS') {
        $corsHeaders = [
            'Access-Control-Allow-Methods' => 'POST, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type',
            'Access-Control-Max-Age' => '600',
            'Allow' => 'POST, OPTIONS',
        ];

        $origin = allowed_origin();
        if ($origin !== null) {
            $corsHeaders['Access-Control-Allow-Origin'] = $origin;
            $corsHeaders['Vary'] = 'Origin';
        }

        json_out(204, [], $corsHeaders);
    }

    /* POST only - explicit rather than implicit. */
    if ($method !== 'POST') {
        json_out(405, ['ok' => false, 'error' => 'method_not_allowed'], ['Allow' => 'POST']);
    }

    $cfg = load_config();
    $payload = read_payload();

    /* 1 - bot traps, answered with one generic message. */
    if (is_likely_bot($payload)) {
        json_out(400, ['ok' => false, 'error' => 'submission_rejected', 'message' => MITT_GENERIC_REJECTION]);
    }

    /* 2 - rate limit, keyed on the real remote address. */
    $limit = rate_limit($cfg['rate_dir'], client_ip(), $cfg['rate_max'], $cfg['rate_window']);
    if (!$limit['allowed']) {
        json_out(
            429,
            ['ok' => false, 'error' => 'rate_limited', 'message' => MITT_RATE_LIMITED],
            ['Retry-After' => (string) $limit['retry_after']]
        );
    }

    /* 3 - schema. */
    $result = validate($payload);
    if (!$result['ok']) {
        json_out(400, [
            'ok' => false,
            'error' => 'validation_failed',
            'message' => MITT_FIELD_SUMMARY,
            'fields' => $result['fields'] ?: ['form' => MITT_FALLBACK_FORM_ERROR],
        ]);
    }

    /* 4 - build and durably store the record BEFORE anything is called a success. */
    $nowMs = now_ms();
    $reference = make_reference();
    $receivedAt = iso8601_utc($nowMs);
    $data = $result['data'];

    $record = [
        'version' => MITT_LEAD_STORE_VERSION,
        'reference' => $reference,
        'receivedAt' => $receivedAt,
        'source' => 'website',
        'name' => $data['name'],
        'organisation' => $data['organisation'],
        'email' => $data['email'],
        'orgType' => $data['orgType'],
        'phone' => $data['phone'] ?? null,
        'trades' => $data['trades'] ?? [],
        'headcount' => $data['headcount'] ?? null,
        'location' => $data['location'] ?? null,
        'employmentType' => $data['employmentType'] ?? null,
        'timeline' => $data['timeline'] ?? null,
        'notes' => $data['notes'] ?? null,
        'consent' => true,
    ];

    try {
        persist($record, $cfg['lead_dir'], lead_file_name($nowMs));
    } catch (Throwable $error) {
        /* Reference and a short status only. Never a submitted value, never a path. */
        error_log('[enquiry] store_unavailable ref=' . $reference . ' status=failed');
        json_out(503, ['ok' => false, 'error' => 'store_unavailable', 'message' => MITT_STORE_UNAVAILABLE]);
    }

    error_log('[enquiry] stored ref=' . $reference . ' status=ok');

    /* 5 - notify. The enquiry is already durable, so this cannot fail the request. */
    $notified = send_mail($record, $cfg);

    error_log('[enquiry] ' . ($notified ? 'notified' : 'notify_failed') . ' ref=' . $reference
        . ' status=' . ($notified ? 'sent' : 'unsent'));

    /* 6 - success. `notified` is additive; the stored record is the source of truth. */
    json_out(201, ['ok' => true, 'reference' => $reference, 'notified' => $notified]);
} catch (Throwable $error) {
    error_log('[enquiry] server_error status=unhandled');
    json_out(500, ['ok' => false, 'error' => 'server_error', 'message' => MITT_SERVER_ERROR]);
}
