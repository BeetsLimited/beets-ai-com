import { THEMES, type Theme } from "./schema";

/**
 * Single-language i18n for beets-ai.com.
 *
 * The site used to print both languages on every page. It now shows exactly one
 * language at a time, chosen by the reader:
 *
 *   /…            Traditional Chinese (the default, at the root)
 *   /en/…         English
 *
 * The default locale lives at the root rather than behind a `/zh-HK/` prefix so
 * the URLs teachers already have keep working, and so the brand's first
 * language is the one Google indexes for the bare domain. `<link rel="alternate"
 * hreflang>` ties the two editions together, with `x-default` on Traditional
 * Chinese.
 *
 * Language is resolved at build time: every page renders one language only, so
 * the built HTML contains no trace of the other. A build gate
 * (`scripts/check-language.mjs`) enforces that.
 */

export const LOCALES = ["zh-HK", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** Traditional Chinese first — Billy, and the whole point of the site. */
export const DEFAULT_LOCALE: Locale = "zh-HK";

/** The non-default locale, i.e. where the language switch sends a zh-HK reader. */
export const SECONDARY_LOCALE: Locale = "en";

/** A language names itself: a reader hunting for their own language scans for it. */
export const LANGUAGE_LABELS: Record<Locale, string> = {
  "zh-HK": "中文",
  en: "English",
};

/** `<html lang>` / `hreflang` value for each locale. */
export const HTML_LANG: Record<Locale, string> = {
  "zh-HK": "zh-HK",
  en: "en",
};

const ZH_HK = {
  skip: "跳至內容",
  navResources: "免費資源",
  navAbout: "關於",
  langGroup: "語言",
  switchAria: "切換至英文版",

  footerDisclaimer:
    "獨立資源計劃，並非 EDB 官方文件。資源經教育工作者審閱、核實來源，並自動檢查連結。",

  homeTitle: "香港教師 AI 課堂實用資源",
  homeDescription:
    "香港教師 AI 課堂實用資源：按學科、級別和具體教學需要，免費取得可編輯工作紙、教案及校本規劃範例。",
  homeLede:
    "按學科、級別和具體教學需要，免費取得可編輯的工作紙、教案及校本規劃範例。下載不需註冊。",
  homeEmptyTitle: "資源陸續上線。",
  homeEmptyBody: "首批資源正在審閱中，通過事實核實及教育工作者審閱後便會發佈。",
  homeEmptyCta: "了解編輯流程",

  resourcesTitle: "免費資源",
  resourcesDescription:
    "免費下載經教育工作者審閱的香港 AI 教學資源，按主題、學科和級別分類。",
  resourcesLede:
    "按主題、學科和級別，免費下載可編輯的工作紙、教案及校本規劃範例。全部資源經教育工作者審閱。",
  resourcesEmpty: "資源陸續上線，請稍後再來。首批資源正在審閱中。",

  labelTheme: "主題",
  labelOriginalIdea: "原始構思",
  labelPrep: "準備時間",
  labelEquipment: "所需器材",
  labelVersion: "版本",
  labelReviewer: "審閱",
  labelFactCheck: "事實核實",
  downloadsHeading: "下載",
  downloadsPending: "檔案準備中。",
  downloadNote: "（可列印，繁體中文版）",
  edbHeading: "與 EDB 框架的關係",
  edbOfficialDoc: "官方文件：",
  debpLinkText: "EDB 數字教育藍圖",
  feedbackHeading: "意見",
  feedbackBody: "你用過這份資源嗎？歡迎告訴我們需要改善的地方，或建議下一份資源。",
} as const;

export type UIKey = keyof typeof ZH_HK;

const EN: Record<UIKey, string> = {
  skip: "Skip to content",
  navResources: "Free resources",
  navAbout: "About",
  langGroup: "Language",
  switchAria: "Switch to the Traditional Chinese version",

  footerDisclaimer:
    "An independent resource initiative — not an official EDB publication. Materials are educator-reviewed, fact-checked and link-checked.",

  homeTitle: "Practical AI classroom resources for Hong Kong teachers",
  homeDescription:
    "Free, educator-reviewed Hong Kong AI teaching resources — by subject, learning stage and specific classroom task.",
  homeLede:
    "Download editable worksheets, lesson plans and school-planning examples by subject, stage and classroom task. No registration.",
  homeEmptyTitle: "Resources are on the way.",
  homeEmptyBody:
    "The first batch is in review — fact-check, educator sign-off and link checking, then it goes live.",
  homeEmptyCta: "How we review",

  resourcesTitle: "Free resources",
  resourcesDescription:
    "Free, educator-reviewed Hong Kong AI teaching resources, organised by theme, subject and learning stage.",
  resourcesLede:
    "Download editable worksheets, lesson plans and school-planning examples by theme, subject and stage. Every resource is educator-reviewed.",
  resourcesEmpty: "Resources are being published — the first batch is in review.",

  labelTheme: "Theme",
  labelOriginalIdea: "Original idea",
  labelPrep: "Preparation",
  labelEquipment: "Equipment",
  labelVersion: "Version",
  labelReviewer: "Reviewer",
  labelFactCheck: "Fact-checked by",
  downloadsHeading: "Downloads",
  downloadsPending: "Files are being prepared.",
  downloadNote: "(Printable, Traditional Chinese edition)",
  edbHeading: "How this relates to the EDB framework",
  edbOfficialDoc: "Official document:",
  debpLinkText: "EDB Digital Education Blueprint",
  feedbackHeading: "Feedback",
  feedbackBody:
    "Have you used this resource? Tell us what needs improving, or suggest the next one.",
};

export const UI: Record<Locale, Record<UIKey, string>> = {
  "zh-HK": ZH_HK,
  en: EN,
};

/** Look up a UI string. Throws on an unknown key or locale — never render blank. */
export function t(locale: Locale, key: UIKey): string {
  const dict = UI[locale] as Record<string, string> | undefined;
  if (!dict) throw new Error(`i18n: unknown locale "${locale}"`);
  const value = dict[key];
  if (value === undefined) throw new Error(`i18n: missing key "${key}" for "${locale}"`);
  return value;
}

/** Theme labels are UI, so they are localised like everything else. */
export const THEME_LABELS: Record<Locale, Record<Theme, string>> = {
  "zh-HK": {
    A: "校本 AI 教育規劃",
    B: "安全及負責任使用 AI",
    C: "看見學生思考",
    D: "用 AI 探究香港",
    E: "共融 AI 課堂",
  },
  en: {
    A: "School planning",
    B: "Responsible AI use",
    C: "Student thinking",
    D: "Hong Kong inquiry",
    E: "First & inclusive lessons",
  },
};

export function themeLabel(locale: Locale, theme: string): string {
  const dict = THEME_LABELS[locale] as Record<string, string>;
  return dict[theme] ?? theme;
}

/** All five themes, keyed, in the given language. */
export function themesInOrder(locale: Locale): { key: Theme; label: string }[] {
  return THEMES.map((key) => ({ key, label: themeLabel(locale, key) }));
}

// ── Paths ──────────────────────────────────────────────────────────────────
// The English edition lives under `/en/`; the default locale owns everything
// else. `/en` and `/en/…` are English — `/english/…` is not.

function stripLocale(path: string): string {
  let clean = path.trim() || "/";
  if (!clean.startsWith("/")) clean = `/${clean}`;
  if (clean === "/en") return "/";
  if (clean.startsWith("/en/")) return clean.slice(3);
  return clean;
}

function withTrailingSlash(path: string): string {
  if (path === "" || path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function localeOf(path: string): Locale {
  const clean = path.trim();
  return clean === "/en" || clean.startsWith("/en/") ? "en" : DEFAULT_LOCALE;
}

export function otherLocale(locale: Locale): Locale {
  return locale === DEFAULT_LOCALE ? SECONDARY_LOCALE : DEFAULT_LOCALE;
}

/** Prefix (or strip) the locale segment of a site path. Idempotent. */
export function localizePath(path: string, locale: Locale): string {
  const bare = withTrailingSlash(stripLocale(path));
  if (locale === DEFAULT_LOCALE) return bare;
  return bare === "/" ? `/${locale}/` : `/${locale}${bare}`;
}

/** The same page in the other language. */
export function alternatePath(path: string): string {
  return localizePath(path, otherLocale(localeOf(path)));
}

/** `hreflang` links for `<head>`: both editions plus `x-default` → zh-HK. */
export function alternateLinks(path: string): { hreflang: string; href: string }[] {
  const zhHk = localizePath(path, DEFAULT_LOCALE);
  return [
    { hreflang: HTML_LANG[DEFAULT_LOCALE], href: zhHk },
    { hreflang: HTML_LANG[SECONDARY_LOCALE], href: localizePath(path, SECONDARY_LOCALE) },
    { hreflang: "x-default", href: zhHk },
  ];
}

/** The resource section index for a locale. */
export function resourceIndexPath(locale: Locale): string {
  return localizePath("/resources/", locale);
}

/** A resource page for a locale (content addresses stay ASCII in both languages). */
export function resourcesPath(locale: Locale, slug: string): string {
  return localizePath(`/resources/${slug}/`, locale);
}
