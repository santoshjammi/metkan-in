/**
 * Lead store — one JSON line per enquiry.
 *
 * Why a file: the site is a marketing site with no database, and an enquiry that
 * is not durably written must not report success (BUILD-SPEC §0.4). A JSONL
 * append is atomic enough for one process, trivially auditable, and imports into
 * a spreadsheet without a migration.
 *
 * Guarantees:
 *  - directory `MITT_LEAD_DIR ?? ./var/enquiries`, created `0700` (recursive);
 *  - file `enquiries-YYYY-MM.jsonl` (IST month), created `0600`;
 *  - one `appendFile` call per enquiry, newline-terminated, so a crash truncates
 *    at worst the final line;
 *  - **throws** on any failure — the route turns that into an honest 503. There
 *    is no silent fallback and no catch here on purpose.
 *  - never logs. PII stays in the file; the caller logs reference + orgType only.
 */

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { istParts } from "./reference";
import type { EnquiryFields } from "./validation";

/** Bumped only when the line shape changes in a way a reader must handle. */
export const LEAD_STORE_VERSION = 1;

export const LEAD_DIR_FALLBACK = "./var/enquiries";

export interface EnquiryRecord extends EnquiryFields {
  reference: string;
  /** ISO-8601 instant the request was accepted. */
  receivedAt: string;
  source: "website";
}

export interface PersistResult {
  /** Absolute path of the JSONL file the record was appended to. */
  file: string;
  /** Absolute path of the directory holding it. */
  directory: string;
}

/** Absolute directory, resolved against the process cwd. */
export function leadStoreDirectory(): string {
  const configured = process.env.MITT_LEAD_DIR?.trim();
  const raw = configured && configured.length > 0 ? configured : LEAD_DIR_FALLBACK;
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

/** `enquiries-YYYY-MM.jsonl` for the IST month of `receivedAt`. */
export function leadStoreFileName(receivedAt: string | Date): string {
  const date = receivedAt instanceof Date ? receivedAt : new Date(receivedAt);
  return `enquiries-${istParts(date).yyyymm}.jsonl`;
}

/**
 * Append one enquiry. Resolves with the file it wrote to; rejects if the write
 * did not happen. Callers must treat a rejection as "nothing was stored".
 */
export async function persistEnquiry(record: EnquiryRecord): Promise<PersistResult> {
  const directory = leadStoreDirectory();
  const file = path.join(directory, leadStoreFileName(record.receivedAt));

  const line = `${JSON.stringify({
    version: LEAD_STORE_VERSION,
    reference: record.reference,
    receivedAt: record.receivedAt,
    source: record.source,
    name: record.name,
    organisation: record.organisation,
    email: record.email,
    orgType: record.orgType,
    phone: record.phone ?? null,
    trades: record.trades ?? [],
    headcount: record.headcount ?? null,
    location: record.location ?? null,
    employmentType: record.employmentType ?? null,
    timeline: record.timeline ?? null,
    notes: record.notes ?? null,
    consent: record.consent,
  })}\n`;

  await mkdir(directory, { recursive: true, mode: 0o700 });
  await appendFile(file, line, { encoding: "utf8", mode: 0o600 });

  return { file, directory };
}
