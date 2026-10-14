import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { resourceSchema } from "./lib/schema";

/**
 * Beets AI content collection.
 *
 * Resource pages and editorial posts share one frontmatter contract
 * (`resourceSchema`). Pagination of the full library happens through the
 * `/resources/` routes.
 *
 * There is no review gate and no publish switch: everything in this collection
 * is live at its public URL. See `src/lib/schema.ts` for why, and for what
 * survives of the old review records.
 */
const content = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/resources" }),
  schema: resourceSchema,
});

export const collections = { content };
