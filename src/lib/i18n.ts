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
  navBrowse: "按科目及級別",
  navAbout: "關於",
  langGroup: "語言",
  switchAria: "切換至英文版",

  footerDisclaimer:
    "獨立資源計劃，並非 EDB 官方文件。資源經教育工作者審閱、核實來源，並自動檢查連結。",
  footerTerms: "使用條款及私隱",
  footerFeedback: "意見及建議",

  homeTitle: "香港教師 AI 課堂實用資源",
  homeDescription:
    "香港教師 AI 課堂實用資源：按學科、級別和具體教學需要，免費取得可編輯工作紙、教案及校本規劃範例。",
  homeLede:
    "按學科、級別和具體教學需要，免費取得可編輯的工作紙、教案及校本規劃範例。下載不需註冊。",
  homeEmptyTitle: "資源陸續上線。",
  homeEmptyBody: "首批資源正在審閱中，通過事實核實及教育工作者審閱後便會發佈。",
  homeEmptyCta: "了解編輯流程",
  homeThemesHeading: "五大主題",
  homeThemesLede: "按你在校內的工作選擇主題，每個主題都是一條逐步擴充的資源隊列。",
  homeBrowseHeading: "按科目及級別尋找",
  homeBrowseCta: "按科目及級別瀏覽",
  homeNewestHeading: "最新資源",
  homeFeedbackHeading: "找不到你需要的資源？",
  homeFeedbackBody: "告訴我們你正在準備的課堂，我們會優先製作。下載始終不需註冊。",
  homeFeedbackCta: "提出資源需求",

  resourcesTitle: "免費資源",
  resourcesDescription:
    "免費下載經教育工作者審閱的香港 AI 教學資源，按主題、學科和級別分類。",
  resourcesLede:
    "按主題、學科和級別，免費下載可編輯的工作紙、教案及校本規劃範例。全部資源經教育工作者審閱。",
  resourcesEmpty: "資源陸續上線，請稍後再來。首批資源正在審閱中。",
  resourcesThemesHeading: "按主題瀏覽",

  themeAudienceLabel: "對象",
  themeNeedLabel: "這個主題解答什麼問題",
  themeResourcesHeading: "本主題資源",
  themeEmpty: "本主題的首批資源正在審閱中。",
  themeBackToAll: "← 所有免費資源",

  browseTitle: "按科目及級別",
  browseDescription: "按學習階段和科目瀏覽香港 AI 教學資源。",
  browseLede: "選擇級別或科目。只會顯示已有資源的選項。",
  browseStagesHeading: "按學習階段",
  browseSubjectsHeading: "按科目",
  browseEmpty: "資源陸續上線，請稍後再來。",
  browseSeeAll: "查看所有免費資源",

  relatedHeading: "同類資源",
  reuseHeading: "使用條款",
  reuseBody: "資源可免費下載，供教學使用及改編；請保留來源標示。本站不收集學生作品或可識別學生身分的資料。",
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
  sourcesHeading: "來源文件",
  edbOfficialDoc: "官方文件：",
  debpLinkText: "《中小學數字教育發展藍圖》",
  feedbackHeading: "意見",
  feedbackBody: "你用過這份資源嗎？歡迎告訴我們需要改善的地方，或建議下一份資源。",
} as const;

export type UIKey = keyof typeof ZH_HK;

const EN: Record<UIKey, string> = {
  skip: "Skip to content",
  navResources: "Free resources",
  navBrowse: "By subject & stage",
  navAbout: "About",
  langGroup: "Language",
  switchAria: "Switch to the Traditional Chinese version",

  footerDisclaimer:
    "An independent resource initiative — not an official EDB publication. Materials are educator-reviewed, fact-checked and link-checked.",
  footerTerms: "Reuse and privacy",
  footerFeedback: "Feedback and requests",

  homeTitle: "Practical AI classroom resources for Hong Kong teachers",
  homeDescription:
    "Free, educator-reviewed Hong Kong AI teaching resources — by subject, learning stage and specific classroom task.",
  homeLede:
    "Download editable worksheets, lesson plans and school-planning examples by subject, stage and classroom task. No registration.",
  homeEmptyTitle: "Resources are on the way.",
  homeEmptyBody:
    "The first batch is in review — fact-check, educator sign-off and link checking, then it goes live.",
  homeEmptyCta: "How we review",
  homeThemesHeading: "Five themes",
  homeThemesLede:
    "Pick the theme that matches your work at school. Each one is a growing queue of resources.",
  homeBrowseHeading: "Find your exact classroom fit",
  homeBrowseCta: "Browse by subject and stage",
  homeNewestHeading: "Newest resources",
  homeFeedbackHeading: "Can't find what you need?",
  homeFeedbackBody:
    "Tell us the lesson you are preparing and we will prioritise it. Downloading never needs registration.",
  homeFeedbackCta: "Request a resource",

  resourcesTitle: "Free resources",
  resourcesDescription:
    "Free, educator-reviewed Hong Kong AI teaching resources, organised by theme, subject and learning stage.",
  resourcesLede:
    "Download editable worksheets, lesson plans and school-planning examples by theme, subject and stage. Every resource is educator-reviewed.",
  resourcesEmpty: "Resources are being published — the first batch is in review.",
  resourcesThemesHeading: "Browse by theme",

  themeAudienceLabel: "Who it's for",
  themeNeedLabel: "What this theme answers",
  themeResourcesHeading: "Resources in this theme",
  themeEmpty: "The first resources in this theme are in review.",
  themeBackToAll: "← All free resources",

  browseTitle: "By subject and stage",
  browseDescription: "Browse Hong Kong AI teaching resources by learning stage and subject.",
  browseLede: "Pick a learning stage or a subject. Only options with material are shown.",
  browseStagesHeading: "By learning stage",
  browseSubjectsHeading: "By subject",
  browseEmpty: "Resources are on the way — please check back.",
  browseSeeAll: "See all free resources",

  relatedHeading: "Related resources",
  reuseHeading: "Reuse",
  reuseBody:
    "Download and adapt these resources freely for teaching; please keep the attribution. We collect no student work and nothing that could identify a student.",
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
  sourcesHeading: "Source documents",
  edbOfficialDoc: "Official document:",
  debpLinkText: "Blueprint for Digital Education Development in Primary and Secondary Schools",
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

/** The browse-by-subject-and-stage page. */
export function browsePath(locale: Locale): string {
  return localizePath("/browse/", locale);
}

/** The feedback / request-a-resource page. */
export function feedbackPath(locale: Locale): string {
  return localizePath("/feedback/", locale);
}

// ── Themes ─────────────────────────────────────────────────────────────────
// The five navigation themes are browsing routes and editorial queues, not
// bundles. Each has its own page, hidden from the navigation while empty.

export const THEME_SLUGS: Record<Theme, string> = {
  A: "school-planning",
  B: "responsible-ai-use",
  C: "student-thinking",
  D: "hong-kong-inquiry",
  E: "first-and-inclusive-lessons",
};

/** Who each theme is for, and the teacher need it answers. */
export const THEME_INFO: Record<Locale, Record<Theme, { audience: string; need: string }>> = {
  "zh-HK": {
    A: {
      audience: "校長、課程主任及科主任",
      need: "把人工智能素養學習架構變成切實可行的學期規劃，並看清課程覆蓋與缺口。",
    },
    B: {
      audience: "教師、家校協調人員及家長",
      need: "在校內和家中都要做的實務決定：學生資料、私隱、家校溝通。",
    },
    C: {
      audience: "高小及初中科目教師",
      need: "學生用了 AI 之後，如何看見他們的思考與學習歷程。",
    },
    D: {
      audience: "高小數學、科學及人文科教師",
      need: "配合現有科目、以香港為題的探究活動，並核對 AI 提供的資料。",
    },
    E: {
      audience: "初次使用 AI 的小學教師（包括支援學習多樣性的教師）",
      need: "用現有器材、備課負擔不高就能開始的 AI 課堂。",
    },
  },
  en: {
    A: {
      audience: "Principals, curriculum coordinators and panel heads",
      need: "Turn the AI literacy framework into a realistic term plan, and see curriculum coverage and gaps.",
    },
    B: {
      audience: "Teachers, home-school coordinators and parents",
      need: "The practical decisions at school and at home: pupil data, privacy and home-school communication.",
    },
    C: {
      audience: "Upper-primary and junior-secondary subject teachers",
      need: "See what students actually thought and changed once they used AI.",
    },
    D: {
      audience: "Upper-primary maths, science and Humanities teachers",
      need: "Local Hong Kong inquiry activities that fit existing subjects — and checking what AI says.",
    },
    E: {
      audience: "Primary teachers new to AI, including those supporting learning diversity",
      need: "Lessons you can start with the equipment you already have and modest preparation.",
    },
  },
};

/** Theme page meta descriptions, written in the words teachers search with. */
export const THEME_META: Record<Locale, Record<Theme, string>> = {
  "zh-HK": {
    A: "校本 AI 教育規劃範例：可編輯的一學期規劃範本、課程覆蓋分析及完成示例。",
    B: "學校 AI 使用指引、學生私隱及家長溝通的實用資源。",
    C: "AI 功課與學生思考歷程：評估工作紙及歷程記錄範例。",
    D: "香港人口折線圖、校園植物及香港今昔等本地探究教案。",
    E: "初小不插電 AI 教案及小學分層工作紙。",
  },
  en: {
    A: "School-level AI education planning: an editable one-term plan template, curriculum coverage analysis and a completed example.",
    B: "Practical resources on safe AI use at school, pupil privacy and home-school communication.",
    C: "AI homework and evidence of student thinking: assessment tasks and process records.",
    D: "Hong Kong inquiry lessons: population line graphs, campus plants and then-and-now local history.",
    E: "Unplugged AI lessons for early primary and scaffolded primary worksheets.",
  },
};

export function themePath(locale: Locale, theme: Theme): string {
  return localizePath(`/by-theme/${THEME_SLUGS[theme]}/`, locale);
}

export function themeInfo(locale: Locale, theme: Theme) {
  return THEME_INFO[locale][theme];
}

export function themeMeta(locale: Locale, theme: Theme): string {
  return THEME_META[locale][theme];
}
