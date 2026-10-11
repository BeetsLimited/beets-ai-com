/**
 * Open every OFF-SITE link in a new tab (Billy, 2026-10-11).
 *
 * A reader following the Census department's table or EDB's document page is
 * leaving the library mid-task; opening it in place loses the resource they were
 * reading and their place in the catalogue. So every anchor that leaves
 * beets-ai.com gets `target="_blank"` and `rel="noopener noreferrer"` — the
 * `noopener` being the part that stops the opened page reaching back through
 * `window.opener`.
 *
 * **Why a build pass rather than a Markdown plugin.** Astro 7's default Markdown
 * processor (Sätteri) does not run rehype plugins unless `@astrojs/markdown-remark`
 * is installed, and the off-site links live in three different places anyway:
 * Markdown content (the EDB and Census links inside resource pages), `.astro`
 * components (the footer, /about/, the home page) and whatever a future page adds.
 * A single pass over the built HTML covers all three, so the correct behaviour is
 * the default and nobody has to remember a convention. The components still write
 * the attributes themselves where a link is authored by hand — this pass simply
 * makes them non-optional.
 *
 * Our own origin is never touched: an absolute `https://beets-ai.com/...` link is
 * an internal link and navigates in place like every other one.
 *
 * Ordering note: this runs at `astro:build:done`, so `npm run dev` serves the
 * un-rewritten HTML. `dist/` — what gets deployed, and what every gate reads — is
 * correct, and `npm run check:links` fails the build if any off-site anchor in
 * `dist/` is still naked.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Hosts that are us. A link to one of these is not leaving the site. */
const OWN_HOSTS = new Set(["beets-ai.com", "www.beets-ai.com"]);

/** Add the two attributes to one `<a …>` tag, if it is an off-site link. */
function openInNewTab(tag) {
  const href = tag.match(/href\s*=\s*"([^"]*)"/i)?.[1];
  if (!href || !/^https?:\/\//i.test(href)) return tag;
  const host = href.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].toLowerCase();
  if (OWN_HOSTS.has(host)) return tag;
  if (/target\s*=\s*"_blank"/i.test(tag) && /rel\s*=\s*"[^"]*noopener/i.test(tag)) return tag;

  let out = tag;
  const rel = out.match(/rel\s*=\s*"([^"]*)"/i);
  if (rel && !/noopener/i.test(rel[1])) {
    out = out.replace(rel[0], `rel="${rel[1]} noopener noreferrer"`);
  } else if (!rel) {
    out = out.replace(/<a\b/i, '<a rel="noopener noreferrer"');
  }
  if (!/target\s*=\s*"_blank"/i.test(out)) {
    out = out.replace(/<a\b/i, '<a target="_blank"');
  }
  return out;
}

/** Rewrite one built page. Returns how many anchors changed. */
function rewrite(html) {
  let changed = 0;
  const next = html.replace(/<a\b[^>]*>/gi, (tag) => {
    const fixed = openInNewTab(tag);
    if (fixed !== tag) changed += 1;
    return fixed;
  });
  return { next, changed };
}

function htmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name !== "_astro") htmlFiles(full, out);
    } else if (name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

export default function openExternalLinks() {
  return {
    name: "beets-open-external-links",
    hooks: {
      "astro:build:done": ({ dir }) => {
        const root = dir.pathname;
        let files = 0;
        let anchors = 0;
        for (const file of htmlFiles(root)) {
          const html = readFileSync(file, "utf8");
          const { next, changed } = rewrite(html);
          if (changed === 0) continue;
          writeFileSync(file, next);
          files += 1;
          anchors += changed;
        }
        console.log(
          `external-link pass: ${anchors} off-site anchor(s) across ${files} page(s) ` +
            `now open in a new tab`,
        );
      },
    },
  };
}
