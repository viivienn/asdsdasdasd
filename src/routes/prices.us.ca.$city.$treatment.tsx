import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCityPrices } from "@/lib/content.functions";
import {
  EmptyCoverage,
  PriceDatasetSummary,
  PriceObservationTable,
} from "@/components/pricing-preview";
import { PriceUpdatesControl } from "@/components/account-actions";
import { FeaturePreview } from "@/components/editorial";
import { PricingDisclaimer } from "@/components/disclaimers";
import type { PriceObservation } from "@/lib/content-types";
import { SITE, SITE_URL, absoluteUrl, breadcrumbJsonLd, organizationJsonLd } from "@/lib/site";
import { FEATURES } from "@/lib/features";

const CITY_LABELS: Record<string, string> = { "san-francisco": "San Francisco" };
const TREATMENT_LABELS: Record<string, string> = { botox: "Botox" };

export const Route = createFileRoute("/prices/us/ca/$city/$treatment")({
  loader: ({ params }) =>
    FEATURES.clinicPriceDirectory
      ? fetchCityPrices({ data: { city: params.city, treatment: params.treatment } })
      : Promise.resolve({
          observations: [],
          cityKnown: false,
          clinicsChecked: 0,
          clinicsWithPublicPrices: 0,
        }),
  head: ({ params, loaderData }) => {
    const city = CITY_LABELS[params.city] ?? params.city;
    const treatment = TREATMENT_LABELS[params.treatment] ?? params.treatment;
    const title = `${city} ${treatment} prices — publicly listed | Aesthetic Index`;
    const description = `Publicly advertised ${treatment} prices in ${city}, each with a source link and the date observed. No estimates.`;
    // Pricing pages stay noindex until manually verified records exist.
    const verified = FEATURES.clinicPriceDirectory && (loaderData?.observations.length ?? 0) > 0;
    const url = absoluteUrl(`/prices/us/ca/${params.city}/${params.treatment}`);
    const dates = (loaderData?.observations ?? []).map((o) => o.observed_at).sort();
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `${city} ${treatment} prices` },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        ...(verified ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: verified
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  organizationJsonLd(),
                  breadcrumbJsonLd([
                    { name: "Home", path: "/" },
                    {
                      name: `${city} ${treatment} prices`,
                      path: `/prices/us/ca/${params.city}/${params.treatment}`,
                    },
                  ]),
                  {
                    "@type": "Dataset",
                    "@id": `${url}#dataset`,
                    name: `Publicly advertised ${treatment} prices in ${city}`,
                    description: `Individually sourced, publicly advertised ${treatment} prices collected from clinic websites in ${city}. Each observation records the amount, pricing unit, source URL and observation date.`,
                    url,
                    isAccessibleForFree: true,
                    license: SITE.pricingMethodology,
                    creator: { "@id": `${SITE_URL}#organization` },
                    spatialCoverage: city,
                    measurementTechnique:
                      "Manual collection of publicly listed prices from clinic websites",
                    variableMeasured: "Advertised price per stated pricing unit",
                    dateCreated: dates[0]?.slice(0, 10),
                    dateModified: dates[dates.length - 1]?.slice(0, 10),
                  },
                ],
              }),
            },
          ]
        : [],
    };
  },
  errorComponent: () => <p>We couldn't load pricing. Please refresh.</p>,
  component: PricingPage,
});

function PricingPage() {
  const { city, treatment } = Route.useParams();
  const { observations, cityKnown, clinicsChecked, clinicsWithPublicPrices } =
    Route.useLoaderData();

  if (!FEATURES.clinicPriceDirectory) {
    return (
      <>
        <h1 className="font-display text-4xl">Clinic price directory unavailable</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Aesthetic Index currently publishes researched regional estimates rather than
          clinic-specific price listings.
        </p>
        <p className="mt-6">
          <Link to="/" className="underline underline-offset-4">
            Check a regional estimate
          </Link>
        </p>
      </>
    );
  }
  const cityLabel = CITY_LABELS[city] ?? city;
  const treatmentLabel = TREATMENT_LABELS[treatment] ?? treatment;
  const rows = observations as PriceObservation[];

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap gap-1">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            {cityLabel} {treatmentLabel} prices
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 font-display text-4xl">
        {cityLabel} {treatmentLabel} prices
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Only prices a clinic has advertised publicly, each with a link to the page we found it on
        and the date we saw it. We do not estimate, model, or average prices we cannot show you.
      </p>

      {!cityKnown ? (
        <div className="mt-8 border border-rule bg-card p-6">
          <h2 className="text-xl">We don't cover this city yet</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Local pricing coverage currently starts with San Francisco.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <>
          <div
            role="status"
            className="mt-8 border border-rose bg-secondary p-5 text-sm text-rose-foreground"
          >
            <p className="font-medium">
              {cityLabel} {treatmentLabel} pricing is being verified.
            </p>
            <p className="mt-1">
              No clinic listing has cleared verification yet, so this page shows no prices rather
              than an estimate. It is excluded from search engines until it does.
            </p>
          </div>
          <div className="mt-6">
            <EmptyCoverage city={cityLabel} treatment={treatmentLabel} />
          </div>
          <PricingDisclaimer className="mt-6" />
        </>
      ) : (
        <>
          <div className="mt-8">
            <PriceDatasetSummary
              city={cityLabel}
              treatment={treatmentLabel}
              observations={rows}
              clinicsChecked={clinicsChecked}
              clinicsWithPublicPrices={clinicsWithPublicPrices}
            />
          </div>
          <PricingDisclaimer className="mt-6" />
          <div className="mt-6">
            <PriceObservationTable observations={rows} />
          </div>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            A range or median is only published once enough compatible, non-sample observations
            exist to compute one honestly.
          </p>
        </>
      )}

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <FeaturePreview title="Corrections">
          <p className="text-sm text-muted-foreground">
            Spotted a wrong or out-of-date price? Email{" "}
            <a href="mailto:corrections@aestheticindex.co" className="underline underline-offset-4">
              corrections@aestheticindex.co
            </a>{" "}
            with the clinic and the listing URL.
          </p>
        </FeaturePreview>
        <FeaturePreview title="Submit a public price">
          <p className="text-sm text-muted-foreground">
            Send a link to a publicly posted price to{" "}
            <a href="mailto:prices@aestheticindex.co" className="underline underline-offset-4">
              prices@aestheticindex.co
            </a>
            . We verify against the clinic's own page before publishing.
          </p>
        </FeaturePreview>
      </section>

      <section className="mt-12">
        <PriceUpdatesControl
          comparisonGroupSlug={treatment === "botox" ? "neuromodulator-brand" : treatment}
        />
      </section>
    </>
  );
}
