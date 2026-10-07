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
 * Exit code 1 if any internal link is broken.
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
const external = new Set();
let checked = 0;

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

console.log(
  `internal links checked: ${checked} across ${htmlFiles.length} page(s); ` +
    `external links seen: ${external.size}`,
);

if (failures.length) {
  console.error(`\n✗ ${failures.length} broken internal link(s):`);
  for (const f of failures) console.error(`   ${f.page}  ->  ${f.target}`);
  process.exit(1);
}
console.log("✓ no broken internal links");
