// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import openExternalLinks from "./src/lib/open-external-links.mjs";
import prettySitemap from "./src/lib/pretty-sitemap.mjs";

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
    /*
      Off-site links open in a new tab, applied to the built HTML so it covers
      Markdown content, `.astro` components and anything a future page adds. See
      src/lib/open-external-links.mjs; `npm run check:links` is what proves no
      off-site anchor was missed.
    */
    openExternalLinks(),
    /*
      The sitemap used to filter /review/ out — the internal bilingual area that held
      unreviewed drafts. That area was deleted with the review gate on 2026-10-15 and every
      remaining page belongs in the sitemap, so the filter is gone rather than left inert: a
      stale filter reads as a policy that no longer exists.
    */
    sitemap({
      i18n: {
        defaultLocale: "zh-HK",
        locales: { "zh-HK": "zh-HK", en: "en" },
      },
    }),
    /*
      The sitemap ships minified, which makes it unreadable in a browser: the
      generated file is one 15 KB line, so a reader sees a run of URLs with no
      tags and reasonably concludes it is broken. This pass puts one element per
      line — whitespace between elements only, asserted not to touch a tag or a
      URL. See src/lib/pretty-sitemap.mjs.
    */
    prettySitemap(),
  ],
});
