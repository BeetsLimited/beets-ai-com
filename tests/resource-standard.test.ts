import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import {
  ATTACHMENT_FORMATS,
  KIND_COPY,
  isResourceKind,
  standardHeadings,
  type ResourceKind,
} from "../src/lib/resource-kinds";

/**
 * The standard resource page.
 *
 * Every resource that declares a `kind` must follow one page shape: seven
 * sections, of which the middle three take their wording from the kind — so a
 * school-planning template reads "規劃目標 / 規劃步驟 / 檢核要點" instead of
 * being told it has "學習目標", which is the wrong document for a principal
 * (Billy, 2026-10-10).
 *
 * This also holds the other half of that brief: the internal record
 * (`sourceIdea`, `sources`, `reviewer`, `factChecked*`) stays in the entry and
 * off the page, and its document shorthand ("B, p.2") never reaches a reader.
 *
 * Every resource is on the standard: the rollout finished on 2026-10-10 and the
 * test now covers all of them, so a new resource that forgets `kind` fails here
 * rather than quietly shipping a page with headings it invented itself.
 */

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT = join(ROOT, "src/content/resources");

interface Entry {
  id: string;
  locale: "zh-HK" | "en";
  fm: Record<string, string>;
  body: string;
}

function markdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...markdownFiles(full));
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

/** Flat `key: value` frontmatter reader — enough for the fields asserted here. */
function parse(file: string): Entry {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`${file} has no frontmatter`);

  const fm: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }

  return {
    id: relative(CONTENT, file),
    locale: file.includes(`${sep}en${sep}`) ? "en" : "zh-HK",
    fm,
    body: raw.slice(match[0].length),
  };
}

const all = markdownFiles(CONTENT).map(parse);
const declared = all;
const downloadsOf = (entry: Entry): string[] => {
  const inline = entry.fm.downloads?.match(/^\[(.*)\]$/);
  if (!inline) return [];
  return [...inline[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
};
const h2sOf = (entry: Entry): string[] =>
  entry.body
    .split(/\r?\n/)
    .filter((line) => /^##\s+\S/.test(line))
    .map((line) => line.replace(/^##\s+/, "").trim());

describe("resource page standard", () => {
  it("puts every resource on the standard", () => {
    // Guards the parser: if `kind:` were written in a form this reader cannot
    // see, every test below would silently check nothing. Equality with the
    // number of files on disk is the real invariant — the rollout is complete.
    expect(declared.length).toBe(all.length);
    expect(markdownFiles(CONTENT).length).toBe(all.length);
  });

  it("declares a known kind", () => {
    for (const entry of declared) {
      expect(isResourceKind(entry.fm.kind), `${entry.id}: kind=${entry.fm.kind}`).toBe(true);
    }
  });

  it("uses the standard section headings, in order, for its kind", () => {
    for (const entry of declared) {
      const kind = entry.fm.kind as ResourceKind;
      expect(h2sOf(entry), `${entry.id} (${kind})`).toEqual(standardHeadings(kind, entry.locale));
    }
  });

  it("ships its attachment in the format its kind declares", () => {
    for (const entry of declared) {
      const kind = entry.fm.kind as ResourceKind;
      const expected = KIND_COPY[entry.locale][kind].format;
      const paths = downloadsOf(entry);

      expect(paths.length, `${entry.id} advertises no attachment`).toBeGreaterThan(0);
      for (const path of paths) {
        const ext = path.split(".").pop()?.toLowerCase();
        expect(ext, `${entry.id}: "${path}" should be a .${expected}`).toBe(expected);
        expect(
          ATTACHMENT_FORMATS.includes(ext as (typeof ATTACHMENT_FORMATS)[number]),
          `${entry.id}: "${path}" is not an Office document`,
        ).toBe(true);
        // Same filename in both editions, different folder — the pairing rule.
        const folder = entry.locale === "en" ? "/files/en/" : "/files/";
        expect(path.startsWith(folder), `${entry.id}: "${path}" should live under ${folder}`).toBe(
          true,
        );
      }
    }
  });

  it("links the attachment a reader is offered to the one the entry records", () => {
    // The old printables could be replaced in `public/` while the body still
    // pointed at the previous file, so the page offered a download that no
    // longer existed. Tie the visible link to the record.
    for (const entry of declared) {
      for (const path of downloadsOf(entry)) {
        expect(entry.body.includes(path), `${entry.id} does not link ${path}`).toBe(true);
      }
    }
  });
});

describe("the internal record stays internal", () => {
  const SHORTHAND = /(?:^|[^A-Za-z])[BFGE]\s*,?\s*pp?\.\s*\d/;
  const REMOVED_LABELS = [
    "原始構思",
    "審閱",
    "事實核實",
    "來源文件",
    "與 EDB 框架的關係",
    "Original idea",
    "Reviewer",
    "Fact-checked by",
    "Source documents",
    "How this relates to the EDB framework",
  ];

  it("never prints the EDB document shorthand", () => {
    for (const entry of declared) {
      const hit = entry.body.match(SHORTHAND);
      expect(hit?.[0], `${entry.id} still prints "${hit?.[0] ?? ""}"`).toBeUndefined();
    }
  });

  it("never prints a removed section label", () => {
    for (const entry of declared) {
      for (const label of REMOVED_LABELS) {
        expect(entry.body.includes(label), `${entry.id} still says "${label}"`).toBe(false);
      }
    }
  });

  it("never prints the reviewer's or fact-checker's name", () => {
    for (const entry of declared) {
      for (const field of ["reviewer", "factCheckedBy"]) {
        const name = entry.fm[field];
        if (!name) continue;
        expect(entry.body.includes(name), `${entry.id} prints ${field} "${name}"`).toBe(false);
      }
    }
  });

  it("still keeps the record, so the audit trail survives", () => {
    // Hidden, not deleted: the source codes and the attestations are what the
    // review hub and any future audit read.
    for (const entry of declared) {
      expect(entry.fm.sources, `${entry.id} must keep its sources`).toMatch(/[BFGE]/);
      if (entry.fm.draft === "false") {
        expect(entry.fm.reviewer, `${entry.id} must keep its reviewer`).toBeTruthy();
        expect(entry.fm.factChecked, `${entry.id} must keep factChecked`).toBe("true");
        expect(entry.fm.factCheckedBy, `${entry.id} must keep factCheckedBy`).toBeTruthy();
      }
    }
  });
});
