const origin = (process.env.SEO_AUDIT_ORIGIN || process.argv[2] || "http://127.0.0.1:4173").replace(
  /\/$/,
  "",
);
const productionOrigin = "https://aestheticindex.app";

const response = await fetch(`${origin}/sitemap.xml`);
if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);
const xml = await response.text();
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
if (!paths.length) throw new Error("Sitemap contains no URLs");
if (new Set(paths).size !== paths.length) throw new Error("Sitemap contains duplicate URLs");

const seenTitles = new Map();
const seenDescriptions = new Map();
const errors = [];
const internalLinks = new Set();

for (const path of paths) {
  const page = await fetch(`${origin}${path}`, { redirect: "manual" });
  if (page.status !== 200) {
    errors.push(`${path}: expected 200, received ${page.status}`);
    continue;
  }
  const html = await page.text();
  const titleMatches = [...html.matchAll(/<title[^>]*>(.*?)<\/title>/gis)];
  if (titleMatches.length !== 1)
    errors.push(`${path}: expected one title, found ${titleMatches.length}`);
  const title = titleMatches[0]?.[1]?.trim();
  if (title) {
    if (seenTitles.has(title))
      errors.push(`${path}: duplicate title with ${seenTitles.get(title)}`);
    seenTitles.set(title, path);
  }
  const description = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i,
  )?.[1];
  if (!description) errors.push(`${path}: missing meta description`);
  else {
    if (seenDescriptions.has(description))
      errors.push(`${path}: duplicate description with ${seenDescriptions.get(description)}`);
    seenDescriptions.set(description, path);
  }
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1];
  if (canonical !== `${productionOrigin}${path === "/" ? "/" : path.replace(/\/$/, "")}`) {
    errors.push(`${path}: incorrect canonical ${canonical || "missing"}`);
  }
  if (/name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) {
    errors.push(`${path}: sitemap URL is noindex`);
  }
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) errors.push(`${path}: expected one H1, found ${h1Count}`);
  for (const block of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis,
  )) {
    try {
      JSON.parse(block[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
    } catch (error) {
      errors.push(`${path}: invalid JSON-LD (${error.message})`);
    }
  }
  for (const match of html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)) {
    try {
      const link = new URL(match[1], origin);
      if (link.origin === origin) internalLinks.add(link.pathname);
    } catch {
      /* malformed href is covered by the browser/accessibility pass */
    }
  }
}

for (const path of internalLinks) {
  const linked = await fetch(`${origin}${path}`, { redirect: "manual" });
  if (linked.status >= 400) errors.push(`Internal link ${path} returned ${linked.status}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `SEO route audit passed for ${paths.length} sitemap URLs and ${internalLinks.size} internal links.`,
);
