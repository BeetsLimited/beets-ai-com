/**
 * The five facts a teacher needs before reading a page (Henry, 2026-10-17).
 *
 * *「今日抽樣五頁，四頁開頭 300 字無任何官方字眼 —— 老師第一屏判斷不到是否
 * 教材。」* So every resource page opens with five lines: 學習階段 · 科目 ·
 * 學習範疇 · 對應官方文件 · 一節時間.
 *
 * Two of the five are not in the frontmatter — the learning strand and the
 * documents the page maps to — and they must **not** become a hand-typed copy:
 * they already exist, once, in the page's 官方文件參考 section, and a second
 * copy would drift the first time a source changed. So they are read out of that
 * section: the `**學習範疇**：…` line and the bullets under 本資源對應. The block
 * therefore cannot name a document the page does not cite, which is exactly the
 * constraint the request set.
 *
 * The reader-facing output never carries an EDB document code (`E, p.6`) — the
 * titles are EDB's own published titles, in the language of the edition.
 */
import type { Locale } from "./i18n";

/** The lead-in above the bullet list of documents a resource maps to. */
const DOCS_LEAD: Record<Locale, RegExp> = {
  "zh-HK": /^本資源對應[：:]\s*$/,
  en: /^This resource maps to:\s*$/,
};

const STRAND: Record<Locale, RegExp> = {
  "zh-HK": /\*\*學習範疇\*\*[：:]\s*(.+)/,
  // `strands` (plural) on the page whose strand is all three at once — the
  // title of the line is the same, so the reader's answer is the same.
  en: /\*\*Learning strands?\*\*:\s*(.+)/,
};

/**
 * Prefixes EDB puts in front of a supplement's title — 附篇一/附篇二 and
 * Supplement I/II. Dropped so the line reads as document titles only; the
 * section below keeps the full citation.
 */
const SUPPLEMENT_PREFIX = /^(?:附篇[一二三四]?[：:]\s*|Supplement\s+I{1,3}V?\s*[:：]\s*)/i;

/** The learning strand the page's 官方文件參考 section declares, if any. */
export function parseStrand(body: string, lang: Locale): string | undefined {
  const match = body.match(STRAND[lang]);
  return match ? match[1].trim() : undefined;
}

/**
 * The documents the page says it maps to, in the order it says them, without
 * page numbers (those belong to the citation, not to a one-line answer).
 */
export function parseDocuments(body: string, lang: Locale): string[] {
  const lines = body.split(/\r?\n/);
  const lead = lines.findIndex((line) => DOCS_LEAD[lang].test(line.trim()));
  if (lead === -1) return [];

  const bullets: string[] = [];
  for (const line of lines.slice(lead + 1)) {
    const trimmed = line.trim();
    if (!trimmed) {
      // A blank line before the first bullet is layout; after it, the list ended.
      if (bullets.length) break;
      continue;
    }
    if (!trimmed.startsWith("- ")) break;
    bullets.push(trimmed.slice(2));
  }

  const titles: string[] = [];
  for (const bullet of bullets) {
    const bold = bullet.match(/\*\*(.+?)\*\*/);
    const title = (bold ? bold[1] : bullet).replace(SUPPLEMENT_PREFIX, "").trim();
    if (title && !titles.includes(title)) titles.push(title);
  }
  return titles;
}

export interface PageFacts {
  stage?: string;
  subject?: string;
  strand?: string;
  documents: string[];
  /** Prep/session time as the page states it — a lesson's 一節, a meeting's 一次. */
  time?: string;
  /**
   * The label for `time`, when the page's own wording beats the default
   * 一節時間 — a checklist is used, not taught (Henry, 2026-10-26).
   */
  timeLabel?: string;
}

/** Everything the five-line block prints, read from the entry and its body. */
export function pageFacts(
  data: { stage?: string; subject?: string; prepTime?: string; timeLabel?: string },
  body: string,
  lang: Locale,
): PageFacts {
  const timeLabel = data.timeLabel?.trim();
  return {
    stage: data.stage?.trim() || undefined,
    subject: data.subject?.trim() || undefined,
    strand: parseStrand(body, lang),
    documents: parseDocuments(body, lang),
    time: data.prepTime?.trim() || undefined,
    // Spread, not a value: an absent label must stay absent so the view falls
    // back to the default and the fact object gains no empty key.
    ...(timeLabel ? { timeLabel } : {}),
  };
}
