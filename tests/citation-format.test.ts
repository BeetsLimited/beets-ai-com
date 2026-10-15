import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

/**
 * One citation format on every resource page (R3, 2026-10-15).
 *
 * The 官方文件參考 / Official documents block is credible only if a reader can
 * read every reference the same way. It had drifted into four shapes at once:
 * `pp.` on a single page (so "pp.1-8" and "p.1-8" meant the same thing on two
 * pages), `（p.7）` beside `（pp.1-6 至 1-10）` with no rule saying which marker
 * to use, a page range joined with an English "to" inside a Chinese page, and
 * the Blueprint called "leaflet" on one page and "three-fold leaflet" on the
 * others. None of it is visible on the page it is wrong on — a mis-marked
 * single page reads perfectly — which is why this is a test and not a habit.
 *
 * The format, one rule per case:
 *
 *   one page            （p.7）              (p.7)
 *   a run of pages      （pp.1-6 至 1-10）   (pp.1-6 to 1-10)
 *   two named pages     （pp.2-5 及 2-7）    (pp.2-5 and 2-7)
 *   a document cited as a whole (a circular, a framework) carries no page
 *   marker at all — its parenthetical holds the document's own identifier.
 *
 * So: `p.` marks exactly one page, `pp.` marks more than one, the range
 * connector is 至 / to and the list connector is 及 / and, and a document
 * whose form is not plain pagination says so in full (三摺頁 / three-fold
 * leaflet). The internal document shorthand ("B, p.2") belongs to the entry's
 * `sources:`, never to the body.
 */

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT = join(ROOT, "src/content/resources");
type Locale = "zh-HK" | "en";

const START: Record<Locale, RegExp> = {
  "zh-HK": /^##\s+官方文件參考\s*$/,
  en: /^##\s+Official documents\s*$/,
};
const END: Record<Locale, RegExp> = {
  "zh-HK": /^##\s+意見\s*$/,
  en: /^##\s+Feedback\s*$/,
};

function markdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...markdownFiles(full));
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

interface Page {
  id: string;
  locale: Locale;
  body: string;
  block: string;
  bullets: string[];
}

function read(file: string): Page {
  const raw = readFileSync(file, "utf8");
  const locale: Locale = file.includes(`${sep}en${sep}`) ? "en" : "zh-HK";
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const lines = body.split(/\r?\n/);
  const from = lines.findIndex((line) => START[locale].test(line));
  const to = lines.findIndex((line, i) => i > from && END[locale].test(line));
  expect(from, `${file} has no citation block`).toBeGreaterThanOrEqual(0);
  const block = lines.slice(from + 1, to === -1 ? undefined : to).join("\n");
  return {
    id: relative(CONTENT, file),
    locale,
    body,
    block,
    bullets: block.split(/\r?\n/).filter((line) => /^-\s+\S/.test(line)),
  };
}

const pages = markdownFiles(CONTENT).map(read);
const RANGE = ["至", "to"];
const LIST = ["、", "及", "and"];
const PARENTHETICAL = /[（(]([^（）()]*)[）)]/g;
const REFERENCE = /\b(p{1,2})\.(\d[\d-]*)/g;

describe("one citation format", () => {
  it("covers every resource page, in both editions", () => {
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) expect(page.bullets.length, page.id).toBeGreaterThan(0);
  });

  it("marks one page `p.` and more than one `pp.`", () => {
    for (const page of pages) {
      for (const bullet of page.bullets) {
        for (const paren of bullet.matchAll(PARENTHETICAL)) {
          const text = paren[1];
          for (const ref of text.matchAll(REFERENCE)) {
            const marker = ref[1];
            const after = text.slice(ref.index + ref[0].length);
            const joined = after.match(/^\s*([至、及]|to\b|and\b)/)?.[1] ?? null;
            const plural = marker === "pp";
            const label = `${page.id}: ${text}`;
            if (plural) {
              expect(
                joined !== null && [...RANGE, ...LIST].includes(joined),
                `${label} — pp. marks more than one page, so a connector must follow`,
              ).toBe(true);
            } else {
              expect(
                joined === null || !RANGE.includes(joined),
                `${label} — a page range needs pp., not p.`,
              ).toBe(true);
              expect(
                joined === null || !LIST.includes(joined),
                `${label} — a list of pages needs pp., not p.`,
              ).toBe(true);
            }
          }
        }
      }
    }
  });

  it("joins a range with 至 / to, in each edition's own language", () => {
    for (const page of pages) {
      const wanted = page.locale === "zh-HK" ? "至" : "to";
      for (const bullet of page.bullets) {
        for (const paren of bullet.matchAll(PARENTHETICAL)) {
          const text = paren[1];
          for (const ref of text.matchAll(REFERENCE)) {
            if (ref[1] !== "pp") continue;
            const after = text.slice(ref.index + ref[0].length);
            const joined = after.match(/^\s*([至、及]|to\b|and\b)/)?.[1];
            if (joined === undefined) continue;
            if (!["至", "、", "及", "to", "and"].includes(joined)) continue;
            if (joined === "至" || joined === "to") {
              expect(joined, `${page.id}: ${text} — a range reads "${wanted}"`).toBe(wanted);
            }
          }
        }
      }
    }
  });

  it("names a document's form in full — 三摺頁 / three-fold leaflet", () => {
    for (const page of pages) {
      for (const bullet of page.bullets) {
        for (const paren of bullet.matchAll(PARENTHETICAL)) {
          const text = paren[1];
          if (page.locale === "zh-HK" && text.includes("摺頁")) {
            expect(text.includes("三摺頁"), `${page.id}: ${text} — name the form in full`).toBe(
              true,
            );
          }
          if (page.locale === "en" && /\bleaflet\b/.test(text)) {
            expect(
              text.includes("three-fold leaflet"),
              `${page.id}: ${text} — name the form in full`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it("keeps the internal document shorthand out of the body", () => {
    // `B, p.2` is the entry's own `sources:` shorthand; a reader gets titles.
    for (const page of pages) {
      const prose = page.body.replace(page.block, "");
      expect(/\b[BEGF],\s*p/.test(prose), `${page.id} prints an internal document code`).toBe(
        false,
      );
    }
  });
});
