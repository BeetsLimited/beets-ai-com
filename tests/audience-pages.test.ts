import { describe, it, expect } from "vitest";
import { AUDIENCE_PAGES, audiencePageCopy } from "../src/lib/audience-pages";
import { AUDIENCE_INFO, LOCALES } from "../src/lib/i18n";
import { AUDIENCES } from "../src/lib/schema";

/**
 * The audience pages' written copy (對象).
 *
 * The three audience pages are built like the theme pages, and this is the same
 * kind of gate: whenever an audience's copy exists it must be complete in both
 * languages and good enough to publish, because it goes on a public page AND
 * into FAQ structured data that an answer engine will quote.
 *
 * `AUDIENCE_PAGES` stays PARTIAL and `AudiencePageView` still renders an audience
 * with no copy (heading, sub-title, hero and the locked catalogue, minus the
 * description and FAQs), so a fourth audience or a new language degrades instead
 * of breaking the build. As of 2026-10-11 all three audiences are written in both
 * languages, and the last test here holds that.
 */

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

const written = LOCALES.flatMap((locale) =>
  AUDIENCES.filter((audience) => audiencePageCopy(locale, audience)).map((audience) => ({
    locale,
    audience,
    copy: audiencePageCopy(locale, audience)!,
  })),
);

describe("audience page copy", () => {
  it("has something written to check", () => {
    expect(written.length).toBeGreaterThan(0);
  });

  it("writes every audience's copy in EVERY language, or in none", () => {
    // A description in one language and not the other would leave one edition of
    // the page visibly thinner than its counterpart.
    for (const audience of AUDIENCES) {
      const langs = LOCALES.filter((locale) => audiencePageCopy(locale, audience));
      expect(langs.length === 0 || langs.length === LOCALES.length, audience).toBe(true);
    }
  });

  it("gives each written audience at least three substantial paragraphs", () => {
    for (const { locale, audience, copy } of written) {
      expect(copy.intro.length, `${locale}/${audience}`).toBeGreaterThanOrEqual(3);
      for (const paragraph of copy.intro) {
        expect(paragraph.trim().length, `${locale}/${audience} paragraph`).toBeGreaterThan(80);
      }
    }
  });

  it("answers four or five questions per audience", () => {
    for (const { locale, audience, copy } of written) {
      expect(copy.faqs.length, `${locale}/${audience}`).toBeGreaterThanOrEqual(4);
      expect(copy.faqs.length, `${locale}/${audience}`).toBeLessThanOrEqual(5);
    }
  });

  it("writes each FAQ as a real question with a real answer", () => {
    for (const { locale, audience, copy } of written) {
      for (const faq of copy.faqs) {
        const where = `${locale}/${audience}: ${faq.question.slice(0, 24)}`;
        expect(faq.question.trim().length, where).toBeGreaterThan(8);
        expect(faq.answer.trim().length, where).toBeGreaterThan(40);
        // A question mark is what makes it a question for a FAQ rich result.
        expect(/[?？]$/.test(faq.question.trim()), where).toBe(true);
      }
    }
  });

  it("keeps the questions distinct within an audience", () => {
    for (const { locale, audience, copy } of written) {
      const questions = copy.faqs.map((faq) => faq.question.trim());
      expect(new Set(questions).size, `${locale}/${audience}`).toBe(questions.length);
    }
  });

  it("keeps each language in its own script", () => {
    // The single-language gate checks the built page; this catches it at the
    // source, where the fix is obvious.
    for (const { locale, audience, copy } of written) {
      const text = [...copy.intro, ...copy.faqs.flatMap((faq) => [faq.question, faq.answer])].join(" ");
      if (locale === "zh-HK") expect(CJK.test(text), `${locale}/${audience}`).toBe(true);
      else expect(CJK.test(text), `${locale}/${audience}`).toBe(false);
    }
  });

  it("names the official documents by their published titles", () => {
    // Both languages must use EDB's own title, never a translation and never a
    // paraphrase. Checked on the teachers' page, which carries the full framing.
    const zh = audiencePageCopy("zh-HK", "teachers")!;
    const en = audiencePageCopy("en", "teachers")!;
    const zhText = zh.intro.join(" ") + zh.faqs.map((f) => f.answer).join(" ");
    const enText = en.intro.join(" ") + en.faqs.map((f) => f.answer).join(" ");
    expect(zhText).toContain("《中小學人工智能素養學習架構》");
    expect(zhText).toContain("《中小學數字教育發展藍圖》");
    expect(enText).toContain("AI Literacy Learning Framework for Primary and Secondary Schools");
    expect(enText).toContain(
      "Blueprint for Digital Education Development in Primary and Secondary Schools",
    );
  });

  it("says it is an independent initiative, not an official publication", () => {
    // The claim that keeps the site honest about what it is — on EVERY audience
    // page, because each one is a page a reader may land on first.
    for (const { locale, audience, copy } of written) {
      const text = copy.faqs.map((faq) => faq.answer).join(" ");
      if (locale === "zh-HK") {
        expect(text, audience).toContain("並非教育局官方文件");
      } else {
        expect(text, audience).toContain("not an official EDB publication");
      }
    }
  });
});

describe("audiencePageCopy", () => {
  it("has copy for every audience, in every language the site publishes", () => {
    // The map stays PARTIAL and the view still degrades gracefully, but as of
    // 2026-10-11 all three audiences are written. A fourth audience must arrive
    // with its copy, or this fails and says so.
    for (const locale of LOCALES) {
      for (const audience of AUDIENCES) {
        expect(audiencePageCopy(locale, audience), `${locale}/${audience}`).toBeDefined();
      }
    }
  });

  it("returns the copy for an audience that has it, per language", () => {
    expect(audiencePageCopy("zh-HK", "teachers")).toBe(AUDIENCE_PAGES["zh-HK"].teachers);
    expect(audiencePageCopy("en", "parents")).toBe(AUDIENCE_PAGES.en.parents);
  });
});

describe("audience page headings", () => {
  it("gives every audience a heading of its own, in every language", () => {
    // The heading is the page's h1 and the breadcrumb. It cannot just be the
    // audience's name: 教師 alone says nothing about what is behind it.
    for (const locale of LOCALES) {
      const seen = new Set<string>();
      for (const audience of AUDIENCES) {
        const heading = AUDIENCE_INFO[locale][audience].heading;
        expect(heading.trim().length, `${locale}/${audience}`).toBeGreaterThan(4);
        expect(seen.has(heading), `${locale}/${audience}`).toBe(false);
        seen.add(heading);
        if (locale === "zh-HK") expect(CJK.test(heading)).toBe(true);
        else expect(CJK.test(heading)).toBe(false);
      }
    }
  });
});
