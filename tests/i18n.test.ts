import { describe, it, expect } from "vitest";
import {
  LOCALES,
  DEFAULT_LOCALE,
  LANGUAGE_LABELS,
  UI,
  THEME_LABELS,
  t,
  localeOf,
  localizePath,
  alternatePath,
  alternateLinks,
  resourcesPath,
  resourceIndexPath,
  themeLabel,
  themeNavLabel,
  AUDIENCE_LABELS,
  audienceImagePath,
  audienceLabel,
  audiencePath,
  type Locale,
  type UIKey,
} from "../src/lib/i18n";
import { AUDIENCES, THEMES } from "../src/lib/schema";

/**
 * The site shows exactly ONE language per page. These tests pin the rules that
 * make that true: every locale carries the same keys, no locale leaks the
 * other's script, and the language switch always maps a path onto its sibling
 * path (never onto a 404).
 */

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

describe("locales", () => {
  it("defaults to Traditional Chinese", () => {
    expect(DEFAULT_LOCALE).toBe("zh-HK");
    expect(LOCALES[0]).toBe(DEFAULT_LOCALE);
    expect([...LOCALES].sort()).toEqual(["en", "zh-HK"]);
  });

  it("labels each language in its own language", () => {
    expect(LANGUAGE_LABELS["zh-HK"]).toBe("中文");
    expect(LANGUAGE_LABELS.en).toBe("English");
  });
});

describe("UI strings", () => {
  it("has the same keys in every locale", () => {
    const keys = Object.keys(UI[DEFAULT_LOCALE]).sort();
    expect(keys.length).toBeGreaterThan(0);
    for (const locale of LOCALES) {
      expect(Object.keys(UI[locale]).sort(), locale).toEqual(keys);
    }
  });

  it("has no empty strings", () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(UI[locale])) {
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("never reuses the same text for both languages", () => {
    const keys = Object.keys(UI["zh-HK"]) as UIKey[];
    for (const key of keys) {
      expect(UI.en[key], key).not.toBe(UI["zh-HK"][key]);
    }
  });

  it("writes Traditional Chinese in Chinese characters", () => {
    for (const [key, value] of Object.entries(UI["zh-HK"])) {
      expect(CJK.test(value), key).toBe(true);
    }
  });

  it("keeps Chinese characters out of the English strings", () => {
    for (const [key, value] of Object.entries(UI.en)) {
      expect(CJK.test(value), key).toBe(false);
    }
  });

  it("looks keys up per locale", () => {
    expect(t("zh-HK", "navAbout")).toBe(UI["zh-HK"].navAbout);
    expect(t("en", "navAbout")).toBe(UI.en.navAbout);
    // @ts-expect-error unknown locales are not addressable
    expect(() => t("fr", "navAbout")).toThrow();
  });
});

describe("theme labels", () => {
  it("covers all five themes in one language each", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(THEME_LABELS[locale]).sort()).toEqual(["A", "B", "C", "D", "E"]);
    }
  });

  it("keeps the scripts separate", () => {
    for (const [key, label] of Object.entries(THEME_LABELS["zh-HK"])) {
      expect(CJK.test(label), key).toBe(true);
    }
    for (const [key, label] of Object.entries(THEME_LABELS.en)) {
      expect(CJK.test(label), key).toBe(false);
    }
  });
});

describe("the navigation's labels and character budget", () => {
  /*
   * The bar is one row inside a 54rem content column, so its labels are on a
   * measured budget. Until 2026-10-11 the bar carried the five themes as flat
   * items; they now sit inside the 主題 disclosure group and the three audiences
   * inside 對象 (Billy asked for that on 2026-10-11, reversing his earlier
   * "make them top-level" call once the row had to hold both groups). So the six
   * top-level labels are short by design, and what has to stay in budget are the
   * PANEL labels: a panel is nowrap, so a label wider than the viewport is a
   * menu nobody can read.
   *
   * Pixel widths cannot be asserted from here, so this holds the budget that
   * produced them — the six English top-level items measure 45 characters, and
   * the nav's type size is 0.9rem.
   */
  const topLevel = (locale: Locale) => [
    t(locale, "navHome"),
    t(locale, "navResources"),
    t(locale, "navThemes"),
    t(locale, "navAudiences"),
    t(locale, "navAbout"),
    t(locale, "navFeedback"),
  ];

  it("gives every theme and every audience a label in every language", () => {
    for (const locale of LOCALES) {
      for (const theme of THEMES) {
        expect(themeNavLabel(locale, theme).trim().length, `${locale}/${theme}`).toBeGreaterThan(0);
      }
      for (const audience of AUDIENCES) {
        expect(audienceLabel(locale, audience).trim().length, `${locale}/${audience}`).toBeGreaterThan(
          0,
        );
      }
    }
  });

  it("never lets an English nav label be longer than the full label", () => {
    for (const theme of THEMES) {
      expect(themeNavLabel("en", theme).length, theme).toBeLessThanOrEqual(themeLabel("en", theme).length);
    }
  });

  it("keeps the six top-level items inside the row's character budget", () => {
    // The Chinese budget rose from 20 to 30 on 2026-10-11: Billy asked for 關於 to
    // read 關於 Beets AI in the menu ("change 關於 in the site menu to 關於 Beets AI"),
    // which is +9 characters. Measured after the change: the six labels still fit
    // one line with room to spare (see site-chrome.md for the probe).
    expect(topLevel("en").join("").length).toBeLessThanOrEqual(60);
    expect(topLevel("zh-HK").join("").length).toBeLessThanOrEqual(30);
  });

  it("keeps the dropdown labels short enough to sit in a panel", () => {
    // 20 characters is roughly 150px at this size, i.e. the panel's own width.
    for (const theme of THEMES) {
      expect(themeNavLabel("en", theme).length, theme).toBeLessThanOrEqual(20);
    }
    for (const audience of AUDIENCES) {
      expect(audienceLabel("en", audience).length, audience).toBeLessThanOrEqual(20);
    }
  });

  it("uses the theme's full label in Chinese, where it already fits", () => {
    for (const theme of THEMES) {
      expect(themeNavLabel("zh-HK", theme)).toBe(themeLabel("zh-HK", theme));
    }
  });

  it("names the two disclosure groups", () => {
    // The 主題 and 對象 triggers, i.e. the labels a reader has to understand
    // before they can find the five themes or the three audiences at all.
    for (const locale of LOCALES) {
      expect(t(locale, "navThemes").trim().length, locale).toBeGreaterThan(0);
      expect(t(locale, "navAudiences").trim().length, locale).toBeGreaterThan(0);
      expect(CJK.test(t(locale, "navThemes")), locale).toBe(locale === "zh-HK");
    }
  });
});

describe("audience labels and routes", () => {
  it("labels all three audiences in every language, each in its own script", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(AUDIENCE_LABELS[locale]).sort()).toEqual([...AUDIENCES].sort());
    }
    for (const audience of AUDIENCES) {
      expect(CJK.test(audienceLabel("zh-HK", audience)), audience).toBe(true);
      expect(CJK.test(audienceLabel("en", audience)), audience).toBe(false);
    }
  });

  it("routes each audience to its own index page, in each language", () => {
    expect(audiencePath("zh-HK", "teachers")).toBe("/by-audience/teachers/");
    expect(audiencePath("zh-HK", "students")).toBe("/by-audience/students/");
    expect(audiencePath("en", "parents")).toBe("/en/by-audience/parents/");
  });

  it("points an audience card at that audience's own illustration", () => {
    // The card a visitor clicks and the page they land on show one picture.
    expect(audienceImagePath("teachers")).toBe("/images/home-aud-teachers.webp");
    expect(audienceImagePath("students")).toBe("/images/home-aud-students.webp");
  });
});

describe("localeOf", () => {
  it("reads the locale out of a path", () => {
    expect(localeOf("/")).toBe("zh-HK");
    expect(localeOf("/about/")).toBe("zh-HK");
    expect(localeOf("/en/")).toBe("en");
    expect(localeOf("/en")).toBe("en");
    expect(localeOf("/en/about/")).toBe("en");
    expect(localeOf("/en/resources/foo/")).toBe("en");
  });

  it("does not treat a path that merely starts with 'en' as English", () => {
    expect(localeOf("/english/")).toBe("zh-HK");
    expect(localeOf("/energy-saving/")).toBe("zh-HK");
  });
});

describe("localizePath", () => {
  it("leaves the default locale at the root", () => {
    expect(localizePath("/", "zh-HK")).toBe("/");
    expect(localizePath("/about/", "zh-HK")).toBe("/about/");
    expect(localizePath("/en/about/", "zh-HK")).toBe("/about/");
    expect(localizePath("/en/", "zh-HK")).toBe("/");
  });

  it("prefixes the non-default locale", () => {
    expect(localizePath("/", "en")).toBe("/en/");
    expect(localizePath("/about/", "en")).toBe("/en/about/");
    expect(localizePath("/resources/", "en")).toBe("/en/resources/");
    expect(localizePath("/resources/some-slug/", "en")).toBe("/en/resources/some-slug/");
  });

  it("is idempotent", () => {
    for (const path of ["/", "/about/", "/resources/", "/resources/foo/"]) {
      for (const locale of LOCALES) {
        const once = localizePath(path, locale);
        expect(localizePath(once, locale), `${path} -> ${locale}`).toBe(once);
      }
    }
  });

  it("tolerates a missing trailing slash", () => {
    expect(localizePath("/about", "en")).toBe("/en/about/");
    expect(localizePath("/en/about", "zh-HK")).toBe("/about/");
  });

  it("never lets a non-English path be treated as English", () => {
    expect(localizePath("/english/", "en")).toBe("/en/english/");
    expect(localizePath("/en/english/", "zh-HK")).toBe("/english/");
  });
});

describe("language switching", () => {
  it("maps a path onto its counterpart", () => {
    expect(alternatePath("/")).toBe("/en/");
    expect(alternatePath("/en/")).toBe("/");
    expect(alternatePath("/about/")).toBe("/en/about/");
    expect(alternatePath("/en/resources/foo/")).toBe("/resources/foo/");
  });

  it("emits hreflang alternates with x-default pointing at Traditional Chinese", () => {
    const links = alternateLinks("/about/");
    expect(links).toEqual([
      { hreflang: "zh-HK", href: "/about/" },
      { hreflang: "en", href: "/en/about/" },
      { hreflang: "x-default", href: "/about/" },
    ]);
  });
});

describe("resource paths", () => {
  it("addresses the resource section per locale", () => {
    expect(resourceIndexPath("zh-HK")).toBe("/resources/");
    expect(resourceIndexPath("en")).toBe("/en/resources/");
    expect(resourcesPath("zh-HK", "my-slug")).toBe("/resources/my-slug/");
    expect(resourcesPath("en", "my-slug")).toBe("/en/resources/my-slug/");
  });
});
