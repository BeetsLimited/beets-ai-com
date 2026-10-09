#!/usr/bin/env node
/**
 * Submit URLs to IndexNow — the protocol Bing, Yandex, Seznam and Naver use to
 * learn about pages within minutes instead of waiting for a crawl. This is also
 * the path that feeds Bing's index, and therefore Copilot's answers.
 *
 * Setup (one-off, already committed):
 *   public/<key>.txt  — a file containing exactly the key, served at /<key>.txt
 *
 * Usage:
 *   node scripts/indexnow.mjs                 # submit every URL in the built sitemap
 *   node scripts/indexnow.mjs <url> [url...]  # submit specific URLs
 *   node scripts/indexnow.mjs --dry           # show what would be sent
 *
 * Build first — it reads dist/sitemap-0.xml, so it submits exactly what shipped.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const HOST = "beets-ai.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** The key is whatever `public/<key>.txt` is called and contains. */
function readKey() {
  const candidate = readdirSync(PUBLIC).find((f) => /^[a-f0-9]{8,128}\.txt$/.test(f));
  if (!candidate) {
    throw new Error(
      "No IndexNow key file found. Create public/<key>.txt containing the key (8-128 hex chars).",
    );
  }
  const key = candidate.replace(/\.txt$/, "");
  const body = readFileSync(join(PUBLIC, candidate), "utf8").trim();
  if (body !== key) throw new Error(`${candidate} must contain exactly the key "${key}"`);
  return key;
}

function sitemapUrls() {
  const dist = join(ROOT, "dist");
  const files = readdirSync(dist).filter((f) => /^sitemap.*\.xml$/.test(f));
  const urls = new Set();
  for (const f of files) {
    const xml = readFileSync(join(dist, f), "utf8");
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (m[1].endsWith(".xml")) continue;
      urls.add(m[1]);
    }
  }
  return [...urls];
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const explicit = args.filter((a) => !a.startsWith("--"));
const key = readKey();
const urls = explicit.length ? explicit : sitemapUrls();

if (!urls.length) {
  console.error("No URLs to submit. Run `npm run build` first, or pass URLs explicitly.");
  process.exit(1);
}

console.log(`IndexNow: ${urls.length} URL(s) · key ${key}`);
console.log(urls.map((u) => `  ${u}`).join("\n"));
if (dry) process.exit(0);

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: urls,
  }),
});

// 200 = accepted, 202 = accepted but key validation pending. Anything else is a real failure.
console.log(`\nHTTP ${res.status} ${res.statusText}`);
if (!res.ok && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
console.log("Submitted. Bing/Copilot index is notified.");
