import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { resourceSchema } from "./lib/schema";
import { reviewRequired } from "./lib/review-gate";

// Deliberately loud: every build states out loud whether unreviewed content is
// being published. See src/lib/review-gate.ts (Billy, 2026-10-10).
if (!reviewRequired()) {
  console.warn(
    "\n⚠️  REVIEW GATE OFF — resources publish without fact-check or educator approval.\n" +
      "    Restore before public rollout: build with REVIEW_REQUIRED=true, or set\n" +
      "    DEFAULT_REVIEW_REQUIRED = true in src/lib/review-gate.ts.\n",
  );
}

/**
 * BEETS AI content collection.
 *
 * Resource pages and editorial posts share one frontmatter contract
 * (`resourceSchema`). Pagination of the full library happens through the
 * `/resources/` routes.
 */
const content = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/resources" }),
  schema: resourceSchema,
});

export const collections = { content };
