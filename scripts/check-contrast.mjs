#!/usr/bin/env node
/**
 * Contrast gate: the site is light-only, so no page may ship a dark block.
 *
 * Astro highlights fenced code blocks with Shiki, whose DEFAULT theme is
 * `github-dark`. Every resource that used a fenced block (the checklists)
 * therefore shipped as a near-black panel with light grey text — a dark box on a
 * site that is deliberately light-only, and hard to read on a projector in a
 * classroom, which is exactly where these pages are used. It was invisible in
 * the source: the markdown just says ``` and the colour arrives from a default.
 *
 * Two assertions, because the fix has two halves and either can be undone:
 *   1. no built page emits a dark Shiki theme or a dark inline background;
 *   2. the built stylesheet still carries the `pre.astro-code` brand override.
 *
 * Run after `astro build` (reads dist/). Exit code 1 on any failure.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

/** Directories that are not page output. */
const SKIP = new Set(["files", "_astro"]);

/** Footer of the built stylesheet — this rule must survive. */
const REQUIRED_CSS = "pre.astro-code";

/**
 * A light-only site. Anything below this relative luminance is a dark block and
 * fails. github-light's #ffffff is 1.0; github-dark's #24292e is ~0.03.
 */
const MIN_LUMINANCE = 0.5;

function luminance(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!match) return null;
  const n = Number.parseInt(match[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP.has(entry)) continue;
      out.push(...walk(full));
    } else if (entry.endsWith(".html") || entry.endsWith(".css")) {
      out.push(full);
    }
  }
  return out;
}

try {
  statSync(DIST);
} catch {
  console.error("✗ dist/ not found — run `npm run build` first.");
  process.exit(1);
}

const files = walk(DIST);
const pages = files.filter((f) => f.endsWith(".html"));
const failures = [];

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const name = relative(DIST, page).split("\\").join("/");

  for (const match of html.matchAll(/<pre\b[^>]*>/gi)) {
    const tag = match[0];

    // A named dark theme class is the root cause — catch it by name so the
    // failure message says what to change, not just "it is dark".
    const darkClass = /astro-code[^"]*\b(\w*dark\w*)\b/i.exec(tag);
    if (darkClass) {
      failures.push({ page: name, why: `dark Shiki theme "${darkClass[1]}" on a <pre>` });
      continue;
    }

    const bg = /background-color:\s*(#[0-9a-f]{3,6})/i.exec(tag);
    if (bg) {
      const luma = luminance(bg[1]);
      if (luma !== null && luma < MIN_LUMINANCE) {
        failures.push({
          page: name,
          why: `<pre> background ${bg[1]} (luminance ${luma.toFixed(2)}) is too dark`,
        });
      }
    }
  }
}

// Assertion 2: the brand override must still be in the shipped stylesheet.
const cssFiles = files.filter((f) => f.endsWith(".css"));
const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");
if (cssFiles.length && !css.includes(REQUIRED_CSS)) {
  failures.push({
    page: "(stylesheet)",
    why: `missing the "${REQUIRED_CSS}" override — dark Shiki colours would win again`,
  });
}

console.log(`contrast gate: ${pages.length} page(s) checked for dark blocks`);

if (failures.length) {
  console.error(`\n✗ ${failures.length} contrast problem(s):`);
  for (const failure of failures) console.error(`   ${failure.page}  ${failure.why}`);
  console.error(
    "\n  Fix: keep `markdown.shikiConfig.theme` light in astro.config.mjs AND the\n" +
      "  `pre.astro-code` rule in the Base.astro stylesheet (Shiki writes its\n" +
      "  background inline, so only !important there can override it).",
  );
  process.exit(1);
}

console.log("✓ no dark code blocks on a light-only site");
