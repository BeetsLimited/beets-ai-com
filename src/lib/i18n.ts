import { AUDIENCES, THEMES, type Audience, type Theme } from "./schema";

/**
 * **No reader-facing string describes our own process** (Billy, 2026-10-11):
 * no editorial pipeline, no build or link-check machinery, no review status, no
 * reviewer names, no internal document codes. So nothing below branches on the
 * review gate any more — a string is either about the material or it is not
 * published. `scripts/check-public-copy.mjs` fails the build if internal
 * shorthand reappears in the built site.
 */

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
  navHome: "主頁",
  navResources: "免費資源",
  /*
   * The nav groups (Billy, 2026-10-11). The five themes and the three audiences
   * are now folded under one trigger each, because the bar has to hold both
   * groups AND 免費資源, 關於 and 意見及建議 as flat items as well.
   */
  navThemes: "主題",
  navAudiences: "對象",
  navAbout: "關於 Beets AI",
  navFeedback: "意見及建議",
  langGroup: "語言",
  switchAria: "切換至英文版",

  /*
    Reader-facing only (Billy, 2026-10-11): no build/link-check machinery, no
    pending-review status, no internal process. What a visitor needs is where the
    material comes from and that it is free.
  */
  footerDisclaimer: "獨立資源計劃，並非 EDB 官方文件。資源免費下載，不需註冊。",
  footerTerms: "使用條款及私隱",
  footerFeedback: "意見及建議",
  aboutTitle: "關於 Beets AI",
  aboutDescription:
    "Beets AI 是 Beets Limited 為香港教師、家長和學生設立的免費 AI 教育資源庫：教案、工作紙及校本規劃範例，每份列明所依據的官方文件，免費下載、不需註冊。",

  homeTitle: "香港免費 AI 教育資源",
  homeDescription:
    "香港免費 AI 教育資源：教師、家長及學生都可下載工作紙、教案及校本規劃範例，附答案及來源，全部免費。",
  /*
    The intro is split so the company name can be a LINK (Billy, 2026-10-11).
    The two halves are joined around it, so the sentence still reads as one
    sentence — never assemble a sentence from fragments that only work in one
    language.
  */
  homeLedeBefore: "Beets AI 是 ",
  homeLedeAfter:
    " 為香港教師、家長和學生設立的免費 AI 教育資源庫。我們相信學好 AI 不應該取決於學校有多少預算，或者家長懂不懂技術，所以我們把教師真正需要的教案、工作紙和校本規劃範例，做成下載即可使用的教材——全部免費，下載不需註冊。",
  homeIntro2:
    "無論你是明天要上第一堂 AI 課的教師、想知道子女該怎樣用 AI 做功課的家長，還是要找資料做專題的學生，都可以按科目、級別或你面對的難題，找到今天就能用的資源。每份資源都列明所依據的官方文件與版本，並說明它為你解決什麼問題。",
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
  homeAboutCta: "關於 Beets AI",
  homeFeedbackCta: "提出資源需求",

  resourcesTitle: "免費資源",
  resourcesDescription:
    "免費下載香港 AI 教學資源：按主題、學科和級別分類，附可編輯的教案、工作紙及校本規劃範例。",
  resourcesLede:
    "按主題、學科和級別，免費下載可編輯的工作紙、教案及校本規劃範例。資源持續增加，全部免費、不需註冊。",
  resourcesEmpty: "資源陸續上線，請稍後再來。首批資源正在審閱中。",
  resourcesThemesHeading: "按主題瀏覽",
  resourcesAudiencesHeading: "按對象瀏覽",
  catalogueSearchHeading: "搜尋資源",
  catalogueFilterTheme: "主題",
  catalogueFilterAudience: "對象",
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
  labelAudience: "對象",
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
  navHome: "Home",
  navResources: "Free resources",
  navThemes: "Themes",
  navAudiences: "Audience",
  navAbout: "About Beets AI",
  navFeedback: "Feedback",
  langGroup: "Language",
  switchAria: "Switch to the Traditional Chinese version",

  footerDisclaimer:
    "An independent resource initiative — not an official EDB publication. Free to download, no registration.",
  footerTerms: "Reuse and privacy",
  footerFeedback: "Feedback and requests",
  aboutTitle: "About Beets AI",
  /* Inside the 155-unit snippet budget. `npm run check:meta` holds the line. */
  aboutDescription:
    "Beets AI is a free library of Hong Kong AI teaching resources for teachers, parents and students — lesson plans, worksheets, planning examples.",

  homeTitle: "Free AI education resources for Hong Kong",
  /*
    Kept inside the 155-unit snippet budget — the longer form was cut off in a
    search result mid-sentence. `npm run check:meta` holds the line.
  */
  homeDescription:
    "Free AI education resources for Hong Kong: teachers, parents and students can download worksheets, lesson plans and school-planning examples.",
  homeLedeBefore: "Beets AI is a free library of AI education resources that ",
  homeLedeAfter:
    " builds for Hong Kong teachers, parents and students. We believe learning to use AI well should not depend on how much a school can budget for it, or on how much a parent knows about technology — so we turn the lesson plans, worksheets and planning examples teachers actually ask for into materials you can download and use straight away. Everything is free, and nothing needs registration.",
  homeIntro2:
    "Whether you are a teacher running your first AI lesson tomorrow, a parent working out how your child should use AI for homework, or a student looking for material for a project, you can search by subject, learning stage or the difficulty you are facing — and find something you can use today. Every resource names the official document it draws on and its version, and says what problem it solves.",
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
  homeAboutCta: "About Beets AI",
  homeFeedbackCta: "Request a resource",

  resourcesTitle: "Free resources",
  resourcesDescription:
    "Download free Hong Kong AI teaching resources by theme, subject and learning stage — editable lesson plans, worksheets and school-planning examples.",
  resourcesLede:
    "Download editable worksheets, lesson plans and school-planning examples by theme, subject and stage. More are added regularly, and everything is free with no registration.",
  resourcesEmpty: "Resources are being published — the first batch is in review.",
  resourcesThemesHeading: "Browse by theme",
  resourcesAudiencesHeading: "Browse by audience",
  catalogueSearchHeading: "Search the catalogue",
  catalogueFilterTheme: "Theme",
  catalogueFilterAudience: "Audience",
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
  labelAudience: "Audience",
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

/**
 * The theme label for the NAVIGATION.
 *
 * English needs a shorter set than the rest of the site. Measured in a browser at
 * a 1280px viewport, the eight nav items need 982px at the nav's type size and the
 * row offers 816px, so the full English labels wrap to a second line — and the
 * separator then lands at the start of that line, where it reads as a stray mark
 * rather than a divider. Per item: "First & inclusive lessons" 172px,
 * "Hong Kong inquiry" 140px, "Responsible AI use" 139px, "School planning" 121px.
 *
 * A nav label is allowed to be shorter than the page it points at: page headings,
 * cards and breadcrumbs keep the full label from `themeLabel`. The Chinese labels
 * already fit, so they are used unchanged.
 */
const EN_THEME_NAV_LABELS: Partial<Record<Theme, string>> = {
  A: "Planning",
  B: "Safe AI use",
  D: "HK inquiry",
  E: "Inclusive lessons",
};

export function themeNavLabel(locale: Locale, theme: Theme): string {
  if (locale === SECONDARY_LOCALE) {
    return EN_THEME_NAV_LABELS[theme] ?? themeLabel(locale, theme);
  }
  return themeLabel(locale, theme);
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

// ── Audiences (對象) ───────────────────────────────────────────────────────
// The three audiences are the ones the home page's 「由需要出發」 blocks address.
// They are a classification IN THEIR OWN RIGHT (Billy, 2026-10-11): a resource
// carries one or more of them, the catalogue can filter on them, and each has its
// own index page — a browsing route like a theme, not a label on a theme.
//
// The audience KEY is also its URL segment (`/by-audience/teachers/`), so the
// key must stay lowercase and stable.

/** The audience's own name — on the nav, on cards, and in the catalogue tags. */
export const AUDIENCE_LABELS: Record<Locale, Record<Audience, string>> = {
  "zh-HK": { teachers: "教師", parents: "家長", students: "學生" },
  en: { teachers: "Teachers", parents: "Parents", students: "Students" },
};

export function audienceLabel(locale: Locale, audience: Audience): string {
  return AUDIENCE_LABELS[locale][audience];
}

/** Every audience, keyed, in the order the site presents them. */
export function audiencesInOrder(locale: Locale): { key: Audience; label: string }[] {
  return AUDIENCES.map((key) => ({ key, label: audienceLabel(locale, key) }));
}

/** The card / hero illustration for an audience, generated as a set with the home page. */
export function audienceImagePath(audience: Audience): string {
  return `/images/home-aud-${audience}.webp`;
}

/**
 * Alt text for each audience's illustration. It describes the PICTURE, not the
 * audience — a screen reader reads this aloud, so it must match what is in the
 * image. Written from the image itself.
 */
export const AUDIENCE_IMAGE_ALT: Record<Locale, Record<Audience, string>> = {
  "zh-HK": {
    teachers:
      "插圖：一位教師站在課室桌前，手按一疊空白紙張，桌上有深紅色筆筒和藍色文件盤。",
    parents:
      "插圖：家長與孩子並排坐在家中飯桌前，一起看一張空白紙張，桌上有平板、深紅色杯和藍色筆筒。",
    students: "插圖：一位學生坐在書桌前，用藍色鉛筆在攤開的筆記本上書寫，桌上有深紅色筆筒。",
  },
  en: {
    teachers:
      "Illustration: a teacher standing at a classroom table with one hand on a stack of blank sheets, a deep red pencil cup and a blue paper tray on the table.",
    parents:
      "Illustration: a parent and child sitting side by side at a home dining table looking at one blank sheet, with a tablet, a deep red mug and a blue pencil cup.",
    students:
      "Illustration: a student sitting at a desk writing in an open notebook with a blue pencil, with a deep red pencil cup on the desk.",
  },
};

export function audienceImageAlt(locale: Locale, audience: Audience): string {
  return AUDIENCE_IMAGE_ALT[locale][audience];
}

/**
 * The audience page's heading, its one-sentence need (`lede`, which is also the
 * catalogue's intro on that page) and the home card's own copy.
 *
 * The heading is not just the audience's name: 「教師」 alone says nothing about
 * what is behind it, and it is the page's h1.
 */
export const AUDIENCE_INFO: Record<
  Locale,
  Record<Audience, { heading: string; need: string; cardBody: string; cardCta: string }>
> = {
  "zh-HK": {
    teachers: {
      heading: "教師適用的資源",
      need: "備課、施教與校本規劃用得着的教案、工作紙和範例——全部免費，下載可直接修改。",
      cardBody: "備課用得着的教案、工作紙和校本規劃範例，附答案及來源。",
      cardCta: "瀏覽教師資源",
    },
    parents: {
      heading: "家長適用的資源",
      need: "子女用 AI 做功課時，你可以怎樣引導、怎樣檢查——由家長通告到家庭功課協議。",
      cardBody: "子女用 AI 做功課時，你可以怎樣引導、怎樣檢查——由家長通告到家庭功課協議。",
      cardCta: "瀏覽家長資源",
    },
    students: {
      heading: "學生適用的資源",
      need: "做專題與核對 AI 答案時，你可以直接使用的工作紙、步驟與紀錄表。",
      cardBody: "做專題前先學會核對：按科目和級別找到可用的工作紙與步驟，確認 AI 給你的答案。",
      cardCta: "瀏覽學生資源",
    },
  },
  en: {
    teachers: {
      heading: "Resources for teachers",
      need: "Lesson plans, worksheets and school-planning examples you can prepare with — free, and editable once downloaded.",
      cardBody: "Lesson plans, worksheets and school-planning examples, with answer keys and sources.",
      cardCta: "Browse teacher resources",
    },
    parents: {
      heading: "Resources for parents",
      need: "How to guide and check AI homework at home — from a parent notice to a family homework agreement.",
      cardBody:
        "How to guide and check AI homework at home — from a parent notice to a family homework agreement.",
      cardCta: "Browse parent resources",
    },
    students: {
      heading: "Resources for students",
      need: "Worksheets, steps and record sheets you can use yourself for a project — and for checking what an AI told you.",
      cardBody:
        "For projects and for checking what an AI tells you: find worksheets and steps by subject and learning stage.",
      cardCta: "Browse student resources",
    },
  },
};

export function audienceInfo(locale: Locale, audience: Audience) {
  return AUDIENCE_INFO[locale][audience];
}

/** Audience page meta descriptions, in the words the audience itself searches with. */
export const AUDIENCE_META: Record<Locale, Record<Audience, string>> = {
  "zh-HK": {
    teachers: "免費下載香港教師適用的 AI 教學資源：教案、工作紙、校本規劃範例及評估工具，附答案及來源。",
    parents: "家長適用的免費 AI 資源：在家引導子女使用 AI 做功課的親子活動、家庭功課協議及家長通告。",
    students: "學生適用的免費資源：核對 AI 答案、做專題時可直接使用的工作紙、步驟與紀錄表。",
  },
  en: {
    teachers:
      "Free Hong Kong AI teaching resources for teachers: lesson plans, worksheets, school-planning examples and assessment tasks, with answer keys and sources.",
    parents:
      "Free AI resources for parents: activities to do at home with your child, a family homework agreement and a parent notice.",
    students:
      "Free resources for students: worksheets, steps and record sheets for projects and for checking what an AI tells you.",
  },
};

export function audienceMeta(locale: Locale, audience: Audience): string {
  return AUDIENCE_META[locale][audience];
}

/** An audience index page. The key is the URL segment, in both languages. */
export function audiencePath(locale: Locale, audience: Audience): string {
  return localizePath(`/by-audience/${audience}/`, locale);
}
