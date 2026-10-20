import { revisionFor } from "./revisions";
import { SITE_URL } from "./seo";

/**
 * The public resource feed: one JSON file listing every published resource,
 * newest first, with both editions and the hero image.
 *
 * WHY THIS EXISTS (Billy, 2026-10-21): *"a simple machine-friendly readable list
 * of our available resources ... available to public that would allow external
 * agents or programs to check what are the available resources, in a descending
 * order of publishing date. The list should contains the title and URL of both
 * the Chinese and English version, and also the URL of the hero image."*
 *
 * It is generated AT BUILD TIME by `src/pages/resources.json.ts` and served as
 * a static file at https://beets-ai.com/resources.json. Every push rebuilds it,
 * so it cannot drift from the content — there is no separate step to remember,
 * and no server to keep alive for a file that changes a few times a week.
 *
 * RESOURCES ONLY. Posts and resources share one content collection, but this
 * feed lists resources only (Billy, 2026-10-21: *"I only want resources"*).
 * `type: "post"` entries are dropped here, and the endpoint filters them out
 * before they ever reach this function.
 *
 * Version and dates come from the publish log (`./revisions`, generated from the
 * commit log), not from frontmatter, so the feed can never advertise a version
 * or a date the page itself has moved past — the same rule `gen-llms-txt.mjs`
 * and the page views follow.
 *
 * Kept free of `astro:content` on purpose: the pairing, sorting and shape rules
 * are what can be wrong silently, so they live here where `tests/resources-feed.ts`
 * can drive them directly with fixture entries.
 */

/** Where the feed is served, relative to the site root. */
export const FEED_PATH = "/resources.json";

/** The JSON Schema consumers can fetch to validate the feed. */
export const FEED_SCHEMA_PATH = "/resources.schema.json";

/** One language edition of one resource. */
export interface FeedEdition {
  /** The visible page title, in that edition's language. */
  title: string;
  /** Absolute URL of the page. */
  url: string;
  /** Absolute URL of the hero image (`og:image` for the page). */
  image?: string;
}

/** One resource, with both editions. */
export interface FeedItem {
  /** Stable address, identical in both editions — also the URL segment. */
  id: string;
  /** First publication, `YYYY-MM-DD` (HKT), from the publish log. */
  published: string;
  /** Most recent publication, `YYYY-MM-DD` (HKT). */
  updated: string;
  /** `1.0` at first publication, `+0.1` per later one. */
  version: string;
  theme: string;
  stage: string;
  audience: string[];
  /** Traditional Chinese edition (primary; owns the site root). */
  zh?: FeedEdition;
  /** English edition (under /en/). */
  en?: FeedEdition;
}

/** The whole feed. */
export interface ResourcesFeed {
  /** URL of the JSON Schema that describes this document. */
  $schema: string;
  /** Origin the URLs are built against. */
  site: string;
  /** Build time, HKT, ISO-8601 with an explicit offset. */
  generated: string;
  /** `resources.length`, so a consumer can check it read the whole file. */
  count: number;
  resources: FeedItem[];
}

/**
 * The minimum an entry must expose. Matches the content schema; deliberately
 * narrow so a fixture in a test is a few lines, and so nothing here can depend
 * on a field the schema does not guarantee.
 */
export interface FeedSource {
  data: {
    address: string;
    lang: string;
    title: string;
    /** `resource` or `post`. Anything but `resource` is not listed. */
    type?: string;
    theme?: string;
    stage?: string;
    audience?: string[];
    image?: string;
    version?: string;
    date?: Date | string;
    updated?: Date | string;
  };
}

/** Edition keys, in the order the site publishes them. */
const EDITIONS = [
  { key: "zh", lang: "zh-HK", prefix: "/resources" },
  { key: "en", lang: "en", prefix: "/en/resources" },
] as const;

/**
 * A calendar date as `YYYY-MM-DD`.
 *
 * Anchored at UTC midnight by `z.coerce.date()` (see `hkDate()` in
 * `./revisions`), so slicing the ISO string gives the day that was written, not
 * the previous one — formatting in local time is how a date either side of the
 * boundary lands on the wrong day.
 */
function isoDay(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  const iso = typeof value === "string" ? value : value.toISOString();
  return /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : undefined;
}

/** Build time in HKT, with the offset written out: `2026-10-21T09:00:00+08:00`. */
function hkTimestamp(date: Date): string {
  const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return `${shifted.toISOString().slice(0, 19)}+08:00`;
}

/** `https://beets-ai.com/resources/x/` — one edition's page URL. */
function editionUrl(site: string, prefix: string, address: string): string {
  return `${site}${prefix}/${address}/`;
}

/** An image path from frontmatter (`/images/x-hero.webp`) as an absolute URL. */
function absolute(site: string, path: string | undefined): string | undefined {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : `${site}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Build the feed from content entries.
 *
 * `entries` may hold both editions of a resource and both types; the function
 * drops anything that is not `type: "resource"`, pairs the editions by
 * `address`, and returns the resources sorted by `published` descending, with
 * the address as the tie-break so the order is stable between builds.
 *
 * An address with only one edition still yields an item — a half-published
 * resource is a real state mid-authoring, and hiding it would make the feed lie
 * by omission. `scripts/check-resources-feed.mjs` is what refuses to ship a feed
 * with an edition missing, so the failure surfaces in CI rather than here.
 */
export function buildResourcesFeed(
  entries: FeedSource[],
  { site = SITE_URL, generated = new Date() }: { site?: string; generated?: Date } = {},
): ResourcesFeed {
  const byAddress = new Map<string, FeedSource[]>();
  for (const entry of entries) {
    const { address, type } = entry.data;
    if (!address) continue;
    if (type && type !== "resource") continue;
    const group = byAddress.get(address);
    if (group) group.push(entry);
    else byAddress.set(address, [entry]);
  }

  const resources: FeedItem[] = [];
  // Iterated as an array rather than the Map itself: `for (const [k, v] of map)`
  // needs a down-level-iteration target, and the set of addresses is small.
  for (const [address, group] of Array.from(byAddress.entries())) {
    // The Chinese edition owns the root, so it is the spine when it exists. Its
    // frontmatter carries the theme/stage/audience the feed publishes.
    const spine = group.find((entry) => entry.data.lang === "zh-HK") ?? group[0];
    const revision = revisionFor(address);
    const published = revision?.published ?? isoDay(spine.data.date) ?? "";
    const updated = revision?.modified ?? isoDay(spine.data.updated) ?? published;

    const item: FeedItem = {
      id: address,
      published,
      updated,
      version: revision?.version ?? spine.data.version ?? "1.0",
      theme: spine.data.theme ?? "",
      stage: spine.data.stage ?? "",
      audience: spine.data.audience ?? [],
    };

    for (const edition of EDITIONS) {
      const entry = group.find((candidate) => candidate.data.lang === edition.lang);
      if (!entry) continue;
      item[edition.key] = {
        title: entry.data.title,
        url: editionUrl(site, edition.prefix, address),
        image: absolute(site, entry.data.image),
      };
    }

    resources.push(item);
  }

  resources.sort((a, b) => (a.published === b.published ? a.id.localeCompare(b.id) : a.published < b.published ? 1 : -1));

  return {
    $schema: `${site}${FEED_SCHEMA_PATH}`,
    site,
    generated: hkTimestamp(generated),
    count: resources.length,
    resources,
  };
}
