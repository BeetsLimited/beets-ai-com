/**
 * Catalogue rules for the resource listing/search pages.
 *
 * Kept free of `astro:content` and of the DOM on purpose: the filtering, paging
 * and URL-state rules are the part that can be wrong silently, so they live here
 * where `tests/catalogue.test.ts` can drive them directly. The component renders
 * the cards; the browser only ever applies these same rules to the DOM it was
 * given, and every card is in the HTML whether or not JavaScript runs.
 */

/** Ten cards a page — the catalogue's contract with the reader. */
export const PAGE_SIZE = 10;

export type CatalogueFilterKey = "theme" | "stage" | "subject" | "q";

export interface CatalogueFilters {
  /** Theme key, "A"–"E". */
  theme?: string;
  /** Learning stage as published, e.g. "P4-P6". */
  stage?: string;
  /** Subject as published, e.g. "科學" or "Science". */
  subject?: string;
  /** Free-text keyword, matched against the title and description. */
  q?: string;
}

/** The minimum a card must expose for the rules below to work on it. */
export interface CatalogueItem {
  theme: string;
  stage: string;
  subject: string;
  /** Lower-cased title + description, precomputed so matching is a substring test. */
  haystack: string;
}

/**
 * Apply a page's locked criteria over whatever the reader arrived with.
 *
 * A page that fixes a criterion (a theme page fixing its theme) must not be
 * defeatable by editing the query string: `?theme=C` on the school-planning page
 * used to render three theme-C resources under a 「校本 AI 教育規劃」 heading,
 * which puts a resource in front of a reader under a claim about it that is not
 * true. Locked criteria therefore win, whatever the URL asks for.
 */
export function withLocked(filters: CatalogueFilters, locked: CatalogueFilters): CatalogueFilters {
  return { ...filters, ...locked };
}

/**
 * Build the searchable text for one resource. Deliberately title + description
 * only: the dropdowns already cover theme, stage and subject, so a keyword that
 * also matched those would make the two controls disagree about what they do.
 */
export function haystackFor(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function normaliseQuery(q: string | undefined): string {
  return (q ?? "").trim().toLowerCase();
}

/** Does one item satisfy every filter that is set? An unset filter matches all. */
export function matches(item: CatalogueItem, filters: CatalogueFilters): boolean {
  if (filters.theme && item.theme !== filters.theme) return false;
  if (filters.stage && item.stage !== filters.stage) return false;
  if (filters.subject && item.subject !== filters.subject) return false;
  const q = normaliseQuery(filters.q);
  return !q || item.haystack.includes(q);
}

export function filterItems<T extends CatalogueItem>(items: T[], filters: CatalogueFilters): T[] {
  return items.filter((item) => matches(item, filters));
}

/** At least one page, even with nothing to show — the pager never reads "0". */
export function pageCount(total: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** A page number is always inside the catalogue: a shared link cannot 404 the view. */
export function clampPage(page: number, total: number, pageSize: number = PAGE_SIZE): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.trunc(page)), pageCount(total, pageSize));
}

export interface CataloguePage<T> {
  page: number;
  pages: number;
  /** 1-based index of the first item shown; 0 when there are no items. */
  from: number;
  /** 1-based index of the last item shown; 0 when there are no items. */
  to: number;
  total: number;
  items: T[];
}

export function paginate<T>(items: T[], page: number, pageSize: number = PAGE_SIZE): CataloguePage<T> {
  const pages = pageCount(items.length, pageSize);
  const current = clampPage(page, items.length, pageSize);
  const start = (current - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    page: current,
    pages,
    total: items.length,
    from: items.length === 0 ? 0 : start + 1,
    to: start + slice.length,
    items: slice,
  };
}

/** The values actually present, so a filter never offers a dead end. */
export function filterOptions<T extends CatalogueItem>(
  items: T[],
): { themes: string[]; stages: string[]; subjects: string[] } {
  const unique = (values: string[]) =>
    Array.from(new Set(values.filter((value) => value && value.trim()))).sort((a, b) =>
      a.localeCompare(b),
    );
  return {
    themes: unique(items.map((item) => item.theme)),
    stages: unique(items.map((item) => item.stage)),
    subjects: unique(items.map((item) => item.subject)),
  };
}

// ── URL state ──────────────────────────────────────────────────────────────
// The catalogue's state lives in the query string, so a filtered view can be
// linked to, bookmarked and shared — and so a page can be built with a default
// filter that a link can still override.

export interface CatalogueState {
  filters: CatalogueFilters;
  page: number;
}

const FILTER_KEYS: CatalogueFilterKey[] = ["theme", "stage", "subject", "q"];

/** Read the catalogue state out of a query string, falling back to page defaults. */
export function readState(search: string, defaults: CatalogueFilters = {}): CatalogueState {
  const params = new URLSearchParams(search);
  const filters: CatalogueFilters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    filters[key] = value === null || value.trim() === "" ? defaults[key] : value;
  }
  const rawPage = Number(params.get("page"));
  return { filters, page: Number.isFinite(rawPage) && rawPage > 0 ? Math.trunc(rawPage) : 1 };
}

/** Serialise the state back into a query string. Unset filters are omitted. */
export function writeState(state: CatalogueState): string {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = state.filters[key];
    if (value && value.trim()) params.set(key, value.trim());
  }
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}
