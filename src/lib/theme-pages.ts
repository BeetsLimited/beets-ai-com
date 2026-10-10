import type { Locale } from "./i18n";
import type { Theme } from "./schema";

/**
 * Long-form copy for the five theme pages — the part that is written, not
 * derived from the content collection.
 *
 * The theme's heading and sub-title come from `THEME_INFO`; this file adds the
 * **description** (element 4 of the theme page: more context, written in the words
 * a teacher or curriculum lead searches with, so the page can be found and quoted
 * for that theme) and the **FAQs** (element 6: the questions people actually ask,
 * answered on the page — the same text is published as FAQ structured data, which
 * is what an AI answer engine reads).
 *
 * Only theme A is written so far (Billy, 2026-10-10 — review the shape on one
 * theme first). The map is deliberately partial: a theme without copy still
 * renders heading, sub-title, hero, the locked catalogue and the other themes, so
 * a page is never broken by a missing entry. `tests/theme-pages.test.ts` holds the
 * shape for the remaining four.
 *
 * **Accuracy rules for this copy** (it is public and it is about official
 * documents):
 * - Name the official documents by their own published titles, in each language.
 *   Never translate a title, never invent one.
 * - Describe what those documents are for; do not assert specific requirements,
 *   hour counts, deadlines or figures that the documents would have to be checked
 *   against first.
 * - Say plainly that this is an independent initiative, not an official EDB
 *   publication.
 */

export interface ThemeFaq {
  question: string;
  answer: string;
}

export interface ThemePageCopy {
  /** Paragraphs, in order. Rendered as prose, not as a bullet list. */
  intro: string[];
  /** Four to five questions, answered on the page. */
  faqs: ThemeFaq[];
}

export const THEME_PAGES: Record<Locale, Partial<Record<Theme, ThemePageCopy>>> = {
  "zh-HK": {
    A: {
      intro: [
        "「校本 AI 教育規劃」是把人工智能素養納入學校整體課程的過程：決定先由哪些科目、哪些級別開始，用什麼課時，由誰負責，以及如何知道學生真的學到了。它不是在買了 AI 工具之後填的一份清單，而是一份可以在一個學年內逐步執行的計劃。",
        "香港的官方文件已經給出方向：《中小學數字教育發展藍圖》說明學校數字教育的整體發展，《中小學人工智能素養學習架構》則描述學生在人工智能素養上需要達到的學習重點。最花時間的一步，是把這些文件翻譯成切合自己校情的學期規劃——不少學校就停在「聽過框架」而未有下一步。",
        "這個主題的資源正是為這一步而設：一份可編輯的一學期規劃範本（附完成示例），以及一份課程覆蓋分析，幫你看清 AI 素養已經落在哪些科目、哪些級別仍有缺口。它們的對象是校長、課程主任及科主任——需要向同事交代「下學期做什麼」的人。",
        "全部資源免費下載、不需註冊，可直接以 Word 或 Excel 開啟修改，方便你按校情調整。若你未決定從哪一份開始，建議先看「一學期 AI 教育規劃」範本，再用「課程覆蓋分析」檢查現況；你亦可以在下方按主題、學習階段和科目篩選，找出最適合你學校的材料。",
      ],
      faqs: [
        {
          question: "甚麼是校本 AI 教育規劃？",
          answer:
            "指學校按自己的校情——科目、級別、課時、教師人手——把人工智能素養納入課程的整體安排，包括推行次序、負責人、課時安排，以及檢視學生學習成效的方法。它是一份需要逐年檢視的計劃，而不是一份採購清單。",
        },
        {
          question: "《中小學人工智能素養學習架構》要求學校做什麼？",
          answer:
            "這是教育局就中小學人工智能素養發布的官方文件，列出學生需要掌握的學習重點。學校的實際做法，是把這些重點對應到現有科目的課題與課時，再決定先做哪一部分。本主題的規劃範本與課程覆蓋分析，就是為逐項討論而設。",
        },
        {
          question: "一份學期 AI 規劃應該包含哪些部分？",
          answer:
            "最少包括：推行目標與範圍（哪些級別、哪些科目）、時間表、負責教師與分工、所需器材，以及檢視方式。「一學期 AI 教育規劃」範本已把這些部分排好，並附上一間學校的完成示例，你可以直接改寫成自己學校的版本。",
        },
        {
          question: "我們學校還未用過 AI，這些規劃範本適用嗎？",
          answer:
            "適用。範本設想的是「先由一至兩個科目、一個級別開始」，不需要全校同時推行，也不假設教師已有 AI 教學經驗。若你想先看單一課堂怎樣做，可以先取「共融 AI 課堂」主題的資源，再回來做整體規劃。",
        },
        {
          question: "這些資源需要收費或有使用限制嗎？",
          answer:
            "全部免費下載，不需註冊。資源可作教學用途自由改編，只需保留來源標示。它們是 Beets Limited 的獨立資源計劃，並非教育局官方文件；每份資源都列明所參考的官方文件與版本。",
        },
      ],
    },
  },
  en: {
    A: {
      intro: [
        "Whole-school AI education planning is how a school decides what to teach, in which subjects and year levels, with whose time — and how it will know students actually learned it. It is not a checklist that ends with buying a tool: it is a plan a school can carry out across a school year.",
        "Hong Kong's official documents already set the direction. The Blueprint for Digital Education Development in Primary and Secondary Schools describes how digital education develops across a school, and the AI Literacy Learning Framework for Primary and Secondary Schools describes the learning students are expected to reach. The step that takes the time is translating those into a term plan that fits your own school, which is where many schools stop: the framework has been read, but nothing has changed yet.",
        "The resources in this theme exist for that step — an editable one-term plan template with a completed school example, and a curriculum coverage analysis that shows where AI literacy already sits in your subjects and where the gaps are. They are written for principals, curriculum coordinators and panel heads: the people who have to tell colleagues what happens next term.",
        "Everything is free to download with no registration, and opens in Word or Excel so you can adapt it to your school. If you are not sure where to start, begin with the one-term plan template and then use the curriculum coverage analysis to see where you stand; you can also filter by theme, learning stage and subject below.",
      ],
      faqs: [
        {
          question: "What is whole-school AI education planning?",
          answer:
            "It is the school's own arrangement for bringing AI literacy into the curriculum — which subjects and year levels go first, whose time it uses, who is responsible, and how you check whether students learned it. It is a plan to review year by year, not a purchasing list.",
        },
        {
          question: "What does the AI Literacy Learning Framework ask schools to do?",
          answer:
            "It is the Education Bureau's published framework for AI literacy in primary and secondary schools, setting out the learning students are expected to reach. In practice a school maps those points onto the topics and lesson time it already has, then decides which part to start with. This theme's planning template and coverage analysis are built for exactly that discussion.",
        },
        {
          question: "What should a one-term AI plan contain?",
          answer:
            "At its minimum: the aim and scope (which year levels, which subjects), a timetable, the teachers responsible and how the work is shared, the equipment needed, and how you will review it. The one-term plan template lays those sections out and includes a completed example from a school, so you can rewrite it as your own version.",
        },
        {
          question: "Our school has not used AI yet. Do these templates still apply?",
          answer:
            "Yes. The template assumes you start with one or two subjects at a single year level — it does not require a whole-school rollout, and it does not assume any teacher has taught with AI before. If you would rather see a single lesson first, start with the First and inclusive lessons theme, then come back to the whole-school plan.",
        },
        {
          question: "Do these resources cost anything, and may we adapt them?",
          answer:
            "They are free to download with no registration, and you may adapt them freely for teaching as long as you keep the attribution. They are an independent resource initiative by Beets Limited and not an official EDB publication; every resource names the official document and version it draws on.",
        },
      ],
    },
  },
};

export function themePageCopy(locale: Locale, theme: Theme): ThemePageCopy | undefined {
  return THEME_PAGES[locale][theme];
}
