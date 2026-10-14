import { describe, it, expect } from "vitest";
import { alternateHrefFor, assertPairedEditions, findCounterpart } from "../src/lib/resources";

/**
 * The language switch must never point at a page that does not exist.
 *
 * This suite used to exercise two review-gate modes through the
 * `REVIEW_REQUIRED` environment variable, because a counterpart edition could
 * be an unpublished draft and the cross-language link had to fall back. Both
 * the gate and the draft state are gone (Billy, 2026-10-15): every entry in the
 * collection is live, so the only remaining reason to fall back is a genuinely
 * missing counterpart edition.
 */

interface Stub {
  data: { address: string; lang: string };
}

const entry = (address: string, lang: string): Stub => ({ data: { address, lang } });

describe("findCounterpart", () => {
  it("finds the same address in the other language", () => {
    const zh = entry("foo", "zh-HK");
    const en = entry("foo", "en");
    expect(findCounterpart(zh, [zh, en])).toBe(en);
    expect(findCounterpart(en, [zh, en])).toBe(zh);
  });

  it("does not match a different address", () => {
    const zh = entry("foo", "zh-HK");
    expect(findCounterpart(zh, [entry("bar", "en")])).toBeUndefined();
  });
});

describe("alternateHrefFor", () => {
  it("links both editions to each other", () => {
    const zh = entry("foo", "zh-HK");
    const en = entry("foo", "en");
    expect(alternateHrefFor(zh, [zh, en])).toBe("/en/resources/foo/");
    expect(alternateHrefFor(en, [zh, en])).toBe("/resources/foo/");
  });

  it("falls back to the section index when there is no counterpart at all", () => {
    // The one remaining fallback: `assertPairedEditions` fails the build on a
    // missing edition, but this helper must not build a 404 link even so.
    const zh = entry("foo", "zh-HK");
    expect(alternateHrefFor(zh, [zh])).toBe("/en/resources/");
    const en = entry("foo", "en");
    expect(alternateHrefFor(en, [en])).toBe("/resources/");
  });

  it("needs no publish state to link across — there is none to consult", () => {
    // The old suite pinned a gate-on case (fall back) and a gate-off case
    // (link across) for the same input. Both flags are deleted from the entry
    // shape, so the same call has one answer now.
    const zh = { data: { address: "foo", lang: "zh-HK" } };
    const en = { data: { address: "foo", lang: "en" } };
    expect(alternateHrefFor(zh, [zh, en])).toBe("/en/resources/foo/");
  });
});

describe("assertPairedEditions", () => {
  it("accepts a complete library", () => {
    const all = [entry("foo", "zh-HK"), entry("foo", "en"), entry("bar", "zh-HK"), entry("bar", "en")];
    expect(() => assertPairedEditions(all, "test")).not.toThrow();
  });

  it("throws when an edition is missing — the content loader drops colliding entries", () => {
    const all = [entry("foo", "zh-HK"), entry("foo", "en"), entry("bar", "en")];
    expect(() => assertPairedEditions(all, "test")).toThrow(/bar \(en\)/);
  });

  it("throws when the same language appears twice", () => {
    const all = [entry("foo", "zh-HK"), entry("foo", "zh-HK")];
    expect(() => assertPairedEditions(all, "test")).toThrow(/foo \(zh-HK, zh-HK\)/);
  });
});
