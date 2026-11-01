// ACE audit: SEO / AEO / EEAT measured from BUILT HTML, not from source.
// Usage: node scripts/ace-audit.mjs [dir]   (default: out)
import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] ?? "out";

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "_next" || e.name === "media") continue;
      walk(p, acc);
    } else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
   .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");

const text = (html) =>
  decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const pages = [];
const titles = new Map();
const descs = new Map();

for (const file of walk(ROOT).sort()) {
  const html = fs.readFileSync(file, "utf8");
  const route = "/" + path.relative(ROOT, file).replace(/(index)?\.html$/, "").replace(/\\/g, "/");

  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
  // Measure the DECODED title: "&amp;" is 5 characters in the HTML but 1 in the
  // SERP, so counting the raw markup reports false truncation on any title
  // containing an ampersand.
  const titleText = decode(title);
  const desc = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ?? "").trim();
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i)?.[1] ?? "";
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1]));
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => text(m[1]));
  const h3s = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => text(m[1]));
  const jsonld = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => { try { const d = JSON.parse(m[1]); return d["@type"] ?? (Array.isArray(d) ? "array" : "?"); } catch { return "INVALID"; } });
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\balt="/.test(t)).length;
  const internal = new Set([...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]));
  const body = text(html);
  const words = body ? body.split(/\s+/).length : 0;
  const og = ["og:title", "og:description", "og:image", "og:url"].filter((k) => html.includes(`property="${k}"`));
  const hasDate = /\b(20\d\d-\d\d-\d\d|last (reviewed|updated)|updated)\b/i.test(body.slice(0, 2500));
  // AEO answer block: pages usually open with a short eyebrow/label paragraph, so
  // measure the first SUBSTANTIVE paragraph rather than literally the first <p>.
  const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => text(m[1]));
  const answerParas = paras.map((t) => t.split(/\s+/).filter(Boolean).length).filter((n) => n >= 20);
  const answerWords = answerParas[0] ?? 0;

  if (title) titles.set(titleText, (titles.get(titleText) ?? 0) + 1);
  if (desc) descs.set(desc, (descs.get(desc) ?? 0) + 1);

  pages.push({ route, file, title: titleText, titleLen: titleText.length, desc, descLen: desc.length, canonical,
    h1: h1s.length, h1Text: h1s[0] ?? "", h2: h2s.length, h3: h3s.length, jsonld,
    imgs: imgs.length, noAlt, internal: internal.size, words, og: og.length, hasDate, answerWords });
}

const NOINDEX_ROUTES = /^\/(thank-you|404|_not-found)\/?$/;
const isNoIndex = (route) => NOINDEX_ROUTES.test(route);

const bad = [];
const warn = [];
for (const p of pages) {
  if (p.h1 !== 1) bad.push(`${p.route}: h1 count ${p.h1}`);
  if (!p.title) bad.push(`${p.route}: no title`);
  else if (p.titleLen > 62) warn.push(`${p.route}: title ${p.titleLen} chars (>62 truncates in SERP)`);
  else if (p.titleLen < 30 && !isNoIndex(p.route)) warn.push(`${p.route}: title ${p.titleLen} chars (too short to carry keywords)`);
  if (!p.desc) bad.push(`${p.route}: no meta description`);
  else if (p.descLen < 70 || p.descLen > 165) warn.push(`${p.route}: description ${p.descLen} chars (want 70-165)`);
  // A 404 or a noindex confirmation page legitimately has no canonical and is not
  // competing for a query, so it is exempt from the ranking checks.
  if (!p.canonical && !isNoIndex(p.route)) bad.push(`${p.route}: no canonical`);
  if (p.jsonld.includes("INVALID")) bad.push(`${p.route}: invalid JSON-LD`);
  if (p.noAlt > 0) bad.push(`${p.route}: ${p.noAlt} img without alt`);
  if (p.og < 4 && !isNoIndex(p.route)) warn.push(`${p.route}: only ${p.og}/4 OG tags`);
  if (p.words < 250 && !isNoIndex(p.route)) warn.push(`${p.route}: thin (${p.words} words)`);
  if (!p.hasDate && !isNoIndex(p.route)) warn.push(`${p.route}: no visible updated/reviewed date (EEAT)`);
  if ((p.answerWords < 25 || p.answerWords > 90) && !isNoIndex(p.route))
    warn.push(`${p.route}: first paragraph ${p.answerWords} words (AEO wants a 40-60 word answer block)`);
  if (p.internal < 8 && !isNoIndex(p.route)) warn.push(`${p.route}: only ${p.internal} internal links`);
}

console.log(`\nACE AUDIT - ${pages.length} built pages from ${ROOT}\n`);
console.log("route".padEnd(18), "title".padEnd(6), "desc".padEnd(5), "canon", "h1/h2/h3".padEnd(9), "words".padEnd(6), "imgs", "links".padEnd(6), "json-ld");
for (const p of pages) {
  console.log(
    p.route.padEnd(18),
    String(p.titleLen).padEnd(6),
    String(p.descLen).padEnd(5),
    (p.canonical ? "yes " : "NO  "),
    `${p.h1}/${p.h2}/${p.h3}`.padEnd(9),
    String(p.words).padEnd(6),
    String(p.imgs).padEnd(4),
    String(p.internal).padEnd(6),
    p.jsonld.join(",") || "-",
  );
}

const dupTitles = [...titles].filter(([, n]) => n > 1);
const dupDescs = [...descs].filter(([, n]) => n > 1);
console.log("\nUNIQUE TITLES:", titles.size, "/", pages.length, dupTitles.length ? `DUPLICATES: ${dupTitles.map(([t]) => t)}` : "(all unique)");
console.log("UNIQUE DESCRIPTIONS:", descs.size, "/", pages.length, dupDescs.length ? `DUPLICATES: ${dupDescs.length}` : "(all unique)");

console.log(`\nFAIL (${bad.length})`); bad.forEach((b) => console.log("  -", b));
console.log(`\nWARN (${warn.length})`); warn.forEach((w) => console.log("  -", w));
process.exit(bad.length ? 1 : 0);
