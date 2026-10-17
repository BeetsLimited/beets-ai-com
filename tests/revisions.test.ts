import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { applyRevision, revisionFor, trackedAddresses, withRevision } from "../src/lib/revisions";
import { learningResourceLd } from "../src/lib/seo";

/**
 * Version and 最後修改 are written by the publish flow, not by hand.
 *
 * Henry, 2026-10-17: *「版本號與『最後修改』由發佈流程自動寫入，不再由人手填」* —
 * after finding `deepfake-response-game` still printing 「版本 1.0 · 最後修改
 * 2026-10-08」 although its subject had been changed on 10-15. The record is
 * derived from the commit log by `scripts/gen-revisions.mjs`, so these tests pin
 * the two things a reader can be misled by: a page with no publish record, and a
 * page whose structured data reports a different date from the one it prints.
 */

const CONTENT = resolve(import.meta.dirname, "..", "src/content/resources");
const addresses = readdirSync(CONTENT)
  .filter((name) => name.endsWith(".md"))
  .map((name) => name.replace(/\.md$/, ""));

describe("the publish record", () => {
  it("covers every resource the site builds", () => {
    const missing = addresses.filter((address) => !revisionFor(address));
    expect(missing).toEqual([]);
    expect(trackedAddresses().sort()).toEqual([...addresses].sort());
  });

  it("gives every resource a one-decimal version, from 1.0 up", () => {
    for (const address of addresses) {
      const revision = revisionFor(address)!;
      expect(revision.version, `${address} version`).toMatch(/^\d+\.\d$/);
      expect(Number(revision.version)).toBeGreaterThanOrEqual(1);
      expect(revision.publishes).toBeGreaterThanOrEqual(1);
    }
  });

  it("never reports a modification before the first publication", () => {
    for (const address of addresses) {
      const revision = revisionFor(address)!;
      expect(revision.published, `${address} dates`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(revision.modified >= revision.published, `${address} modified >= published`).toBe(true);
    }
  });

  it("counts publishes into the version: 1 → 1.0, 2 → 1.1, 11 → 2.0", () => {
    expect(revisionFor("_does-not-exist")).toBeUndefined();
    const base = { address: "x", version: "9.9", date: new Date("2020-01-01") };
    const at = (publishes: number) =>
      applyRevision(base, {
        published: "2026-10-01",
        modified: "2026-10-17",
        publishes,
        version: `${Math.floor((9 + publishes) / 10)}.${(9 + publishes) % 10}`,
      }).version;
    expect(at(1)).toBe("1.0");
    expect(at(2)).toBe("1.1");
    expect(at(11)).toBe("2.0");
  });

  it("becomes the page's datePublished and dateModified, with no gap between them", () => {
    const revision = revisionFor("deepfake-response-game")!;
    const entry = withRevision({
      data: {
        title: "測試",
        address: "deepfake-response-game",
        lang: "zh-HK",
        version: "1.0",
        date: new Date("2026-10-08"),
        description: "測試",
      },
    });

    expect(entry.data.version).toBe(revision.version);
    expect(entry.data.date?.toISOString().slice(0, 10)).toBe(revision.published);
    expect(entry.data.updated?.toISOString().slice(0, 10)).toBe(revision.modified);

    const ld = learningResourceLd(entry as never, "zh-HK", "https://beets-ai.com/x/");
    expect(ld.datePublished).toBe(revision.published);
    expect(ld.dateModified).toBe(revision.modified);
    expect(ld.version).toBe(revision.version);
  });

  it("leaves an entry with no publish record exactly as it was", () => {
    const data = { address: "not-a-page", version: "1.0", date: new Date("2026-10-01") };
    const entry = { data };
    expect(withRevision(entry)).toBe(entry);
  });
});
