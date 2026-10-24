import { resourceIndexPath, resourcesPath, type Locale } from "./i18n";
import { revisionFor } from "./revisions";

/**
 * Resource routing helpers.
 *
 * Kept free of `astro:content` imports so the rules stay unit-testable: the
 * shapes below are the only thing these functions actually need from a content
 * entry.
 */

export interface LocalizedEntry {
  data: {
    address: string;
    lang: string;
    theme?: string;
    stage?: string;
    subject?: string;
    title?: string;
    /** Shorter <title>, when the visible title is too long for a search result. */
    metaTitle?: string;
    /** Snippet-sized summary, when the visible lede is too long for one. */
    metaDescription?: string;
    date?: Date;
  };
}

/** Appended to every page <title>. Counts against the title budget. */
export const TITLE_SUFFIX = " — Beets AI";

/**
 * The <title> for a resource page.
 *
 * `metaTitle` wins over the visible `title` because the two have different
 * jobs: the H1 is read on the page and has no length limit, while the <title>
 * is truncated by a search engine at roughly 60 display units. A resource whose
 * heading is specific and long therefore keeps both — a complete heading, and a
 * front-loaded title that is read to the end. See `scripts/check-meta.mjs`.
 */
export function pageTitle(entry: LocalizedEntry): string {
  return `${entry.data.metaTitle ?? entry.data.title ?? ""}${TITLE_SUFFIX}`;
}

/**
 * The meta description for a resource page.
 *
 * `metaDescription` wins over `description` because `description` is also the
 * lede paragraph rendered on the page: written for a reader, and too long for
 * the ~155 display units a snippet shows.
 */
export function pageDescription(entry: { data: { description?: string; metaDescription?: string } }): string {
  return entry.data.metaDescription ?? entry.data.description ?? "";
}

/** The same resource in the other language, matched on its address. */
export function findCounterpart<T extends LocalizedEntry>(entry: T, all: T[]): T | undefined {
  return all.find(
    (other) => other.data.lang !== entry.data.lang && other.data.address === entry.data.address,
  );
}

function otherLocaleOf(entry: LocalizedEntry): Locale {
  return entry.data.lang === "en" ? "zh-HK" : "en";
}

/**
 * Where the language switch goes from a resource page.
 *
 * Switching must never land on a 404, so a missing counterpart edition falls
 * back to that language's resource index, which always exists. There is no
 * unpublished state any more — every entry in the collection is live — so a
 * counterpart, when it exists, is always a valid target.
 */
export function alternateHrefFor<T extends LocalizedEntry>(entry: T, all: T[]): string {
  const target = otherLocaleOf(entry);
  const counterpart = findCounterpart(entry, all);
  if (!counterpart) return resourceIndexPath(target);
  return resourcesPath(target, entry.data.address);
}

/**
 * Build-time invariant: every resource exists in every language.
 *
 * The content loader silently drops entries that collide on a reserved field —
 * it kept one edition of a resource and discarded the other, and the only
 * symptom was half the library missing from the built site. Rather than trust
 * that, every page that lists content runs this, so a missing edition breaks
 * the build instead of quietly shipping.
 */
export function assertPairedEditions<T extends LocalizedEntry>(entries: T[], where: string): void {
  const counts = new Map<string, string[]>();
  for (const entry of entries) {
    counts.set(entry.data.address, [...(counts.get(entry.data.address) ?? []), entry.data.lang]);
  }

  const broken = Array.from(counts).filter(([, langs]) => new Set(langs).size !== 2);
  if (broken.length) {
    const detail = broken
      .map(([address, langs]) => `${address} (${langs.sort().join(", ")})`)
      .join("; ");
    throw new Error(
      `${where}: every resource needs one edition per language, but got ${detail}. ` +
        `Check for duplicate frontmatter fields the content loader reserves.`,
    );
  }
}

// ── Browsing ───────────────────────────────────────────────────────────────
// The theme pages and the catalogue are views over the same published set. The
// catalogue's tags replaced the old by-stage / by-subject pages: a resource's
// stage and subject are labels ON it, never separate near-identical pages.

/**
 * Newest first — by PUBLICATION date, then by address.
 *
 * The publication date is the publish log's (`src/data/revisions.json`, written
 * from the commit log), not the frontmatter's `date` field. The feed at
 * `/resources.json` already sorts this way, and the detail pages already print
 * these dates (`withRevision()`), so sorting on frontmatter here made the
 * listing disagree with both:
 *
 *   Billy, 2026-10-24: *"resource json file is out of sync with the actual
 *   content"* — `p4-hk-population-ai-graph-check` sat at position 4 on the
 *   catalogue (its frontmatter `date` had been bumped to the last edit,
 *   2026-10-17) while the feed listed it 28th, because it was first published
 *   2026-10-07. Two surfaces, one library, two different answers to "what is
 *   new".
 *
 * Ties break on `address` ascending for the same reason the feed does it: a
 * stable, content-independent order, so the listing and the feed cannot drift
 * apart on the days when several resources ship together.
 * `scripts/check-resources-feed.mjs` fails the build if they ever do.
 */
export function newestFirst<T extends { data: { address?: string; date?: Date } }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) => {
    const left = publishedDay(a);
    const right = publishedDay(b);
    if (left !== right) return left < right ? 1 : -1;
    return (a.data.address ?? "").localeCompare(b.data.address ?? "");
  });
}

/**
 * The day an entry was first published, `YYYY-MM-DD`.
 *
 * The publish log wins whenever it has a record; frontmatter is the fallback for
 * an entry that has no commit yet (only possible mid-authoring), so nothing
 * sorts to the top by accident.
 */
export function publishedDay<T extends { data: { address?: string; date?: Date } }>(
  entry: T,
): string {
  const revision = entry.data.address ? revisionFor(entry.data.address) : undefined;
  if (revision) return revision.published;
  return entry.data.date ? entry.data.date.toISOString().slice(0, 10) : "";
}

/** Same-theme siblings, excluding the entry itself — "related resources". */
export function relatedTo<T extends LocalizedEntry>(entry: T, all: T[], limit = 4): T[] {
  return all
    .filter(
      (other) =>
        other.data.address !== entry.data.address &&
        other.data.lang === entry.data.lang &&
        other.data.theme === entry.data.theme,
    )
    .slice(0, limit);
}
