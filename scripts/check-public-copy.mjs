#!/usr/bin/env node
/**
 * Public-copy gate: nothing internal on a page a customer can read.
 *
 * Billy, 2026-10-11: *"remove all content about internal process and information
 * and do not use any internal reference codes like B, F, G, E for the reference
 * document. In future, NEVER put any internal processing notes or information in
 * customer facing website."*
 *
 * The about page had all of it — an editorial pipeline, a build/link-check note,
 * a "review gate is off" notice and a table decoding the B/F/G/E document codes.
 * Two more leaks were found while sweeping for the same class of thing:
 *
 *   · every resource page's JSON-LD said `"author": "BeetsBot"` — our drafting
 *     persona, published as the author of the material, in the structured data
 *     that search and AI answer engines read;
 *   · `llms-full.txt` carried `Sources: E, p.6` and `Reviewed by: <a person>`,
 *     from our internal record;
 *   · every resource page and /feedback/ told readers to write to
 *     `enquiry@beets-ai.com` — a domain we run no mailbox on.
 *
 * So this gate reads the BUILT site — what is actually published, not what the
 * source says it publishes — and fails if any of that reappears. It reads
 * `dist/` (run after `astro build`).
 *
 * ── What it deliberately does NOT cover ──────────────────────────────────────
 * Nothing is skipped but the asset directory. `dist/review/**` used to be
 * exempt — it WAS the internal record — and that area no longer exists: the
 * review gate was removed permanently on 2026-10-15 (Billy), so there is no
 * internal page to exempt and no publish state left to explain.
 *
 * The theme cards still print an A–E letter in their `.badge` — the internal
 * lettering of our content plan. That is a VISUAL design element Billy approved
 * on screen, so it is left alone here; removing it is his call, not a silent
 * cleanup. (The theme's own name is never replaced by the letter.)
 *
 * Exit code 1 on any hit.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

/** Directories that are not published pages. */
const SKIP_DIRS = new Set(["_astro"]);
/** Public machine-readable files that are still customer-facing. */
const EXTRA_FILES = ["llms.txt", "llms-full.txt"];

const FORBIDDEN = [
  {
    pattern: /\b[BEFG]\s*,\s*p\.\s*\d/,
    why: "an internal EDB document code (B/F/G/E + page) — name the document by its title",
  },
  {
    pattern: /\bsourceIdea\b|\bfactChecked(?:By|On)?\b/,
    why: "an internal frontmatter field",
  },
  { pattern: /\[\[VERIFY\]\]/, why: "an unresolved [[VERIFY]] marker meant for a reviewer" },
  { pattern: /\bBeetsBot\b/, why: "the internal authoring persona" },
  { pattern: /\/review\//, why: "the internal review area's URL — that area was removed on 2026-10-15" },
  {
    pattern: /\bbeets-ai-build\b|\bbeets-ai-brief\b/,
    why: "an internal build profile or brief file",
  },
  {
    pattern: /編輯流程|審閱關卡|每次建置|自動檢查連結|尚待教育工作者審閱|審閱記錄|工作流程/,
    why: "internal process or review status, in Chinese",
  },
  {
    pattern: /editorial process|review gate|link-checked|every build|review record|fact-checked|has not yet been \w+-reviewed/i,
    why: "internal process or review status, in English",
  },
  {
    pattern: /"keywords":"[A-E],/,
    why: "a bare A–E theme key in structured data — publish the theme's name instead",
  },
  {
    /*
     * `enquiry@beets-ai.com` was on all 28 resource pages and on /feedback/ — an
     * address at a domain we do not run a mailbox on (Billy, 2026-10-11). The
     * public address lives at beets3d.com, and a dead address on a teaching
     * resource is a reader who never gets a reply.
     */
    pattern: /[A-Za-z0-9._%+-]+@beets-ai\.com/,
    why: "an email address at a domain with no mailbox — the public address is at beets3d.com",
  },
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, out);
    } else if (name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

let pages;
try {
  pages = walk(DIST);
} catch {
  console.error("✗ dist/ not found — run `npm run build` first.");
  process.exit(1);
}
for (const extra of EXTRA_FILES) {
  try {
    statSync(join(DIST, extra));
    pages.push(join(DIST, extra));
  } catch {
    // A site with no llms.txt is not this gate's business.
  }
}

const failures = [];
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const where = relative(DIST, page).split("\\").join("/");
  for (const { pattern, why } of FORBIDDEN) {
    for (const match of html.matchAll(new RegExp(pattern, pattern.flags.includes("g") ? "g" : "g"))) {
      failures.push({ where, why, found: match[0].slice(0, 60) });
      break; // one example per file per rule is enough to act on
    }
  }
}

console.log(`public-copy gate: ${pages.length} public file(s) checked for internal material`);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} internal-material leak(s) on a customer-facing surface:`);
  for (const failure of failures) {
    console.error(`   ${failure.where}\n     ${failure.why}\n     found: ${failure.found}`);
  }
  process.exit(1);
}

console.log("✓ no internal codes, fields, personas or process notes in the published site");
