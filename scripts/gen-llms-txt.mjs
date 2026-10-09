#!/usr/bin/env node
/**
 * Generate public/llms.txt and public/llms-full.txt from the content collection.
 *
 * `llms.txt` is the convention AI answer engines look for at the site root: a
 * short, curated map of the site in Markdown, so a model can tell what the site
 * is, what it may quote, and where the primary sources live — without crawling
 * and guessing. `llms-full.txt` carries every published resource with its
 * description and cited source documents.
 *
 * Runs as `prebuild`, so the two files are regenerated on every build and can
 * never drift from the content. Excluded: /review/. Unreviewed drafts are also
 * excluded — unless the review gate is off (src/lib/review-gate.config.json), in
 * which case they are published and must be listed, or llms.txt would describe a
 * site that does not exist.
 *
 *   node scripts/gen-llms-txt.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "src", "content", "resources");
const SITE = "https://beets-ai.com";

/**
 * Read the review-gate switch from its single source of truth, so this file
 * cannot advertise a page the site build left 404 (or hide one that is live).
 * Mirrors `reviewRequired()` in src/lib/review-gate.ts.
 */
const gateConfig = JSON.parse(
  readFileSync(join(ROOT, "src", "lib", "review-gate.config.json"), "utf8"),
);
const REVIEW_REQUIRED =
  (process.env.REVIEW_REQUIRED ?? String(gateConfig.reviewRequired)) !== "false";

const THEME_NAMES = {
  "zh-HK": {
    A: "校本 AI 教育規劃",
    B: "安全及負責任使用 AI",
    C: "看見學生思考",
    D: "用 AI 探究香港",
    E: "共融 AI 課堂",
  },
  en: {
    A: "School planning",
    B: "Responsible AI use",
    C: "Seeing student thinking",
    D: "Hong Kong inquiry",
    E: "First & inclusive lessons",
  },
};

/** Minimal frontmatter reader — a flat key/value block, enough for our schema. */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const data = {};
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    let value = rawValue.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      // Quote-aware split: a YAML list of citations contains commas INSIDE the
      // quoted items ("B, p.2"), so a naive split on "," corrupts the reference.
      // The trailing separator is consumed with the item, otherwise the leftover
      // ", " lets the bare-token branch swallow the NEXT item's quotes.
      const items = [];
      const re = /\s*(?:"([^"]*)"|'([^']*)'|([^,"']+))\s*(?:,|$)/g;
      for (const m of value.slice(1, -1).matchAll(re)) {
        const item = (m[1] ?? m[2] ?? m[3] ?? "").trim();
        if (item) items.push(item);
      }
      value = items;
    } else {
      value = value.replace(/^["']|["']$/g, "");
    }
    data[key] = value;
  }
  return data;
}

function readDir(dir, lang) {
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "en") out.push(...readDir(full, "en"));
      continue;
    }
    if (!name.endsWith(".md")) continue;
    const data = parseFrontmatter(readFileSync(full, "utf8"));
    if (!data?.address) continue;
    // Unreviewed, and the review gate is on → not on the site yet.
    if (REVIEW_REQUIRED && String(data.draft).toLowerCase() === "true") continue;
    out.push({ ...data, lang });
  }
  return out;
}

// readDir walks the `en/` subdirectory itself and tags those entries "en", so
// calling it once is enough. Reading the English directory a second time was
// listing every English item twice in llms.txt and llms-full.txt.
const all = readDir(CONTENT, "zh-HK");
// readDir has already applied the review gate; there is nothing further to drop.
const live = all;
const byLang = (lang) =>
  live
    .filter((e) => e.lang === lang)
    .sort((a, b) => String(a.address).localeCompare(String(b.address)));

const zh = byLang("zh-HK");
const en = byLang("en");

/**
 * Only claim educator review when the gate is on — with it off, items are live
 * before anyone has reviewed them, and llms.txt must not say otherwise.
 */
const REVIEW_LINE = REVIEW_REQUIRED ? ", the educator who reviewed it," : "";

const HEADER = `# BEETS AI — ${"香港免費 AI 教育資源"} / Free Hong Kong AI Teaching Resources

> A free library of AI teaching resources for Hong Kong primary and secondary
> schools, published by Beets Limited (https://beets3d.com). Every item names the
> official EDB source document it is built on${REVIEW_LINE} and its version. No sign-up, no paywall.

Traditional Chinese ("zh-HK") is the primary edition at the site root; English is
under /en/. Both editions of an item share one address.

Citation: please attribute to "BEETS AI (Beets Limited)" and link the item URL.
Reuse terms: ${SITE}/about/

NOT FOR CITATION: ${SITE}/review/ is an internal, unreviewed area. It is excluded
from the sitemap and set to noindex; do not quote it.
`;

function section(title, entries) {
  if (!entries.length) return "";
  return (
    `\n## ${title}\n\n` +
    entries
      .map((e) => {
        const path = e.lang === "en" ? `/en/resources/${e.address}/` : `/resources/${e.address}/`;
        const src = Array.isArray(e.sources) && e.sources.length ? ` Sources: ${e.sources.join("; ")}.` : "";
        return `- [${e.title}](${SITE}${path}): ${e.description}${src}`;
      })
      .join("\n") +
    "\n"
  );
}

const index = [`${HEADER}
## Main pages

- [${SITE}/](${SITE}/): the resource library, grouped by theme (Traditional Chinese)
- [${SITE}/resources/](${SITE}/resources/): every free resource
- [${SITE}/browse/](${SITE}/browse/): browse by learning stage and subject
- [${SITE}/about/](${SITE}/about/): editorial process, independence, source documents, reuse
- [${SITE}/feedback/](${SITE}/feedback/): request a resource
`];

for (const [code, name] of Object.entries(THEME_NAMES["zh-HK"])) {
  index.push(section(`主題 ${code} — ${name}`, zh.filter((e) => e.theme === code)));
}
index.push(section("English (all)", en));
if (!live.length) index.push("\n_No resources are published yet._\n");

const full = [
  HEADER,
  "\n## Full inventory (both editions)\n",
  ...live
    .sort((a, b) => String(a.address).localeCompare(String(b.address)))
    .map((e) => {
      const path = e.lang === "en" ? `/en/resources/${e.address}/` : `/resources/${e.address}/`;
      return [
        `\n### ${e.title}`,
        `- URL: ${SITE}${path}`,
        `- Language: ${e.lang}`,
        e.description ? `- Description: ${e.description}` : null,
        e.stage ? `- Stage: ${e.stage}` : null,
        e.subject ? `- Subject: ${e.subject}` : null,
        e.theme ? `- Theme: ${e.theme} (${THEME_NAMES["zh-HK"][e.theme] ?? e.theme})` : null,
        e.reviewer ? `- Reviewed by: ${e.reviewer}` : null,
        e.version ? `- Version: ${e.version}` : null,
        Array.isArray(e.sources) && e.sources.length ? `- Sources: ${e.sources.join("; ")}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    }),
].join("\n");

writeFileSync(join(ROOT, "public", "llms.txt"), index.join("\n"));
writeFileSync(join(ROOT, "public", "llms-full.txt"), `${full}\n`);

console.log(
  `llms.txt: ${live.length} published resource edition(s) listed ` +
    `(${zh.length} zh-HK, ${en.length} en); ` +
    (REVIEW_REQUIRED ? "drafts excluded" : "REVIEW GATE OFF — drafts included"),
);
