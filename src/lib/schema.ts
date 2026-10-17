import { z } from "zod";
import { RESOURCE_KINDS } from "./resource-kinds";

/**
 * Frontmatter contract for Beets AI content.
 *
 * **There is no review gate.** Content publishes as authored: a resource page
 * is live at its public URL the moment it is committed, with no fact-check or
 * educator sign-off required, and there is no draft state that holds a page
 * back. Billy removed the process permanently on 2026-10-15 — *"I actually want
 * to remove the review gate permanently. We do not need that anymore."* The
 * switch, the `/review/` area, the schema gates and the `draft` flag are all
 * gone; nothing in the build reads a review state.
 *
 * What survives is the RECORD, as provenance rather than as a gate:
 * `sourceIdea`, `sources`, `reviewer`, `factChecked*` and `author` stay in the
 * entry as the internal audit trail, and are never rendered on a page
 * (`ResourceView` does not print them; `npm run check:public-copy` fails the
 * build if one reaches `dist/`). They are optional — an entry that has never
 * been through any check simply has no attestation, which is honest — and
 * nothing requires them to be filled in to publish.
 *
 * Editorial quality is still asserted, just not by a blocking gate: the
 * seven-section resource standard (`tests/resource-standard.test.ts`), the
 * single-language gate, the duplicate-heading gate, the metadata gate and the
 * public-copy gate all still fail the build. What is gone is the human
 * approval step, not the quality bar.
 *
 * Broken links are a separate gate, enforced in CI by `npm run check:links`
 * against the built site.
 */

/** The five navigation themes (EXCO-714 content plan). */
export const THEMES = ["A", "B", "C", "D", "E"] as const;

export type Theme = (typeof THEMES)[number];

/**
 * Who a resource is FOR — the 對象 dimension (Billy, 2026-10-11).
 *
 * The three audiences are the ones the home page's 「由需要出發」 blocks address
 * (teachers, parents, students), and they are what the catalogue's 對象 filter
 * and the three audience index pages are built from. A resource can serve more
 * than one: a P4 worksheet is a teacher's teaching instrument AND something the
 * pupil works in.
 */
export const AUDIENCES = ["teachers", "parents", "students"] as const;

export type Audience = (typeof AUDIENCES)[number];

/** Traditional Chinese first; English is the companion edition. */
export const LANGS = ["zh-HK", "en"] as const;

/** Stable addresses only: lowercase, hyphen-separated. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const fields = {
  title: z.string().min(1),
  title_en: z.string().min(1).optional(),
  /**
   * The resource's stable address, identical in every language edition — the
   * two editions of one resource share it, which is how they are paired. It is
   * deliberately NOT called `slug`: the content loader reserves that name and
   * silently drops all but one entry when two share it.
   */
  address: z
    .string()
    .regex(SLUG_PATTERN, "address must be lowercase and hyphen-separated"),
  lang: z.enum(LANGS),
  /** Resource pages are the primary publishing unit; posts are editorial. */
  type: z.enum(["resource", "post"]),
  /**
   * What KIND of resource this is. It decides the three section headings that
   * adapt to the resource ("planning objectives", not "learning objectives")
   * and the office format of its attachment — see `./resource-kinds.ts`.
   *
   * Optional, so a resource written before the redesign keeps its own
   * headings and still builds; declare it on every new resource.
   */
  kind: z.enum(RESOURCE_KINDS).optional(),
  theme: z.enum(THEMES),
  /**
   * Who the resource is for: one or more of the three audiences. Required, so a
   * resource can never be invisible to every 對象 route and filter — an
   * unclassified resource is the thing this field exists to prevent.
   */
  audience: z.array(z.enum(AUDIENCES)).min(1, "at least one audience (對象) is required"),
  stage: z.string().min(1),
  subject: z.string().min(1),
  /**
   * The 20-idea launch inventory this page came from, e.g. "#11".
   *
   * INTERNAL, and kept as provenance: the idea number and the source codes
   * below are working records, never something a teacher reads. They are *not*
   * a gate — the field is optional and nothing requires it.
   */
  sourceIdea: z.string().optional(),
  /** EDB document code + page, e.g. ["E, p.6"]. At least one is required. */
  sources: z.array(z.string().min(1)).min(1, "at least one EDB source reference is required"),
  prepTime: z.string().optional(),
  equipment: z.string().optional(),
  /** Our internal record. Never published — structured data names the org. */
  author: z.string().min(1),
  /**
   * Named educator who checked the content. INTERNAL provenance, optional, and
   * it no longer gates publication — record it when someone did the check, and
   * leave it out when nobody did. It is never rendered on the page.
   */
  reviewer: z.string().min(1).optional(),
  version: z.string().default("1.0"),
  date: z.coerce.date(),
  /**
   * The date the page was last changed, when that is not the day it was first
   * published (Henry, 2026-10-17 — "顯示最後修改日").
   *
   * A reader uses this the way a teacher uses the date on a printed worksheet:
   * to know whether what they downloaded last term is still what is here. So the
   * page prints it beside the version, and `dateModified` in the structured data
   * reads it too. Optional, and absent means "never changed since publication" —
   * the view then prints `date`, which is honest rather than blank.
   */
  updated: z.coerce.date().optional(),
  description: z.string().min(1),
  /**
   * The <title> TAG only, for when it has to differ from the visible `title`.
   *
   * The H1 and the <title> do different jobs. A heading has no length limit and
   * should say what the page is; a <title> is truncated by a search engine at
   * roughly 60 display units, so a long, specific heading leaves the end of its
   * title unread. Write the front-loaded version a searcher actually sees here;
   * the brand suffix is still appended. The visible heading is not shortened to
   * satisfy a search result. Enforced by `npm run check:meta`.
   */
  metaTitle: z.string().min(1).optional(),
  /**
   * The meta description only, for when it has to differ from `description`.
   *
   * `description` is ALSO the lede paragraph printed on the page (see
   * ResourceView), so it is written for a reader — and a reader is not a search
   * result: a snippet truncates at roughly 155 display units. Use this for a
   * snippet-sized summary and leave the lede alone.
   */
  metaDescription: z.string().min(1).optional(),
  downloads: z.array(z.string()).default([]),
  /**
   * Optional hero image, a path under public/ (e.g. /images/x-hero.webp). Used as
   * the page hero AND as the page's Open Graph image. Ship WebP: one 1280x720
   * illustration is 25 KB as WebP and 683 KB as the PNG it was generated as.
   */
  image: z.string().optional(),
  /**
   * Alt text for the hero. Falls back to the title, which is a poor description
   * of a picture — write a real one whenever the image carries meaning.
   */
  imageAlt: z.string().optional(),
  feedback: z.boolean().default(false),

  // ── fact-check record ─────────────────────────────────────────────────────
  // INTERNAL provenance, no longer a gate (Billy, 2026-10-15). The fields stay
  // so a page that was checked keeps its record and an audit can read it, but
  // publishing never requires them and `/review/` no longer exists to show them.
  /** Whether someone verified the page's claims against their sources. */
  factChecked: z.boolean().default(false),
  /** Who verified the facts. */
  factCheckedBy: z.string().min(1).optional(),
  /** When the facts were last verified. */
  factCheckedOn: z.coerce.date().optional(),
};

export const resourceSchema = z.object(fields);

export type Resource = z.infer<typeof resourceSchema>;
