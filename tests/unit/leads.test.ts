import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  LEAD_STORE_VERSION,
  leadStoreDirectory,
  leadStoreFileName,
  persistEnquiry,
  type EnquiryRecord,
} from "@/lib/leads";

const ORIGINAL_DIR = process.env.MITT_LEAD_DIR;

let directory: string;

function record(overrides: Partial<EnquiryRecord> = {}): EnquiryRecord {
  return {
    reference: "MITT-261030-K3M9QW",
    receivedAt: "2026-10-30T06:30:00.000Z",
    source: "website",
    name: "Ravi Kumar",
    organisation: "Autonagar Fabrication Works",
    email: "ravi@example.com",
    orgType: "employer",
    consent: true,
    phone: "+91 74163 42020",
    trades: ["welding", "fitting-and-fabrication"],
    headcount: "6-25",
    location: "Visakhapatnam",
    employmentType: "contract",
    timeline: "30d",
    notes: "Two shifts.",
    ...overrides,
  };
}

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "mitt-leads-"));
  process.env.MITT_LEAD_DIR = directory;
});

afterEach(async () => {
  if (ORIGINAL_DIR === undefined) delete process.env.MITT_LEAD_DIR;
  else process.env.MITT_LEAD_DIR = ORIGINAL_DIR;

  await rm(directory, { recursive: true, force: true });
});

describe("lead file naming", () => {
  it("uses the IST month in enquiries-YYYY-MM.jsonl", () => {
    /* 2026-10-31T20:00Z is already November in IST. */
    expect(leadStoreFileName("2026-10-31T20:00:00.000Z")).toBe(
      "enquiries-2026-11.jsonl",
    );
    expect(leadStoreFileName("2026-10-30T06:30:00.000Z")).toBe(
      "enquiries-2026-10.jsonl",
    );
  });

  it("resolves MITT_LEAD_DIR, absolute or relative", () => {
    expect(leadStoreDirectory()).toBe(directory);

    process.env.MITT_LEAD_DIR = "./var/enquiries-test";
    expect(leadStoreDirectory()).toBe(
      path.resolve(process.cwd(), "var/enquiries-test"),
    );
  });
});

describe("persistEnquiry()", () => {
  it("appends one parseable JSON line", async () => {
    const result = await persistEnquiry(record());

    expect(result.file).toBe(
      path.join(directory, "enquiries-2026-10.jsonl"),
    );

    const contents = await readFile(result.file, "utf8");
    expect(contents.endsWith("\n")).toBe(true);
    expect(contents.split("\n").filter(Boolean)).toHaveLength(1);

    const parsed = JSON.parse(contents.trim());
    expect(parsed.version).toBe(LEAD_STORE_VERSION);
    expect(parsed.reference).toBe("MITT-261030-K3M9QW");
    expect(parsed.receivedAt).toBe("2026-10-30T06:30:00.000Z");
    expect(parsed.source).toBe("website");
    expect(parsed.name).toBe("Ravi Kumar");
    expect(parsed.email).toBe("ravi@example.com");
    expect(parsed.orgType).toBe("employer");
    expect(parsed.trades).toEqual(["welding", "fitting-and-fabrication"]);
    expect(parsed.consent).toBe(true);
  });

  it("writes one line per enquiry, in order", async () => {
    await persistEnquiry(record({ reference: "MITT-261030-AAAAAA" }));
    await persistEnquiry(record({ reference: "MITT-261030-BBBBBB" }));

    const contents = await readFile(
      path.join(directory, "enquiries-2026-10.jsonl"),
      "utf8",
    );
    const lines = contents.split("\n").filter(Boolean);

    expect(lines).toHaveLength(2);
    expect(lines.map((line) => JSON.parse(line).reference)).toEqual([
      "MITT-261030-AAAAAA",
      "MITT-261030-BBBBBB",
    ]);
  });

  it("creates the store directory 0700 and the file 0600", async () => {
    const result = await persistEnquiry(record());

    const dirMode = (await stat(result.directory)).mode & 0o777;
    const fileMode = (await stat(result.file)).mode & 0o777;

    expect(dirMode).toBe(0o700);
    expect(fileMode).toBe(0o600);
  });

  it("creates a missing nested directory", async () => {
    process.env.MITT_LEAD_DIR = path.join(directory, "nested", "leads");
    const result = await persistEnquiry(record());

    expect(result.directory).toBe(path.join(directory, "nested", "leads"));
    await expect(stat(result.file)).resolves.toBeTruthy();
  });

  it("throws when the store cannot be written", async () => {
    /* A regular file where a directory must be: mkdir fails, so persist fails. */
    const blocker = path.join(directory, "blocked");
    await persistEnquiry(record());
    await rm(path.join(directory, "enquiries-2026-10.jsonl"));

    const { writeFile } = await import("node:fs/promises");
    await writeFile(blocker, "not a directory", "utf8");
    process.env.MITT_LEAD_DIR = blocker;

    await expect(persistEnquiry(record())).rejects.toThrow();
  });
});
