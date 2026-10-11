#!/usr/bin/env node
/**
 * Nav alignment gate: every item in the masthead's nav occupies the SAME line
 * height, so all of their labels share one baseline.
 *
 * The defect (Billy, 2026-10-11 — *"the items are not horizontally aligned… the
 * middle two are at different levels from the others"*): a `<details>` that sets
 * no `font-size` of its own keeps the BODY's 17px, so its line-box **strut** is
 * 29.75px against the plain links' 25.2px. `.site-nav` is `align-items: center`,
 * so the taller box is centred and its summary's text lands **1.7px below** the
 * links beside it — measured, 103.20 for the four links against 104.94 for the
 * two groups.
 *
 * Nothing about that is visible in the markup, in a screenshot, or to a vision
 * model, and no other gate in this repo can see it: it is a relationship between
 * two rules in the BUILT stylesheet. So the relationship is asserted directly.
 *
 * Reads `dist/` (run after `astro build`), because the built CSS is the truth —
 * a bundler or a later edit can drop a declaration the source still has.
 *
 *   1. the nav's links declare a font-size;
 *   2. the disclosure group declares THE SAME one — the whole point;
 *   3. the separator rule survives, because the row's other dependency is
 *      `.site-nav > * + *::before` (`a + a` silently drops the rule before every
 *      `<details>`, which is a different silent miss in the same bar).
 *
 * Exit code 1 on any problem.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

const read = (path) => {
  try {
    return readFileSync(path, "utf8");
  } catch {
    console.error(`✗ ${path.replace(`${DIST}/`, "dist/")} not found — run \`npm run build\` first.`);
    process.exit(1);
  }
};

const html = read(`${DIST}/index.html`);
const cssHref = (html.match(/_astro\/[A-Za-z0-9._-]+\.css/) || [])[0];
if (!cssHref) {
  console.error("✗ the home page links no stylesheet — nothing to check the nav against.");
  process.exit(1);
}
const css = read(`${DIST}/${cssHref}`);

/** The declarations of a rule, by its exact (minified) selector. */
const declarations = (selector) => {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\{([^}]*)\\}`);
  const match = css.match(pattern);
  return match ? match[1] : null;
};

const fontSizeOf = (decls) => (decls ?? "").match(/font-size:([^;]+)/)?.[1]?.trim();

const linkRule = declarations(".site-nav a");
const groupRule = declarations(".site-nav .nav-group");
const linkSize = fontSizeOf(linkRule);
const groupSize = fontSizeOf(groupRule);

const problems = [];
if (linkRule === null) {
  problems.push("the built stylesheet has no `.site-nav a` rule — did the nav move?");
} else if (!linkSize) {
  problems.push("`.site-nav a` declares no font-size, so the group has nothing to match.");
}
if (groupRule === null) {
  problems.push("the built stylesheet has no `.site-nav .nav-group` rule — did the menu groups move?");
} else if (!groupSize) {
  problems.push(
    "`.site-nav .nav-group` declares no font-size: a <details> then keeps the body's 17px, " +
      "its strut is 29.75px against the links' 25.2px, and its label sits 1.7px low " +
      "(Billy, 2026-10-11).",
  );
}
if (linkSize && groupSize && linkSize !== groupSize) {
  problems.push(
    `the nav's links are ${linkSize} and the menu groups are ${groupSize}: the two groups ` +
      `will not share the links' baseline, which is the 2026-10-11 misalignment.`,
  );
}
if (!css.includes(".site-nav>*+:before") && !css.includes(".site-nav>*+*::before")) {
  problems.push(
    "the separator rule `.site-nav > * + *::before` is gone — without it there is no light " +
      "rule between items, and `a + a` would drop it before every <details>.",
  );
}

if (problems.length > 0) {
  console.error("✗ nav alignment gate failed:");
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exit(1);
}

console.log(
  `nav alignment gate: the links and the ${css.includes(".site-nav .nav-menu") ? "two " : ""}menu ` +
    `group(s) both set font-size ${linkSize}, and the separator rule survives`,
);
