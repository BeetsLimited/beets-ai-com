import { describe, it, expect } from "vitest";
import { resourceSchema } from "../src/lib/schema";
import { learningResourceLd } from "../src/lib/seo";

/**
 * The last-modified date (Henry, 2026-10-17: "改動後版本 1.0 → 1.1 並顯示最後
 * 修改日").
 *
 * A page a teacher downloaded last term has to be able to say whether it has
 * changed since. Two things therefore have to agree, and neither is visible from
 * the other: the entry can carry an `updated` date, and the structured data that
 * search and answer engines read must report THAT date as `dateModified` rather
 * than the publication date. A page whose JSON-LD says it was last modified the
 * day it was published, two edits later, is the defect this pins.
 */

const base = {
  title: "測試資源",
  address: "test-resource",
  lang: "zh-HK" as const,
  type: "resource" as const,
  theme: "D" as const,
  audience: ["teachers" as const],
  stage: "P4",
  subject: "數學",
  sources: ["E, p.6"],
  author: "BeetsBot",
  description: "測試用的描述。",
  version: "1.1",
  date: "2026-10-07",
  updated: "2026-10-17",
};

describe("the last-modified date", () => {
  it("is optional — a page that was never edited still validates", () => {
    const { updated, ...neverEdited } = base;
    expect(updated).toBe("2026-10-17");
    expect(resourceSchema.safeParse(neverEdited).success).toBe(true);
  });

  it("accepts a date and parses it to a real Date", () => {
    const parsed = resourceSchema.parse(base);
    expect(parsed.updated).toBeInstanceOf(Date);
    expect(parsed.updated?.toISOString().slice(0, 10)).toBe("2026-10-17");
  });

  it("reports the edit as dateModified, not the publication date", () => {
    const ld = learningResourceLd({ data: base } as never, "zh-HK", "https://beets-ai.com/x/");
    expect(ld.datePublished).toBe("2026-10-07");
    expect(ld.dateModified).toBe("2026-10-17");
  });

  it("falls back to the publication date when there is no edit", () => {
    const { updated, ...neverEdited } = base;
    const ld = learningResourceLd({ data: neverEdited } as never, "zh-HK", "https://beets-ai.com/x/");
    expect(ld.dateModified).toBe("2026-10-07");
  });
});
