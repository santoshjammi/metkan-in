// Independent accessibility audit across every route, at two viewports.
import { chromium } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = process.env.AXE_BASE ?? "http://localhost:3220";
const ROUTES = [
  "/",
  "/for-employers",
  "/capabilities",
  "/training",
  "/our-process",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/thank-you",
  "/does-not-exist",
];

const browser = await chromium.launch();
let total = 0;
const worst = [];

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const ctx = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const res = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    const bad = res.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    total += res.violations.length;
    const line = `${viewport.name.padEnd(7)} ${route.padEnd(18)} violations=${res.violations.length} critical/serious=${bad.length}`;
    if (res.violations.length) {
      worst.push(`${line}\n` + res.violations.map((v) => `      [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes) -> ${v.nodes[0]?.target?.join(" ")}`).join("\n"));
    } else {
      console.log(line);
    }
  }
  await ctx.close();
}
await browser.close();
console.log("\n--- pages with violations ---\n" + (worst.length ? worst.join("\n") : "none"));
console.log(`\nTOTAL violations across ${ROUTES.length * 2} page/device combinations: ${total}`);
