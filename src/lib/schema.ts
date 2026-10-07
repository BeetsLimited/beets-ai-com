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
};

/**
 * Frontmatter contract for BEETS AI content.
 *
 * The educator review gate is enforced here: a published `resource` must name
 * its reviewer. Editorial `post` entries are exempt, and so are `draft`
 * resources — the gate applies at publish, not at authoring. See the setup
 * notes in the publishing workflow — AI drafts, a person verifies before
 * publication.
 */
export const resourceSchema = z.object(fields).refine(
  (value) => value.type !== "resource" || value.draft || Boolean(value.reviewer),
  {
    message:
      "educator review gate: a published resource requires a named reviewer (or set draft: true)",
    path: ["reviewer"],
  },
);

export type Resource = z.infer<typeof resourceSchema>;
