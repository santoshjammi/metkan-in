import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROUTES: Array<{ path: string; h1: RegExp }> = [
  { path: "/", h1: /Skilled Hands\. Stronger Industries\./ },
  { path: "/for-employers", h1: /Send the requirement\./ },
  { path: "/capabilities", h1: /trade categories/i },
  { path: "/training", h1: /front half of hiring/i },
  { path: "/our-process", h1: /Eight stages/i },
  { path: "/about", h1: /Metkan Institute for Technical Training/i },
  { path: "/contact", h1: /Discuss your workforce requirement/i },
  { path: "/privacy", h1: /Privacy notice/i },
  { path: "/terms", h1: /terms of use/i },
];

test.describe("routes and structure", () => {
  for (const { path, h1 } of ROUTES) {
    test(`${path} renders with a single matching h1`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      const headings = page.locator("h1");
      await expect(headings).toHaveCount(1);
      await expect(headings.first()).toHaveText(h1);
      // Title must exist and not be the bare template placeholder
      const title = await page.title();
      expect(title.length).toBeGreaterThan(8);
    });
  }

  test("unknown route is a real 404 with one h1", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("capability deep links resolve to anchors", async ({ page }) => {
    await page.goto("/capabilities");
    for (const slug of [
      "welding",
      "fitting-and-fabrication",
      "electrical-trades",
      "mechanical-and-industrial-support",
      "plumbing",
      "construction-trades",
      "general-industrial-workforce",
    ]) {
      await expect(page.locator(`#${slug}`)).toHaveCount(1);
    }
  });

  test("every internal nav target returns 200", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator("header nav a, footer nav a").evaluateAll((els) =>
      Array.from(new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? ""))),
    );
    const internal = hrefs.filter((h) => h.startsWith("/"));
    expect(internal.length).toBeGreaterThan(5);
    for (const href of internal) {
      const res = await page.request.get(href);
      expect(res.status(), `${href} should be 200`).toBe(200);
    }
  });
});

test.describe("conversion path", () => {
  test("invalid submit shows field errors and moves focus", async ({ page }) => {
    await page.goto("/contact");
    // Let the render-timing guard pass so validation (not the bot check) is exercised.
    await page.waitForTimeout(3000);
    await page.getByRole("button", { name: /submit|send/i }).first().click();
    await expect(page.locator("[aria-invalid='true']").first()).toBeVisible();
    const focusedId = await page.evaluate(() => document.activeElement?.id ?? "");
    expect(focusedId).not.toBe("");
  });

  test("valid submit persists a lead and shows the real reference", async ({ page }) => {
    const dir = process.env.MITT_LEAD_DIR;
    test.skip(!dir, "requires MITT_LEAD_DIR from the server environment");

    await page.goto("/contact");
    await page.waitForTimeout(3000);

    const stamp = Date.now();
    await page.locator("#name").fill("Playwright Reviewer");
    await page.locator("#organisation").fill("E2E Fabrication Pvt Ltd");
    await page.locator("#email").fill(`e2e.${stamp}@example.com`);
    await page.locator("#orgType").selectOption("employer");
    await page.getByRole("checkbox", { name: /welding/i }).first().check();
    await page.getByRole("checkbox", { name: /consent|agree|confirm/i }).last().check();
    await page.getByRole("button", { name: /submit|send/i }).first().click();

    await page.waitForURL(/\/thank-you\?ref=/, { timeout: 15000 });
    const url = new URL(page.url());
    const ref = url.searchParams.get("ref") ?? "";
    expect(ref).toMatch(/^MITT-\d{6}-[A-Z2-9]{6}$/);
    await expect(page.locator("body")).toContainText(ref);

    // The reference shown to the user must exist on disk — no optimistic UI.
    const month = new Date().toISOString().slice(0, 7);
    const file = join(dir as string, `enquiries-${month}.jsonl`);
    expect(existsSync(file), `expected ${file}`).toBe(true);
    const lines = readFileSync(file, "utf8").trim().split("\n");
    const hit = lines.map((l) => JSON.parse(l)).find((r) => r.reference === ref);
    expect(hit, "persisted record must match the reference shown").toBeTruthy();
    expect(hit.email).toBe(`e2e.${stamp}@example.com`); // normalisation proof
  });
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps to a close action, and closes on Escape", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /menu/i }).first();
    await trigger.click();
    await expect(page.getByRole("link", { name: /capabilities/i }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    const stillOpen = await page.locator("[role='dialog']").count();
    expect(stillOpen).toBe(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe("no horizontal overflow", () => {
  for (const width of [320, 390, 768, 1440]) {
    test(`width ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/for-employers", "/contact", "/capabilities"]) {
        await page.goto(path);
        const over = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(over, `${path} overflows at ${width}px`).toBeLessThanOrEqual(1);
      }
    });
  }
});
