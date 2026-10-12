/**
 * Pretty-print the built sitemaps, so a human can read them in a browser.
 *
 * WHY (Billy, 2026-10-12). The sitemap is generated minified — `sitemap-0.xml`
 * is 14,930 bytes on ONE line. That is valid XML and every crawler parses it,
 * but a browser renders an XML document that carries no stylesheet by showing
 * its TEXT NODES, so the whole file arrives as an unbroken run of URLs with no
 * tags and no line breaks: `https://beets-ai.com/https://beets-ai.com/about/…`.
 * It looks exactly like a corrupted file, and the person who has to press
 * "Submit" in Search Console cannot tell that it is fine. Verified in Chromium's
 * own DOM before this pass existed — `document.contentType` was
 * `application/xml`, the root element was `urlset` with 52 children, and the
 * text content did not contain the string `<urlset`: the tree was correct, only
 * the presentation was unreadable.
 *
 * WHAT IT DOES. Inserts a newline at every `><` boundary and indents by depth.
 * That is a change to whitespace BETWEEN elements only, which XML parsers treat
 * as insignificant — no element name, attribute, namespace prefix or URL is
 * touched. A reader now gets one URL per line, and `view-source:` gets an
 * indented document.
 *
 * WHAT IT REFUSES TO DO. It will not rewrite through a parser: re-serialising
 * with a library renames namespace prefixes (`xhtml:` -> `ns0:`), and the
 * alternates in this file are hreflang links that Google reads under the
 * `http://www.w3.org/1999/xhtml` namespace. A whitespace-only text pass cannot
 * disturb that, and the assertions below prove it did not:
 *
 *   1. the `<` and `>` character counts are unchanged (so nothing inside a tag
 *      or inside a text node was altered), and
 *   2. the list of `<loc>` values is byte-identical to the minified original.
 *
 * It also refuses to lie: if either assertion fails, the original file is left
 * in place and the build fails, because a silently mangled sitemap is worse than
 * an ugly one.
 *
 * Ordering note: like `open-external-links.mjs` this runs at `astro:build:done`,
 * so `npm run dev` serves nothing extra — only `dist/`, which is what deploys.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The one line that actually makes the file readable in a browser.
 *
 * Whitespace does NOT do it. A browser renders an XML document with the UA
 * default `white-space: normal`, so the newlines this file inserts between
 * elements COLLAPSE INTO SPACES — measured, not assumed: after pretty-printing,
 * Chromium still laid the document out as a single wrapped block (root element
 * height 270px, no vertical scroll) showing `url url url` on one line. To see
 * the pages you have to hand the browser a stylesheet to apply, which is what
 * /sitemap.xsl is for. Crawlers ignore this processing instruction and read the
 * XML, so it changes nothing for a search engine.
 */
const STYLESHEET = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

/** Second line, or first — right after the XML declaration. */
function withStylesheet(xml) {
  if (xml.includes("xml-stylesheet")) return xml;
  const lines = xml.split("\n");
  if (lines[0].startsWith("<?xml")) {
    lines.splice(1, 0, STYLESHEET);
    return lines.join("\n");
  }
  return `${STYLESHEET}\n${xml}`;
}

/** Every `<loc>` value, in order — the payload a sitemap exists to deliver. */
const locsOf = (xml) => [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((m) => m[1]);

const countOf = (xml, ch) => [...xml].filter((c) => c === ch).length;

/** One element per line, indented by nesting depth. */
function prettify(xml) {
  const chunks = xml.replace(/></g, ">\n<").split("\n");
  let depth = 0;
  const out = [];

  for (const chunk of chunks) {
    const line = chunk.trim();
    if (!line) continue;

    if (line.startsWith("</")) {
      // A closing tag: it belongs to the element one level out.
      depth = Math.max(0, depth - 1);
      out.push("  ".repeat(depth) + line);
      continue;
    }

    out.push("  ".repeat(depth) + line);

    // The XML declaration is not an element, so it must not open a level.
    if (line.startsWith("<?")) continue;

    // An element that carries text (`<loc>https://…</loc>`) or closes itself
    // (`<xhtml:link … />`) does not open a level. Everything else does.
    const closesItself = line.endsWith("/>") || /<\/[^>]+>\s*$/.test(line);
    if (!closesItself) depth += 1;
  }

  return out.join("\n") + "\n";
}

export default function prettySitemap() {
  return {
    name: "beets-pretty-sitemap",
    hooks: {
      "astro:build:done": ({ dir }) => {
        const root = dir.pathname;
        const names = readdirSync(root).filter(
          (name) => name.endsWith(".xml") && name.startsWith("sitemap"),
        );

        for (const name of names) {
          const file = join(root, name);
          const before = readFileSync(file, "utf8");
          const beforeLocs = locsOf(before);

          // ── transform 1: whitespace only ──────────────────────────────────
          const indented = prettify(before);

          // No character inside a tag or inside a text node may move. Asserted
          // against the whitespace pass ALONE: the stylesheet line added next is
          // itself a `<?…?>` and would shift these counts by one, which is how
          // this assertion first failed — correctly, rather than silently.
          if (
            countOf(before, "<") !== countOf(indented, "<") ||
            countOf(before, ">") !== countOf(indented, ">")
          ) {
            throw new Error(
              `pretty-sitemap: ${name} changed a tag character count — refusing to write a ` +
                `mangled sitemap. Before ${countOf(before, "<")} '<' / ${countOf(before, ">")} '>', ` +
                `after ${countOf(indented, "<")} '<' / ${countOf(indented, ">")} '>'.`,
            );
          }

          // ── transform 2: the stylesheet instruction, and nothing else ─────
          const after = withStylesheet(indented);

          // The URLs the sitemap exists to deliver must survive BOTH passes.
          const afterLocs = locsOf(after);
          if (beforeLocs.length !== afterLocs.length || beforeLocs.some((v, i) => v !== afterLocs[i])) {
            throw new Error(
              `pretty-sitemap: ${name} changed its <loc> list ` +
                `(${beforeLocs.length} -> ${afterLocs.length}) — refusing to write it.`,
            );
          }

          writeFileSync(file, after);
          console.log(
            `pretty-sitemap: ${name} — ${afterLocs.length} URL(s) on their own lines, ` +
              `stylesheet applied`,
          );
        }
      },
    },
  };
}
