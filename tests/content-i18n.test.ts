import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";

/**
 * Content-side language gate.
 *
 * Every page carries a language switcher, so every entry MUST have a
 * counterpart in the other language — otherwise the switch lands on a 404.
 * And an English page must not contain Chinese text: the whole point of the
 * change is that a reader sees one language at a time.
 *
 * The printables are checked here too, because the post-build language gate
 * treats `files/` as out of scope — and an English worksheet is exactly where a
 * Chinese sentence would otherwise slip through unnoticed.
 */

const CONTENT = resolve(import.meta.dirname, "../src/content/resources");
const FILES = resolve(import.meta.dirname, "../public/files");
const EN_FILES = resolve(FILES, "en");
/** Attachments are Office documents; the HTML printables are gone (2026-10-10). */
const OFFICE = /\.(docx|xlsx|pptx)$/;
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
/** Stricter: printables must carry no full-width forms or CJK punctuation either. */
const WIDE_CJK = /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;

/** Descriptive stand-ins used before the official EDB titles were verified. */
const PLACEHOLDER_TITLES = [
  "the EDB AI literacy learning framework",
  "the EDB guidelines on using AI in teaching",
  "the EDB examples of AI in education",
  "the EDB examples of AI applications in education",
  "the Digital Education Blueprint leaflet",
];

function markdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...markdownFiles(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

function frontmatter(md: string): Record<string, string> {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error("no frontmatter");
  const out: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return out;
}

function body(md: string): string {
  const match = md.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return match ? match[1] : "";
}

const entries = markdownFiles(CONTENT).map((path) => {
  const md = readFileSync(path, "utf8");
  return {
    path,
    id: relative(CONTENT, path).replace(/\.md$/, ""),
    fm: frontmatter(md),
    body: body(md),
    raw: md,
  };
});

type Entry = (typeof entries)[number];

const zhEntries = entries.filter((entry) => entry.fm.lang === "zh-HK");
const enEntries = entries.filter((entry) => entry.fm.lang === "en");

function counterpartOf(entry: Entry): Entry | undefined {
  const pool = entry.fm.lang === "en" ? zhEntries : enEntries;
  return pool.find((other) => other.fm.address === entry.fm.address);
}

describe("content language coverage", () => {
  it("has content at all", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("declares a supported language on every entry", () => {
    for (const entry of entries) {
      expect(["zh-HK", "en"], entry.id).toContain(entry.fm.lang);
    }
  });

  it("never uses a `slug` field — the content loader reserves it and drops colliding entries", () => {
    for (const entry of entries) {
      expect(entry.fm.slug, `${entry.id} must use \`address\`, not \`slug\``).toBeUndefined();
    }
  });

  it("pairs every Traditional Chinese entry with an English one (and vice versa)", () => {
    const missingEn = zhEntries.filter((entry) => !counterpartOf(entry)).map((entry) => entry.id);
    const missingZh = enEntries.filter((entry) => !counterpartOf(entry)).map((entry) => entry.id);
    expect(missingEn, "zh entries with no English counterpart").toEqual([]);
    expect(missingZh, "en entries with no Traditional Chinese counterpart").toEqual([]);
  });

  it("uses the same address in both languages", () => {
    for (const entry of entries) {
      const other = counterpartOf(entry);
      expect(other, entry.id).toBeDefined();
      expect(other!.fm.theme).toBe(entry.fm.theme);
      expect(other!.fm.type).toBe(entry.fm.type);
      expect(other!.fm.sources).toEqual(entry.fm.sources);
    }
  });

  it("documents the English title on the Traditional Chinese entry", () => {
    for (const entry of enEntries) {
      const zh = counterpartOf(entry);
      expect(zh!.fm.title_en, entry.id).toBe(entry.fm.title);
    }
  });

  it("gives each edition its own language's printable", () => {
    // The Chinese page offers the Chinese file, the English page the English
    // one — same filenames, different folder. Anything else would either show a
    // Chinese worksheet behind an English label, or 404.
    for (const zh of zhEntries) {
      const en = counterpartOf(zh)!;
      expect(en.fm.downloads, zh.id).toBe(zh.fm.downloads.replace(/\/files\//g, "/files/en/"));
    }
  });
});

describe("English content is English", () => {
  it("keeps Chinese characters out of English entries", () => {
    for (const entry of enEntries) {
      expect(CJK.test(entry.fm.title), `${entry.id} title`).toBe(false);
      expect(CJK.test(entry.fm.description), `${entry.id} description`).toBe(false);
      expect(CJK.test(entry.body), `${entry.id} body`).toBe(false);
    }
  });

  it("names EDB documents by their official English titles", () => {
    // The titles were verified on EDB's own publications page. Descriptive
    // placeholders were the interim state while that was being checked; they
    // must not come back, because an invented title reads as authoritative.
    for (const entry of enEntries) {
      for (const phrase of PLACEHOLDER_TITLES) {
        expect(entry.raw.includes(phrase), `${entry.id} still says "${phrase}"`).toBe(false);
      }
    }
  });

  it("keeps English glosses out of Traditional Chinese headings", () => {
    for (const entry of zhEntries) {
      const headings = body(entry.raw)
        .split(/\r?\n/)
        .filter((line) => /^#{1,6}\s/.test(line));
      for (const heading of headings) {
        expect(heading.replace(/^#{1,6}\s*/, "").trim(), `${entry.id}: ${heading}`).not.toMatch(
          /[A-Za-z]{2,}\s+[A-Za-z]{2,}/,
        );
      }
    }
  });
});

describe("published content", () => {
  /**
   * Content-level contract: an entry that declares itself published must carry
   * its attestations. Note this keys on the frontmatter, not on what the site
   * publishes — while the review gate is off (`src/lib/review-gate.ts`) the
   * build also publishes drafts, and those deliberately have no reviewer.
   */
  const published = entries.filter((entry) => entry.fm.draft === "false");

  it("has at least one published resource once publishing has started", () => {
    // Guards the filter itself: if `draft:` were written in a form this parser
    // does not read, this would silently check nothing.
    expect(published.length).toBeGreaterThan(0);
  });

  it("carries no draft warning in its body", () => {
    // The warning is rendered by ResourceView from the `draft` flag. A warning
    // written into the body stays there after publication — which is how five
    // live pages came to announce themselves as unpublished drafts.
    for (const entry of published) {
      expect(/待教育工作者審閱|awaiting educator review|DRAFT, NOT REVIEWED/.test(entry.body), entry.id).toBe(
        false,
      );
    }
  });

  it("records who reviewed and fact-checked it", () => {
    for (const entry of published) {
      expect(entry.fm.reviewer, `${entry.id} needs a named reviewer`).toBeTruthy();
      expect(entry.fm.factChecked, `${entry.id} needs factChecked: true`).toBe("true");
      expect(entry.fm.factCheckedBy, `${entry.id} needs factCheckedBy`).toBeTruthy();
    }
  });
});

describe("English attachments", () => {
  /*
   * Attachments are editable Office documents now, not print-optimised web
   * pages (Billy, 2026-10-10). Every check the printables had still matters, so
   * they are kept — the text just has to be read out of the OOXML container
   * first. An English worksheet remains exactly where a Chinese sentence would
   * otherwise slip through unnoticed, and the post-build language gate treats
   * `files/` as out of scope.
   */
  const names = (dir: string) =>
    existsSync(dir) ? readdirSync(dir).filter((name) => OFFICE.test(name)).sort() : [];
  const files = names(EN_FILES);
  const chinese = names(FILES);

  /** An .docx/.xlsx is a zip; unzip its XML parts and strip the tags. */
  const textOf = (dir: string, name: string): string =>
    execFileSync("unzip", ["-p", join(dir, name), "*.xml"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    }).replace(/<[^>]+>/g, " ");

  it("has one for every resource, in both languages", () => {
    expect(files.length).toBeGreaterThan(0);
    expect(chinese.length).toBe(files.length);
    for (const name of files) expect(chinese, `${name} has no Chinese edition`).toContain(name);
  });

  it("leaves no HTML printable behind", () => {
    for (const dir of [FILES, EN_FILES]) {
      if (!existsSync(dir)) continue;
      expect(readdirSync(dir).filter((name) => name.endsWith(".html")), dir).toEqual([]);
    }
  });

  it("contains no Chinese or full-width characters", () => {
    for (const name of files) {
      const match = textOf(EN_FILES, name).match(WIDE_CJK);
      expect(match?.[0] ?? null, name).toBeNull();
    }
  });

  it("names EDB documents by their official English titles", () => {
    for (const name of files) {
      const text = textOf(EN_FILES, name);
      for (const phrase of PLACEHOLDER_TITLES) {
        expect(text.includes(phrase), `${name} still says "${phrase}"`).toBe(false);
      }
    }
  });

  it("carries none of the internal record", () => {
    // The printables shipped an internal status note ("this file is a draft and
    // must be reviewed by an educator") and the resource's idea number.
    // "BEETS AI · an independent teaching resource…" is legitimate boilerplate;
    // what must never survive is the meta line, which carries "· Theme C · #3".
    const internal = [
      /VERIFY/,
      /reviewed by an educator/i,
      /This (page|file) is a draft/i,
      /BEETS AI · Theme/,
    ];
    for (const name of files) {
      const text = textOf(EN_FILES, name);
      for (const pattern of internal) {
        expect(pattern.test(text), `${name} still matches ${pattern}`).toBe(false);
      }
    }
  });
});
