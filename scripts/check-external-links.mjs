#!/usr/bin/env node
/**
 * External link checker — fetches every http(s) link found in the built site
 * and reports non-2xx responses.
 *
 * Network-dependent and therefore NOT part of the blocking CI gate (a
 * third-party outage should not fail a deploy). Run it before publishing new
 * content, and treat its output as a required review step.
 *
 *   npm run check:links:external
 *
 * Exit code 1 if any link fails, so it can also be run manually in a pipeline.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");
/** Our own origin is covered by the internal checker — never fetch it here. */
const SITE_ORIGIN = "https://beets-ai.com";

/** Path component of a URL, or "" when it can't be parsed. */
function pathOf(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}
const TIMEOUT_MS = 15000;
const CONCURRENCY = 6;

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

const links = new Map(); // url -> Set(pages)
for (const file of walk(DIST)) {
  const html = readFileSync(file, "utf8");
  const attr = /(?:href|src)\s*=\s*"(https?:\/\/[^"]+)"/g;
  let m;
  while ((m = attr.exec(html)) !== null) {
    const url = m[1];
    if (url.startsWith(SITE_ORIGIN)) continue; // internal — other checker handles it
    // Bare-origin URLs are resource hints (preconnect / dns-prefetch), not links:
    // those hosts legitimately return 404 for "/" and must not be fetched.
    if (!url.includes("//") || pathOf(url) === "/") continue;
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(file.replace(DIST + "/", ""));
  }
}

async function probe(url) {
  // A plain GET with a browser-ish UA: many sites reject HEAD or unknown UAs.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BeetsAI-link-check/1.0; +https://beets-ai.com)",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: `ERR ${String(err.name || err).slice(0, 40)}` };
  } finally {
    clearTimeout(timer);
  }
}

const urls = [...links.keys()];
console.log(`checking ${urls.length} external link(s)…\n`);

const results = [];
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY);
  results.push(...(await Promise.all(batch.map(async (u) => [u, await probe(u)]))));
}

const bad = results.filter(([, r]) => !r.ok);
for (const [url, r] of results) {
  const mark = r.ok ? "ok " : "BAD";
  console.log(`  [${mark}] ${r.status}  ${url}`);
}

if (bad.length) {
  console.error(`\n✗ ${bad.length} external link(s) failed. Fix or replace before publishing.`);
  for (const [url, r] of bad) {
    console.error(`   ${r.status}  ${url}`);
    for (const page of links.get(url)) console.error(`        referenced from ${page}`);
  }
  process.exit(1);
}
console.log("\n✓ all external links reachable");
