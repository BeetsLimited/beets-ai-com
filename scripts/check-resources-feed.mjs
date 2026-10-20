#!/usr/bin/env node
/**
 * Feed gate: the built /resources.json tells the truth about what is published.
 *
 * WHY THIS EXISTS (Billy, 2026-10-21). The resource feed is written for programs
 * — external agents, MCP servers, other sites' scripts — so its defects are
 * invisible to every gate that exists. A page can be built and listed, and the
 * feed can still advertise the wrong URL, the wrong hero, a stale version, or
 * omit a resource entirely, and nothing else in CI would notice: `check:links`
 * reads HTML, `check:catalogue` reads the catalogue pages, `check:meta` reads
 * <title>/<h1>/alt. This gate reads the file a machine actually consumes.
 *
 * CHECKS
 *   1. dist/resources.json exists, parses, and declares its schema and origin
 *   2. count === resources.length === the number of Chinese resource sources
 *      (one per resource — the Chinese edition is the spine)
 *   3. sorted by published descending, ties broken by id, ids unique and
 *      slug-shaped
 *   4. every item has both editions, each with a title, the canonical URL for
 *      that address, and a hero image that exists in dist/
 *   5. every listed page was actually built (dist/<url>/index.html)
 *   6. version and both dates agree with the publish log
 *      (src/data/revisions.json) — the feed must never advertise a version the
 *      page has moved past
 *   7. no internal material: no idea numbers (#41), no document codes (B, p.6)
 *
 * Resources only. Posts share one content collection; if a post ever appears in
 * the feed, check 2 fails on the count.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const FEED = join(DIST, "resources.json");
const SITE = "https://beets-ai.com";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const problems = [];
const note = (message) => problems.push(message);

if (!existsSync(FEED)) {
  console.error("✗ feed gate failed: dist/resources.json was not built");
  console.error("  Is `src/pages/resources.json.ts` still present, and did the build run?");
  process.exit(1);
}
if (!existsSync(join(DIST, "resources.schema.json"))) {
  note("dist/resources.schema.json is missing — the feed names a schema a consumer cannot fetch");
}

let feed;
try {
  feed = JSON.parse(readFileSync(FEED, "utf8"));
} catch (error) {
  console.error(`✗ feed gate failed: dist/resources.json is not valid JSON — ${error.message}`);
  process.exit(1);
}

if (feed.site !== SITE) note(`site is ${JSON.stringify(feed.site)}, expected ${SITE}`);
if (feed.$schema !== `${SITE}/resources.schema.json`) {
  note(`$schema is ${JSON.stringify(feed.$schema)}, expected ${SITE}/resources.schema.json`);
}
if (typeof feed.generated !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+08:00$/.test(feed.generated)) {
  note(`generated is ${JSON.stringify(feed.generated)} — expected HKT, e.g. 2026-10-21T09:00:00+08:00`);
}
if (!/^https?:\/\//.test(String(feed.$schema))) note("$schema is not an absolute URL");

const resources = Array.isArray(feed.resources) ? feed.resources : [];
if (!Array.isArray(feed.resources)) note("resources is not an array");

// 2. The count is what a consumer trusts to know it read the whole file.
const sources = readdirSync(join(ROOT, "src/content/resources")).filter(
  (name) => name.endsWith(".md"),
);
if (feed.count !== resources.length) {
  note(`count says ${JSON.stringify(feed.count)} but resources has ${resources.length} entries`);
}
if (resources.length !== sources.length) {
  note(
    `${resources.length} resources listed but ${sources.length} Chinese resource sources exist ` +
      `— the feed is missing some, or is listing something that is not a resource`,
  );
}

// 3. Order and identity.
let previous = null;
const seen = new Set();
const revisions = JSON.parse(readFileSync(join(ROOT, "src/data/revisions.json"), "utf8")).resources ?? {};

for (const [index, item] of resources.entries()) {
  const label = item?.id ?? `#${index}`;
  if (typeof item?.id !== "string" || !SLUG.test(item.id)) {
    note(`${label}: id is not a lowercase hyphenated address`);
  }
  if (seen.has(item?.id)) note(`${label}: listed more than once`);
  seen.add(item?.id);

  // 4. Editions, URLs, hero.
  for (const [key, prefix] of [
    ["zh", "/resources"],
    ["en", "/en/resources"],
  ]) {
    const edition = item?.[key];
    if (!edition) {
      note(`${label}: no ${key} edition — every resource must carry both`);
      continue;
    }
    if (typeof edition.title !== "string" || !edition.title.trim()) {
      note(`${label}: ${key}.title is empty`);
    }
    const expected = `${SITE}${prefix}/${item.id}/`;
    if (edition.url !== expected) {
      note(`${label}: ${key}.url is ${JSON.stringify(edition.url)}, expected ${expected}`);
    }
    if (!edition.image) {
      note(`${label}: ${key}.image is empty — a consumer has no hero to show`);
    } else if (!edition.image.startsWith(`${SITE}/`)) {
      note(`${label}: ${key}.image is not absolute on ${SITE} — ${edition.image}`);
    } else if (!existsSync(join(DIST, edition.image.slice(SITE.length + 1)))) {
      note(`${label}: ${key}.image is not in the built site — ${edition.image}`);
    }
  }

  // 5. The listed page must have been built.
  for (const prefix of ["/resources", "/en/resources"]) {
    const path = join(DIST, `${prefix}/${item.id}/index.html`);
    if (!existsSync(path)) note(`${label}: ${prefix}/${item.id}/ was not built`);
  }

  // 6. Version and dates are the publish log's, not frontmatter's.
  const revision = revisions[item.id];
  if (revision) {
    if (item.version !== revision.version) {
      note(`${label}: version ${item.version} but the publish log says ${revision.version}`);
    }
    if (item.published !== revision.published) {
      note(`${label}: published ${item.published} but the publish log says ${revision.published}`);
    }
    if (item.updated !== revision.modified) {
      note(`${label}: updated ${item.updated} but the publish log says ${revision.modified}`);
    }
  } else {
    note(`${label}: no publish-log record, so its version and dates came from frontmatter`);
  }
  for (const field of ["published", "updated"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(item[field]))) {
      note(`${label}: ${field} is ${JSON.stringify(item[field])}, expected YYYY-MM-DD`);
    }
  }
  if (!/^\d+\.\d+$/.test(String(item.version))) {
    note(`${label}: version is ${JSON.stringify(item.version)}, expected e.g. 1.1`);
  }
  if (!/^[A-E]$/.test(String(item.theme))) note(`${label}: theme is ${JSON.stringify(item.theme)}`);
  if (!Array.isArray(item.audience) || item.audience.length === 0) {
    note(`${label}: audience is empty`);
  } else {
    for (const audience of item.audience) {
      if (!["teachers", "parents", "students"].includes(audience)) {
        note(`${label}: audience ${JSON.stringify(audience)} is not one of teachers/parents/students`);
      }
    }
  }

  // 3 (cont). Newest first, ties broken by address.
  const key = `${String(item.published)} ${String(item.id)}`;
  if (previous !== null && !(item.published < previous.published || (item.published === previous.published && item.id > previous.id))) {
    note(`${label}: out of order — sorted newest first, then by id (saw ${key} after ${previous.key})`);
  }
  previous = { published: item.published, id: item.id, key };
}

// 7. Internal material must never reach a machine-readable public surface.
const text = JSON.stringify(feed);
const idea = text.match(/"\s*#[0-9]{1,3}\s*"/);
if (idea) note(`an idea number (${idea[0]}) is in the feed — internal record, never public`);
const documentCode = text.match(/\b[BEFG],\s*p/);
if (documentCode) note(`a document code (${documentCode[0]}) is in the feed — cite the published title`);

if (problems.length > 0) {
  console.error("✗ feed gate failed:");
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exit(1);
}

const newest = resources[0];
console.log(
  `feed gate: ${resources.length} resources in dist/resources.json, newest first, ` +
    `both editions and heroes present` +
    (newest ? ` (newest: ${newest.id}, published ${newest.published})` : ""),
);
