import { SITE_URL, absoluteUrl } from "./site.ts";

export const INDEXABLE_STATIC_ROUTES = [
  "/",
  "/explore",
  "/compare",
  "/treatments",
  "/concerns",
  "/treatment-classes",
  "/prices",
  "/methodology",
  "/about",
  "/contact",
  "/medical-disclaimer",
  "/advertising-disclosure",
] as const;

export const NOINDEX_ROUTES = [
  "/auth",
  "/my-research",
  "/reports/aesthetic-treatment-price-index",
] as const;

export const PRIVATE_CRAWLER_PATHS = [
  "/admin/",
  "/auth",
  "/my-research",
  "/api/",
  "/internal/",
  "/preview/",
  "/staging/",
  "/.mcp/",
  "/mcp",
  "/.lovable/",
] as const;

export function normalizePublicPath(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
}

export function isPrivateCrawlerPath(pathname: string): boolean {
  const path = normalizePublicPath(pathname).toLowerCase();
  return PRIVATE_CRAWLER_PATHS.some((candidate) => {
    const normalized = candidate.toLowerCase();
    return path === normalized.replace(/\/$/, "") || path.startsWith(normalized);
  });
}

export function isCanonicalProductionUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === SITE_URL && url.href === absoluteUrl(url.pathname);
  } catch {
    return false;
  }
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export type SitemapEntry = {
  path: string;
  lastmod?: string | null;
};

export function renderSitemap(entries: SitemapEntry[]): string {
  const unique = new Map<string, SitemapEntry>();
  for (const entry of entries) {
    const path = normalizePublicPath(entry.path);
    unique.set(path, { ...entry, path });
  }
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...[...unique.values()]
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((entry) =>
        [
          "  <url>",
          `    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>`,
          entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod.slice(0, 10))}</lastmod>` : null,
          "  </url>",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
    `</urlset>`,
  ].join("\n");
}
