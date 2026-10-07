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
  type UIKey,
} from "../src/lib/i18n";

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
