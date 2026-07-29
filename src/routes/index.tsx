import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCompareIndex } from "@/lib/content.functions";
import { Prose, SectionHeading } from "@/components/editorial";
import { CoverageRequestForm } from "@/components/demand-forms";
import { SiteSearch } from "@/components/site-search";
import { TreatmentVisual } from "@/components/treatment-visual";
import { GOAL_FILTERS } from "@/lib/taxonomy";
import { buildSearchIndex } from "@/lib/search-index";
import { absoluteUrl } from "@/lib/site";
import type { PopularComparison, TreatmentPickerRecord } from "@/lib/content-types";

export const Route = createFileRoute("/")({
  loader: () => fetchCompareIndex(),
  head: () => ({
    meta: [
      { title: "Aesthetic Index — Compare cosmetic treatments before you book" },
      {
        name: "description",
        content:
          "Compare cosmetic treatments on results, downtime, risks, reversibility, and publicly listed local prices in one clear place.",
      },
      { property: "og:title", content: "Compare cosmetic treatments before you book" },
      {
        property: "og:description",
        content:
          "Results, downtime, risks, reversibility, and publicly listed local prices—in one clear place.",
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
  const { treatments, comparisons, popularComparisons } = Route.useLoaderData();
  const searchIndex = buildSearchIndex(treatments, comparisons, popularComparisons);
  const featured = [...(treatments as TreatmentPickerRecord[])]
    .filter((entry) => entry.entity_type === "product" || entry.entity_type === "device")
    .sort((a, b) => a.sort_rank - b.sort_rank || a.name.localeCompare(b.name))
    .slice(0, 8);

  return (
    <>
      <section className="-mt-4 px-2 py-14 text-center sm:py-24">
        <h1 className="mx-auto max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          Find the treatment that fits
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Explore what's actually inside any cosmetic treatment.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <SiteSearch index={searchIndex} variant="hero" />
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Independent · no sponsorships · publicly listed prices
        </p>
      </section>

      <section className="mt-4">
        <SectionHeading>Browse by goal</SectionHeading>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GOAL_FILTERS.map((goal) => (
            <li key={goal.slug}>
              <Link
                to="/explore"
                search={{ goal: goal.slug }}
                className="block h-full card-soft card-hover p-4"
              >
                <span className="font-display text-base font-semibold">{goal.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{goal.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {featured.length ? (
        <section className="mt-14">
          <SectionHeading>Popular products &amp; devices</SectionHeading>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((entry) => (
              <li key={entry.id}>
                <Link
                  to="/treatments/$slug"
                  params={{ slug: entry.slug }}
                  className="flex h-full items-center gap-3 card-soft card-hover p-4"
                >
                  <TreatmentVisual name={entry.name} media={entry.media} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{entry.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {entry.category}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {popularComparisons.length ? (
        <section className="mt-14">
          <SectionHeading>Popular comparisons</SectionHeading>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularComparisons.map((comparison: PopularComparison) => (
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
        <p className="mt-3 text-sm text-muted-foreground">
          Ready to weigh two options?{" "}
          <Link to="/compare" className="underline underline-offset-4 hover:text-primary">
            Build a comparison
          </Link>
          .
        </p>
      </section>

      <section className="mt-14">
        <SectionHeading>How Aesthetic Index works</SectionHeading>
        <Prose>
          <p className="mt-4">
            We use structured comparisons instead of rankings. The most important differences appear
            first, with deeper details available only when you want them.
          </p>
          <p>
            For pricing, we publish only amounts tied to a public clinic source and the date
            observed. We do not estimate prices we cannot show you.
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
        <SectionHeading>Local pricing coverage</SectionHeading>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Coverage starts in San Francisco and expands by demand.{" "}
          <Link
            to="/prices/us/ca/$city/$treatment"
            params={{ city: "san-francisco", treatment: "botox" }}
            className="underline underline-offset-4 hover:text-primary"
          >
            See San Francisco Botox prices
          </Link>
          .
        </p>
        <div className="mt-5">
          <CoverageRequestForm />
        </div>
      </section>
    </>
  );
}
