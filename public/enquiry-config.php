<?php
/**
 * MITT website - enquiry endpoint configuration (Apache + PHP static host).
 *
 * THIS FILE CONTAINS NO SECRET. It is denied by public/.htaccess as defence in
 * depth, but even if it were served it would leak nothing: every credential
 * field below is empty.
 *
 * Constants are wrapped in `defined()` so an operator can override a value from
 * a file loaded before this one (for example a php.ini auto_prepend_file or a
 * one-off deployment tweak) without editing the committed copy.
 *
 * Each constant can also be overridden per environment by the matching
 * MITT_* environment variable - see config_string() / config_int() in
 * enquiry.php. That is how tests/php/verify-enquiry.sh points the endpoint at a
 * throwaway lead directory instead of a real one.
 */

declare(strict_types=1);

/* ------------------------------------------------------------------ mail --- */

/** Where staff enquiries are delivered. */
if (!defined('MITT_TO_EMAIL')) {
    define('MITT_TO_EMAIL', 'mittvizag@gmail.com');
}

/**
 * Sender address. MUST be set to an address on the deployed domain (for example
 * enquiries@<the MITT domain>) before this form goes live.
 *
 * Why it is empty here: a sender address on a domain the host does not own fails
 * SPF and DMARC alignment, so mail providers file the alert as spam - the lead is
 * stored but nobody reads it. This is a deployment decision (the real domain),
 * not something that belongs in a committed repo.
 *
 * What happens while it is empty: the endpoint still stores the enquiry and still
 * answers 201 with notified=false. A configuration gap must never lose a lead.
 */
if (!defined('MITT_FROM_EMAIL')) {
    /*
     * MUST be an address on the deployed domain. mail() from a foreign domain
     * (a gmail.com From) fails SPF/DMARC alignment and lands in spam.
     *
     * LIVE STATE of metkan.in as measured on 2026-11-01: no MX, no SPF TXT, no
     * DMARC record. Sending as @metkan.in therefore produces a neutral SPF
     * result, which Gmail frequently files as spam. Two fixes, either is fine:
     *   (a) in hPanel add an SPF TXT record for metkan.in:
     *       v=spf1 include:_spf.mail.hostinger.com ~all
     *   (b) or configure the SMTP block below with a Gmail app password, which
     *       is authenticated and DKIM-signed, so it delivers reliably today.
     * The enquiry is stored either way: notify failure never loses a lead.
     */
    define('MITT_FROM_EMAIL', 'website@metkan.in');
}

/** Display name on the From header. */
if (!defined('MITT_FROM_NAME')) {
    define('MITT_FROM_NAME', 'MITT website');
}

/** Subject line prefix; the reference is appended. */
if (!defined('MITT_SUBJECT_PREFIX')) {
    define('MITT_SUBJECT_PREFIX', 'New workforce enquiry ');
}

/* ------------------------------------------------------------- lead store --- */

/**
 * Lead directory. Empty means "use the default": dirname(__DIR__) . '/mitt-leads'.
 *
 * That default is deliberately OUTSIDE public_html - one level up from the
 * webroot - so the JSONL lead files are not reachable over HTTP on a Hostinger
 * shared account (home directory > public_html). Directory 0700, files 0600.
 *
 * Set it only when the host forces a different writable path.
 */
if (!defined('MITT_LEAD_DIR')) {
    define('MITT_LEAD_DIR', '');
}

/**
 * Rate-limit directory. Empty means dirname(__DIR__) . '/mitt-rate-limit', also
 * outside the webroot: the limiter writes one small file per client IP and must
 * not be web-reachable or web-writable.
 */
if (!defined('MITT_RATE_LIMIT_DIR')) {
    define('MITT_RATE_LIMIT_DIR', '');
}

/* ------------------------------------------------------------- rate limit --- */

/** Requests allowed per client IP inside one window. */
if (!defined('MITT_RATE_LIMIT_MAX')) {
    define('MITT_RATE_LIMIT_MAX', 5);
}

/** Window length in seconds (10 minutes). */
if (!defined('MITT_RATE_LIMIT_WINDOW')) {
    define('MITT_RATE_LIMIT_WINDOW', 600);
}

/* ------------------------------------------------------- optional SMTP ----- */

/**
 * Optional SMTP transport. Leave the password empty and the endpoint uses PHP
 * mail(), which on Hostinger hands the message to the host MTA. That MTA is
 * already SPF-authorised for the account's domain, so it is the correct default
 * and needs no credentials.
 *
 * Fill these only if the client later asks for Gmail SMTP. Never commit the
 * password: set it at deploy time (a non-committed include, or the
 * MITT_SMTP_PASSWORD environment variable). A password in git is a leaked
 * password.
 */
if (!defined('MITT_SMTP_HOST')) {
    define('MITT_SMTP_HOST', '');
}
if (!defined('MITT_SMTP_PORT')) {
    define('MITT_SMTP_PORT', 0);
}
if (!defined('MITT_SMTP_USER')) {
    define('MITT_SMTP_USER', '');
}
if (!defined('MITT_SMTP_PASSWORD')) {
    define('MITT_SMTP_PASSWORD', '');
}
