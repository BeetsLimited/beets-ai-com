#!/usr/bin/env node
/**
 * Structural gate: no page prints the same heading twice.
 *
 * A duplicated heading is invisible in source — one copy comes from the content
 * markdown, the other from the component rendering it — and only shows up as the
 * same section appearing twice on a live page. Several resources shipped that
 * way: the body carried the plan's seven sections while the view also rendered
 * "How this relates to the EDB framework" and "Feedback" underneath it.
 *
 * Run after `astro build` (reads dist/). Exit code 1 on any duplicate.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

/** Directories that are not page output. */
const SKIP = new Set(["files", "_astro"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP.has(entry)) continue;
      out.push(...walk(full));
    } else if (entry.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

const headingsOf = (html, level) =>
  [...html.matchAll(new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, "gi"))]
    .map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 1);

try {
  statSync(DIST);
} catch {
  console.error("✗ dist/ not found — run `npm run build` first.");
  process.exit(1);
}

const pages = walk(DIST);
const failures = [];

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const level of [1, 2]) {
    const seen = new Map();
    for (const text of headingsOf(html, level)) {
      seen.set(text, (seen.get(text) ?? 0) + 1);
    }
    for (const [text, count] of seen) {
      if (count > 1) {
        failures.push({
          page: relative(DIST, page).split("\\").join("/"),
          why: `h${level} "${text}" appears ${count} times`,
        });
      }
    }
  }
}

console.log(`structure gate: ${pages.length} page(s) checked for duplicate headings`);

if (failures.length) {
  console.error(`\n✗ ${failures.length} duplicate heading(s):`);
  for (const failure of failures) console.error(`   ${failure.page}  ${failure.why}`);
  process.exit(1);
}

console.log("✓ no page repeats a heading");
