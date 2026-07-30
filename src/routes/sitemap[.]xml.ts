import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";
import { FEATURES } from "@/lib/features";

const BASE_URL = SITE_URL;

/**
 * Only published, non-sample routes belong here. Comparison, treatment, and
 * pricing routes are excluded until sourced, verified records exist.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: Array<{
          path: string;
          changefreq: string;
          priority: string;
          lastmod?: string;
        }> = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/explore", changefreq: "weekly", priority: "0.9" },
          { path: "/compare", changefreq: "weekly", priority: "0.8" },
          { path: "/prices", changefreq: "monthly", priority: "0.7" },
          { path: "/treatments", changefreq: "weekly", priority: "0.8" },
          { path: "/methodology", changefreq: "monthly", priority: "0.5" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          { path: "/medical-disclaimer", changefreq: "yearly", priority: "0.2" },
          { path: "/advertising-disclosure", changefreq: "yearly", priority: "0.2" },
        ];

        const { listReviewedComparisons, listTreatments, listIndexablePricePages } =
          await import("@/lib/content.server");
        const [reviewed, treatments, pricePages] = await Promise.all([
          listReviewedComparisons(),
          listTreatments(),
          FEATURES.clinicPriceDirectory ? listIndexablePricePages() : Promise.resolve([]),
        ]);

        // Only profile-complete, sourced, explicitly indexable comparisons are
        // listed. Arbitrary compatible long-tail pairs remain noindex.
        for (const c of reviewed) {
          entries.push({
            path: `/compare/${c.slug}`,
            changefreq: "monthly",
            priority: "0.7",
            lastmod: c.last_reviewed_at?.slice(0, 10),
          });
        }
        if (!treatments.isDemo) {
          for (const t of treatments.data) {
            entries.push({
              path: `/treatments/${t.slug}`,
              changefreq: "monthly",
              priority: "0.7",
              lastmod: t.last_reviewed_at ? t.last_reviewed_at.slice(0, 10) : undefined,
            });
          }
        }
        // Price pages appear only when a real, non-sample observation exists.
        if (FEATURES.clinicPriceDirectory) {
          for (const p of pricePages) {
            entries.push({
              path: `/prices/us/ca/${p.city}/${p.treatment}`,
              changefreq: "weekly",
              priority: "0.6",
              lastmod: p.lastmod,
            });
          }
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
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
