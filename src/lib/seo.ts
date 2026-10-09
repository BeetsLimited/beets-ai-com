import { HTML_LANG, type Locale } from "./i18n";

/**
 * SEO / AI-search surface: social meta + structured data.
 *
 * Two audiences, one source of truth:
 *  - classic search engines read the JSON-LD graph and the Open Graph tags;
 *  - AI answer engines (AI Overviews, ChatGPT, Perplexity, Copilot) read the
 *    same graph plus `public/llms.txt` to decide what this site is and what it
 *    may quote.
 *
 * Everything here is emitted at build time into static HTML — no client JS — so
 * crawlers that do not execute JavaScript still see all of it.
 */

export const SITE_URL = "https://beets-ai.com";
export const ORG_NAME = "Beets Limited";
export const ORG_URL = "https://beets3d.com";
export const ORG_LOGO = `${SITE_URL}/favicon-192.png`;
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * What a download actually is. Attachments are Office documents now, not
 * printable web pages, so the format follows the extension — declaring
 * `text/html` for an .xlsx misdescribes the file to every consumer of the
 * structured data.
 */
const OFFICE_MIME: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  pdf: "application/pdf",
  html: "text/html",
};
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Resource heroes are generated at 16:9 by scripts + the image skill, so their
 * size is a known constant rather than something to measure per page.
 */
export const HERO_IMAGE_WIDTH = 1280;
export const HERO_IMAGE_HEIGHT = 720;

const OG_LOCALE: Record<Locale, string> = { "zh-HK": "zh_HK", en: "en_HK" };

const SITE_NAME: Record<Locale, string> = {
  "zh-HK": "BEETS AI — 香港免費 AI 教育資源",
  en: "BEETS AI — Free Hong Kong AI Teaching Resources",
};

/** Open Graph + Twitter Card values for one page. */
export function socialMeta(opts: {
  title: string;
  description: string;
  url: string;
  locale: Locale;
  type?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}) {
  const type = opts.type ?? "website";
  /**
   * Open Graph and Twitter require an ABSOLUTE image URL. A root-relative path
   * like "/images/x.webp" is silently ignored by most scrapers — the card just
   * renders with no picture, which looks like "the image didn't upload" rather
   * than a spec violation. Always absolutise.
   */
  const rawImage = opts.image ?? OG_IMAGE;
  const image = /^https?:\/\//.test(rawImage) ? rawImage : `${SITE_URL}${rawImage}`;
  /**
   * A page that supplies its own image is supplying a resource hero, which the
   * pipeline generates at 16:9. The declared size must follow the image:
   * advertising the site card's 1200x630 for a 1280x720 hero makes every share
   * surface crop or letterbox it.
   */
  const imageWidth = opts.imageWidth ?? (opts.image ? HERO_IMAGE_WIDTH : OG_IMAGE_WIDTH);
  const imageHeight = opts.imageHeight ?? (opts.image ? HERO_IMAGE_HEIGHT : OG_IMAGE_HEIGHT);
  const imageAlt =
    opts.imageAlt ?? (opts.locale === "en" ? SITE_NAME.en : SITE_NAME["zh-HK"]);
  return {
    siteName: SITE_NAME[opts.locale],
    type,
    title: opts.title,
    description: opts.description,
    url: opts.url,
    image,
    imageAlt,
    imageWidth,
    imageHeight,
    locale: OG_LOCALE[opts.locale],
    /** The other edition, so a share in one language links the other. */
    localeAlternate: opts.locale === "en" ? OG_LOCALE["zh-HK"] : OG_LOCALE.en,
  };
}

/** The publisher, on every page — the site's identity for both audiences. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${ORG_URL}/#organization`,
    name: ORG_NAME,
    url: ORG_URL,
    logo: ORG_LOGO,
    description:
      "Hong Kong STEM, AI and 3D-printing education company. Publishes BEETS AI, a free library of Hong Kong AI teaching resources.",
    areaServed: { "@type": "Place", name: "Hong Kong" },
    knowsLanguage: ["zh-HK", "en"],
    sameAs: [ORG_URL],
  };
}

/** The site itself, carrying both language editions. */
export function webSiteLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME[lang],
    url: SITE_URL,
    inLanguage: HTML_LANG[lang],
    publisher: { "@id": `${ORG_URL}/#organization` },
    description:
      lang === "en"
        ? "A free library of AI teaching resources for Hong Kong schools: worksheets, lesson plans and school-planning templates, each naming the official document it is built on."
        : "香港教師免費 AI 教學資源庫：工作紙、教案及校本規劃範本，每份列明所依據的官方文件。",
    isAccessibleForFree: true,
  };
}

/** A breadcrumb trail for a nested page. */
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

type ResourceEntry = {
  data: {
    title: string;
    description: string;
    subject: string;
    stage: string;
    theme: string;
    sources?: string[];
    author: string;
    reviewer?: string;
    version?: string;
    date: Date | string;
    fileType?: string[];
    downloads?: string[];
    image?: string;
    type: string;
  };
};

/**
 * One learning resource, described for search engines and answer engines.
 *
 * `LearningResource` is the schema.org type for teaching material (a subclass of
 * CreativeWork). The fields an AI engine needs in order to answer "what free
 * Hong Kong AI lesson material exists for P4 maths?" are exactly the ones below:
 * what it is, who it is for, what stage/subject, that it is free, and who
 * reviewed it.
 */
export function learningResourceLd(entry: ResourceEntry, lang: Locale, url: string) {
  const d = entry.data;
  const published = new Date(d.date).toISOString().slice(0, 10);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: d.title,
    description: d.description,
    url,
    inLanguage: HTML_LANG[lang],
    isAccessibleForFree: true,
    learningResourceType: d.type === "post" ? "Article" : "Worksheet",
    educationalLevel: d.stage,
    about: { "@type": "Thing", name: d.subject },
    keywords: [d.theme, d.stage, d.subject].filter(Boolean).join(", "),
    datePublished: published,
    dateModified: published,
    version: d.version,
    publisher: { "@id": `${ORG_URL}/#organization` },
    author: { "@type": "Organization", name: d.author },
    /** Reuse terms live on the about page. */
    license: `${SITE_URL}/about/`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  // schema.org wants an absolute URL here too.
  if (d.image) {
    ld.image = /^https?:\/\//.test(d.image) ? d.image : `${SITE_URL}${d.image}`;
    ld.thumbnailUrl = ld.image;
  }
  if (d.downloads?.length) {
    ld.encoding = d.downloads.map((path) => ({
      "@type": "MediaObject",
      contentUrl: `${SITE_URL}${path}`,
      encodingFormat: OFFICE_MIME[path.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream",
    }));
  }
  return ld;
}
