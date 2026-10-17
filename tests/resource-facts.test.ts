import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pageFacts, parseDocuments, parseStrand } from "../src/lib/resource-facts";

/**
 * The five lines at the top of every resource page (Henry, 2026-10-17):
 * 學習階段 · 科目 · 學習範疇 · 對應官方文件 · 一節時間.
 *
 * The reason it exists is in the request: *「今日抽樣五頁，四頁開頭 300 字無任何
 * 官方字眼 —— 老師第一屏判斷不到是否教材」*. So the test walks the whole library
 * rather than one sample page: a page whose 官方文件參考 section does not yield a
 * strand or at least one document title would render a block with a silent hole
 * in it, and nothing else in the build would notice.
 *
 * The two parsed values are read from that section on purpose — a hand-typed
 * second copy in the frontmatter is exactly what drifts (see the module header).
 */

const CONTENT = resolve(import.meta.dirname, "..", "src/content/resources");

function pages(): { id: string; lang: "zh-HK" | "en"; body: string }[] {
  const out: { id: string; lang: "zh-HK" | "en"; body: string }[] = [];
  for (const [dir, lang] of [
    [CONTENT, "zh-HK"],
    [join(CONTENT, "en"), "en"],
  ] as const) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".md")) continue;
      const text = readFileSync(join(dir, name), "utf8");
      out.push({ id: `${lang}/${name}`, lang, body: text.replace(/^---[\s\S]*?\n---/, "") });
    }
  }
  return out;
}

const ALL = pages();

describe("the five facts at the top of a page", () => {
  it("finds a learning strand on every page, in both editions", () => {
    const missing = ALL.filter((page) => !parseStrand(page.body, page.lang)).map((page) => page.id);
    expect(missing).toEqual([]);
  });

  it("finds at least one official document on every page", () => {
    const missing = ALL.filter((page) => parseDocuments(page.body, page.lang).length === 0).map(
      (page) => page.id,
    );
    expect(missing).toEqual([]);
  });

  it("never prints an internal document code where a title belongs", () => {
    // "E, p.6" is our shorthand for the reviewer; the reader gets the title.
    for (const page of ALL) {
      for (const title of parseDocuments(page.body, page.lang)) {
        expect(title, page.id).not.toMatch(/^[BFGE]\s*,\s*p\./);
        expect(title, page.id).not.toMatch(/^《?[BFGE]》?$/);
      }
    }
  });

  it("drops the supplement numbering, keeps the published title", () => {
    const zh = "本資源對應：\n\n- **附篇二：《中小學應用人工智能教學指南》**（p.2-3）：說明。\n";
    const en = "This resource maps to:\n\n- **Supplement II: Guide to Using AI in Teaching** (p.2-3): detail.\n";
    expect(parseDocuments(zh, "zh-HK")).toEqual(["《中小學應用人工智能教學指南》"]);
    expect(parseDocuments(en, "en")).toEqual(["Guide to Using AI in Teaching"]);
  });

  it("keeps a document cited twice on different pages only once", () => {
    const body =
      "本資源對應：\n\n- **《中小學應用人工智能教學指南》**（p.2-3）：甲。\n- **《中小學應用人工智能教學指南》**（pp.2-5 及 2-7）：乙。\n";
    expect(parseDocuments(body, "zh-HK")).toEqual(["《中小學應用人工智能教學指南》"]);
  });

  it("stops at the end of the bullet list, so body prose is never collected", () => {
    const body =
      "本資源對應：\n\n- **《中小學數字教育發展藍圖》**（三摺頁，p.2）：甲。\n\n**學習範疇**：應用人工智能的反思\n\n這是一段正文。\n";
    expect(parseDocuments(body, "zh-HK")).toEqual(["《中小學數字教育發展藍圖》"]);
    expect(parseStrand(body, "zh-HK")).toBe("應用人工智能的反思");
  });

  it("assembles all five from the entry and its body", () => {
    const facts = pageFacts(
      { stage: "P4", subject: "數學 / Mathematics", prepTime: "1 節（60 分鐘）" },
      "本資源對應：\n\n- **《中小學人工智能素養學習架構（應用場景示例）》**（p.6）：示例。\n\n**學習範疇**：應用人工智能的反思\n",
      "zh-HK",
    );
    expect(facts).toEqual({
      stage: "P4",
      subject: "數學 / Mathematics",
      strand: "應用人工智能的反思",
      documents: ["《中小學人工智能素養學習架構（應用場景示例）》"],
      time: "1 節（60 分鐘）",
    });
  });
});
