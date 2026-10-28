import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { DOWNLOAD_HREF, GA_MEASUREMENT_ID, GA_PROPERTY_ID } from "../src/lib/analytics";

/**
 * Guards for the GA4 wiring (2026-10-28).
 *
 * The matcher that decides "is this click a download of ours?" is the one piece
 * of analytics code that can be wrong *silently*: a wrong pattern does not throw,
 * it just reports zero downloads for a set of pages and looks like "nobody
 * downloads the English editions". That is exactly what happened while building
 * it — the first pattern allowed one path segment after `/files/`, and every
 * English edition lives at `/files/en/<address>.docx`.
 *
 * So the assertion is made against the **content itself**, not against examples
 * invented here: every path a resource advertises must be a path the tracker
 * counts. A future publishing convention (`/files/fr/…`, `/files/2027/…`) then
 * fails the build instead of quietly going uncounted.
 */

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT = join(ROOT, "src/content/resources");

function markdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...markdownFiles(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

function frontmatter(md: string): string {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : "";
}

function downloadPaths(fm: string): string[] {
  const inline = fm.match(/^downloads:\s*\[(.*)\]\s*$/m);
  if (inline) {
    return [...inline[1].matchAll(/"([^"]+)"|'([^']+)'/g)].map((m) => m[1] ?? m[2]);
  }
  const out: string[] = [];
  let inBlock = false;
  for (const line of fm.split(/\r?\n/)) {
    if (/^downloads:/.test(line)) {
      inBlock = true;
      continue;
    }
    if (inBlock) {
      const item = line.match(/^\s*-\s*"?([^"\s]+)"?/);
      if (item) out.push(item[1]);
      else if (line.trim() !== "") break;
    }
  }
  return out;
}

const files = markdownFiles(CONTENT);

describe("the download matcher covers every published download", () => {
  it("finds content entries to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const id = relative(CONTENT, file);
    const paths = downloadPaths(frontmatter(readFileSync(file, "utf8")));
    if (paths.length === 0) continue;

    it(`${id} — every advertised download would be counted`, () => {
      for (const path of paths) {
        expect(
          DOWNLOAD_HREF.test(`https://beets-ai.com${path}`),
          `${path} would not be counted as a download`,
        ).toBe(true);
      }
    });
  }
});

describe("the download matcher counts our files and nothing else", () => {
  const counted = [
    "https://beets-ai.com/files/student-ai-use-code-posters.docx",
    "https://beets-ai.com/files/en/student-ai-use-code-posters.docx",
    "https://beets-ai.com/files/en/nested/deeper/report.xlsx",
    "https://beets-ai.com/files/en/report.pdf",
    "http://localhost:4321/files/report.docx",
  ];
  for (const url of counted) {
    it(`counts ${url}`, () => {
      expect(DOWNLOAD_HREF.test(url)).toBe(true);
    });
  }

  const ignored = [
    // An official document in the 官方文件參考 section: a reader following a
    // citation, not a download of our material.
    "https://www.edb.gov.hk/en/curriculum-development/ai-guide.pdf",
    // Not a file at all.
    "https://beets-ai.com/resources/student-ai-use-code-posters/",
    "https://beets-ai.com/files/",
    "https://beets-ai.com/files/en/",
    // A format the library does not publish, so a stray link is not a download.
    "https://beets-ai.com/files/notes.txt",
  ];
  for (const url of ignored) {
    it(`ignores ${url}`, () => {
      expect(DOWNLOAD_HREF.test(url)).toBe(false);
    });
  }
});

describe("the measurement configuration is unambiguous", () => {
  it("keeps the property ID and the measurement ID apart", () => {
    // 561153675 is the NUMERIC property ID (Billy, 2026-10-28). Pasting it into
    // the tag would ship a broken tag that looks configured.
    expect(GA_PROPERTY_ID).toMatch(/^\d+$/);
    expect(GA_PROPERTY_ID).not.toBe(GA_MEASUREMENT_ID);
  });

  it("either ships no tag, or ships a measurement ID", () => {
    if (GA_MEASUREMENT_ID === "") return; // analytics deliberately off
    expect(GA_MEASUREMENT_ID).toMatch(/^G-[A-Z0-9]{6,}$/);
  });
});
