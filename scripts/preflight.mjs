#!/usr/bin/env node
/**
 * MITT launch preflight - the gate between "looks finished" and "safe to point
 * the domain at it".
 *
 * Every check below answers a question that has bitten a real launch: is the
 * site's canonical URL still localhost, will enquiries reach a human, can the
 * lead store actually be written, is there still placeholder copy or
 * unlicensed photography on a public page.
 *
 * Rules:
 *  - BLOCKER failures exit 1. A warning never fails the run: a human still has
 *    to do those steps (legal review, approved photography) and a gate that goes
 *    red for work in progress gets ignored.
 *  - Node standard library only. This must run on the deploy box before
 *    `npm ci` has even happened, so it cannot import a dependency.
 *  - Prints no secrets: env presence is reported as set/unset, never echoed.
 *
 * Usage: npm run preflight   (or: node scripts/preflight.mjs)
 */

import { access, constants, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");

/* Only used to colour nothing: output stays plain so it pastes into a ticket. */
const results = [];

function record(status, item, blocker, detail, remedy) {
  results.push({ status, item, blocker, detail, remedy });
}

function pass(item, detail) {
  record("PASS", item, false, detail, "");
}

function fail(item, blocker, detail, remedy) {
  record(blocker ? "FAIL" : "WARN", item, blocker, detail, remedy);
}

function warn(item, detail, remedy) {
  record("WARN", item, false, detail, remedy);
}

/* ── env loading ─────────────────────────────────────────────────────────── */

/**
 * Next loads .env.local automatically; a plain `node` script does not. Load the
 * same files in the same order of precedence so the gate sees what the app sees.
 */
async function loadEnvFiles() {
  const candidates = [".env.local", ".env"];
  const loaded = [];

  for (const name of candidates) {
    const file = path.join(ROOT, name);
    try {
      await stat(file);
    } catch {
      continue;
    }

    try {
      /* Node >= 20.12. Does not overwrite variables already set by the shell. */
      process.loadEnvFile(file);
      loaded.push(name);
    } catch {
      /* Malformed file: report it, do not crash the gate. */
      loaded.push(`${name} (unreadable)`);
    }
  }

  return loaded;
}

function env(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

/* ── checks ──────────────────────────────────────────────────────────────── */

const PLACEHOLDER_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "example.com",
  "www.example.com",
  "example.org",
]);

function checkSiteUrl() {
  const raw = env("NEXT_PUBLIC_SITE_URL");

  if (!raw) {
    fail(
      "site url",
      true,
      "NEXT_PUBLIC_SITE_URL is not set",
      "set NEXT_PUBLIC_SITE_URL=https://mitt.example.in in .env.local (production origin, no trailing slash)",
    );
    return;
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    fail(
      "site url",
      true,
      `NEXT_PUBLIC_SITE_URL is not a URL (${raw})`,
      "use an absolute origin such as https://mitt.example.in",
    );
    return;
  }

  const host = url.hostname.toLowerCase();

  if (PLACEHOLDER_HOSTS.has(host) || host.endsWith(".localhost")) {
    fail(
      "site url",
      true,
      `NEXT_PUBLIC_SITE_URL points at a placeholder host (${host})`,
      "replace it with the live production origin before launch",
    );
    return;
  }

  if (url.protocol !== "https:") {
    fail(
      "site url",
      true,
      `NEXT_PUBLIC_SITE_URL is not https (${url.protocol})`,
      "serve the site over TLS and set the https origin; canonicals and HSTS depend on it",
    );
    return;
  }

  pass("site url", url.origin);
}

/**
 * `src/content/site.ts` holds the contact block. The email entry is a
 * placeholder until MITT supplies an inbox, and the site suppresses the link
 * when `placeholder: true` - so a launch with `true` here means visitors have no
 * way to email.
 */
async function checkContactEmail() {
  const file = path.join(ROOT, "src", "content", "site.ts");

  let source;
  try {
    source = await readFile(file, "utf8");
  } catch {
    fail("contact email", true, "src/content/site.ts not found", "run this from the website/ directory");
    return;
  }

  const emailStart = source.indexOf("email: {");
  if (emailStart === -1) {
    fail(
      "contact email",
      true,
      "no `email: { ... }` block in src/content/site.ts",
      "restore the email entry with display, href and placeholder fields",
    );
    return;
  }

  const emailBlock = source.slice(emailStart, source.indexOf("},", emailStart) + 2);
  const flag = /placeholder:\s*(true|false)/.exec(emailBlock);

  if (!flag) {
    fail(
      "contact email",
      true,
      "email block has no `placeholder:` flag",
      "add placeholder: true|false so the UI can decide whether to render the link",
    );
    return;
  }

  if (flag[1] === "true") {
    fail(
      "contact email",
      true,
      "site.email.placeholder is still true",
      "set the real enquiries inbox, its href (mailto:) and placeholder: false in src/content/site.ts",
    );
    return;
  }

  /* The display string is checked too: a false flag with placeholder copy is
     the failure mode that only shows up in front of a customer. */
  if (/pending confirmation/i.test(emailBlock)) {
    fail(
      "contact email",
      true,
      "placeholder wording still present in the email block",
      "replace the display text with the real address",
    );
    return;
  }

  pass("contact email", "placeholder: false");
}

function checkNotification() {
  const webhook = env("MITT_NOTIFY_WEBHOOK");
  const host = env("MITT_SMTP_HOST");
  const from = env("MITT_SMTP_FROM");
  const to = env("MITT_NOTIFY_TO");

  const smtpMissing = [];
  if (!host) smtpMissing.push("MITT_SMTP_HOST");
  if (!from) smtpMissing.push("MITT_SMTP_FROM");
  if (!to) smtpMissing.push("MITT_NOTIFY_TO");

  if (webhook) {
    let ok = false;
    try {
      const url = new URL(webhook);
      const loopback =
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname === "[::1]";
      ok = url.protocol === "https:" || (url.protocol === "http:" && loopback);
    } catch {
      ok = false;
    }

    if (!ok) {
      fail(
        "notification",
        true,
        "MITT_NOTIFY_WEBHOOK is not a usable https URL",
        "point it at an https endpoint that accepts a JSON POST",
      );
      return;
    }

    pass("notification", "webhook configured");
    return;
  }

  if (host && smtpMissing.length === 0) {
    pass("notification", `smtp configured (${host})`);
    return;
  }

  if (!host) {
    fail(
      "notification",
      true,
      "no channel configured - enquiries would be stored but never seen",
      "set MITT_NOTIFY_WEBHOOK (https) or the full MITT_SMTP_* block plus MITT_NOTIFY_TO",
    );
    return;
  }

  fail(
    "notification",
    true,
    `smtp incomplete, missing ${smtpMissing.join(", ")}`,
    "finish the MITT_SMTP_* block and set MITT_NOTIFY_TO to the staff inbox list (comma separated), or set MITT_NOTIFY_WEBHOOK instead",
  );
}

async function checkLegalReview() {
  const file = path.join(ROOT, "src", "content", "site.ts");

  let source;
  try {
    source = await readFile(file, "utf8");
  } catch {
    warn("legal review", "src/content/site.ts unreadable", "check the file exists and is readable");
    return;
  }

  const match = /legalReviewPending:\s*(true|false)/.exec(source);

  if (!match) {
    warn("legal review", "legalReviewPending flag not found", "restore the flag in site.ts");
    return;
  }

  if (match[1] === "true") {
    warn(
      "legal review",
      "legalReviewPending is true - /privacy and /terms show a DRAFT chip",
      "counsel reviews both pages against DPDP 2023, then set legalReviewPending: false (human step)",
    );
    return;
  }

  pass("legal review", "legalReviewPending: false");
}

async function checkLeadStore() {
  const configured = env("MITT_LEAD_DIR");
  const raw = configured || "./var/enquiries";
  const directory = path.isAbsolute(raw) ? raw : path.resolve(ROOT, raw);

  try {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await access(directory, constants.W_OK);
  } catch (error) {
    fail(
      "lead store",
      true,
      `not writable: ${directory} (${error.code ?? "error"})`,
      "create it with mode 0700 and give the node user ownership, or set MITT_LEAD_DIR to a writable path",
    );
    return;
  }

  pass("lead store", path.relative(ROOT, directory) || ".");
}

/**
 * The media inventory flags both supplied stills as development placeholders
 * with unverified provenance. They may stay (the pages carry a disclosure
 * caption) but a human must confirm the licence or replace them.
 */
async function checkPlaceholderMedia() {
  const filenames = ["hero-welding.jpg", "facility-corridor.jpg"];
  const present = [];

  for (const name of filenames) {
    try {
      await stat(path.join(ROOT, "public", "media", name));
      present.push(name);
    } catch {
      /* absent: nothing to warn about */
    }
  }

  if (present.length === 0) {
    pass("placeholder media", "no development stills present");
    return;
  }

  warn(
    "placeholder media",
    `development placeholders still published: ${present.join(", ")}`,
    "confirm licence for commercial web use, or replace with MITT-approved photography (/public/media, see docs/MEDIA-INVENTORY.md)",
  );
}

/* ── report ──────────────────────────────────────────────────────────────── */

function printTable(loaded) {
  const width = Math.max(...results.map((row) => row.item.length));

  console.log("");
  console.log("MITT preflight - launch gate");
  console.log(`node      ${process.version}`);
  console.log(`root      ${ROOT}`);
  console.log(`env files ${loaded.length > 0 ? loaded.join(", ") : "none (shell environment only)"}`);
  console.log("");
  console.log("-".repeat(78));

  for (const row of results) {
    const detail = row.detail ? `  ${row.detail}` : "";
    console.log(`[${row.status}] ${row.item.padEnd(width)}${detail}`);

    if (row.remedy && row.status !== "PASS") {
      console.log(`         ${" ".repeat(width)}  -> ${row.remedy}`);
    }
  }

  console.log("-".repeat(78));
}

async function main() {
  const loaded = await loadEnvFiles();

  await checkSiteUrl();
  await checkContactEmail();
  checkNotification();
  await checkLegalReview();
  await checkLeadStore();
  await checkPlaceholderMedia();

  printTable(loaded);

  const blockers = results.filter((row) => row.status === "FAIL" && row.blocker);
  const warnings = results.filter((row) => row.status === "WARN");

  console.log(
    `${results.length} checks: ${results.filter((r) => r.status === "PASS").length} pass, ` +
      `${blockers.length} blocker, ${warnings.length} warn`,
  );

  if (blockers.length > 0) {
    console.log("");
    console.log("FAIL - resolve the blocker(s) above before pointing the domain at this build.");
    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    console.log("");
    console.log("PASS with warnings - ship-blocking checks are clear; the warnings are human steps.");
    return;
  }

  console.log("");
  console.log("PASS - all checks clear.");
}

await main();
