import { describe, it, expect } from "vitest";
import { slugify, resourcePath } from "../src/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("P4 Hong Kong population graph")).toBe(
      "p4-hong-kong-population-graph",
    );
  });

  it("collapses runs of punctuation and whitespace into a single hyphen", () => {
    expect(slugify("  Multiple   spaces -- and punctuation! ")).toBe(
      "multiple-spaces-and-punctuation",
    );
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("-Trailing-")).toBe("trailing");
  });

  it("drops characters that are not ASCII alphanumeric", () => {
    // Chinese text is stripped — slugs are built from the English title.
    expect(slugify("AI 生成的解釋")).toBe("ai");
  });
});

describe("resourcePath", () => {
  it("builds the stable /resources/ path from stage, subject and task", () => {
    expect(
      resourcePath({
        stage: "P4",
        subject: "Mathematics",
        task: "HK population AI graph check",
      }),
    ).toBe("/resources/p4-mathematics-hk-population-ai-graph-check/");
  });

  it("is stable for the same inputs (no ordering drift)", () => {
    const input = { stage: "P4", subject: "Maths", task: "Line graph check" };
    expect(resourcePath(input)).toBe(resourcePath(input));
    expect(resourcePath(input)).toBe("/resources/p4-maths-line-graph-check/");
  });

  it("throws when any component is empty", () => {
    expect(() => resourcePath({ stage: "", subject: "Maths", task: "x" })).toThrow();
    expect(() => resourcePath({ stage: "P4", subject: "  ", task: "x" })).toThrow();
    expect(() => resourcePath({ stage: "P4", subject: "Maths", task: "" })).toThrow();
  });
});
