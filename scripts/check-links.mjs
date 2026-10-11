#!/usr/bin/env node
/**
 * Internal link checker — runs against the BUILT site (`dist/`).
 *
 * Every internal href/src in every generated HTML file must resolve to a file
 * that actually exists in `dist/`. This is the gate that stops a teacher
 * clicking a dead link. Runs in CI after `npm run build`.
 *
 * External (http/https) links are collected but NOT fetched here — use
 * `npm run check:links:external` for those (network-dependent).
 *
 * It also checks the SHAPE of every off-site anchor: a link that takes a reader
 * off beets-ai.com must carry `target="_blank"` and `rel="noopener noreferrer"`
 * (Billy, 2026-10-11). The reader is mid-task when they follow the Census table
 * or EDB's document page; opening it in place loses the resource they were
 * reading. `rel="noopener"` is the part that stops the opened page reaching back
 * through `window.opener`. Markdown links get the attributes from
 * `src/lib/rehype-external-links.mjs`; links authored in `.astro` set them by
 * hand — and this is what proves neither path missed one.
 *
 * Exit code 1 if any internal link is broken or any off-site anchor is naked.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

/** Absolute URLs on our own origin are internal links, not external ones. */
const SITE_ORIGIN = "https://beets-ai.com";

if (!existsSync(DIST)) {
  console.error("✗ dist/ not found — run `npm run build` first.");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

/** Does an internal target resolve to something real inside dist/? */
function resolves(target) {
  const clean = target.split("#")[0].split("?")[0];
  if (clean === "" || clean === "/") return existsSync(join(DIST, "index.html"));

  const rel = clean.replace(/^\//, "");
  const p = join(DIST, rel);

  if (existsSync(p)) {
    return statSync(p).isFile() || existsSync(join(p, "index.html"));
  }
  // extensionless: /about → about.html or about/index.html
  if (existsSync(`${p}.html`)) return true;
  if (existsSync(join(p, "index.html"))) return true;
  return false;
}

const htmlFiles = walk(DIST);
const failures = [];
const nakedExternal = [];
const external = new Set();
let checked = 0;
let externalAnchors = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const attr = /(?:href|src)\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = attr.exec(html)) !== null) {
    const target = m[1].trim();
    if (!target) continue;
    if (/^(mailto:|tel:|data:|javascript:)/i.test(target)) continue;
    if (/^https?:\/\//i.test(target)) {
      // Same-origin absolute URLs (e.g. the canonical tag) are internal.
      if (target.startsWith(SITE_ORIGIN)) {
        checked++;
        if (!resolves(target.slice(SITE_ORIGIN.length) || "/")) {
          failures.push({ page: file.replace(DIST + "/", ""), target });
        }
        continue;
      }
      external.add(target);
      continue;
    }
    if (target.startsWith("#")) continue; // same-page anchor

    checked++;
    if (!resolves(target)) {
      failures.push({ page: file.replace(DIST + "/", ""), target });
    }
  }
}

// ── off-site anchors must open in a new tab ────────────────────────────────
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const anchor of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = anchor[0];
    const href = tag.match(/href\s*=\s*"([^"]+)"/)?.[1] ?? "";
    if (!/^https?:\/\//i.test(href) || href.startsWith(SITE_ORIGIN)) continue;
    externalAnchors++;
    const missing = [];
    if (!/target\s*=\s*"_blank"/i.test(tag)) missing.push('target="_blank"');
    if (!/rel\s*=\s*"[^"]*noopener/i.test(tag)) missing.push('rel="noopener"');
    if (missing.length) {
      nakedExternal.push({
        page: file.replace(`${DIST}/`, ""),
        href,
        missing: missing.join(" + "),
      });
    }
  }
}

console.log(
  `internal links checked: ${checked} across ${htmlFiles.length} page(s); ` +
    `external links seen: ${external.size}; off-site anchors: ${externalAnchors}`,
);

if (failures.length) {
  console.error(`\n✗ ${failures.length} broken internal link(s):`);
  for (const f of failures) console.error(`   ${f.page}  ->  ${f.target}`);
}

if (nakedExternal.length) {
  console.error(
    `\n✗ ${nakedExternal.length} off-site link(s) that would navigate away in place:`,
  );
  for (const f of nakedExternal.slice(0, 20)) {
    console.error(`   ${f.page}\n     ${f.href}\n     missing ${f.missing}`);
  }
  if (nakedExternal.length > 20) {
    console.error(`   … and ${nakedExternal.length - 20} more`);
  }
}

if (failures.length || nakedExternal.length) process.exit(1);
console.log("✓ no broken internal links, and every off-site link opens in a new tab");
