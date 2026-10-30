/**
 * GET /api/health — deployment probe.
 *
 * Answers one question an operator actually asks after a deploy: "can this
 * instance still accept an enquiry?" It reports booleans only. Nothing here
 * echoes an environment value, a path, a hostname or a credential, because a
 * health endpoint is usually reachable from the internet and is the first thing
 * a scanner reads.
 *
 * The store probe creates the lead directory (recursive, 0700) and then tests
 * `W_OK` on it. It deliberately does NOT write a test enquiry: a probe that
 * writes a fake lead pollutes the very file staff read, and it would make
 * "writable" look true on a volume that is full right after the probe.
 *
 * 200 when the instance can persist and notify; 503 when it cannot persist.
 * A missing notification channel is reported, not fatal: an enquiry that is
 * stored is still recoverable, so the store is the only hard requirement.
 */

import { access, mkdir, constants } from "node:fs/promises";
import { NextResponse } from "next/server";
import pkg from "../../../../package.json";
import { leadStoreDirectory } from "@/lib/leads";
import { isNotifyConfigured } from "@/lib/notify";

export const runtime = "nodejs";
/** Probes the filesystem on every call: never cached. */
export const dynamic = "force-dynamic";

const PLACEHOLDER_HOSTS = ["localhost", "127.0.0.1", "example.com", "example.org"];

/** True only for an absolute-looking, non-placeholder, non-loopback origin. */
function siteUrlConfigured(): boolean {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return false;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const host = url.hostname.toLowerCase();
  if (PLACEHOLDER_HOSTS.some((placeholder) => host === placeholder)) return false;
  if (host.endsWith(".example.com") || host.endsWith(".localhost")) return false;

  return true;
}

/** create-if-missing, then prove the process can write there. */
async function leadStoreWritable(): Promise<boolean> {
  try {
    const directory = leadStoreDirectory();
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await access(directory, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function version(): string {
  /* package.json is imported at build time; this guards a malformed value only. */
  const value = (pkg as { version?: unknown }).version;
  return typeof value === "string" && value.length > 0 ? value : "0.0.0";
}

export async function GET(): Promise<NextResponse> {
  const writable = await leadStoreWritable();

  return NextResponse.json(
    {
      ok: writable,
      version: version(),
      leadStoreWritable: writable,
      notifyConfigured: isNotifyConfigured(),
      siteUrlConfigured: siteUrlConfigured(),
    },
    {
      status: writable ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
