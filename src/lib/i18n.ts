import { THEMES, type Theme } from "./schema";
import { reviewRequired } from "./review-gate";

/**
 * The review gate is temporarily off (Billy, 2026-10-10), so resources go live
 * before fact-check and educator review. The strings below that assert EVERY
 * resource is educator-reviewed would then be false on a public page, so they
 * are written to hold either way. See `src/lib/review-gate.ts`.
 */
const REVIEW_ON = reviewRequired();

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
  breadcrumbHome: "主頁",
  navResources: "免費資源",
  navThemes: "五大主題",
  navAbout: "關於",
  langGroup: "語言",
  switchAria: "切換至英文版",

  footerDisclaimer: REVIEW_ON
    ? "獨立資源計劃，並非 EDB 官方文件。資源經教育工作者審閱、核實來源，並自動檢查連結。"
    : "獨立資源計劃，並非 EDB 官方文件。資源已核實來源並自動檢查連結；部分資源尚待教育工作者審閱。",
  footerTerms: "使用條款及私隱",
  footerFeedback: "意見及建議",

  homeTitle: "香港免費 AI 教育資源",
  homeDescription: REVIEW_ON
    ? "香港免費 AI 教育資源：教師、家長及學生都可下載經審閱的工作紙、教案及校本規劃範例，附答案、來源與審閱記錄。"
    : "香港免費 AI 教育資源：教師、家長及學生都可下載工作紙、教案及校本規劃範例，附答案及來源，全部免費。",
  homeLede:
    "BEETS AI 是 Beets Limited 為香港教師、家長和學生設立的免費 AI 教育資源庫。我們相信學好 AI 不應該取決於學校有多少預算，或者家長懂不懂技術，所以我們把教師真正需要的教案、工作紙和校本規劃範例，做成下載即可使用的教材——全部免費，下載不需註冊。",
  homeIntro2: REVIEW_ON
    ? "無論你是明天要上第一堂 AI 課的教師、想知道子女該怎樣用 AI 做功課的家長，還是要找資料做專題的學生，都可以按科目、級別或你面對的難題，找到今天就能用的資源。每份資源都列明所依據的官方文件、審閱人與版本，並說明它為你解決什麼問題。"
    : "無論你是明天要上第一堂 AI 課的教師、想知道子女該怎樣用 AI 做功課的家長，還是要找資料做專題的學生，都可以按科目、級別或你面對的難題，找到今天就能用的資源。每份資源都列明所依據的官方文件與版本，並說明它為你解決什麼問題。",
  homeEyebrow: "教師、家長、學生都合用 · 下載不需註冊",
  topbarPrefix: "免費資源持續上線：",
  topbarSuffix: "份已可下載，全部免費、免註冊。",
  homeAudienceHeading: "由需要出發",
  homeEmptyTitle: "資源陸續上線。",
  homeEmptyBody: "首批資源正在審閱中，通過事實核實及教育工作者審閱後便會發佈。",
  homeEmptyCta: "了解編輯流程",
  homeThemesHeading: "五大主題",
  homeThemesLede: "按你在校內的工作選擇主題，每個主題都是一條逐步擴充的資源隊列。",
  homeNewestHeading: "最新資源",
  homeFeedbackHeading: "找不到你需要的資源？",
  homeFeedbackBody: "告訴我們你正在準備的課堂，我們會優先製作。下載始終不需註冊。",
  homeHeroAlt:
    "插圖：左邊並排站着教師、家長和學生三人，各自拿着書本；右邊是一整排原木書架，放滿書本。",
  cardCtaTheme: "瀏覽此主題",
  cardCtaResource: "查看資源",
  homeMoreResourcesCta: "更多資源",
  homeFeedbackCta: "提出資源需求",

  resourcesTitle: "免費資源",
  resourcesDescription: REVIEW_ON
    ? "免費下載經教育工作者審閱的香港 AI 教學資源，按主題、學科和級別分類。"
    : "免費下載香港 AI 教學資源，按主題、學科和級別分類。",
  resourcesLede: REVIEW_ON
    ? "按主題、學科和級別，免費下載可編輯的工作紙、教案及校本規劃範例。全部資源經教育工作者審閱。"
    : "按主題、學科和級別，免費下載可編輯的工作紙、教案及校本規劃範例。資源持續增加，部分尚待教育工作者審閱。",
  resourcesEmpty: "資源陸續上線，請稍後再來。首批資源正在審閱中。",
  resourcesThemesHeading: "按主題瀏覽",
  catalogueSearchHeading: "搜尋資源",
  catalogueFilterTheme: "主題",
  catalogueFilterStage: "學習階段",
  catalogueFilterSubject: "科目",
  catalogueFilterKeyword: "關鍵字",
  catalogueFilterKeywordPlaceholder: "例如：人口、私隱、植物",
  catalogueMultiHint: "可選多項。同一組內符合任一項即可；不同組別須同時符合。",
  catalogueResetFilters: "清除篩選",
  catalogueCountTemplate: "顯示 {from}–{to}，共 {total} 份資源",
  catalogueLockedNote: "此頁已固定此項篩選",
  catalogueEmpty: "沒有符合條件的資源。試試放寬或清除篩選。",
  cataloguePagerAria: "分頁",
  cataloguePrevAria: "上一頁",
  catalogueNextAria: "下一頁",
  catalogueNoScript: "啟用 JavaScript 才能篩選及分頁；以下列出全部資源。",

  themeAudienceLabel: "對象",
  themeFaqHeading: "常見問題",
  themeBackToAll: "← 所有免費資源",


  relatedHeading: "同類資源",
  reuseHeading: "使用條款",
  reuseBody: "資源可免費下載，供教學使用及改編；請保留來源標示。",
  labelTheme: "主題",
  labelStage: "年級",
  labelSubject: "範疇／科目",
  labelPrep: "準備時間",
  labelEquipment: "所需器材",
  labelVersion: "版本",
  downloadsHeading: "下載",
  downloadsPending: "檔案準備中。",
  downloadNote: "（可列印，繁體中文版）",
  edbHeading: "官方文件參考",
  debpLinkText: "《中小學數字教育發展藍圖》",
  feedbackHeading: "意見",
  feedbackBody: "你用過這份資源嗎？歡迎告訴我們需要改善的地方，或建議下一份資源。",
} as const;

export type UIKey = keyof typeof ZH_HK;

const EN: Record<UIKey, string> = {
  skip: "Skip to content",
  breadcrumbHome: "Home",
  navResources: "Free resources",
  navThemes: "Themes",
  navAbout: "About",
  langGroup: "Language",
  switchAria: "Switch to the Traditional Chinese version",

  footerDisclaimer: REVIEW_ON
    ? "An independent resource initiative — not an official EDB publication. Materials are educator-reviewed, fact-checked and link-checked."
    : "An independent resource initiative — not an official EDB publication. Materials are fact-checked and link-checked; some have not yet been educator-reviewed.",
  footerTerms: "Reuse and privacy",
  footerFeedback: "Feedback and requests",

  homeTitle: "Free AI education resources for Hong Kong",
  homeDescription: REVIEW_ON
    ? "Free AI education resources for Hong Kong: teachers, parents and students can download reviewed worksheets, lesson plans and school-planning examples, with answer keys, sources and a review record."
    : "Free AI education resources for Hong Kong: teachers, parents and students can download worksheets, lesson plans and school-planning examples, with answer keys and sources.",
  homeLede:
    "BEETS AI is a free library of AI education resources that Beets Limited builds for Hong Kong teachers, parents and students. We believe learning to use AI well should not depend on how much a school can budget for it, or on how much a parent knows about technology — so we turn the lesson plans, worksheets and planning examples teachers actually ask for into materials you can download and use straight away. Everything is free, and nothing needs registration.",
  homeIntro2: REVIEW_ON
    ? "Whether you are a teacher running your first AI lesson tomorrow, a parent working out how your child should use AI for homework, or a student looking for material for a project, you can search by subject, learning stage or the difficulty you are facing — and find something you can use today. Every resource names the official document it draws on, the person who reviewed it and its version, and says what problem it solves."
    : "Whether you are a teacher running your first AI lesson tomorrow, a parent working out how your child should use AI for homework, or a student looking for material for a project, you can search by subject, learning stage or the difficulty you are facing — and find something you can use today. Every resource names the official document it draws on and its version, and says what problem it solves.",
  homeEyebrow: "For teachers, parents and students · no registration to download",
  topbarPrefix: "Free resources are going live:",
  topbarSuffix: "ready to download — free, no registration.",
  homeAudienceHeading: "Start from what you need",
  homeEmptyTitle: "Resources are on the way.",
  homeEmptyBody:
    "The first batch is in review — fact-check, educator sign-off and link checking, then it goes live.",
  homeEmptyCta: "How we review",
  homeThemesHeading: "Five themes",
  homeThemesLede:
    "Pick the theme that matches your work at school. Each one is a growing queue of resources.",
  homeNewestHeading: "Newest resources",
  homeFeedbackHeading: "Can't find what you need?",
  homeFeedbackBody:
    "Tell us the lesson you are preparing and we will prioritise it. Downloading never needs registration.",
  homeHeroAlt:
    "Illustration: a teacher, a parent and a pupil standing side by side on the left, each holding a book; on the right, a tall wooden bookshelf filled with books.",
  cardCtaTheme: "Browse this theme",
  cardCtaResource: "View this resource",
  homeMoreResourcesCta: "More resources",
  homeFeedbackCta: "Request a resource",

  resourcesTitle: "Free resources",
  resourcesDescription: REVIEW_ON
    ? "Free, educator-reviewed Hong Kong AI teaching resources, organised by theme, subject and learning stage."
    : "Free Hong Kong AI teaching resources, organised by theme, subject and learning stage.",
  resourcesLede: REVIEW_ON
    ? "Download editable worksheets, lesson plans and school-planning examples by theme, subject and stage. Every resource is educator-reviewed."
    : "Download editable worksheets, lesson plans and school-planning examples by theme, subject and stage. More are added regularly; some have not yet been educator-reviewed.",
  resourcesEmpty: "Resources are being published — the first batch is in review.",
  resourcesThemesHeading: "Browse by theme",
  catalogueSearchHeading: "Search the catalogue",
  catalogueFilterTheme: "Theme",
  catalogueFilterStage: "Learning stage",
  catalogueFilterSubject: "Subject",
  catalogueFilterKeyword: "Keyword",
  catalogueFilterKeywordPlaceholder: "e.g. population, privacy, plants",
  catalogueMultiHint: "Pick as many as you like — any tag in a group matches, and every group must be met.",
  catalogueResetFilters: "Clear filters",
  catalogueCountTemplate: "Showing {from}–{to} of {total} resources",
  catalogueLockedNote: "Fixed by this page",
  catalogueEmpty: "No resources match these filters. Try widening or clearing them.",
  cataloguePagerAria: "Pagination",
  cataloguePrevAria: "Previous page",
  catalogueNextAria: "Next page",
  catalogueNoScript: "Turn on JavaScript to filter and page through the catalogue; every resource is listed below.",

  themeAudienceLabel: "Who it's for",
  themeFaqHeading: "Frequently asked questions",
  themeBackToAll: "← All free resources",


  relatedHeading: "Related resources",
  reuseHeading: "Reuse",
  reuseBody: "Download and adapt these resources freely for teaching; please keep the attribution.",
  labelTheme: "Theme",
  labelStage: "Stage",
  labelSubject: "Domain / subject",
  labelPrep: "Preparation",
  labelEquipment: "Equipment",
  labelVersion: "Version",
  downloadsHeading: "Downloads",
  downloadsPending: "Files are being prepared.",
  downloadNote: "(Printable, Traditional Chinese edition)",
  edbHeading: "Official documents",
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

/**
 * Alt text for each theme's card illustration on the home page. It describes the
 * picture, not the theme — a screen reader reads this aloud, so it must match
 * what is actually in the image (write it from the image, not from the prompt).
 */
export const THEME_IMAGE_ALT: Record<Locale, Record<Theme, string>> = {
  "zh-HK": {
    A: "插圖：兩位學校領導站在桌前，桌上排列着白、紅、藍色的方塊，他們手持紅色文件夾。",
    B: "插圖：教師把一張空白紙張放入深紅色文件夾，桌上有藍色盾牌圖案和反轉放下的平板。",
    C: "插圖：一位學生單手托腮坐在書桌前，望着面前一張空白紙張。",
    D: "插圖：一位學生手持放大鏡細看一張紅色卡紙，桌上有藍色玩具火車和綠色盆栽。",
    E: "插圖：教師蹲在矮桌前，與兩位學生一起活動，其中一位學生坐着輪椅。",
  },
  en: {
    A: "Illustration: two school leaders standing at a table with white, red and blue blocks laid out between them, holding red folders.",
    B: "Illustration: a teacher placing a blank sheet into a deep red folder, with a blue shield shape and a face-down tablet on the table.",
    C: "Illustration: a student sitting at a desk with a hand under their chin, looking at a blank sheet of paper.",
    D: "Illustration: a student holding a magnifying glass over a red card, with a blue toy train and a green potted plant on the table.",
    E: "Illustration: a teacher kneeling at a low table working with two pupils, one of them using a wheelchair.",
  },
};

export function themeImageAlt(locale: Locale, theme: Theme): string {
  return THEME_IMAGE_ALT[locale][theme];
}

export function themePath(locale: Locale, theme: Theme): string {
  return localizePath(`/by-theme/${THEME_SLUGS[theme]}/`, locale);
}

export function themeInfo(locale: Locale, theme: Theme) {
  return THEME_INFO[locale][theme];
}

export function themeMeta(locale: Locale, theme: Theme): string {
  return THEME_META[locale][theme];
}
