import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { resourceSchema } from "./lib/schema";

/**
 * BEETS AI content collection.
 *
 * Resource pages and editorial posts share one frontmatter contract
 * (`resourceSchema`). Pagination of the full library happens through the
 * `/resources/` routes; drafts are excluded everywhere.
 */
const content = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/resources" }),
  schema: resourceSchema,
});

export const collections = { content };
