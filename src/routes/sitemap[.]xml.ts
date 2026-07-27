import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// TODO: replace with the project URL once the domain is live on Lovable hosting.
const BASE_URL = "";

/**
 * Only published, non-sample routes belong here. Comparison, treatment, and
 * pricing routes are excluded until sourced, verified records exist.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: Array<{ path: string; changefreq: string; priority: string }> = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/compare", changefreq: "weekly", priority: "0.8" },
          { path: "/treatments", changefreq: "weekly", priority: "0.8" },
          { path: "/methodology", changefreq: "monthly", priority: "0.5" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
        ];

        const { listComparisonSlugs, listTreatments } = await import("@/lib/content.server");
        const [slugs, treatments] = await Promise.all([listComparisonSlugs(), listTreatments()]);

        if (!slugs.isDemo) {
          for (const slug of slugs.data) {
            entries.push({ path: `/compare/${slug}`, changefreq: "monthly", priority: "0.7" });
          }
        }
        if (!treatments.isDemo) {
          for (const t of treatments.data) {
            entries.push({ path: `/treatments/${t.slug}`, changefreq: "monthly", priority: "0.7" });
          }
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              `  </url>`,
            ].join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});