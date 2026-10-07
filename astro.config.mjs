// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// BEETS AI — free Hong Kong AI teaching-resource library.
// Static output, deployed to GitHub Pages at beets-ai.com.
export default defineConfig({
  site: "https://beets-ai.com",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [sitemap()],
});
