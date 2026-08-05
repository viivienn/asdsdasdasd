import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeDollarSign, CalendarClock, FileSearch } from "lucide-react";
import { fetchCompareIndex, fetchRegionalPriceDirectory } from "@/lib/content.functions";
import { RegionalPriceLookup } from "@/components/regional-price-lookup";
import { absoluteUrl } from "@/lib/site";
import type { TreatmentPickerRecord } from "@/lib/content-types";
import type { RegionalPriceLanding } from "@/lib/content.server";

export const Route = createFileRoute("/prices/")({
  loader: async () => {
    const [experience, pages] = await Promise.all([
      fetchCompareIndex(),
      fetchRegionalPriceDirectory(),
    ]);
    return { ...experience, pages };
  },
  head: () => ({
    meta: [
      { title: "Local cosmetic treatment price estimates | Aesthetic Index" },
      {
        name: "description",
        content:
          "Check researched cosmetic treatment price estimates by US ZIP code or Canadian postal code, with pricing basis and source limitations shown.",
      },
      { property: "og:title", content: "Local cosmetic treatment price estimates" },
      { property: "og:url", content: absoluteUrl("/prices") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/prices") }],
  }),
  errorComponent: () => <p>We couldn't load local prices. Please refresh.</p>,
  component: Prices,
});

function Prices() {
  const { treatments, pages } = Route.useLoaderData();

  return (
    <>
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          United States &amp; Canada
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">
          See typical treatment prices near you.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Enter a ZIP or postal code to check researched estimates for the surrounding market. Every
          result keeps its pricing basis, research date, and limitations visible.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-4xl">
        <RegionalPriceLookup
          treatments={treatments.map((treatment: TreatmentPickerRecord) => ({
            id: treatment.id,
            slug: treatment.slug,
            name: treatment.name,
          }))}
        />
      </div>

      <section className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-rule bg-card p-5">
          <FileSearch className="size-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-display text-lg">Public sources</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Estimates use stored regional research, not live quotes or invented national averages.
          </p>
        </article>
        <article className="rounded-2xl border border-rule bg-card p-5">
          <BadgeDollarSign className="size-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-display text-lg">Comparable units</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Per-unit, per-vial, per-syringe, and treatment-area prices are kept separate.
          </p>
        </article>
        <article className="rounded-2xl border border-rule bg-card p-5">
          <CalendarClock className="size-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-display text-lg">Dated research</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Results show when sources were reviewed so older estimates are not presented as live.
          </p>
        </article>
      </section>

      {pages.length ? (
        <section className="mx-auto mt-14 max-w-5xl" aria-labelledby="published-prices-heading">
          <h2 id="published-prices-heading" className="font-display text-3xl">
            Published treatment and market estimates
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Every linked page has a stored research date, compatible pricing basis, public source
            list, and limitations. Empty markets are not listed.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page: RegionalPriceLanding) => (
              <li key={`${page.treatment.slug}-${page.estimate.region_slug}`}>
                <Link
                  to="/prices/$treatment/$region"
                  params={{ treatment: page.treatment.slug, region: page.estimate.region_slug }}
                  className="block h-full rounded-2xl border border-rule bg-card p-4 hover:border-primary"
                >
                  <span className="block font-medium">{page.treatment.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {page.estimate.region_name} · {page.estimate.currency} ·{" "}
                    {page.estimate.pricing_unit}
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {page.estimate.source_count} public sources · researched{" "}
                    {page.estimate.researched_at}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto mt-14 max-w-3xl border-t border-rule pt-10 text-sm text-muted-foreground">
        <h2 className="font-display text-2xl text-foreground">What the estimate means</h2>
        <p className="mt-3 leading-6">
          A local estimate summarizes compatible public pricing sources for the broader market
          associated with a ZIP or postal code. It is not a clinic quote and may not represent a
          provider inside that exact postal area.
        </p>
        <p className="mt-3 leading-6">
          Final cost can change with treatment area, quantity, provider, membership, promotion, and
          individual treatment needs. Confirm pricing directly before booking.
        </p>
        <Link
          to="/methodology"
          className="mt-4 inline-block font-medium text-primary underline underline-offset-4"
        >
          Read the pricing methodology
        </Link>
      </section>
    </>
  );
}
