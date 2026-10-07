import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";

/**
 * Content guard: every file a resource advertises under `downloads:` must
 * actually exist in `public/`. A teacher clicking a dead download is worse
 * than no download at all, and this catches it in CI rather than in the wild.
 *
 * Walks subdirectories, so the English editions under `resources/en/` are
 * checked too — that is exactly where a wrong `/files/en/…` path would hide.
 */

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT = join(ROOT, "src/content/resources");
const PUBLIC = join(ROOT, "public");

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

describe("content downloads resolve", () => {
  it("finds content entries to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const id = relative(CONTENT, file);
    it(`${id} — every advertised download exists in public/`, () => {
      const fm = frontmatter(readFileSync(file, "utf8"));
      for (const path of downloadPaths(fm)) {
        expect(existsSync(join(PUBLIC, path.replace(/^\//, ""))), `missing public${path}`).toBe(
          true,
        );
      }
    });
  }
});
