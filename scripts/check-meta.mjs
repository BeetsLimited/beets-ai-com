#!/usr/bin/env node
/**
 * Metadata gate: every published page ships the metadata a search engine needs.
 *
 * WHY THIS EXISTS (Billy, 2026-10-12). The ask was to check that every page is
 * SEO-optimised — "use of H1, H2, H3, presence of meta title and descriptions,
 * all images have alt text defined ... ensure all URL slugs are in english even
 * when the text is in chinese". Auditing the live site by hand answered it, and
 * the answer was invisible to the build: the seven gates that already existed
 * (links, lang, structure, contrast, nav, public-copy, catalogue) check links,
 * language, repeated headings, colour, layout and published copy. NOT ONE of
 * them reads <title>, <meta name="description">, the <h1>, or an image's alt.
 * A page could have shipped with no title at all and every gate would pass.
 * This gate is what stops that recurring.
 *
 * CHECKS, per page:
 *   1. exactly one non-empty <h1>
 *   2. <h2> or <h3> present (a page with a heading structure, not a wall of text)
 *   3. no heading level skipped (h1 -> h3 with no h2 in between)
 *   4. <title> present, non-empty, within the title budget
 *   5. <meta name="description"> present, within the snippet budget
 *   6. every <img> carries alt; an empty alt is allowed ONLY on an image marked
 *      decorative (aria-hidden="true" or role="presentation")
 *   7. the URL path is ASCII — no CJK and no percent-encoding — even though the
 *      page's text is Chinese
 *
 * WIDTH, NOT CHARACTERS — and the brand suffix counts.
 * Limits are in display units, not characters: a CJK or full-width character
 * counts as 2, everything else as 1, approximating the pixels a search engine
 * renders. A <title> gets 60 units and a meta description 155, BRAND SUFFIX
 * INCLUDED — the " — Beets AI" suffix costs 11 of the 60. A page that needs a
 * shorter <title> than its <h1>, or a shorter snippet than its lede, sets
 * `metaTitle` / `metaDescription` in frontmatter (see src/lib/resources.ts).
 * The visible heading and the visible lede are NEVER shortened to satisfy this
 * gate: they are written for a reader, and a reader is not a search result.
 *
 * DELIBERATELY NOT CHECKED:
 *   - duplicate <title> across pages. It is worth having, but `check:structure`
 *     owns cross-page duplication concerns and bolting it on here would make a
 *     failure ambiguous between two gates.
 *   - <title> containing the brand. The suffix is added by the route; asserting
 *     it here would fight the fallbacks on the pages that legitimately omit it.
 *
 * SKIPPED: dist/files/** (printable downloads, not pages), dist/review/** (the
 * internal review area — deliberately bilingual and noindex) and _astro/**.
 *
 * Run after `astro build` (reads dist/). Exit code 1 on any failure.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

/** Directories that are not published pages. */
const SKIP_DIRS = new Set(["files", "review", "_astro"]);

/** Search-result display budgets, in display units. See the header. */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

/**
 * East Asian wide/full-width ranges, counted as 2. Mirrors the width model
 * `scripts/check-language.mjs` uses to reason about CJK.
 */
const WIDE =
  /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/;

const width = (text) => [...text].reduce((n, ch) => n + (WIDE.test(ch) ? 2 : 1), 0);

/**
 * Attributes of a single tag, honouring the quote character.
 *
 * A regex like `content="(.*?)"` paired with a `['"]` delimiter silently stops
 * at the first apostrophe inside the value — an English meta description such
 * as "…the part of a classmate's answer…" was measured as 110 characters
 * instead of 273, and an audit built on that regex under-counted its findings
 * by half. Match a double-quoted value to the next DOUBLE quote, or a
 * single-quoted value to the next single quote, and never mix the two.
 */
function attributes(tag) {
  const out = Object.create(null);
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match;
  while ((match = re.exec(tag))) {
    out[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return out;
}

/** The five entities Astro emits, enough to measure text, not to render it. */
const decode = (text) =>
  text
    .replace(/&(?:amp|#38|#x26);/g, "&")
    .replace(/&(?:lt|#60);/g, "<")
    .replace(/&(?:gt|#62);/g, ">")
    .replace(/&(?:quot|#34|#x22);/g, '"')
    .replace(/&(?:apos|#39|#x27);/g, "'")
    .replace(/&nbsp;/g, " ");

const textOf = (html) =>
  decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function pages(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      out.push(...pages(full));
    } else if (entry.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

/** The page's URL path, for the English-slug rule. */
const urlPathOf = (file) => {
  const rel = relative(DIST, file).split("\\").join("/");
  const dir = rel.replace(/index\.html$/, "");
  return `/${dir}`;
};

try {
  statSync(DIST);
} catch {
  console.error("✗ dist/ not found — run `npm run build` first.");
  process.exit(1);
}

const files = pages(DIST);
const failures = [];
const fail = (file, why) => failures.push({ page: urlPathOf(file), why });

for (const file of files) {
  const html = readFileSync(file, "utf8");

  // ── 1. the h1 ──────────────────────────────────────────────────────────
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((m) => textOf(m[1]))
    .filter((t) => t.length > 0);
  if (h1s.length !== 1) {
    fail(file, `has ${h1s.length} non-empty <h1> (want exactly 1)`);
  }

  // ── 2 + 3. the heading structure ───────────────────────────────────────
  const levels = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((m) => Number(m[1]));
  const subs = levels.filter((l) => l === 2 || l === 3).length;
  if (subs === 0) fail(file, "has no <h2> or <h3>");
  for (let i = 1; i < levels.length; i += 1) {
    if (levels[i] > levels[i - 1] + 1) {
      fail(file, `skips a heading level (h${levels[i - 1]} -> h${levels[i]})`);
      break;
    }
  }

  // ── 4. the title ───────────────────────────────────────────────────────
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? textOf(titleMatch[1]) : "";
  if (!title) {
    fail(file, "has no <title>");
  } else if (width(title) > TITLE_MAX) {
    fail(file, `<title> is ${width(title)} units (max ${TITLE_MAX}): "${title}"`);
  }

  // ── 5. the meta description ────────────────────────────────────────────
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attributes(m[0]));
  const description = metaTags.find((a) => (a.name ?? "").toLowerCase() === "description")?.content ?? "";
  if (!description.trim()) {
    fail(file, 'has no <meta name="description">');
  } else if (width(description) > DESCRIPTION_MAX) {
    fail(file, `meta description is ${width(description)} units (max ${DESCRIPTION_MAX})`);
  }

  // ── 6. image alt text ──────────────────────────────────────────────────
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const a = attributes(tag);
    const src = a.src ?? "(no src)";
    if (a.alt === undefined) {
      fail(file, `<img> has no alt attribute: ${src}`);
    } else if (a.alt.trim() === "" && a["aria-hidden"] !== "true" && a.role !== "presentation") {
      fail(file, `<img> has an empty alt without being marked decorative: ${src}`);
    }
  }

  // ── 7. an English URL, even on a Chinese page ──────────────────────────
  const path = urlPathOf(file);
  const decodedPath = decodeURIComponent(path);
  if ([...decodedPath].some((ch) => WIDE.test(ch))) {
    fail(file, `URL path is not ASCII English: ${path}`);
  }
  if (path.includes("%")) {
    fail(file, `URL path is percent-encoded: ${path}`);
  }
}

console.log(
  `meta gate: ${files.length} page(s) checked — h1, heading order, <title>, ` +
    `description, img alt, ASCII slugs`,
);

const byPage = new Map();
for (const f of failures) byPage.set(f.page, [...(byPage.get(f.page) ?? []), f.why]);

if (byPage.size) {
  console.error(`\n✗ ${byPage.size} page(s) with metadata problems:`);
  for (const [page, whys] of byPage) {
    console.error(`   ${page}`);
    for (const why of whys) console.error(`      ${why}`);
  }
  process.exit(1);
}

console.log(
  `✓ every page has one h1, a heading structure, a title <= ${TITLE_MAX} units, ` +
    `a description <= ${DESCRIPTION_MAX} units, alt text on every image, and an ASCII URL`,
);
