import { describe, it, expect } from "vitest";
import {
  PAGE_SIZE,
  clampPage,
  facetMatches,
  filterItems,
  filterOptions,
  haystackFor,
  matches,
  normaliseQuery,
  pageCount,
  paginate,
  readState,
  toggleValue,
  withLocked,
  writeState,
  type CatalogueItem,
} from "../src/lib/catalogue";

/**
 * The catalogue is the one interactive thing on an otherwise static site, and it
 * renders every card into the HTML and then hides the ones the browser should
 * not show. So "which cards are visible" is decided by these functions — and if
 * one of them is wrong, the page lies about the catalogue in a way no gate looks
 * for. They are therefore pinned here rather than left to the browser.
 *
 * The selection rule is the one most easily got wrong: tags inside a group are
 * OR-ed, groups are AND-ed with each other.
 */

const item = (over: Partial<CatalogueItem> = {}): CatalogueItem => ({
  theme: "D",
  stage: "P4-P6",
  subject: "科學",
  haystack: haystackFor(["校園植物：先觀察，再核對 AI 的說法", "學生先觀察一株植物"]),
  ...over,
});

describe("haystackFor / normaliseQuery", () => {
  it("joins the parts and lower-cases them", () => {
    expect(haystackFor(["Campus Plants", undefined, "Observe first"])).toBe("campus plants observe first");
  });

  it("skips empty parts and trims the query", () => {
    expect(haystackFor(["", undefined, "x"])).toBe("x");
    expect(normaliseQuery("  Graph  ")).toBe("graph");
    expect(normaliseQuery(undefined)).toBe("");
  });
});

describe("facetMatches", () => {
  it("treats an empty selection as no opinion", () => {
    expect(facetMatches(undefined, "D")).toBe(true);
    expect(facetMatches([], "D")).toBe(true);
  });

  it("accepts any of the selected values — OR inside a group", () => {
    expect(facetMatches(["A", "D"], "D")).toBe(true);
    expect(facetMatches(["A", "D"], "C")).toBe(false);
  });
});

describe("matches", () => {
  it("matches everything when nothing is selected", () => {
    expect(matches(item(), {})).toBe(true);
  });

  it("ORs the tags inside one group", () => {
    expect(matches(item(), { theme: ["D"] })).toBe(true);
    expect(matches(item(), { theme: ["A", "D"] })).toBe(true);
    expect(matches(item(), { theme: ["A", "B"] })).toBe(false);
    expect(matches(item(), { stage: ["P4-P6", "S1-S3"] })).toBe(true);
    expect(matches(item(), { subject: ["科學", "數學"] })).toBe(true);
    expect(matches(item(), { subject: ["數學"] })).toBe(false);
  });

  it("ANDs the groups with each other", () => {
    // 科學 + P4-P6: both hold → shown. 科學 + (another theme) → not shown.
    expect(matches(item(), { theme: ["D"], stage: ["P4-P6"], subject: ["科學"] })).toBe(true);
    expect(matches(item(), { theme: ["A"], stage: ["P4-P6"], subject: ["科學"] })).toBe(false);
    expect(matches(item(), { theme: ["D"], stage: ["S1-S3"] })).toBe(false);
    expect(matches(item(), { theme: ["D"], subject: ["數學"] })).toBe(false);
  });

  it("searches the keyword case-insensitively, including in Chinese", () => {
    expect(matches(item(), { q: "植物" })).toBe(true);
    expect(matches(item(), { q: "校園" })).toBe(true);
    expect(matches(item(), { q: "歷史" })).toBe(false);
    const english = item({ haystack: haystackFor(["Campus Plants"]) });
    expect(matches(english, { q: "PLANTS" })).toBe(true);
    expect(matches(english, { q: "  campus " })).toBe(true);
  });

  it("ANDs the keyword with the tags", () => {
    expect(matches(item(), { theme: ["D"], q: "植物" })).toBe(true);
    expect(matches(item(), { theme: ["A"], q: "植物" })).toBe(false);
  });
});

describe("filterItems", () => {
  const items = [
    item({ stage: "P4-P6" }),
    item({ stage: "S1-S3", subject: "人文", haystack: "深偽應對遊戲" }),
    item({ theme: "A", stage: "P1-P6", subject: "校本規劃", haystack: "學期規劃" }),
  ];

  it("keeps only the matching items", () => {
    expect(filterItems(items, {}).length).toBe(3);
    expect(filterItems(items, { theme: ["A"] }).map((i) => i.stage)).toEqual(["P1-P6"]);
    expect(filterItems(items, { q: "規劃" }).length).toBe(1);
    expect(filterItems(items, { q: "nothing here" })).toEqual([]);
  });

  it("unions a multi-tag group and intersects the groups", () => {
    // 科學 OR 人文 → two items; narrowed to S1-S3 → one.
    expect(filterItems(items, { subject: ["科學", "人文"] }).length).toBe(2);
    expect(filterItems(items, { subject: ["科學", "人文"], stage: ["S1-S3"] }).length).toBe(1);
  });
});

describe("toggleValue", () => {
  it("adds an unselected tag", () => {
    expect(toggleValue(undefined, "A")).toEqual(["A"]);
    expect(toggleValue(["A"], "D")).toEqual(["A", "D"]);
  });

  it("removes a selected tag, including the last one", () => {
    expect(toggleValue(["A", "D"], "A")).toEqual(["D"]);
    expect(toggleValue(["A"], "A")).toEqual([]);
  });
});

describe("withLocked", () => {
  it("a locked criterion wins over the reader's own choice", () => {
    // The defect this pins: the school-planning page rendered theme-C resources
    // under a 校本 AI 教育規劃 heading when the URL said ?theme=C.
    expect(withLocked({ theme: ["C"] }, { theme: "A" }).theme).toEqual(["A"]);
    expect(withLocked({ theme: ["C", "D"] }, { theme: "A" }).theme).toEqual(["A"]);
  });

  it("leaves the facets the page does not lock", () => {
    expect(withLocked({ theme: ["C"], stage: ["P4-P6"], q: "植物" }, { theme: "A" })).toEqual({
      theme: ["A"],
      stage: ["P4-P6"],
      q: "植物",
    });
  });

  it("is a no-op for a page that locks nothing", () => {
    expect(withLocked({ theme: ["C"] }, {})).toEqual({ theme: ["C"] });
  });
});

describe("pageCount / clampPage", () => {
  it("counts pages, rounding up, and never reports zero", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(1)).toBe(1);
    expect(pageCount(PAGE_SIZE)).toBe(1);
    expect(pageCount(PAGE_SIZE + 1)).toBe(2);
    expect(pageCount(14)).toBe(2);
    expect(pageCount(25, 5)).toBe(5);
  });

  it("clamps a page number into range", () => {
    expect(clampPage(0, 14)).toBe(1);
    expect(clampPage(-3, 14)).toBe(1);
    expect(clampPage(2, 14)).toBe(2);
    expect(clampPage(99, 14)).toBe(2);
    expect(clampPage(Number.NaN, 14)).toBe(1);
    expect(clampPage(1.9, 14)).toBe(1);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 14 }, (_, i) => i + 1);

  it("slices the first page and reports 1-based bounds", () => {
    const page = paginate(items, 1);
    expect(page.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(page).toMatchObject({ page: 1, pages: 2, from: 1, to: 10, total: 14 });
  });

  it("slices a short last page", () => {
    const page = paginate(items, 2);
    expect(page.items).toEqual([11, 12, 13, 14]);
    expect(page).toMatchObject({ page: 2, pages: 2, from: 11, to: 14 });
  });

  it("clamps an out-of-range page instead of returning nothing", () => {
    const page = paginate(items, 9);
    expect(page.page).toBe(2);
    expect(page.items.length).toBe(4);
  });

  it("handles an empty catalogue without claiming a range", () => {
    expect(paginate([], 3)).toMatchObject({ page: 1, pages: 1, from: 0, to: 0, total: 0, items: [] });
  });
});

describe("filterOptions", () => {
  it("offers each value once, sorted, with nothing blank", () => {
    const items = [
      item({ theme: "D", stage: "P4-P6", subject: "科學" }),
      item({ theme: "A", stage: "P4-P6", subject: "科學" }),
      item({ theme: "D", stage: "S1-S3", subject: "" }),
    ];
    const options = filterOptions(items);
    expect(options.themes).toEqual(["A", "D"]);
    expect(options.stages).toEqual(["P4-P6", "S1-S3"]);
    expect(options.subjects).toEqual(["科學"]);
  });

  it("offers nothing for an empty catalogue", () => {
    expect(filterOptions([])).toEqual({ themes: [], stages: [], subjects: [] });
  });
});

describe("URL state", () => {
  it("reads a facet selected twice as a two-tag group", () => {
    const state = readState("?theme=A&theme=D&stage=P4-P6");
    expect(state.filters.theme).toEqual(["A", "D"]);
    expect(state.filters.stage).toEqual(["P4-P6"]);
    expect(state.filters.subject).toBeUndefined();
  });

  it("also accepts a comma-separated facet, for a hand-written link", () => {
    expect(readState("?theme=A,D").filters.theme).toEqual(["A", "D"]);
    expect(readState("?theme=A,A").filters.theme).toEqual(["A"]);
  });

  it("reads the keyword and the page", () => {
    const state = readState(`?q=${encodeURIComponent("植物")}&page=2`);
    expect(state.filters.q).toBe("植物");
    expect(state.page).toBe(2);
  });

  it("falls back to the page's defaults when a parameter is absent or blank", () => {
    const state = readState("?stage=", { theme: ["A"], stage: ["P4-P6"] });
    expect(state.filters.theme).toEqual(["A"]); // absent → default
    expect(state.filters.stage).toEqual(["P4-P6"]); // blank → default
    expect(state.page).toBe(1);
  });

  it("ignores a nonsense page number", () => {
    expect(readState("?page=abc").page).toBe(1);
    expect(readState("?page=-2").page).toBe(1);
  });

  it("writes only what is selected, and the page only when it matters", () => {
    expect(writeState({ filters: {}, page: 1 })).toBe("");
    expect(writeState({ filters: { theme: ["A"] }, page: 1 })).toBe("theme=A");
    expect(writeState({ filters: { theme: ["A", "D"] }, page: 3 })).toBe("theme=A&theme=D&page=3");
    expect(writeState({ filters: { stage: ["  "] }, page: 1 })).toBe("");
  });

  it("round-trips through a query string", () => {
    const state = {
      filters: { theme: ["A", "D"], stage: ["P4-P6"], subject: ["科學"], q: "植物" },
      page: 4,
    };
    const back = readState(writeState(state));
    expect(back.filters).toEqual(state.filters);
    expect(back.page).toBe(4);
  });
});
