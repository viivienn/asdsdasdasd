import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchRegionalPriceDirectory } from "@/lib/content.functions";
import { FEATURES } from "@/lib/features";
import { PRICE_INDEX_PATH, publicPriceIndexRows } from "@/lib/price-index";
import { SITE, SITE_URL, absoluteUrl, organizationJsonLd, pageMetadata } from "@/lib/site";

export const Route = createFileRoute("/reports/aesthetic-treatment-price-index")({
  loader: () => fetchRegionalPriceDirectory(),
  head: ({ loaderData }) => {
    const published = FEATURES.priceIndexReport && Boolean(loaderData?.length);
    const base = pageMetadata({
      title: "Aesthetic Treatment Price Index | Aesthetic Index",
      description:
        "Annual research infrastructure for comparing compatible public cosmetic-treatment price estimates across supported US and Canadian markets.",
      path: PRICE_INDEX_PATH,
      indexable: published,
      type: "article",
    });
    return {
      ...base,
      scripts: published
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  organizationJsonLd(),
                  {
                    "@type": "Dataset",
                    "@id": `${absoluteUrl(PRICE_INDEX_PATH)}#dataset`,
                    name: "Aesthetic Treatment Price Index",
                    description: base.meta.find((item) => item.name === "description")?.content,
                    url: absoluteUrl(PRICE_INDEX_PATH),
                    creator: { "@id": `${SITE_URL}#organization` },
                    isAccessibleForFree: true,
                    license: SITE.pricingMethodology,
                    distribution: {
                      "@type": "DataDownload",
                      encodingFormat: "text/csv",
                      contentUrl: absoluteUrl(`${PRICE_INDEX_PATH}.csv`),
                    },
                  },
                ],
              }),
            },
          ]
        : [],
    };
  },
  component: PriceIndexReport,
});

function PriceIndexReport() {
  const pages = Route.useLoaderData();
  const rows = publicPriceIndexRows(pages);

  if (!FEATURES.priceIndexReport) {
    return (
      <>
        <h1 className="font-display text-4xl">Aesthetic Treatment Price Index</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          The report infrastructure is ready, but the annual report is not published. This page is
          excluded from search until the dataset has been approved as a report.
        </p>
        <p className="mt-6">
          <Link to="/prices" className="underline underline-offset-4">
            Browse the currently published treatment and market estimates
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <header className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Original research
        </p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Aesthetic Treatment Price Index</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Compatible public price estimates from the published Aesthetic Index regional dataset.
        </p>
      </header>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Market and treatment data</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-rule bg-card">
          <table className="w-full min-w-[55rem] text-sm">
            <thead>
              <tr className="border-b border-rule bg-muted/50 text-left">
                <th className="p-3">Market</th>
                <th className="p-3">Treatment</th>
                <th className="p-3">Basis</th>
                <th className="p-3">Low</th>
                <th className="p-3">Midpoint</th>
                <th className="p-3">High</th>
                <th className="p-3">Sources</th>
                <th className="p-3">Researched</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.market_slug}-${row.treatment_slug}`}
                  className="border-b border-rule last:border-0"
                >
                  <td className="p-3">{row.market}</td>
                  <td className="p-3">
                    <Link
                      to="/prices/$treatment/$region"
                      params={{ treatment: row.treatment_slug, region: row.market_slug }}
                      className="underline underline-offset-4"
                    >
                      {row.treatment}
                    </Link>
                  </td>
                  <td className="p-3">
                    {row.currency} {row.pricing_basis}
                  </td>
                  <td className="p-3">{row.low}</td>
                  <td className="p-3">{row.midpoint || "Not calculated"}</td>
                  <td className="p-3">{row.high}</td>
                  <td className="p-3">{row.source_count}</td>
                  <td className="p-3">{row.researched_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <article>
          <h2 className="font-display text-2xl">Methodology</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Only published, non-sample regional estimates with stored sources are included.
            Currency, pricing basis, and treatment area remain separate.
          </p>
          <Link to="/methodology" className="mt-3 inline-block underline underline-offset-4">
            Read the methodology
          </Link>
        </article>
        <article>
          <h2 className="font-display text-2xl">Citing this dataset</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Suggested attribution: “Aesthetic Treatment Price Index, Aesthetic Index,” with the
            research date and a link to this page.
          </p>
          <a
            href={`${PRICE_INDEX_PATH}.csv`}
            className="mt-3 inline-block underline underline-offset-4"
          >
            Download public CSV
          </a>
        </article>
      </section>
    </>
  );
}
