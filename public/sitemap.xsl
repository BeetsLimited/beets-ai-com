<?xml version="1.0" encoding="UTF-8"?>
<!--
  The view a browser shows for /sitemap-index.xml and /sitemap-0.xml.

  Referenced by `<?xml-stylesheet?>` in both files, added by
  src/lib/pretty-sitemap.mjs. Without it a browser renders an XML document by
  printing its TEXT NODES and collapsing whitespace, so a 52-URL sitemap arrives
  as one wrapped block of concatenated URLs — indistinguishable from a broken
  file (Billy, 2026-10-12). With it the browser renders this table instead.

  Crawlers are unaffected: sitemap processors ignore `xml-stylesheet` and read
  the XML. This file is for the human who has to press "Submit" in Search
  Console and wants to see what they are submitting.

  XSLT 1.0 on purpose — it is the version every browser implements.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sm xhtml">

  <xsl:output method="html" encoding="UTF-8"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Sitemap — beets-ai.com</title>
        <style>
          :root { --corporate: #e10707; --ink: #080808; --muted: #6f6f6f;
                  --line: #e8e6e6; --surface: #f3f3f3; }
          body { margin: 0; padding: 2.5rem clamp(1rem, 5vw, 3rem); color: var(--ink);
                 background: #fff; font: 16px/1.6 -apple-system, BlinkMacSystemFont,
                 "Segoe UI", Roboto, "Noto Sans TC", sans-serif; }
          header { border-bottom: 4px solid var(--corporate); padding-bottom: 1rem;
                   margin-bottom: 1.5rem; }
          h1 { margin: 0 0 .35rem; font-size: 1.6rem; font-weight: 600; }
          .lede { margin: 0; color: var(--muted); font-size: .95rem; }
          .lede strong { color: var(--ink); }
          table { border-collapse: collapse; width: 100%; }
          th, td { text-align: left; padding: .55rem .8rem; border-bottom: 1px solid var(--line);
                   vertical-align: top; }
          th { background: var(--surface); font-size: .8rem; letter-spacing: .06em;
               text-transform: uppercase; color: var(--muted); position: sticky; top: 0; }
          td.n { color: var(--muted); font-variant-numeric: tabular-nums; width: 3rem; }
          a { color: var(--corporate); text-decoration: none; }
          a:hover { text-decoration: underline; }
          code { font-size: .85rem; color: var(--muted); }
          .alt { display: block; font-size: .85rem; color: var(--muted); }
          footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--line);
                   color: var(--muted); font-size: .85rem; }
        </style>
      </head>
      <body>
        <header>
          <h1>
            <xsl:choose>
              <xsl:when test="sm:urlset">Sitemap</xsl:when>
              <xsl:otherwise>Sitemap index</xsl:otherwise>
            </xsl:choose>
            — beets-ai.com
          </h1>
          <p class="lede">
            <xsl:choose>
              <xsl:when test="sm:urlset">
                <strong><xsl:value-of select="count(sm:urlset/sm:url)" /></strong>
                pages, each with its language alternates. This is the XML a search
                engine reads; this table is only how your browser chooses to show it.
              </xsl:when>
              <xsl:otherwise>
                <strong><xsl:value-of select="count(sm:sitemapindex/sm:sitemap)" /></strong>
                child sitemap(s). Open one below to see the pages it lists.
              </xsl:otherwise>
            </xsl:choose>
          </p>
        </header>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>URL</th>
              <xsl:if test="sm:urlset"><th>Language alternates</th></xsl:if>
            </tr>
          </thead>
          <tbody>
            <xsl:apply-templates select="sm:urlset/sm:url" />
            <xsl:apply-templates select="sm:sitemapindex/sm:sitemap" />
          </tbody>
        </table>

        <footer>
          Generated at build time by <code>@astrojs/sitemap</code>. Absolute URLs in the
          <code>http://www.sitemaps.org/schemas/sitemap/0.9</code> namespace; alternates in
          <code>http://www.w3.org/1999/xhtml</code>. View the raw XML with View Source.
        </footer>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="sm:url">
    <tr>
      <td class="n"><xsl:value-of select="position()" /></td>
      <td><a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></td>
      <td>
        <xsl:for-each select="xhtml:link">
          <span class="alt">
            <xsl:value-of select="@hreflang" /> — <xsl:value-of select="@href" />
          </span>
        </xsl:for-each>
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="sm:sitemap">
    <tr>
      <td class="n"><xsl:value-of select="position()" /></td>
      <td><a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></td>
      <xsl:if test="//sm:urlset"><td /></xsl:if>
    </tr>
  </xsl:template>

</xsl:stylesheet>
