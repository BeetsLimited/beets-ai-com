import { resourceIndexPath, resourcesPath, type Locale } from "./i18n";

/**
 * Resource routing helpers.
 *
 * Kept free of `astro:content` imports so the rules stay unit-testable: the
 * shapes below are the only thing these functions actually need from a content
 * entry.
 */

export interface LocalizedEntry {
  data: { address: string; draft: boolean; lang: string };
}

/** The same resource in the other language, matched on its address. */
export function findCounterpart<T extends LocalizedEntry>(entry: T, all: T[]): T | undefined {
  return all.find(
    (other) => other.data.lang !== entry.data.lang && other.data.address === entry.data.address,
  );
}

function otherLocaleOf(entry: LocalizedEntry): Locale {
  return entry.data.lang === "en" ? "zh-HK" : "en";
}

/**
 * Where the language switch goes from a resource page.
 *
 * Switching must never land on a 404, and publication state is per language: a
 * resource can be published in Traditional Chinese while its English edition is
 * still a draft. So the counterpart is only a valid target when both editions
 * share the same state — otherwise the switch falls back to that language's
 * resource index, which always exists.
 */
export function alternateHrefFor<T extends LocalizedEntry>(entry: T, all: T[]): string {
  const target = otherLocaleOf(entry);
  const counterpart = findCounterpart(entry, all);
  if (!counterpart || counterpart.data.draft !== entry.data.draft) {
    return resourceIndexPath(target);
  }
  return resourcesPath(target, entry.data.address);
}

/**
 * Build-time invariant: every resource exists in every language.
 *
 * The content loader silently drops entries that collide on a reserved field —
 * it kept one edition of a resource and discarded the other, and the only
 * symptom was half the library missing from the built site. Rather than trust
 * that, every page that lists content runs this, so a missing edition breaks
 * the build instead of quietly shipping.
 */
export function assertPairedEditions<T extends LocalizedEntry>(entries: T[], where: string): void {
  const counts = new Map<string, string[]>();
  for (const entry of entries) {
    counts.set(entry.data.address, [...(counts.get(entry.data.address) ?? []), entry.data.lang]);
  }

  const broken = Array.from(counts).filter(([, langs]) => new Set(langs).size !== 2);
  if (broken.length) {
    const detail = broken
      .map(([address, langs]) => `${address} (${langs.sort().join(", ")})`)
      .join("; ");
    throw new Error(
      `${where}: every resource needs one edition per language, but got ${detail}. ` +
        `Check for duplicate frontmatter fields the content loader reserves.`,
    );
  }
}
