/**
 * GA4 event tracking for beets-ai.com — the browser half.
 *
 * Loaded by `../components/Analytics.astro` as a bundled module, NOT as an
 * inline script: an inline script ships its comments verbatim into the HTML of
 * every page, which put internal notes (and Chinese characters, on English
 * pages) into the published source. A bundled, minified module is stripped and
 * cached by hash. Keep it that way.
 *
 * Two events, and nothing else:
 *
 *   resource_view      once per resource page, carrying the resource's address.
 *   resource_download  on a click that downloads one of our files.
 *
 * GA4 sends `page_view` by itself for every page, which is what makes "views of
 * resource pages" a built-in report; `resource_view` exists to give that a
 * per-resource key instead of a per-URL one.
 *
 * The `gtag` function is defined by the inline stub in Analytics.astro and
 * queues onto `window.dataLayer`; gtag.js is loaded `async` and drains that
 * queue, so an event fired before the library arrives is still delivered.
 */
import { DOWNLOAD_HREF, RESOURCE_DOWNLOAD_EVENT, RESOURCE_VIEW_EVENT } from "./analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function track(event: string, params: Record<string, unknown>): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}

/**
 * Which resource this page is about. `ResourceView.astro` stamps the address on
 * the page's <article>; a page without it (home, about, a theme index) is not a
 * resource and sends no resource event.
 */
function resourceSlug(): string {
  const node = document.querySelector("[data-resource-slug]");
  return node?.getAttribute("data-resource-slug") ?? "";
}

function sendResourceView(): void {
  const slug = resourceSlug();
  if (slug) track(RESOURCE_VIEW_EVENT, { resource_slug: slug });
}

/**
 * Download clicks.
 *
 * Delegated on the document in the CAPTURE phase so the hit is still recorded
 * when something nearer the link handles or cancels the click. The click is
 * never prevented: the browser downloads the file exactly as before, and GA4
 * sends the hit with `sendBeacon` as the page goes away.
 */
function onDocumentClick(event: MouseEvent): void {
  const target = event.target as Element | null;
  const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!link?.href || !DOWNLOAD_HREF.test(link.href)) return;

  const file = link.href.split("/").pop()?.split("?")[0].split("#")[0] ?? "";
  const dot = file.lastIndexOf(".");

  track(RESOURCE_DOWNLOAD_EVENT, {
    file_name: file,
    file_extension: dot > -1 ? file.slice(dot + 1).toLowerCase() : "",
    link_url: link.href,
    link_text: (link.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 100),
    resource_slug: resourceSlug(),
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", sendResourceView);
} else {
  sendResourceView();
}
document.addEventListener("click", onDocumentClick, true);
