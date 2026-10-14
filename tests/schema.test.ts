import { describe, it, expect } from "vitest";
import { resourceSchema } from "../src/lib/schema";

/**
 * The frontmatter contract, now that the review gate is gone.
 *
 * There is exactly ONE schema and it has no gate in it: no fact-check
 * requirement, no educator-attestation requirement, and no `draft` flag to
 * exempt anything. Billy removed the review process permanently on 2026-10-15 —
 * *"I actually want to remove the review gate permanently. We do not need that
 * anymore."* — so these assertions pin the contract that replaced it: the
 * structural rules still bite, and the human-review fields are optional
 * provenance rather than a condition of publication.
 *
 * The old suite was built around `createResourceSchema(true|false)` and the
 * `REVIEW_REQUIRED` environment variable. Both are deleted; a test that still
 * stubbed the env var would be asserting about a switch that no longer exists.
 */

/** A compliant resource (#11 Hong Kong population graph lesson). */
const valid = {
  title: "P4 香港人口折線圖：檢查 AI 生成的解釋",
  title_en: "P4 Hong Kong population line graph: check an AI explanation",
  address: "p4-hk-population-ai-graph-check",
  lang: "zh-HK",
  type: "resource",
  theme: "D",
  audience: ["teachers", "students"],
  stage: "P4",
  subject: "數學 / Mathematics",
  sourceIdea: "#11",
  sources: ["E, p.6"],
  prepTime: "10 min",
  equipment: "投影 / 打印",
  author: "BeetsBot",
  reviewer: "Billy Kan",
  version: "1.0",
  date: "2026-10-07",
  description: "檢查 AI 生成的香港人口折線圖解釋，找出錯誤並核對來源。",
  downloads: ["/files/p4-hk-population-graph-v1.docx"],
  feedback: true,
  factChecked: true,
  factCheckedBy: "Billy Kan",
};

describe("resourceSchema — structure", () => {
  it("accepts a well-formed resource", () => {
    expect(resourceSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown theme", () => {
    expect(resourceSchema.safeParse({ ...valid, theme: "Z" }).success).toBe(false);
  });

  it("rejects an unknown lang", () => {
    expect(resourceSchema.safeParse({ ...valid, lang: "fr-FR" }).success).toBe(false);
  });

  it("rejects an address that is not lowercase-hyphenated", () => {
    expect(resourceSchema.safeParse({ ...valid, address: "P4 HK Population" }).success).toBe(false);
  });

  it("requires at least one EDB source reference", () => {
    expect(resourceSchema.safeParse({ ...valid, sources: [] }).success).toBe(false);
  });

  it("requires at least one audience — a resource nobody is classified for is the defect", () => {
    expect(resourceSchema.safeParse({ ...valid, audience: [] }).success).toBe(false);
    expect(resourceSchema.safeParse({ ...valid, audience: undefined }).success).toBe(false);
  });

  it("rejects an audience that is not one of the three", () => {
    expect(
      resourceSchema.safeParse({ ...valid, audience: ["teachers", "parents", "governors"] }).success,
    ).toBe(false);
  });

  it("accepts a resource that serves more than one audience", () => {
    expect(resourceSchema.safeParse({ ...valid, audience: ["teachers", "parents", "students"] }).success).toBe(
      true,
    );
  });

  it("coerces an ISO date string into a Date", () => {
    const parsed = resourceSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.date).toBeInstanceOf(Date);
  });

  it("has no `draft` field — there is no unpublished state to declare", () => {
    // The flag is stripped from the schema, so it is not in the parsed output
    // whatever the file says. Leaving it in a file would be a silent no-op,
    // which is why every entry was swept clean in the same change.
    const parsed = resourceSchema.safeParse({ ...valid, draft: true });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect("draft" in parsed.data).toBe(false);
  });
});

describe("resourceSchema — the review gate is gone", () => {
  it("publishes without any human attestation at all", () => {
    const noAttestation = {
      ...valid,
      reviewer: undefined,
      factChecked: undefined,
      factCheckedBy: undefined,
      factCheckedOn: undefined,
    };
    expect(resourceSchema.safeParse(noAttestation).success).toBe(true);
  });

  it("accepts a resource that records no idea number — `sourceIdea` is provenance, not a gate", () => {
    expect(resourceSchema.safeParse({ ...valid, sourceIdea: undefined }).success).toBe(true);
  });

  it("still rejects a reviewer recorded as an empty string", () => {
    // `min(1)` matters because the sweeps write `reviewer: ""` when a field is
    // meant to be absent: an empty attestation must be no attestation, not a
    // blank name published as one.
    expect(resourceSchema.safeParse({ ...valid, reviewer: "" }).success).toBe(false);
  });

  it("defaults the fact-check record to false when unset", () => {
    const parsed = resourceSchema.safeParse({ ...valid, factChecked: undefined });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.factChecked).toBe(false);
  });

  it("applies the structural rules to posts too", () => {
    expect(resourceSchema.safeParse({ ...valid, type: "post" }).success).toBe(true);
    expect(resourceSchema.safeParse({ ...valid, type: "post", sources: [] }).success).toBe(false);
  });
});
