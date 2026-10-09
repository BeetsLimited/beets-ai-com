/**
 * The review gate — the ONE switch that decides whether content must pass human
 * review (fact-check + educator sign-off) before it appears at its public URL.
 *
 * ⚠️  TEMPORARILY DISABLED — Billy, 2026-10-10.
 *
 * Billy asked for the review process to be switched off while the site is being
 * built out, so that resources go live automatically without any approval step,
 * and to be switched back on before the site is rolled out to the public.
 * While it is off:
 *
 *   • every resource is published at its public URL, `draft: true` or not;
 *   • the fact-check and educator-attestation fields are NOT enforced by the
 *     content schema (`createResourceSchema(false)`);
 *   • the "draft, not reviewed" banner is not shown on public pages;
 *   • `/review/<address>/` mirrors are not built — there is nothing left to
 *     mirror, the public page *is* the draft. The `/review/` hub still lists
 *     every resource, its open checklist items and its unreviewed state.
 *
 * Content is NOT rewritten. An unreviewed resource keeps `draft: true` and keeps
 * its empty `reviewer`, so nothing false is recorded in the public repo. Turning
 * the gate back on restores the process exactly: those resources 404 at their
 * public URLs and reappear under `/review/`.
 *
 * RESTORE BEFORE PUBLIC ROLLOUT — either:
 *   • set `"reviewRequired": true` in `./review-gate.config.json` (the switch), or
 *   • build with `REVIEW_REQUIRED=true` in the environment.
 *
 * The switch lives in `review-gate.config.json` rather than here because a
 * SECOND consumer has to agree with it: `scripts/gen-llms-txt.mjs` decides which
 * items to list in `public/llms.txt`, and an llms.txt that advertised pages the
 * build had left 404 would be worse than no llms.txt at all. One file, both
 * readers.
 *
 * Tracked as a Jira item so it cannot be forgotten; every build prints a warning
 * while it is off (see `src/content.config.ts`).
 */
import gateConfig from "./review-gate.config.json";

/** The repo's standing policy. `false` = review temporarily disabled. */
export const DEFAULT_REVIEW_REQUIRED: boolean = gateConfig.reviewRequired;

/**
 * The effective mode for this build.
 *
 * A function, not a constant, so the test suite can exercise both modes through
 * the environment (`vi.stubEnv`). Anything other than the literal "false" — or
 * an empty value — means the gate is ON, so an unset variable can never be read
 * as "review disabled" by accident.
 */
export function reviewRequired(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const raw = env.REVIEW_REQUIRED;
  if (raw === undefined || raw === "") return DEFAULT_REVIEW_REQUIRED;
  return raw !== "false";
}

/**
 * Whether an entry is reachable at its public URL.
 *
 * With the gate ON this is the old rule (`!draft`). With it OFF every entry is
 * published, which is why this predicate — not a bare `!data.draft` — is what
 * every route and listing filters on.
 */
export function isPublished(
  data: { draft: boolean },
  required: boolean = reviewRequired(),
): boolean {
  return required ? !data.draft : true;
}
