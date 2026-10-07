/**
 * Stable, human-readable URL slugs for BEETS AI resources.
 *
 * Slugs are built from the ENGLISH title so URLs stay ASCII and shareable.
 * Chinese titles are preserved in the page content, not the address.
 */

export interface ResourceParts {
  /** Learning stage, e.g. "P4", "S1". */
  stage: string;
  /** Subject, e.g. "Mathematics", "Primary Humanities". */
  subject: string;
  /** The specific classroom task, e.g. "HK population AI graph check". */
  task: string;
}

/**
 * Lowercase ASCII slug. Runs of any non-alphanumeric character collapse to a
 * single hyphen, and leading/trailing hyphens are trimmed.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The canonical, stable address for a resource page:
 * `/resources/<stage>-<subject>-<task>/`
 *
 * Stable addresses let analytics distinguish revised material from new
 * material (see the publishing workflow: keep the page, record the version).
 */
export function resourcePath({ stage, subject, task }: ResourceParts): string {
  const parts = [stage, subject, task].map(slugify);
  if (parts.some((part) => part === "")) {
    throw new Error(
      "resourcePath: stage, subject and task must each produce a non-empty slug",
    );
  }
  return `/resources/${parts.join("-")}/`;
}
