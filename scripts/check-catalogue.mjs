#!/usr/bin/env node
/**
 * Catalogue gate: every published resource is still IN THE HTML of the catalogue.
 *
 * The resource index filters and pages with a small script. The temptation for
 * the next person to touch it is to fetch the resources in the browser — which
 * looks tidier, works in a demo, and silently empties the page for a crawler, for
 * a reader whose script failed, and for anything reading the HTML. That defect is
 * invisible in review: the page renders perfectly in a browser and the sitemap is
 * unchanged.
 *
 * So: the catalogue page must list exactly the resources the site actually
 * PUBLISHES — the control is the set of resource pages that were built, one
 * directory per resource — in both languages, and the header's own count of
 * published resources must match the number of cards on the page.
 *
 * (The control used to be /browse/, a hand-maintained second listing. That page
 * was removed on 2026-10-10 once the catalogue's tags replaced it; comparing
 * against the built pages is both stronger and immune to that kind of removal.).
 *
 * Run after `astro build` (reads dist/). Exit code 1 on any mismatch.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");
const ZH_INDEX = `${DIST}/resources/index.html`;
const EN_INDEX = `${DIST}/en/resources/index.html`;

const read = (path) => {
  try {
    return readFileSync(path, "utf8");
  } catch {
    console.error(`✗ ${path.replace(`${DIST}/`, "dist/")} not found — run \`npm run build\` first.`);
    process.exit(1);
  }
};

/** The addresses a page links to, as a sorted list of stable addresses. */
const addressesOf = (html, prefix) =>
  [
    ...new Set(
      [...html.matchAll(new RegExp(`href="${prefix}([a-z0-9-]+)/"`, "g"))].map((m) => m[1]),
    ),
  ].sort();

/** The resource addresses that were actually BUILT, i.e. what is published. */
const builtAddresses = (dir) =>
  readdirSync(dir)
    .filter((name) => statSync(`${dir}/${name}`).isDirectory())
    .sort();

const problems = [];
const note = (message) => problems.push(message);

const zh = read(ZH_INDEX);
const en = read(EN_INDEX);
const zhBuilt = builtAddresses(`${DIST}/resources`);
const enBuilt = builtAddresses(`${DIST}/en/resources`);

// 1. The template actually rendered.
for (const [label, html] of [["zh", zh], ["en", en]]) {
  if (!html.includes("data-catalogue")) note(`${label}: no catalogue container on the page`);
  if (!html.includes("data-filters")) note(`${label}: no search-criteria form on the page`);
  if (!html.includes("data-haystack")) note(`${label}: cards carry no searchable text`);
}

const zhCards = addressesOf(zh, "/resources/");
const enCards = addressesOf(en, "/en/resources/");

// 2. The catalogue lists exactly what the site publishes.
if (zhCards.length === 0) {
  note("zh: the catalogue lists no resources at all — were they moved behind a fetch?");
}
for (const address of zhBuilt) {
  if (!zhCards.includes(address)) note(`zh: ${address} is published but the catalogue does not list it`);
}
for (const address of zhCards) {
  if (!zhBuilt.includes(address)) note(`zh: the catalogue lists ${address}, which was not built`);
}
for (const address of enBuilt) {
  if (!enCards.includes(address)) note(`en: ${address} is published but the catalogue does not list it`);
}

// 3. Both editions list the same resources (they are paired by address).
if (enCards.join() !== zhCards.join()) {
  const onlyZh = zhCards.filter((a) => !enCards.includes(a));
  const onlyEn = enCards.filter((a) => !zhCards.includes(a));
  note(`editions disagree — zh only: [${onlyZh.join(", ")}], en only: [${onlyEn.join(", ")}]`);
}

// 4. The status strip's own count agrees with the catalogue.
const strip = zh.match(/<strong>(\d+)<\/strong>/);
if (!strip) {
  note("zh: could not read the published-resource count from the status strip");
} else if (Number(strip[1]) !== zhCards.length) {
  note(
    `zh: the status strip says ${strip[1]} published resources but the catalogue renders ` +
      `${zhCards.length} cards`,
  );
}

if (problems.length > 0) {
  console.error("✗ catalogue gate failed:");
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exit(1);
}

console.log(
  `catalogue gate: ${zhCards.length} resources in the HTML of the index (both editions), ` +
    `matching the ${zhBuilt.length} built resource pages and the status strip`,
);
