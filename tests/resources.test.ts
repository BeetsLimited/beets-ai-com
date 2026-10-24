import { describe, it, expect } from "vitest";
import {
  alternateHrefFor,
  assertPairedEditions,
  findCounterpart,
  newestFirst,
  publishedDay,
} from "../src/lib/resources";
import { revisionFor, trackedAddresses } from "../src/lib/revisions";

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

/**
 * Newest first means "newest PUBLISHED first" — the publish log's date, never
 * the frontmatter's.
 *
 * Billy, 2026-10-24: the JSON feed and the catalogue disagreed about what was
 * new, because the catalogue sorted on frontmatter `date` (which had been bumped
 * to the day of a later edit) while the feed sorted on the publish log. Both
 * surfaces must answer "what is new" the same way; `check:feed` now compares the
 * built catalogue's card order against the feed.
 *
 * Fixtures use real publish-log records (chosen at run time, not hard-coded), so
 * these tests do not break when a resource is added or retired.
 */
describe("newestFirst", () => {
  const tracked = trackedAddresses()
    .map((address) => ({ address, revision: revisionFor(address)! }))
    .filter(({ revision }) => revision);

  it("takes the publication date from the publish log, not frontmatter", () => {
    const [first] = tracked;
    const bumped = { data: { address: first.address, date: new Date("2099-01-01T00:00:00Z") } };
    expect(publishedDay(bumped)).toBe(first.revision.published);
  });

  it("falls back to the frontmatter date when the publish log has no record", () => {
    const untracked = { data: { address: "not-committed-yet", date: new Date("2026-10-09") } };
    expect(publishedDay(untracked)).toBe("2026-10-09");
  });

  it("orders by publication date even when frontmatter claims the opposite", () => {
    const sorted = [...tracked].sort((a, b) => a.revision.published.localeCompare(b.revision.published));
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    if (oldest.revision.published === newest.revision.published) return; // one publish day: nothing to order

    // Frontmatter deliberately inverted: the oldest resource claims to be the
    // most recent, the newest claims to be ancient.
    const lying = [
      { data: { address: oldest.address, date: new Date("2099-12-31T00:00:00Z") } },
      { data: { address: newest.address, date: new Date("1990-01-01T00:00:00Z") } },
    ];
    expect(newestFirst(lying).map((item) => item.data.address)).toEqual([
      newest.address,
      oldest.address,
    ]);
  });

  it("breaks a same-day tie by address, so the order is stable between builds", () => {
    const day = new Date("2026-10-09");
    const items = [
      { data: { address: "zz-later", date: day } },
      { data: { address: "aa-earlier", date: day } },
    ];
    expect(newestFirst(items).map((item) => item.data.address)).toEqual(["aa-earlier", "zz-later"]);
  });
});
