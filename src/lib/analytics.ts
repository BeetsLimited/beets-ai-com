/**
 * Google Analytics 4 — measurement configuration for beets-ai.com.
 *
 * One place for the two things that would otherwise be retyped in the layout
 * and in the tracker: the measurement ID and the event names.
 *
 * The ID is the **measurement ID** of the site's GA4 *web data stream*
 * (`G-…`), NOT the numeric property ID (`561153675`). Billy, 2026-10-28:
 * property 561153675 is "Beets AI". The measurement ID is in GA4 under
 * Admin → Data streams → the beets-ai.com stream → "Measurement ID".
 * G-2EDTDP179D is that ID, supplied by Billy 2026-10-28.
 *
 * While `GA_MEASUREMENT_ID` is empty the layout emits no tag at all, so a build
 * that has not been given the ID ships exactly the site it shipped before —
 * no half-configured Google script, no request to Google, nothing to unlearn.
 */

/** GA4 measurement ID (`G-…`). Empty ⇒ analytics is off for this build. */
export const GA_MEASUREMENT_ID: string = "G-2EDTDP179D";

/**
 * GA4 property ID, numeric. Not used by the tag — recorded here because this is
 * where anyone looking for "the property" will look, and the two IDs are
 * routinely confused.
 */
export const GA_PROPERTY_ID = "561153675";

/** Fired once when a resource page (/resources/<address>/ or /en/resources/<address>/) is viewed. */
export const RESOURCE_VIEW_EVENT = "resource_view";

/** Fired when a reader clicks a download link on a resource page. */
export const RESOURCE_DOWNLOAD_EVENT = "resource_download";

/**
 * What a download link looks like on this site: a file under `/files/`, in one
 * of the formats the library publishes (`content-downloads.test.ts` holds that
 * list).
 *
 * **Any depth below `/files/`** — the English editions live at
 * `/files/en/<address>.docx` while the Chinese ones sit at
 * `/files/<address>.docx`, and a pattern allowing only one segment silently
 * missed every English download. Verified against both editions, not assumed.
 *
 * Anchored on the path, not on the extension alone, so an off-site `.pdf` link
 * (an EDB circular in the 官方文件參考 section) is never counted as a download
 * of ours.
 */
export const DOWNLOAD_HREF =
  /\/files\/(?:[^/]+\/)*[^/]+\.(?:docx|xlsx|pptx|pdf|zip)(?:[?#].*)?$/i;
