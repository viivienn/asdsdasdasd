import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { breadcrumbJsonLd, organizationJsonLd, pageMetadata, SITE_URL } from "./site.ts";
import {
  INDEXABLE_STATIC_ROUTES,
  NOINDEX_ROUTES,
  isCanonicalProductionUrl,
  renderSitemap,
} from "./seo.ts";
import { CLASS_LANDINGS, CONCERN_LANDINGS, LANDINGS } from "./seo-taxonomy.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("production metadata uses the configured .app canonical origin", () => {
  assert.equal(SITE_URL, "https://aestheticindex.app");
  const head = pageMetadata({
    title: "Example | Aesthetic Index",
    description: "A useful description.",
    path: "/example/",
  });
  assert.deepEqual(head.links, [{ rel: "canonical", href: "https://aestheticindex.app/example" }]);
  assert.equal(head.meta.filter((item) => "title" in item).length, 1);
  assert.match(head.meta.find((item) => item.name === "robots")?.content ?? "", /^index, follow/);
  assert.equal(isCanonicalProductionUrl("https://aestheticindex.app/example"), true);
  assert.equal(isCanonicalProductionUrl("https://aestheticindex.co/example"), false);
});

test("indexable and noindex route registries never overlap", () => {
  const overlap = INDEXABLE_STATIC_ROUTES.filter((route) =>
    (NOINDEX_ROUTES as readonly string[]).includes(route),
  );
  assert.deepEqual(overlap, []);
  assert.equal(new Set(INDEXABLE_STATIC_ROUTES).size, INDEXABLE_STATIC_ROUTES.length);
});

test("sitemap renderer deduplicates canonical paths and escapes XML", () => {
  const xml = renderSitemap([
    { path: "/example/", lastmod: "2026-08-01T10:00:00Z" },
    { path: "/example", lastmod: "2026-08-02" },
    { path: "/a&b" },
  ]);
  assert.equal((xml.match(/<loc>https:\/\/aestheticindex\.app\/example<\/loc>/g) ?? []).length, 1);
  assert.match(xml, /a&amp;b/);
  assert.match(xml, /<lastmod>2026-08-02<\/lastmod>/);
});

test("concern and class landing slugs are unique and canonical", () => {
  assert.equal(CONCERN_LANDINGS.length, 4);
  assert.equal(CLASS_LANDINGS.length, 6);
  assert.equal(new Set(LANDINGS.map((item) => `${item.kind}:${item.slug}`)).size, LANDINGS.length);
  for (const landing of LANDINGS) {
    assert.match(landing.slug, /^[a-z0-9-]+$/);
    assert.ok(landing.definition.length > 40);
    assert.ok(landing.limitations.length > 40);
  }
});

test("organization and breadcrumb JSON-LD are serializable and canonical", () => {
  const organization = organizationJsonLd();
  const graph = [
    organization,
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Treatments", path: "/treatments" },
    ]),
  ];
  const serialized = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  assert.doesNotThrow(() => JSON.parse(serialized));
  assert.equal(organization["@id"], "https://aestheticindex.app#organization");
});

test("crawler rules separate search retrieval from model training", async () => {
  const robots = await read("routes/robots[.]txt.ts");
  for (const crawler of [
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "Claude-SearchBot",
    "Claude-User",
  ]) {
    assert.match(robots, new RegExp(`\\"${crawler}\\"`));
  }
  assert.match(robots, /User-agent: GPTBot/);
  assert.match(robots, /User-agent: ClaudeBot/);
  assert.match(robots, /Sitemap: \$\{SITE_URL\}\/sitemap\.xml/);
});

test("homepage has one explicit product H1 and data-derived counts", async () => {
  const source = await read("routes/index.tsx");
  assert.equal((source.match(/<h1\b/g) ?? []).length, 1);
  assert.match(source, /Compare cosmetic treatments, risks, downtime, and prices\./);
  assert.match(source, /\{treatments\.length\} published profiles/);
  assert.doesNotMatch(source, /Eight treatments/);
});

test("route source files do not contain image elements without alt attributes", async () => {
  async function files(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map((entry) => {
        const path = join(dir, entry.name);
        return entry.isDirectory() ? files(path) : Promise.resolve([path]);
      }),
    );
    return nested.flat().filter((path) => path.endsWith(".tsx"));
  }
  for (const file of await files(fileURLToPath(root))) {
    const source = await readFile(file, "utf8");
    for (const tag of source.match(/<img\b[^>]*>/gs) ?? []) {
      assert.match(tag, /\balt=/, `${file} has an <img> without alt text`);
    }
  }
});

test("sitemap is database-gated and excludes private/report routes", async () => {
  const sitemap = await read("routes/sitemap[.]xml.ts");
  assert.match(sitemap, /listReviewedComparisons/);
  assert.match(sitemap, /listRegionalPriceLandings/);
  assert.match(sitemap, /INDEXABLE_STATIC_ROUTES/);
  assert.doesNotMatch(sitemap, /path:\s*["']\/auth/);
  assert.doesNotMatch(sitemap, /path:\s*["']\/my-research/);
  assert.doesNotMatch(sitemap, /aesthetic-treatment-price-index["']/);
});
