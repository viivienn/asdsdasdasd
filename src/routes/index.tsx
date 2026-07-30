import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCompareIndex } from "@/lib/content.functions";
import { TreatmentPicker } from "@/components/treatment-picker";
import { Prose, SectionHeading } from "@/components/editorial";
import { RegionalPriceLookup } from "@/components/regional-price-lookup";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => fetchCompareIndex(),
  head: () => ({
    meta: [
      { title: "Aesthetic Index — Compare treatments and typical local costs" },
      {
        name: "description",
        content:
          "Compare cosmetic treatments side by side and see researched regional price estimates by ZIP or postal code.",
      },
      { property: "og:title", content: "Compare treatments and typical local costs" },
      {
        property: "og:description",
        content:
          "Results, downtime, risks, sources, and researched regional price estimates in one clear place.",
      },
      { property: "og:url", content: absoluteUrl("/") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  errorComponent: () => <p>We couldn't load this page. Please refresh.</p>,
  component: Home,
});

function Home() {
  const { treatments, popularComparisons, familyRules } = Route.useLoaderData();

  return (
    <>
      <section className="-mt-10 px-2 py-4 text-center sm:-mt-14 sm:py-6">
        <h1 className="mx-auto max-w-3xl font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
          Compare treatments and see what they typically cost near you.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Understand differences in results, downtime, risks, and typical regional pricing.
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Source-backed comparisons · Sources shown
        </p>
      </section>

      <section className="mt-4">
        <SectionHeading>Compare treatments</SectionHeading>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Start with one item. We will show close matches, options in the same family, and selected
          beginner comparisons.
        </p>
        <div className="mt-5 card-soft p-4 sm:p-5">
          <TreatmentPicker treatments={treatments} familyRules={familyRules} />
        </div>
      </section>

      {popularComparisons.length ? (
        <section className="mt-14">
          <SectionHeading>Popular comparisons</SectionHeading>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularComparisons.map((comparison) => (
              <li key={comparison.slug}>
                <Link
                  to="/compare/$slug"
                  params={{ slug: comparison.slug }}
                  className="block h-full card-soft card-hover p-4"
                >
                  <span className="font-display text-base font-semibold">{comparison.label}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Results, downtime, trade-offs, and sources.
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-14">
        <SectionHeading>Explore the index</SectionHeading>
        <ul className="mt-5 flex flex-wrap gap-2">
          {[...treatments]
            .sort((a, b) => a.sort_rank - b.sort_rank || a.name.localeCompare(b.name))
            .slice(0, 12)
            .map((treatment) => (
              <li key={treatment.id}>
                <Link
                  to="/treatments/$slug"
                  params={{ slug: treatment.slug }}
                  className="inline-block rounded-full border border-rule bg-card px-4 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  {treatment.name}
                </Link>
              </li>
            ))}
        </ul>
        <Link to="/explore" className="mt-4 inline-block text-sm underline underline-offset-4">
          Browse brands, products, devices, and treatment types
        </Link>
      </section>

      <section className="mt-14">
        <SectionHeading>How Aesthetic Index works</SectionHeading>
        <Prose>
          <p className="mt-4">
            We use structured comparisons instead of rankings. The most important differences appear
            first, with deeper details available only when you want them.
          </p>
          <p>
            Regional estimates use stored, researched market data with the pricing basis, source
            count, and research date shown.
          </p>
          <p>
            We do not diagnose, recommend treatments, or rank providers.{" "}
            <Link to="/methodology" className="underline underline-offset-4">
              Read the methodology
            </Link>
            .
          </p>
        </Prose>
      </section>

      <section className="mt-14">
        <RegionalPriceLookup
          treatments={treatments.map((treatment) => ({
            id: treatment.id,
            slug: treatment.slug,
            name: treatment.name,
          }))}
        />
      </section>
    </>
  );
}
