import { z } from "zod";

/** The five navigation themes (EXCO-714 content plan). */
export const THEMES = ["A", "B", "C", "D", "E"] as const;

/** Traditional Chinese first; English is the companion edition. */
export const LANGS = ["zh-HK", "en"] as const;

/** Stable addresses only: lowercase, hyphen-separated. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const fields = {
  title: z.string().min(1),
  title_en: z.string().min(1).optional(),
  slug: z
    .string()
    .regex(SLUG_PATTERN, "slug must be lowercase and hyphen-separated"),
  lang: z.enum(LANGS),
  /** Resource pages are the primary publishing unit; posts are editorial. */
  type: z.enum(["resource", "post"]),
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
  /** Named educator who checked the content. Required for type: resource. */
  reviewer: z.string().min(1).optional(),
  version: z.string().default("1.0"),
  date: z.coerce.date(),
  description: z.string().min(1),
  downloads: z.array(z.string()).default([]),
  feedback: z.boolean().default(false),
  /** Unreviewed scaffolding. Drafts must never be published. */
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
 * Two gates are enforced here, both at publish time only (drafts are exempt):
 *
 * 1. **Fact-check gate** — published content must be verified by a named
 *    person. No post goes live on unchecked claims.
 * 2. **Educator review gate** — a published `resource` must name the educator
 *    who reviewed its learning aim, age fit and usability.
 *
 * AI drafts; a person verifies facts and an educator approves before
 * publication. Broken links are a separate gate, enforced in CI by
 * `npm run check:links` against the built site.
 */
export const resourceSchema = z
  .object(fields)
  .refine((value) => value.draft || (value.factChecked && Boolean(value.factCheckedBy)), {
    message:
      "fact-check gate: published content must be fact-checked by a named person " +
      "(set factChecked: true and factCheckedBy) — or set draft: true",
    path: ["factChecked"],
  })
  .refine((value) => value.draft || value.type !== "resource" || Boolean(value.reviewer), {
    message:
      "educator review gate: a published resource requires a named reviewer (or set draft: true)",
    path: ["reviewer"],
  });

export type Resource = z.infer<typeof resourceSchema>;
