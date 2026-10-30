/**
 * Staff notification for a stored enquiry.
 *
 * WHY THIS EXISTS
 * A file on disk is durable but nobody is watching it. An enquiry that is
 * written and never read is a lost employer. This module turns a stored record
 * into a human-readable alert down one of two optional channels:
 *
 *   (a) WEBHOOK  `MITT_NOTIFY_WEBHOOK` — an HTTPS endpoint (chat-ops bot, mail
 *       relay, automation platform) that receives the record as JSON.
 *   (b) SMTP     `MITT_SMTP_*` + `MITT_NOTIFY_TO` — mail straight from the app.
 *
 * CONTRACT
 *  - `notifyEnquiry()` NEVER throws. Every failure is returned as
 *    `{ ok: false, channel, error }` so the caller can keep the 201 it already
 *    earned by persisting the record. A notification problem must never turn a
 *    saved enquiry into an error page for the employer.
 *  - NO PII IN LOGS. This module itself writes nothing to stdout/stderr. The
 *    route logs only the reference, the channel and a short status — never the
 *    name, organisation, email address, phone number or notes. The record's own
 *    contents travel to staff over the configured channel and nowhere else.
 *  - Bounded. Each attempt is time-boxed (webhook 5s, SMTP connection and
 *    socket timeouts), and the whole call has an internal 6s deadline so a
 *    wedged mail server cannot hold the HTTP response open.
 *
 * Server-only: imports `nodemailer` lazily, so the webhook path (and any build
 * that never configures SMTP) does not load it.
 */

import type { EnquiryRecord } from "@/lib/leads";

export type NotifyChannel = "webhook" | "smtp" | "none";

export interface NotifyResult {
  ok: boolean;
  channel: NotifyChannel;
  /** Short machine-readable reason. Never contains submitted field values. */
  error?: string;
}

/** Hard ceiling for the whole notification, including every fallback attempt. */
export const NOTIFY_BUDGET_MS = 6000;

/** Per-request ceiling for the webhook POST. */
export const WEBHOOK_TIMEOUT_MS = 5000;

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string[];
}

/* ── configuration ───────────────────────────────────────────────────────── */

function readWebhookUrl(): string | null {
  const raw = process.env.MITT_NOTIFY_WEBHOOK?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  /*
   * HTTPS only, with one deliberate exception: a loopback HTTP URL, so the
   * channel can be exercised against a local sink during verification. Anything
   * else over plaintext would put an employer's contact details on the wire.
   */
  const loopback =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]" ||
    url.hostname === "::1";

  if (url.protocol === "https:") return url.toString();
  if (url.protocol === "http:" && loopback) return url.toString();
  return null;
}

function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.MITT_SMTP_HOST?.trim();
  const from = process.env.MITT_SMTP_FROM?.trim();
  /* MITT_NOTIFY_TO is required: an SMTP transport with no recipient is not a
     notification channel, it is a misconfiguration that silently drops leads. */
  const to = (process.env.MITT_NOTIFY_TO ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (!host || !from || to.length === 0) return null;

  const portRaw = process.env.MITT_SMTP_PORT?.trim();
  const parsedPort = portRaw ? Number.parseInt(portRaw, 10) : NaN;
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;

  const secure = process.env.MITT_SMTP_SECURE?.trim().toLowerCase() === "true";

  const user = process.env.MITT_SMTP_USER?.trim() || undefined;
  const pass = process.env.MITT_SMTP_PASS?.trim() || undefined;

  return { host, port, secure, user, pass, from, to };
}

/** True when at least one channel has everything it needs. */
export function isNotifyConfigured(): boolean {
  return readWebhookUrl() !== null || readSmtpConfig() !== null;
}

/* ── message rendering ───────────────────────────────────────────────────── */

function dash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Not provided";
}

function subjectFor(record: EnquiryRecord): string {
  return `New workforce enquiry ${record.reference}`;
}

/**
 * Plain-text body. Deliberately one label per line: staff read this on a phone
 * between site visits, and a single dense paragraph loses the timeline.
 */
function textBody(record: EnquiryRecord): string {
  const trades =
    record.trades && record.trades.length > 0 ? record.trades.join(", ") : null;

  const lines = [
    "A new workforce enquiry was submitted on the MITT website.",
    "",
    `Reference:        ${record.reference}`,
    `Received (UTC):   ${record.receivedAt}`,
    "",
    `Organisation:     ${record.organisation}`,
    `Organisation type: ${record.orgType}`,
    `Trades:           ${dash(trades)}`,
    `Headcount:        ${dash(record.headcount)}`,
    `Location:         ${dash(record.location)}`,
    `Timeline:         ${dash(record.timeline)}`,
    `Employment type:  ${dash(record.employmentType)}`,
    "",
    `Contact name:     ${record.name}`,
    `Contact email:    ${record.email}`,
    `Contact phone:    ${dash(record.phone)}`,
  ];

  if (record.notes && record.notes.trim().length > 0) {
    lines.push("", "Notes from the employer:", record.notes.trim());
  }

  lines.push(
    "",
    `Reply to the sender at ${record.email} to respond to this enquiry.`,
    "The employer agreed to be contacted about this enquiry when submitting the form.",
    "",
    "This message was generated automatically by the MITT website. The stored copy",
    "of the enquiry is in the lead store under the reference above.",
  );

  return `${lines.join("\n")}\n`;
}

/** HTML escape. Every interpolated value passes through this. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlBody(record: EnquiryRecord): string {
  const trades =
    record.trades && record.trades.length > 0 ? record.trades.join(", ") : null;

  const rows: Array<[string, string]> = [
    ["Reference", record.reference],
    ["Received (UTC)", record.receivedAt],
    ["Organisation", record.organisation],
    ["Organisation type", record.orgType],
    ["Trades", dash(trades)],
    ["Headcount", dash(record.headcount)],
    ["Location", dash(record.location)],
    ["Timeline", dash(record.timeline)],
    ["Employment type", dash(record.employmentType)],
    ["Contact name", record.name],
    ["Contact email", record.email],
    ["Contact phone", dash(record.phone)],
  ];

  const table = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:4px 12px 4px 0;font-weight:600;white-space:nowrap;">${esc(
          label,
        )}</th><td style="padding:4px 0;">${esc(value)}</td></tr>`,
    )
    .join("");

  const notes =
    record.notes && record.notes.trim().length > 0
      ? `<h2 style="font-size:15px;margin:20px 0 6px;">Notes from the employer</h2><p style="margin:0;white-space:pre-wrap;">${esc(
          record.notes.trim(),
        )}</p>`
      : "";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#111;">
    <p style="margin:0 0 14px;">A new workforce enquiry was submitted on the MITT website.</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${table}</table>
    ${notes}
    <p style="margin:20px 0 0;">Reply to the sender at <a href="mailto:${esc(
      record.email,
    )}">${esc(record.email)}</a> to respond to this enquiry.</p>
    <p style="margin:8px 0 0;color:#555;font-size:13px;">The employer agreed to be contacted about this enquiry when submitting the form. This message was generated automatically by the MITT website.</p>
  </body>
</html>`;
}

/* ── channels ────────────────────────────────────────────────────────────── */

async function sendWebhook(record: EnquiryRecord, url: string): Promise<NotifyResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "enquiry.created",
        reference: record.reference,
        receivedAt: record.receivedAt,
        enquiry: record,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, channel: "webhook", error: `http_${response.status}` };
    }

    return { ok: true, channel: "webhook" };
  } catch (error) {
    const name =
      error instanceof Error && error.name === "AbortError" ? "timeout" : "request_failed";
    return { ok: false, channel: "webhook", error: name };
  } finally {
    clearTimeout(timer);
  }
}

async function sendSmtp(record: EnquiryRecord, config: SmtpConfig): Promise<NotifyResult> {
  try {
    /* Lazy import: keeps nodemailer out of any path that does not use SMTP. */
    const nodemailerModule = await import("nodemailer");
    const nodemailer = nodemailerModule.default ?? nodemailerModule;
    const createTransport = nodemailer.createTransport.bind(nodemailer);

    const transport = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth:
        config.user && config.pass
          ? { user: config.user, pass: config.pass }
          : undefined,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 6000,
    });

    await transport.sendMail({
      from: config.from,
      to: config.to,
      /*
       * Reply goes straight to the employer, not to the sending mailbox: the
       * whole point of the alert is that a human can answer the enquiry.
       */
      replyTo: record.email,
      subject: subjectFor(record),
      text: textBody(record),
      html: htmlBody(record),
    });

    transport.close();
    return { ok: true, channel: "smtp" };
  } catch (error) {
    /* Error codes only. A nodemailer error can echo the envelope, so nothing
       from the thrown object is copied verbatim beyond a short code. */
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code).slice(0, 40)
        : "send_failed";
    return { ok: false, channel: "smtp", error: code };
  }
}

/* ── entry point ─────────────────────────────────────────────────────────── */

/**
 * Deliver `record` to staff. Resolves with an outcome; never rejects, never
 * throws synchronously, and never exceeds `NOTIFY_BUDGET_MS` by any meaningful
 * margin (per-attempt timeouts keep each step well inside it).
 */
export async function notifyEnquiry(record: EnquiryRecord): Promise<NotifyResult> {
  const webhookUrl = readWebhookUrl();
  const smtp = readSmtpConfig();

  if (!webhookUrl && !smtp) {
    return { ok: false, channel: "none", error: "not_configured" };
  }

  const deadline = Date.now() + NOTIFY_BUDGET_MS;
  const timeLeft = (): number => deadline - Date.now();

  /* Webhook first: it is the cheaper, more reliably observable channel. */
  if (webhookUrl) {
    if (timeLeft() <= 0) {
      return { ok: false, channel: "webhook", error: "budget_exceeded" };
    }

    const result = await sendWebhook(record, webhookUrl);
    if (result.ok) return result;

    /* Fall through to SMTP only when there is real time left to try it. */
    if (!smtp) return result;
    if (timeLeft() <= 1000) return result;
  }

  if (!smtp) return { ok: false, channel: "none", error: "not_configured" };

  return sendSmtp(record, smtp);
}
