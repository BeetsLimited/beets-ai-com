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
  // One language per page. Traditional Chinese owns the root (the default, and
  // the URLs teachers already have); English lives under /en/. See src/lib/i18n.ts.
  i18n: {
    defaultLocale: "zh-HK",
    locales: ["zh-HK", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // Astro highlights fenced code blocks with Shiki, whose DEFAULT theme is
  // `github-dark` — a near-black panel with light grey text. This site is
  // light-only, so every resource that used a fenced block (the checklists)
  // shipped as a dark box, and it was unreadable. Ask for a light theme here;
  // Base.astro then restyles the block to the brand surface.
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
  integrations: [
    // /review/ holds unreviewed drafts — internal, bilingual, never indexed.
    sitemap({
      filter: (page) => !page.includes("/review/"),
      i18n: {
        defaultLocale: "zh-HK",
        locales: { "zh-HK": "zh-HK", en: "en" },
      },
    }),
  ],
});
