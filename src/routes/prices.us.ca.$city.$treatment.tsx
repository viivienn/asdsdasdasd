import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCityPrices } from "@/lib/content.functions";
import {
  EmptyCoverage,
  LocalPriceSummary,
  PriceObservationTable,
} from "@/components/pricing-preview";
import { CoverageRequestForm, PriceAlertForm } from "@/components/demand-forms";
import { FeaturePreview } from "@/components/editorial";
import { PricingDisclaimer } from "@/components/disclaimers";
import type { PriceObservation } from "@/lib/content-types";

const CITY_LABELS: Record<string, string> = { "san-francisco": "San Francisco" };
const TREATMENT_LABELS: Record<string, string> = { botox: "Botox" };

export const Route = createFileRoute("/prices/us/ca/$city/$treatment")({
  loader: ({ params }) =>
    fetchCityPrices({ data: { city: params.city, treatment: params.treatment } }),
  head: ({ params, loaderData }) => {
    const city = CITY_LABELS[params.city] ?? params.city;
    const treatment = TREATMENT_LABELS[params.treatment] ?? params.treatment;
    const title = `${city} ${treatment} prices — publicly listed | Aesthetic Index`;
    const description = `Publicly advertised ${treatment} prices in ${city}, each with a source link and the date observed. No estimates.`;
    // Pricing pages stay noindex until manually verified records exist.
    const verified = (loaderData?.observations.length ?? 0) > 0;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `${city} ${treatment} prices` },
        { property: "og:description", content: description },
        { property: "og:url", content: `/prices/us/ca/${params.city}/${params.treatment}` },
        { property: "og:type", content: "website" },
        ...(verified ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [
        { rel: "canonical", href: `/prices/us/ca/${params.city}/${params.treatment}` },
      ],
    };
  },
  errorComponent: () => <p>We couldn't load pricing. Please refresh.</p>,
  component: PricingPage,
});

function PricingPage() {
  const { city, treatment } = Route.useParams();
  const { observations, cityKnown } = Route.useLoaderData();
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
        </>
      ) : (
        <>
          <div className="mt-8">
            <LocalPriceSummary observations={rows} />
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
        <PriceAlertForm treatmentSlug={treatment} />
      </section>

      <section className="mt-8">
        <CoverageRequestForm treatmentSlug={treatment} />
      </section>
    </>
  );
}