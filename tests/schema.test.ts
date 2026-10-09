import { describe, it, expect } from "vitest";
import { createResourceSchema } from "../src/lib/schema";

/**
 * The two human gates are enforced through the schema, and the schema is built
 * either strict or permissive depending on the review gate
 * (`src/lib/review-gate.ts`). Both modes are pinned here explicitly, so these
 * assertions do not depend on the repo's current gate setting.
 */
const strict = createResourceSchema(true); // review on — the normal contract
const permissive = createResourceSchema(false); // review temporarily off

/** A compliant, publishable resource (#11 Hong Kong population graph lesson). */
const valid = {
  title: "P4 香港人口折線圖：檢查 AI 生成的解釋",
  title_en: "P4 Hong Kong population line graph: check an AI explanation",
  slug: "p4-hk-population-ai-graph-check",
  address: "p4-hk-population-ai-graph-check",
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

describe("resourceSchema (review gate ON)", () => {
  it("accepts a well-formed published resource", () => {
    expect(strict.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown theme", () => {
    expect(strict.safeParse({ ...valid, theme: "Z" }).success).toBe(false);
  });

  it("rejects an unknown lang", () => {
    expect(strict.safeParse({ ...valid, lang: "fr-FR" }).success).toBe(false);
  });

  it("enforces the educator review gate: a resource needs a named reviewer", () => {
    const noReviewer = { ...valid, reviewer: undefined };
    expect(strict.safeParse(noReviewer).success).toBe(false);
  });

  it("allows an editorial blog post without a reviewer", () => {
    expect(strict.safeParse({ ...valid, type: "post", reviewer: undefined }).success).toBe(true);
  });

  it("allows an unreviewed DRAFT — the gate applies at publish, not at authoring", () => {
    expect(strict.safeParse({ ...valid, reviewer: undefined, draft: true }).success).toBe(true);
  });

  it("rejects an address that is not lowercase-hyphenated", () => {
    expect(strict.safeParse({ ...valid, address: "P4 HK Population" }).success).toBe(false);
  });

  it("requires at least one EDB source reference", () => {
    expect(strict.safeParse({ ...valid, sources: [] }).success).toBe(false);
  });

  it("coerces an ISO date string into a Date", () => {
    const parsed = strict.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.date).toBeInstanceOf(Date);
  });

  // ── fact-check gate ───────────────────────────────────────────────────────
  it("requires a fact-check attestation before publish", () => {
    expect(strict.safeParse({ ...valid, factChecked: false }).success).toBe(false);
  });

  it("requires a NAMED fact-checker before publish", () => {
    expect(strict.safeParse({ ...valid, factChecked: true, factCheckedBy: undefined }).success).toBe(
      false,
    );
  });

  it("applies the fact-check gate to posts too, not just resources", () => {
    expect(strict.safeParse({ ...valid, type: "post", factChecked: false }).success).toBe(false);
  });

  it("exempts drafts from the fact-check gate as well", () => {
    expect(
      strict.safeParse({
        ...valid,
        draft: true,
        reviewer: undefined,
        factChecked: false,
        factCheckedBy: undefined,
      }).success,
    ).toBe(true);
  });
});

describe("resourceSchema (review gate OFF — temporary, Billy 2026-10-10)", () => {
  const unreviewed = {
    ...valid,
    reviewer: undefined,
    factChecked: false,
    factCheckedBy: undefined,
    factCheckedOn: undefined,
  };

  it("publishes an unreviewed, unfact-checked resource without attestation", () => {
    expect(permissive.safeParse(unreviewed).success).toBe(true);
  });

  it("still ignores `draft` — the flag no longer decides publication on its own", () => {
    expect(permissive.safeParse({ ...unreviewed, draft: true }).success).toBe(true);
  });

  it("still rejects structurally invalid content", () => {
    expect(permissive.safeParse({ ...unreviewed, theme: "Z" }).success).toBe(false);
    expect(permissive.safeParse({ ...unreviewed, sources: [] }).success).toBe(false);
    expect(permissive.safeParse({ ...unreviewed, address: "Not An Address" }).success).toBe(false);
  });
});
