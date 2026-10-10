/**
 * Catalogue rules for the resource listing/search pages.
 *
 * Kept free of `astro:content` and of the DOM on purpose: the filtering, paging
 * and URL-state rules are the part that can be wrong silently, so they live here
 * where `tests/catalogue.test.ts` can drive them directly. The component renders
 * the cards and the tags; the browser only ever applies these same rules to what
 * it was given, and every card is in the HTML whether or not JavaScript runs.
 *
 * **Selection semantics (Billy, 2026-10-10):** criteria are chosen as tags, and a
 * group can hold several at once.
 *
 *   within a group   OR   — 科學 + 數學 shows resources in either
 *   across groups    AND  — 科學 + P4-P6 shows only P4-P6 science
 *
 * That is what a tag filter is expected to do, and it is the only reading that
 * makes the keyword box composable with the tags. The UI states the rule, so a
 * reader is never left guessing which it is.
 */

/** Ten cards a page — two rows of five, the catalogue's contract with the reader. */
export const PAGE_SIZE = 10;

export type CatalogueFacet = "theme" | "stage" | "subject";

export interface CatalogueFilters {
  /** Theme keys, "A"–"E". Several are OR-ed. */
  theme?: string[];
  /** Learning stages as published, e.g. "P4-P6". Several are OR-ed. */
  stage?: string[];
  /** Subjects as published, e.g. "科學" or "Science". Several are OR-ed. */
  subject?: string[];
  /** Free-text keyword, matched against the title and description. */
  q?: string;
}

/** Criteria a page may fix. A locked facet is shown, but cannot be changed. */
export type CatalogueLocked = Partial<Record<CatalogueFacet, string>>;

/** The minimum a card must expose for the rules below to work on it. */
export interface CatalogueItem {
  theme: string;
  stage: string;
  subject: string;
  /** Lower-cased title + description, precomputed so matching is a substring test. */
  haystack: string;
}

export const FACETS: CatalogueFacet[] = ["theme", "stage", "subject"];

/**
 * Build the searchable text for one resource. Deliberately title + description
 * only: the tags already cover theme, stage and subject, so a keyword that also
 * matched those would make the two controls disagree about what they do.
 */
export function haystackFor(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function normaliseQuery(q: string | undefined): string {
  return (q ?? "").trim().toLowerCase();
}

/** Is this facet satisfied? An empty selection means "no opinion" — show all. */
export function facetMatches(selected: string[] | undefined, value: string): boolean {
  return !selected || selected.length === 0 || selected.includes(value);
}

/**
 * Does one item satisfy every facet that is set? Within a facet any selection is
 * enough (OR); every facet must be satisfied (AND).
 */
export function matches(item: CatalogueItem, filters: CatalogueFilters): boolean {
  if (!facetMatches(filters.theme, item.theme)) return false;
  if (!facetMatches(filters.stage, item.stage)) return false;
  if (!facetMatches(filters.subject, item.subject)) return false;
  const q = normaliseQuery(filters.q);
  return !q || item.haystack.includes(q);
}

export function filterItems<T extends CatalogueItem>(items: T[], filters: CatalogueFilters): T[] {
  return items.filter((item) => matches(item, filters));
}

/** Toggle one tag, returning the new selection for its facet. */
export function toggleValue(selected: string[] | undefined, value: string): string[] {
  const current = selected ?? [];
  return current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
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
export function withLocked(filters: CatalogueFilters, locked: CatalogueLocked): CatalogueFilters {
  const merged: CatalogueFilters = { ...filters };
  for (const facet of FACETS) {
    const value = locked[facet];
    if (value) merged[facet] = [value];
  }
  return merged;
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

/** The values actually present, so a tag never offers a dead end. */
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
// linked to, bookmarked and shared — and so a page can be built with defaults
// that a link can still override. A facet with several tags repeats its key
// (`?theme=A&theme=D`), which is what URLSearchParams is for.

export interface CatalogueState {
  filters: CatalogueFilters;
  page: number;
}

const readFacet = (params: URLSearchParams, facet: CatalogueFacet): string[] | undefined => {
  const values = params.getAll(facet).flatMap((raw) => raw.split(",")).map((v) => v.trim()).filter(Boolean);
  return values.length > 0 ? Array.from(new Set(values)) : undefined;
};

/** Read the catalogue state out of a query string, falling back to page defaults. */
export function readState(search: string, defaults: CatalogueFilters = {}): CatalogueState {
  const params = new URLSearchParams(search);
  const filters: CatalogueFilters = {};
  for (const facet of FACETS) {
    filters[facet] = readFacet(params, facet) ?? defaults[facet];
  }
  const q = params.get("q");
  filters.q = q === null || q.trim() === "" ? defaults.q : q;
  const rawPage = Number(params.get("page"));
  return { filters, page: Number.isFinite(rawPage) && rawPage > 0 ? Math.trunc(rawPage) : 1 };
}

/** Serialise the state back into a query string. Unset criteria are omitted. */
export function writeState(state: CatalogueState): string {
  const params = new URLSearchParams();
  for (const facet of FACETS) {
    for (const value of state.filters[facet] ?? []) {
      if (value.trim()) params.append(facet, value.trim());
    }
  }
  const q = state.filters.q;
  if (q && q.trim()) params.set("q", q.trim());
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}
