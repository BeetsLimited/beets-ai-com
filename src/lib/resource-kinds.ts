/**
 * What KIND of resource this is — and what that changes.
 *
 * This exists because a section heading must not be hardcoded to "學習目標".
 * A whole-school planning template is not a lesson, and calling its objectives
 * "learning objectives" tells the reader the template was not written for them
 * (Billy, 2026-10-10).
 *
 * So one field, `kind`, decides:
 *
 *   • the three section headings that adapt to the resource (objective /
 *     steps / check) — see `standardHeadings()`;
 *   • the office format its attachment ships as (notes → Word, a planning
 *     workbook → Excel, a deck → PowerPoint);
 *   • what the download link calls itself.
 *
 * `tests/resource-standard.test.ts` enforces both for any resource that
 * declares a `kind`, so the wording cannot drift back to one hardcoded set.
 *
 * Deliberately dependency-free (no imports): `schema.ts` imports this file, and
 * `schema.ts` is imported by `i18n.ts` — importing either back would be a cycle.
 */

/** The kinds we write. Add one only with a real resource that needs it. */
export const RESOURCE_KINDS = ["lesson", "worksheet", "planning", "slides", "guide"] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];

/** The office formats a downloadable attachment can be. */
export const ATTACHMENT_FORMATS = ["docx", "xlsx", "pptx"] as const;

export type AttachmentFormat = (typeof ATTACHMENT_FORMATS)[number];

export interface KindCopy {
  /** Section 2 — what the reader should be able to do afterwards. */
  objective: string;
  /** Section 3 — how they work through it. */
  steps: string;
  /** Section 4 — how they check it / mark it. */
  check: string;
  /** The attachment's default office format. */
  format: AttachmentFormat;
  /** Plain-language name of that format, for the download link. */
  formatLabel: string;
}

export const KIND_COPY: Record<"zh-HK" | "en", Record<ResourceKind, KindCopy>> = {
  "zh-HK": {
    lesson: {
      objective: "學習目標",
      steps: "教學步驟",
      check: "答案與評分要點",
      format: "docx",
      formatLabel: "Word 文件",
    },
    worksheet: {
      objective: "學習目標",
      steps: "使用步驟",
      check: "答案與評分要點",
      format: "docx",
      formatLabel: "Word 文件",
    },
    planning: {
      objective: "規劃目標",
      steps: "規劃步驟",
      check: "檢核要點",
      format: "xlsx",
      formatLabel: "Excel 試算表",
    },
    slides: {
      objective: "學習目標",
      steps: "使用步驟",
      check: "每頁重點",
      format: "pptx",
      formatLabel: "PowerPoint 簡報",
    },
    guide: {
      objective: "目的",
      steps: "使用步驟",
      check: "檢核要點",
      format: "docx",
      formatLabel: "Word 文件",
    },
  },
  en: {
    lesson: {
      objective: "Learning objectives",
      steps: "Teaching steps",
      check: "Answers and marking notes",
      format: "docx",
      formatLabel: "Word document",
    },
    worksheet: {
      objective: "Learning objectives",
      steps: "How to use it",
      check: "Answers and marking notes",
      format: "docx",
      formatLabel: "Word document",
    },
    planning: {
      objective: "Planning objectives",
      steps: "Planning steps",
      check: "Review checklist",
      format: "xlsx",
      formatLabel: "Excel spreadsheet",
    },
    slides: {
      objective: "Learning objectives",
      steps: "How to use the slides",
      check: "Notes for each slide",
      format: "pptx",
      formatLabel: "PowerPoint deck",
    },
    guide: {
      objective: "Purpose",
      steps: "How to use it",
      check: "Review checklist",
      format: "docx",
      formatLabel: "Word document",
    },
  },
};

/**
 * The headings that are the same on every resource page, whatever the kind.
 * These are the only four the content may use verbatim, and the three adaptive
 * ones come from `KIND_COPY`.
 */
export const FIXED_HEADINGS = {
  "zh-HK": {
    problem: "這個資源解決什麼問題",
    files: "附件",
    official: "官方文件參考",
    feedback: "意見",
  },
  en: {
    problem: "What this solves",
    files: "Files",
    official: "Official documents",
    feedback: "Feedback",
  },
} as const;

/**
 * The standard resource page, in order: 7 sections, of which the middle three
 * adapt to the resource's kind. One list, so the page, the drafting prompt and
 * the test all agree.
 */
export function standardHeadings(kind: ResourceKind, locale: "zh-HK" | "en"): string[] {
  const fixed = FIXED_HEADINGS[locale];
  const copy = KIND_COPY[locale][kind];
  return [
    fixed.problem,
    copy.objective,
    copy.steps,
    copy.check,
    fixed.files,
    fixed.official,
    fixed.feedback,
  ];
}

/** The office format a resource of this kind ships its attachment as. */
export function attachmentFormat(kind: ResourceKind): AttachmentFormat {
  return KIND_COPY["zh-HK"][kind].format;
}

export function isResourceKind(value: unknown): value is ResourceKind {
  return typeof value === "string" && (RESOURCE_KINDS as readonly string[]).includes(value);
}
