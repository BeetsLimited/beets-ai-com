#!/usr/bin/env node
/**
 * Single-language gate — runs against the BUILT site (`dist/`), after `npm run build`.
 *
 * beets-ai.com shows exactly one language at a time. This gate is what makes that
 * a fact rather than a promise, and it is deliberately derived from the build
 * itself rather than from a hand-kept list of strings, so it cannot drift:
 *
 *   1. No English page contains a CJK or full-width character.
 *   2. Every page has a counterpart in the other language (no one-language page).
 *   3. No English sentence from an English page also appears on its Traditional
 *      Chinese counterpart — the exact failure mode being fixed: the same page
 *      printing both languages at once.
 *
 * Excluded (by design, not by accident):
 *   files/   — printable worksheets, Traditional Chinese only
 *   review/  — the internal hub, which is bilingual on purpose and noindex
 *
 * Exit code 1 if any check fails.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

/** CJK ideographs, kana, CJK symbols/punctuation and full-width forms. */
const CJK = /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;

/** Directories that are intentionally not part of the per-language site. */
const SKIP = new Set(["files", "review"]);

/** Text that is legitimately identical on both editions (brand/legal, not prose). */
const SHARED = new Set(["© Beets Limited · beets3d.com"]);

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

function textOf(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/i, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Whole passages a reader would notice if they appeared in the other edition.
 * Long, prose-like English only: proper nouns, URLs, brand names and short
 * labels are shared by both editions and are not leakage.
 */
function englishSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(
      (sentence) =>
        sentence.length >= 40 &&
        (sentence.match(/[A-Za-z][A-Za-z'-]*/g) ?? []).length >= 6 &&
        !CJK.test(sentence) &&
        !/https?:\/\/|www\./.test(sentence) &&
        !SHARED.has(sentence),
    );
}

/**
 * The language selector shows each language in its own script — "中文" appears on
 * the English page by design, as the label of the link to the Chinese edition.
 * It is a control, not content, so it is removed before checking the page text.
 */
function withoutLanguageSwitch(html) {
  return html.replace(/<div class="lang"[\s\S]*?<\/div>/i, " ");
}

const pages = walk(DIST)
  .map((file) => {
    const rel = relative(DIST, file).split("\\").join("/");
    return {
      file,
      rel,
      html: readFileSync(file, "utf8"),
      locale: rel === "en" || rel.startsWith("en/") ? "en" : "zh-HK",
    };
  })
  .filter((page) => !SKIP.has(page.rel.split("/")[0]));

const byRel = new Map(pages.map((page) => [page.rel, page]));
const counterpartOf = (rel) => (rel.startsWith("en/") ? rel.slice(3) : `en/${rel}`);

const failures = [];
const chineseLeaks = [];

for (const page of pages) {
  const counterpart = byRel.get(counterpartOf(page.rel));

  // 1. An English page carries no Chinese at all (the language selector, which
  //    names each language in its own script, does not count).
  if (page.locale === "en") {
    const checked = withoutLanguageSwitch(page.html);
    const match = checked.match(CJK);
    if (match) {
      const index = checked.indexOf(match[0]);
      failures.push({
        page: page.rel,
        why: `English page contains "${match[0]}" (near: …${checked.slice(Math.max(0, index - 40), index + 40)}…)`,
      });
    }
  } else {
    // …and a Traditional Chinese page is actually written in Chinese.
    const chinese = page.html.match(/[\u4e00-\u9fff]/g) ?? [];
    if (chinese.length < 20) {
      failures.push({
        page: page.rel,
        why: `Traditional Chinese page has only ${chinese.length} Chinese character(s)`,
      });
    }
  }

  // 2. Every page is paired with its other-language edition.
  if (!counterpart) {
    failures.push({ page: page.rel, why: `no ${counterpartOf(page.rel)} counterpart` });
    continue;
  }

  // 3. English prose stays off the Traditional Chinese page.
  if (page.locale === "en") {
    const zhText = textOf(counterpart.html);
    for (const sentence of englishSentences(textOf(page.html))) {
      if (zhText.includes(sentence)) {
        chineseLeaks.push({ page: counterpart.rel, from: page.rel, sentence });
      }
    }
  }
}

console.log(
  `language gate: ${pages.length} page(s) checked ` +
    `(${pages.filter((p) => p.locale === "en").length} English, ` +
    `${pages.filter((p) => p.locale === "zh-HK").length} Traditional Chinese)`,
);

if (failures.length) {
  console.error(`\n✗ ${failures.length} language problem(s):`);
  for (const failure of failures) console.error(`   ${failure.page}  ${failure.why}`);
}

if (chineseLeaks.length) {
  console.error(`\n✗ ${chineseLeaks.length} English passage(s) also shown on a Chinese page:`);
  for (const leak of chineseLeaks) {
    console.error(`   ${leak.page}  shows what ${leak.from} says: "${leak.sentence}"`);
  }
}

if (failures.length || chineseLeaks.length) process.exit(1);
console.log("✓ one language per page");
