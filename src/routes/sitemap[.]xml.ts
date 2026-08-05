import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { FEATURES } from "@/lib/features";
import { INDEXABLE_STATIC_ROUTES, renderSitemap, type SitemapEntry } from "@/lib/seo";
import { CLASS_LANDINGS, CONCERN_LANDINGS } from "@/lib/seo-taxonomy";

/** Canonical, complete, public URLs only. Draft and user-specific routes never enter this list. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const {
          getTaxonomyLanding,
          listIndexablePricePages,
          listRegionalPriceLandings,
          listReviewedComparisons,
          listTreatments,
        } = await import("@/lib/content.server");
        const [
          reviewed,
          treatments,
          regionalPricePages,
          clinicPricePages,
          concernPages,
          classPages,
        ] = await Promise.all([
          listReviewedComparisons(),
          listTreatments(),
          listRegionalPriceLandings(),
          FEATURES.clinicPriceDirectory ? listIndexablePricePages() : Promise.resolve([]),
          Promise.all(
            CONCERN_LANDINGS.map((landing) => getTaxonomyLanding("concern", landing.slug)),
          ),
          Promise.all(CLASS_LANDINGS.map((landing) => getTaxonomyLanding("class", landing.slug))),
        ]);

        const entries: SitemapEntry[] = INDEXABLE_STATIC_ROUTES.map((path) => ({ path }));
        entries.push(
          ...CONCERN_LANDINGS.filter((_, index) =>
            Boolean(concernPages[index]?.treatments.length && concernPages[index]?.sources.length),
          ).map((landing) => ({ path: `/concerns/${landing.slug}` })),
          ...CLASS_LANDINGS.filter((_, index) =>
            Boolean(classPages[index]?.treatments.length && classPages[index]?.sources.length),
          ).map((landing) => ({ path: `/treatment-classes/${landing.slug}` })),
          ...reviewed.map((comparison) => ({
            path: `/compare/${comparison.slug}`,
            lastmod: comparison.last_reviewed_at,
          })),
          ...(!treatments.isDemo
            ? treatments.data
                .filter((treatment) => treatment.last_reviewed_at)
                .map((treatment) => ({
                  path: `/treatments/${treatment.slug}`,
                  lastmod: treatment.last_reviewed_at,
                }))
            : []),
          ...regionalPricePages.map((page) => ({
            path: `/prices/${page.treatment.slug}/${page.estimate.region_slug}`,
            lastmod: page.lastmod,
          })),
          ...clinicPricePages.map((page) => ({
            path: `/prices/us/ca/${page.city}/${page.treatment}`,
            lastmod: page.lastmod,
          })),
        );

        return new Response(renderSitemap(entries), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
