import { describe, it, expect } from "vitest";
import { resourceSchema } from "../src/lib/schema";

/** A compliant, publishable resource (#11 Hong Kong population graph lesson). */
const valid = {
  title: "P4 香港人口折線圖：檢查 AI 生成的解釋",
  title_en: "P4 Hong Kong population line graph: check an AI explanation",
  slug: "p4-hk-population-ai-graph-check",
  lang: "zh-HK",
  type: "resource",
  theme: "D",
  stage: "P4",
  subject: "數學 / Mathematics",
  sourceIdea: "#11",
  sources: ["E, p.6"],
  prepTime: "10 min",
  equipment: "投影 / 打印",
  author: "BeetsBot",
  reviewer: "Henry",
  version: "1.0",
  date: "2026-10-07",
  description: "檢查 AI 生成的香港人口折線圖解釋，找出錯誤並核對來源。",
  downloads: ["/files/p4-hk-population-graph-v1.pdf"],
  feedback: true,
  factChecked: true,
  factCheckedBy: "BeetsBot",
};

describe("resourceSchema", () => {
  it("accepts a well-formed published resource", () => {
    expect(resourceSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown theme", () => {
    expect(resourceSchema.safeParse({ ...valid, theme: "Z" }).success).toBe(false);
  });

  it("rejects an unknown lang", () => {
    expect(resourceSchema.safeParse({ ...valid, lang: "fr-FR" }).success).toBe(false);
  });

  it("enforces the educator review gate: a resource needs a named reviewer", () => {
    const noReviewer = { ...valid, reviewer: undefined };
    expect(resourceSchema.safeParse(noReviewer).success).toBe(false);
  });

  it("allows an editorial blog post without a reviewer", () => {
    expect(
      resourceSchema.safeParse({ ...valid, type: "post", reviewer: undefined }).success,
    ).toBe(true);
  });

  it("allows an unreviewed DRAFT — the gate applies at publish, not at authoring", () => {
    expect(
      resourceSchema.safeParse({ ...valid, reviewer: undefined, draft: true }).success,
    ).toBe(true);
  });

  it("rejects a slug that is not lowercase-hyphenated", () => {
    expect(resourceSchema.safeParse({ ...valid, slug: "P4 HK Population" }).success).toBe(
      false,
    );
  });

  it("requires at least one EDB source reference", () => {
    expect(resourceSchema.safeParse({ ...valid, sources: [] }).success).toBe(false);
  });

  it("coerces an ISO date string into a Date", () => {
    const parsed = resourceSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.date).toBeInstanceOf(Date);
  });

  // ── fact-check gate ───────────────────────────────────────────────────────
  it("requires a fact-check attestation before publish", () => {
    expect(resourceSchema.safeParse({ ...valid, factChecked: false }).success).toBe(false);
  });

  it("requires a NAMED fact-checker before publish", () => {
    expect(
      resourceSchema.safeParse({ ...valid, factChecked: true, factCheckedBy: undefined })
        .success,
    ).toBe(false);
  });

  it("applies the fact-check gate to posts too, not just resources", () => {
    expect(
      resourceSchema.safeParse({ ...valid, type: "post", factChecked: false }).success,
    ).toBe(false);
  });

  it("exempts drafts from the fact-check gate as well", () => {
    expect(
      resourceSchema.safeParse({
        ...valid,
        draft: true,
        reviewer: undefined,
        factChecked: false,
        factCheckedBy: undefined,
      }).success,
    ).toBe(true);
  });
});
