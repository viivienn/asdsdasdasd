import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PricingDisclaimer } from "@/components/disclaimers";
import { PriceUpdatesControl } from "@/components/account-actions";
import { fetchRegionalPriceLanding } from "@/lib/content.functions";
import { comparisonLabel } from "@/lib/content-types";
import {
  SITE,
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/site";

const money = (value: string, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
  }).format(Number(value));

export const Route = createFileRoute("/prices/$treatment/$region")({
  loader: async ({ params }) => {
    const page = await fetchRegionalPriceLanding({ data: params });
    if (!page) throw notFound();
    return page;
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.treatment.name ?? params.treatment.replaceAll("-", " ");
    const region = loaderData?.estimate.region_name ?? params.region.replaceAll("-", " ");
    const path = `/prices/${params.treatment}/${params.region}`;
    const description = loaderData
      ? `Research-based ${name} price range in ${region}, shown in ${loaderData.estimate.currency} with its pricing basis, source count, research date, and limitations.`
      : `Research-based ${name} pricing in ${region}.`;
    const base = pageMetadata({
      title: `${name} cost in ${region}: researched price range | Aesthetic Index`,
      description,
      path,
      type: "article",
      indexable: Boolean(loaderData),
    });
    return {
      ...base,
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  organizationJsonLd(),
                  breadcrumbJsonLd([
                    { name: "Home", path: "/" },
                    { name: "Prices", path: "/prices" },
                    { name: `${name} in ${region}`, path },
                  ]),
                  {
                    "@type": "Dataset",
                    "@id": `${absoluteUrl(path)}#dataset`,
                    name: `${name} researched prices in ${region}`,
                    description,
                    url: absoluteUrl(path),
                    isAccessibleForFree: true,
                    creator: { "@id": `${SITE_URL}#organization` },
                    license: SITE.pricingMethodology,
                    dateModified: loaderData.estimate.researched_at,
                    temporalCoverage: loaderData.estimate.researched_at,
                    spatialCoverage: loaderData.estimate.region_name,
                    measurementTechnique: loaderData.estimate.methodology_note,
                    variableMeasured: `${loaderData.estimate.currency} ${loaderData.estimate.pricing_unit}`,
                    citation: loaderData.estimate.source_urls,
                  },
                ],
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <div>
      <h1 className="font-display text-3xl">Price estimate not available</h1>
      <p className="mt-3 text-muted-foreground">
        This treatment and market do not have a complete published estimate.
      </p>
      <Link to="/prices" className="mt-4 inline-block underline underline-offset-4">
        Browse available markets
      </Link>
    </div>
  ),
  component: RegionalPricePage,
});

function RegionalPricePage() {
  const { treatment, estimate, relatedComparisons } = Route.useLoaderData();
  const low = money(estimate.estimated_low, estimate.currency);
  const high = money(estimate.estimated_high, estimate.currency);
  const midpoint = estimate.estimated_median ?? estimate.estimated_average;

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap gap-1">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/prices">Prices</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            {treatment.name} in {estimate.region_name}
          </li>
        </ol>
      </nav>

      <header className="mt-5 max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Researched {estimate.currency} estimate
        </p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">
          {treatment.name} cost in {estimate.region_name}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A dated summary of compatible public pricing sources, not a clinic quote.
        </p>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Price summary">
        <Summary label="Researched range" value={`${low}–${high}`} />
        <Summary
          label={estimate.estimated_median ? "Median" : "Typical midpoint"}
          value={midpoint ? money(midpoint, estimate.currency) : "Not calculated"}
        />
        <Summary label="Pricing basis" value={estimate.pricing_unit} />
        <Summary label="Compatible sources" value={String(estimate.source_count)} />
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-rule bg-card p-5">
          <h2 className="font-display text-2xl">How this estimate was assembled</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium">Research date</dt>
              <dd className="mt-1 text-muted-foreground">{estimate.researched_at}</dd>
            </div>
            <div>
              <dt className="font-medium">Treatment area</dt>
              <dd className="mt-1 text-muted-foreground">
                {estimate.treatment_area || "Not normalized to one area"}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Inclusions and exclusions</dt>
              <dd className="mt-1 leading-6 text-muted-foreground">{estimate.methodology_note}</dd>
            </div>
          </dl>
        </article>
        <article className="rounded-2xl border border-rule bg-secondary p-5">
          <h2 className="font-display text-2xl">Limitations</h2>
          <p className="mt-3 text-sm leading-6">{estimate.limitations}</p>
          <p className="mt-4 text-sm">
            <Link to="/methodology" className="underline underline-offset-4">
              Read the full pricing methodology
            </Link>
          </p>
        </article>
      </section>

      <section id="sources" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl">Public pricing sources</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {estimate.source_urls.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="nofollow noopener"
                className="break-all underline underline-offset-4"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <article>
          <h2 className="font-display text-2xl">Research the treatment</h2>
          <Link
            to="/treatments/$slug"
            params={{ slug: treatment.slug }}
            className="mt-3 inline-block underline underline-offset-4"
          >
            {treatment.name}: uses, risks, downtime, and sources
          </Link>
        </article>
        {relatedComparisons.length ? (
          <article>
            <h2 className="font-display text-2xl">Related comparisons</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {relatedComparisons.map((comparison) => (
                <li key={comparison.slug}>
                  <Link
                    to="/compare/$slug"
                    params={{ slug: comparison.slug }}
                    className="underline underline-offset-4"
                  >
                    {comparisonLabel(comparison.slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </section>

      <section className="mt-12">
        <PriceUpdatesControl treatmentId={treatment.id} />
      </section>
      <PricingDisclaimer className="mt-8" />
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <dl className="rounded-2xl border border-rule bg-card p-4">
      <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-display text-xl">{value}</dd>
    </dl>
  );
}
