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
 * never drift from the content. Every entry in the collection is listed: there
 * is no review gate and no draft state (Billy, 2026-10-15), so a resource the
 * site builds is a resource llms.txt advertises.
 *
 *   node scripts/gen-llms-txt.mjs
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "src", "content", "resources");
const SITE = "https://beets-ai.com";

/**
 * The three audiences (對象), in the site's own words. Mirrors `AUDIENCE_LABELS`
 * in src/lib/i18n.ts — keep the two in step when either changes.
 */
const AUDIENCE_NAMES = {
  "zh-HK": { teachers: "教師", parents: "家長", students: "學生" },
  en: { teachers: "Teachers", parents: "Parents", students: "Students" },
};

/** One line per audience index page, for the "Main pages" list. */
const AUDIENCE_PAGES = [
  { path: "/by-audience/teachers/", zh: "教師適用的資源", en: "Resources for teachers" },
  { path: "/by-audience/parents/", zh: "家長適用的資源", en: "Resources for parents" },
  { path: "/by-audience/students/", zh: "學生適用的資源", en: "Resources for students" },
];

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

/**
 * The version a model reads has to be the version the page shows. Both come
 * from the publish log (`scripts/gen-revisions.mjs`, which `prebuild` runs
 * first), so llms-full.txt cannot advertise a stale number the page has moved
 * past — Henry, 2026-10-17: 版本號由發佈流程自動寫入.
 */
const REVISIONS_FILE = join(ROOT, "src", "data", "revisions.json");
const REVISIONS = existsSync(REVISIONS_FILE)
  ? (JSON.parse(readFileSync(REVISIONS_FILE, "utf8")).resources ?? {})
  : {};
for (const entry of live) {
  const revision = REVISIONS[entry.address];
  if (revision?.version) entry.version = revision.version;
}

const byLang = (lang) =>
  live
    .filter((e) => e.lang === lang)
    .sort((a, b) => String(a.address).localeCompare(String(b.address)));

const zh = byLang("zh-HK");
const en = byLang("en");

/**
 * Official documents by their PUBLISHED titles — never our internal codes.
 * `- Sources: E, p.6` is our shorthand for the reviewer; a public file that AI
 * engines quote has to name the document (Billy, 2026-10-11).
 */
const SOURCE_TITLES = {
  B: {
    "zh-HK": "《中小學數字教育發展藍圖》",
    en: "Blueprint for Digital Education Development in Primary and Secondary Schools",
  },
  F: {
    "zh-HK": "《中小學人工智能素養學習架構》",
    en: "Supplement I: AI Literacy Learning Framework for Primary and Secondary Schools",
  },
  G: {
    "zh-HK": "《中小學應用人工智能教學指南》",
    en: "Supplement II: Guide to Using AI in Teaching in Primary and Secondary Schools",
  },
  E: {
    "zh-HK": "《中小學人工智能素養學習架構（應用場景示例）》",
    en: "AI Literacy Learning Framework for Primary and Secondary Schools (Examples of Application Scenarios)",
  },
};

/** "E, p.6" -> "《中小學人工智能素養學習架構（應用場景示例）》, p.6" */
function sourceLabel(raw, lang) {
  const match = String(raw).match(/^([A-Z])\s*,\s*(.*)$/);
  const title = match ? SOURCE_TITLES[match[1]]?.[lang] : null;
  return title ? `${title}, ${match[2]}` : String(raw);
}

const HEADER = `# Beets AI — ${"香港免費 AI 教育資源"} / Free Hong Kong AI Teaching Resources

> A free library of AI teaching resources for Hong Kong primary and secondary
> schools, published by Beets Limited (https://beets3d.com). Every item names the
> official EDB source document it is built on and its version. No sign-up, no paywall.

Traditional Chinese ("zh-HK") is the primary edition at the site root; English is
under /en/. Both editions of an item share one address.

Citation: please attribute to "Beets AI (Beets Limited)" and link the item URL.
Reuse terms: ${SITE}/about/
`;

function section(title, entries) {
  if (!entries.length) return "";
  return (
    `\n## ${title}\n\n` +
    entries
      .map((e) => {
        const path = e.lang === "en" ? `/en/resources/${e.address}/` : `/resources/${e.address}/`;
        const src =
          Array.isArray(e.sources) && e.sources.length
            ? ` Sources: ${e.sources.map((s) => sourceLabel(s, e.lang)).join("; ")}.`
            : "";
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
${AUDIENCE_PAGES.map((page) => `- [${SITE}${page.path}](${SITE}${page.path}): ${page.zh} (${page.en})`).join("\n")}
- [${SITE}/about/](${SITE}/about/): what Beets AI is, who it is for, about Beets Limited, reuse terms
- [${SITE}/feedback/](${SITE}/feedback/): request a resource
`];

/**
 * The machine-readable index, for a program rather than a reader (Billy,
 * 2026-10-21). It is generated by `src/pages/resources.json.ts` in the same
 * build, so the two can never disagree about what is published.
 */
index.push(`
## Machine-readable index

- [${SITE}/resources.json](${SITE}/resources.json): every published resource, newest first — both editions' titles and URLs, the hero image, date and version. JSON; schema at ${SITE}/resources.schema.json
`);

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
        Array.isArray(e.audience) && e.audience.length
          ? `- Audience: ${e.audience
              .map((key) => `${key} (${AUDIENCE_NAMES["zh-HK"][key] ?? key})`)
              .join(", ")}`
          : null,
        e.version ? `- Version: ${e.version}` : null,
        Array.isArray(e.sources) && e.sources.length
          ? `- Sources: ${e.sources.map((s) => sourceLabel(s, e.lang)).join("; ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
    }),
].join("\n");

writeFileSync(join(ROOT, "public", "llms.txt"), index.join("\n"));
writeFileSync(join(ROOT, "public", "llms-full.txt"), `${full}\n`);

console.log(
  `llms.txt: ${live.length} published resource edition(s) listed ` +
    `(${zh.length} zh-HK, ${en.length} en)`,
);
