import { z } from "zod";
import { RESOURCE_KINDS } from "./resource-kinds";
import { reviewRequired } from "./review-gate";

/** The five navigation themes (EXCO-714 content plan). */
export const THEMES = ["A", "B", "C", "D", "E"] as const;

export type Theme = (typeof THEMES)[number];

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
  stage: z.string().min(1),
  subject: z.string().min(1),
  /** Ties the page back to the 14-idea launch inventory, e.g. "#11". */
  sourceIdea: z.string().optional(),
  /** EDB document code + page, e.g. ["E, p.6"]. At least one is required. */
  sources: z.array(z.string().min(1)).min(1, "at least one EDB source reference is required"),
  prepTime: z.string().optional(),
  equipment: z.string().optional(),
  author: z.string().min(1),
  /** Named educator who checked the content. Required for a published resource. */
  reviewer: z.string().min(1).optional(),
  version: z.string().default("1.0"),
  date: z.coerce.date(),
  description: z.string().min(1),
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
  /** Unreviewed scaffolding. Excluded from public routes while the gate is on. */
  draft: z.boolean().default(false),

  // ── fact-check gate ───────────────────────────────────────────────────────
  /** Every claim verified against its source. Required unless draft. */
  factChecked: z.boolean().default(false),
  /** Who verified the facts. Required alongside factChecked to publish. */
  factCheckedBy: z.string().min(1).optional(),
  /** When the facts were last verified. */
  factCheckedOn: z.coerce.date().optional(),
};

/**
 * Frontmatter contract for BEETS AI content.
 *
 * `reviewRequired` selects whether the two human gates below are enforced:
 *
 * 1. **Fact-check gate** — published content must be verified by a named
 *    person. No post goes live on unchecked claims.
 * 2. **Educator review gate** — a published `resource` must name the educator
 *    who reviewed its learning aim, age fit and usability.
 *
 * While the gate is on, AI drafts, a person verifies facts and an educator
 * approves before publication. While it is off (see `./review-gate.ts`, Billy
 * 2026-10-10) both gates are skipped and content publishes as authored — the
 * fields stay optional so nothing false has to be recorded to publish.
 *
 * Broken links are a separate gate, enforced in CI by `npm run check:links`
 * against the built site.
 */
export function createResourceSchema(reviewRequiredFlag: boolean) {
  return z
    .object(fields)
    .refine((value) => !reviewRequiredFlag || value.draft || (value.factChecked && Boolean(value.factCheckedBy)), {
      message:
        "fact-check gate: published content must be fact-checked by a named person " +
        "(set factChecked: true and factCheckedBy) — or set draft: true",
      path: ["factChecked"],
    })
    .refine((value) => !reviewRequiredFlag || value.draft || value.type !== "resource" || Boolean(value.reviewer), {
      message:
        "educator review gate: a published resource requires a named reviewer (or set draft: true)",
      path: ["reviewer"],
    });
}

/**
 * The schema the content collection is actually built with — the review gate's
 * current state decides whether the human gates apply. See `./review-gate.ts`.
 */
export const resourceSchema = createResourceSchema(reviewRequired());

export type Resource = z.infer<typeof resourceSchema>;
