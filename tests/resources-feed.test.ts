import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  buildResourcesFeed,
  FEED_PATH,
  FEED_SCHEMA_PATH,
  type FeedSource,
} from "../src/lib/resources-feed";
import { revisionFor } from "../src/lib/revisions";

/**
 * The public resource feed (/resources.json) is what external agents and
 * programs read to learn what beets-ai.com publishes, so the rules that shape it
 * are pinned here rather than left to the build:
 *
 *   - newest first, with a stable tie-break
 *   - one item per resource, both editions paired by address
 *   - the version and both dates come from the publish log, not frontmatter
 *   - the hero image is an absolute URL
 *   - resources only — posts share the collection but are not "resources"
 *
 * The built file itself is validated after the build by
 * `scripts/check-resources-feed.mjs` (it needs `dist/`, which does not exist when
 * these tests run in CI — check → test → build).
 */

const SITE = "https://beets-ai.com";

/** One content entry, in the shape `buildResourcesFeed` accepts. */
function entry(over: Partial<FeedSource["data"]> = {}): FeedSource {
  return {
    data: {
      address: "sample-resource",
      lang: "zh-HK",
      title: "樣本資源",
      type: "resource",
      theme: "C",
      stage: "P4-P6",
      audience: ["teachers"],
      image: "/images/sample-resource-hero.webp",
      version: "1.0",
      date: new Date("2026-10-08T00:00:00Z"),
      ...over,
    },
  };
}

/** Both editions of one resource. */
function pair(address: string, over: Partial<FeedSource["data"]> = {}): FeedSource[] {
  return [
    entry({ address, ...over }),
    entry({ address, lang: "en", title: `${address} (en)`, ...over }),
  ];
}

describe("buildResourcesFeed — payload", () => {
  it("names the schema and the origin, and counts what it lists", () => {
    const feed = buildResourcesFeed(pair("a-resource"), {
      site: SITE,
      generated: new Date("2026-10-21T01:00:00Z"),
    });

    expect(feed.$schema).toBe(`${SITE}${FEED_SCHEMA_PATH}`);
    expect(feed.site).toBe(SITE);
    expect(feed.count).toBe(1);
    expect(feed.resources).toHaveLength(1);
  });

  it("writes the build time in Hong Kong time with an explicit offset", () => {
    // 01:00 UTC is 09:00 in Hong Kong. Writing a local-time string without the
    // offset is how a consumer in another zone reads the wrong day.
    const feed = buildResourcesFeed([], { site: SITE, generated: new Date("2026-10-21T01:00:00Z") });
    expect(feed.generated).toBe("2026-10-21T09:00:00+08:00");
  });

  it("publishes the feed at the site root", () => {
    expect(FEED_PATH).toBe("/resources.json");
    expect(FEED_SCHEMA_PATH).toBe("/resources.schema.json");
  });
});

describe("buildResourcesFeed — pairing and URLs", () => {
  it("pairs both editions of one address into one item", () => {
    const feed = buildResourcesFeed(pair("ten-minute-ai-judgement-checks"), { site: SITE });

    expect(feed.resources).toHaveLength(1);
    const [item] = feed.resources;
    expect(item.id).toBe("ten-minute-ai-judgement-checks");
    expect(item.zh?.title).toBe("樣本資源");
    expect(item.en?.title).toBe("ten-minute-ai-judgement-checks (en)");
  });

  it("builds each edition's URL on its own path, with a trailing slash", () => {
    const feed = buildResourcesFeed(pair("a-resource"), { site: SITE });
    expect(feed.resources[0].zh?.url).toBe(`${SITE}/resources/a-resource/`);
    expect(feed.resources[0].en?.url).toBe(`${SITE}/en/resources/a-resource/`);
  });

  it("makes the hero image absolute — a relative path is unusable off-site", () => {
    const feed = buildResourcesFeed(pair("a-resource"), { site: SITE });
    expect(feed.resources[0].zh?.image).toBe(`${SITE}/images/sample-resource-hero.webp`);
    expect(feed.resources[0].en?.image).toBe(`${SITE}/images/sample-resource-hero.webp`);
  });

  it("keeps a hero that is already absolute and a page that has none", () => {
    const feed = buildResourcesFeed(
      [
        entry({ address: "absolute-hero", image: "https://cdn.example.com/a.webp" }),
        entry({ address: "no-hero", image: undefined }),
      ],
      { site: SITE },
    );
    const byId = Object.fromEntries(feed.resources.map((item) => [item.id, item]));
    expect(byId["absolute-hero"].zh?.image).toBe("https://cdn.example.com/a.webp");
    expect(byId["no-hero"].zh?.image).toBeUndefined();
  });

  it("keeps a half-published resource visible — the gate is what refuses to ship it", () => {
    // Hiding it here would make the feed lie by omission; CI fails on the
    // missing edition instead (scripts/check-resources-feed.mjs).
    const feed = buildResourcesFeed([entry({ address: "only-zh" })], { site: SITE });
    expect(feed.resources).toHaveLength(1);
    expect(feed.resources[0].zh).toBeDefined();
    expect(feed.resources[0].en).toBeUndefined();
  });
});

describe("buildResourcesFeed — what is listed", () => {
  it("lists resources only: a post is not a resource", () => {
    const feed = buildResourcesFeed(
      [entry({ address: "a-resource" }), entry({ address: "a-post", type: "post" })],
      { site: SITE },
    );
    expect(feed.resources.map((item) => item.id)).toEqual(["a-resource"]);
  });

  it("sorts newest publication first", () => {
    const feed = buildResourcesFeed(
      [
        ...pair("oldest", { date: new Date("2026-10-07T00:00:00Z") }),
        ...pair("newest", { date: new Date("2026-10-17T00:00:00Z") }),
        ...pair("middle", { date: new Date("2026-10-12T00:00:00Z") }),
      ],
      { site: SITE },
    );
    expect(feed.resources.map((item) => item.id)).toEqual(["newest", "middle", "oldest"]);
  });

  it("breaks a same-day tie by address, so the order is stable between builds", () => {
    const day = new Date("2026-10-15T00:00:00Z");
    const feed = buildResourcesFeed(
      [...pair("zebra", { date: day }), ...pair("alpha", { date: day })],
      { site: SITE },
    );
    expect(feed.resources.map((item) => item.id)).toEqual(["alpha", "zebra"]);
  });
});

describe("buildResourcesFeed — version and dates", () => {
  it("takes them from the publish log, never from frontmatter", () => {
    // A real tracked address, so this also proves the feed reads the same record
    // the page does. The frontmatter here claims 1.0 and an older date.
    const address = "ten-minute-ai-judgement-checks";
    const revision = revisionFor(address);
    expect(revision, "the publish log no longer tracks this address — pick another").toBeDefined();

    const feed = buildResourcesFeed(
      pair(address, { date: new Date("2020-01-01T00:00:00Z"), version: "1.0" }),
      { site: SITE },
    );
    const [item] = feed.resources;
    expect(item.version).toBe(revision!.version);
    expect(item.published).toBe(revision!.published);
    expect(item.updated).toBe(revision!.modified);
  });

  it("falls back to frontmatter for an address with no publish record yet", () => {
    const feed = buildResourcesFeed(
      pair("never-published-yet", {
        date: new Date("2026-10-20T00:00:00Z"),
        updated: new Date("2026-10-21T00:00:00Z"),
        version: "1.0",
      }),
      { site: SITE },
    );
    const [item] = feed.resources;
    expect(item.published).toBe("2026-10-20");
    expect(item.updated).toBe("2026-10-21");
    expect(item.version).toBe("1.0");
  });

  it("carries the facets a consumer filters on", () => {
    const feed = buildResourcesFeed(pair("a-resource"), { site: SITE });
    const [item] = feed.resources;
    expect(item.theme).toBe("C");
    expect(item.stage).toBe("P4-P6");
    expect(item.audience).toEqual(["teachers"]);
  });
});

describe("public/resources.schema.json", () => {
  const schema = JSON.parse(
    readFileSync(join(import.meta.dirname, "../public/resources.schema.json"), "utf8"),
  ) as {
    $id: string;
    required: string[];
    $defs: { resource: { required: string[]; properties: Record<string, unknown> } };
  };

  it("is published at the URL the feed names in its $schema field", () => {
    expect(schema.$id).toBe(`${SITE}${FEED_SCHEMA_PATH}`);
  });

  it("requires every field the feed always emits", () => {
    expect(new Set(schema.required)).toEqual(
      new Set(["site", "generated", "count", "resources"]),
    );
    // `$schema` is optional in the schema itself (a consumer may strip it), but
    // the per-item contract is not.
    expect(new Set(schema.$defs.resource.required)).toEqual(
      new Set(["id", "published", "updated", "version", "theme", "stage", "audience", "zh", "en"]),
    );
  });

  it("sits beside the feed in public/, so both are on the built site", () => {
    const files = readdirSync(join(import.meta.dirname, "../public"));
    expect(files).toContain("resources.schema.json");
  });
});
