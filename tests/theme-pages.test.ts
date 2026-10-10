import { describe, it, expect } from "vitest";
import { THEME_PAGES, themePageCopy } from "../src/lib/theme-pages";
import { LOCALES } from "../src/lib/i18n";
import { THEMES } from "../src/lib/schema";

/**
 * The theme pages' written copy. Four of the five themes are not written yet by
 * design, so these tests pin the SHAPE rather than a count of pages: whenever a
 * theme's copy exists, it must be complete in both languages and good enough to
 * publish — because it goes on a public page and into FAQ structured data.
 */

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

const written = LOCALES.flatMap((locale) =>
  THEMES.filter((theme) => themePageCopy(locale, theme)).map((theme) => ({
    locale,
    theme,
    copy: themePageCopy(locale, theme)!,
  })),
);

describe("theme page copy", () => {
  it("has something written to check", () => {
    expect(written.length).toBeGreaterThan(0);
  });

  it("writes every theme's copy in EVERY language, or in none", () => {
    // A description in one language and not the other would leave one edition
    // of the page visibly thinner than its counterpart.
    for (const theme of THEMES) {
      const langs = LOCALES.filter((locale) => themePageCopy(locale, theme));
      expect(langs.length === 0 || langs.length === LOCALES.length, theme).toBe(true);
    }
  });

  it("gives each written theme at least three substantial paragraphs", () => {
    for (const { locale, theme, copy } of written) {
      expect(copy.intro.length, `${locale}/${theme}`).toBeGreaterThanOrEqual(3);
      for (const paragraph of copy.intro) {
        expect(paragraph.trim().length, `${locale}/${theme} paragraph`).toBeGreaterThan(80);
      }
    }
  });

  it("answers four or five questions per theme", () => {
    for (const { locale, theme, copy } of written) {
      expect(copy.faqs.length, `${locale}/${theme}`).toBeGreaterThanOrEqual(4);
      expect(copy.faqs.length, `${locale}/${theme}`).toBeLessThanOrEqual(5);
    }
  });

  it("writes each FAQ as a real question with a real answer", () => {
    for (const { locale, theme, copy } of written) {
      for (const faq of copy.faqs) {
        const where = `${locale}/${theme}: ${faq.question.slice(0, 24)}`;
        expect(faq.question.trim().length, where).toBeGreaterThan(8);
        expect(faq.answer.trim().length, where).toBeGreaterThan(40);
        // A question mark is what makes it a question for a FAQ rich result.
        expect(/[?？]$/.test(faq.question.trim()), where).toBe(true);
      }
    }
  });

  it("keeps the questions distinct within a theme", () => {
    for (const { locale, theme, copy } of written) {
      const questions = copy.faqs.map((faq) => faq.question.trim());
      expect(new Set(questions).size, `${locale}/${theme}`).toBe(questions.length);
    }
  });

  it("keeps each language in its own script", () => {
    // The single-language gate checks the built page; this catches it at the
    // source, where the fix is obvious.
    for (const { locale, theme, copy } of written) {
      const text = [...copy.intro, ...copy.faqs.flatMap((faq) => [faq.question, faq.answer])].join(" ");
      if (locale === "zh-HK") expect(CJK.test(text), `${locale}/${theme}`).toBe(true);
      else expect(CJK.test(text), `${locale}/${theme}`).toBe(false);
    }
  });

  it("names the official documents by their published titles", () => {
    // Both documents have an official English title as well as a Chinese one, so
    // neither language may fall back to the 《》 form or to a paraphrase.
    const zh = themePageCopy("zh-HK", "A")!;
    const en = themePageCopy("en", "A")!;
    const zhText = zh.intro.join(" ") + zh.faqs.map((f) => f.answer).join(" ");
    const enText = en.intro.join(" ") + en.faqs.map((f) => f.answer).join(" ");
    expect(zhText).toContain("《中小學數字教育發展藍圖》");
    expect(zhText).toContain("《中小學人工智能素養學習架構》");
    expect(enText).toContain("Blueprint for Digital Education Development in Primary and Secondary Schools");
    expect(enText).toContain("AI Literacy Learning Framework for Primary and Secondary Schools");
  });

  it("says it is an independent initiative, not an official publication", () => {
    // The claim that keeps the site honest about what it is.
    const en = themePageCopy("en", "A")!;
    expect(en.faqs.map((f) => f.answer).join(" ")).toContain("not an official EDB publication");
    const zh = themePageCopy("zh-HK", "A")!;
    expect(zh.faqs.map((f) => f.answer).join(" ")).toContain("並非教育局官方文件");
  });
});

describe("themePageCopy", () => {
  it("returns undefined for a theme with no copy yet", () => {
    expect(themePageCopy("zh-HK", "C")).toBeUndefined();
  });

  it("returns the copy for a theme that has it, per language", () => {
    expect(themePageCopy("zh-HK", "A")).toBe(THEME_PAGES["zh-HK"].A);
    expect(themePageCopy("en", "A")).toBe(THEME_PAGES.en.A);
  });
});
