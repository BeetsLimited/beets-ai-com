import generated from "../data/revisions.json";

/**
 * A resource's version and its two dates, as published.
 *
 * Henry, 2026-10-17: *「版本號與『最後修改』由發佈流程自動寫入，不再由人手填」*.
 * The record is built from the commit log by `scripts/gen-revisions.mjs` (see
 * its header for the rules and for why a shallow CI checkout would quietly
 * reset every page to 1.0), and this module is the single place the site reads
 * it. Both the printed page and the structured data go through
 * `withRevision()`, so the two cannot disagree — which was the actual defect
 * reported: a page whose subject changed on 10-15 still said
 * 「版本 1.0 · 最後修改 2026-10-08」.
 *
 * A resource with no commit yet (only possible mid-development) falls back to
 * its frontmatter, so nothing renders blank.
 */
export interface Revision {
  /** First publication, `YYYY-MM-DD` in HKT. */
  published: string;
  /** Most recent publication, `YYYY-MM-DD` in HKT. */
  modified: string;
  /** How many times the resource has been published. */
  publishes: number;
  /** `1.0` at the first publish, `+0.1` per later one. */
  version: string;
}

const RESOURCES: Record<string, Revision> = (generated as { resources?: Record<string, Revision> })
  .resources ?? {};

/** The revision record for one resource address, or `undefined` if untracked. */
export function revisionFor(address: string): Revision | undefined {
  return Object.prototype.hasOwnProperty.call(RESOURCES, address) ? RESOURCES[address] : undefined;
}

/** Every address the publish log knows about — used by the tests. */
export function trackedAddresses(): string[] {
  return Object.keys(RESOURCES);
}

/**
 * A HKT calendar date as a Date.
 *
 * Anchored at UTC midnight, not HKT midnight: every consumer formats it with
 * `toISOString().slice(0, 10)`, and HKT midnight is the previous day in UTC —
 * which is how a date either side of the format lands on the wrong day.
 */
function hkDate(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

type DatedData = {
  address: string;
  version?: string;
  date?: Date;
  updated?: Date;
};

/**
 * Apply a revision record to an entry's data: `version` and `updated` come from
 * the publish log, and `date` becomes the real first-publication date (the
 * frontmatter `date` is a manual field, and on several pages it had been
 * re-typed on an edit, which is what made 首發 and 修訂 indistinguishable in the
 * structured data).
 */
export function applyRevision<T extends DatedData>(
  data: T,
  revision: Revision,
): T & { version: string; date: Date; updated: Date } {
  return {
    ...data,
    version: revision.version,
    date: hkDate(revision.published),
    updated: hkDate(revision.modified),
  };
}

/**
 * An entry whose data carries the publish log's version and dates.
 *
 * Called by the resource routes before the page renders, so `ResourceView` and
 * `learningResourceLd()` both read the same numbers without either of them
 * knowing where the numbers came from.
 */
export function withRevision<T extends { data: DatedData }>(
  entry: T,
): T & { data: T["data"] & { version: string; date: Date; updated: Date } } {
  const revision = revisionFor(entry.data.address);
  if (!revision) {
    // No record yet: nothing to override, and the caller sees the frontmatter.
    return entry as unknown as T & {
      data: T["data"] & { version: string; date: Date; updated: Date };
    };
  }
  return { ...entry, data: applyRevision(entry.data, revision) };
}
