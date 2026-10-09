import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { alternateHrefFor, assertPairedEditions, findCounterpart } from "../src/lib/resources";

/**
 * The language switch must never point at a page that does not exist. A resource
 * whose counterpart edition is still a draft has no public page in the other
 * language, so the switch falls back to that language's resource index.
 *
 * With the review gate off every edition is published, so a draft no longer
 * blocks the cross-language link. Both modes are pinned here explicitly rather
 * than inherited from the repo's current setting — see src/lib/review-gate.ts.
 */

interface Stub {
  data: { address: string; draft: boolean; lang: string };
}

const entry = (address: string, draft: boolean, lang: string): Stub => ({
  data: { address, draft, lang },
});

describe("findCounterpart", () => {
  it("finds the same address in the other language", () => {
    const zh = entry("foo", false, "zh-HK");
    const en = entry("foo", false, "en");
    expect(findCounterpart(zh, [zh, en])).toBe(en);
    expect(findCounterpart(en, [zh, en])).toBe(zh);
  });

  it("does not match a different address", () => {
    const zh = entry("foo", false, "zh-HK");
    expect(findCounterpart(zh, [entry("bar", false, "en")])).toBeUndefined();
  });
});

describe("alternateHrefFor (review gate ON)", () => {
  beforeEach(() => vi.stubEnv("REVIEW_REQUIRED", "true"));
  afterEach(() => vi.unstubAllEnvs());

  it("links both published editions to each other", () => {
    const zh = entry("foo", false, "zh-HK");
    const en = entry("foo", false, "en");
    expect(alternateHrefFor(zh, [zh, en])).toBe("/en/resources/foo/");
    expect(alternateHrefFor(en, [zh, en])).toBe("/resources/foo/");
  });

  it("falls back to the section index when the counterpart is not published", () => {
    const zh = entry("foo", false, "zh-HK");
    const enDraft = entry("foo", true, "en");
    expect(alternateHrefFor(zh, [zh, enDraft])).toBe("/en/resources/");
  });

  it("falls back when there is no counterpart at all", () => {
    const zh = entry("foo", false, "zh-HK");
    expect(alternateHrefFor(zh, [zh])).toBe("/en/resources/");
  });
});

describe("alternateHrefFor (review gate OFF — every edition is live)", () => {
  beforeEach(() => vi.stubEnv("REVIEW_REQUIRED", "false"));
  afterEach(() => vi.unstubAllEnvs());

  it("links across even when the counterpart is still an unreviewed draft", () => {
    const zh = entry("foo", false, "zh-HK");
    const enDraft = entry("foo", true, "en");
    expect(alternateHrefFor(zh, [zh, enDraft])).toBe("/en/resources/foo/");
    expect(alternateHrefFor(enDraft, [zh, enDraft])).toBe("/resources/foo/");
  });

  it("still falls back when there is no counterpart", () => {
    const zh = entry("foo", false, "zh-HK");
    expect(alternateHrefFor(zh, [zh])).toBe("/en/resources/");
  });
});

describe("assertPairedEditions", () => {
  it("accepts a complete library", () => {
    const all = [
      entry("foo", false, "zh-HK"),
      entry("foo", false, "en"),
      entry("bar", true, "zh-HK"),
      entry("bar", true, "en"),
    ];
    expect(() => assertPairedEditions(all, "test")).not.toThrow();
  });

  it("throws when an edition is missing — the content loader drops colliding entries", () => {
    const all = [entry("foo", false, "zh-HK"), entry("foo", false, "en"), entry("bar", false, "en")];
    expect(() => assertPairedEditions(all, "test")).toThrow(/bar \(en\)/);
  });

  it("throws when the same language appears twice", () => {
    const all = [entry("foo", false, "zh-HK"), entry("foo", false, "zh-HK")];
    expect(() => assertPairedEditions(all, "test")).toThrow(/foo \(zh-HK, zh-HK\)/);
  });
});
