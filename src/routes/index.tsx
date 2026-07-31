import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, GitCompareArrows, MapPin } from "lucide-react";
import { fetchCompareIndex } from "@/lib/content.functions";
import { SiteSearch } from "@/components/site-search";
import { TreatmentVisual } from "@/components/treatment-visual";
import { SectionHeading } from "@/components/editorial";
import { RegionalPriceLookup } from "@/components/regional-price-lookup";
import { buildSearchIndex } from "@/lib/search-index";
import { GOAL_FILTERS } from "@/lib/taxonomy";
import { absoluteUrl } from "@/lib/site";
import type { PopularComparison, TreatmentPickerRecord } from "@/lib/content-types";

export const Route = createFileRoute("/")({
  loader: () => fetchCompareIndex(),
  head: () => ({
    meta: [
      { title: "Aesthetic Index — Understand cosmetic treatments" },
      {
        name: "description",
        content:
          "Explore cosmetic treatment products, devices, and procedures. Compare similar options and see researched regional price estimates.",
      },
      { property: "og:title", content: "Understand cosmetic treatments before you book" },
      {
        property: "og:description",
        content:
          "Explore treatment profiles, compare related options, and check researched regional price estimates.",
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
  const featuredTreatments = [...treatments]
    .sort((a, b) => a.sort_rank - b.sort_rank || a.name.localeCompare(b.name))
    .slice(0, 8);
  const backgroundTreatments = featuredTreatments.slice(0, 6);

  return (
    <>
      <section className="relative -mx-5 -mt-10 min-h-[34rem] overflow-hidden border-b border-rule sm:-mt-14 sm:min-h-[39rem]">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {backgroundTreatments.map((treatment, index) => (
            <div
              key={treatment.id}
              className={`flex min-h-56 items-end justify-center rounded-2xl border border-rule bg-card/55 p-5 opacity-[0.22] ${
                index % 2 ? "translate-y-16" : ""
              }`}
            >
              <TreatmentVisual
                name={treatment.name}
                media={treatment.media}
                className="size-32 border-0 bg-transparent shadow-none"
              />
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_92%,transparent)_48%,color-mix(in_oklab,var(--color-background)_72%,transparent)_100%)]"
        />

        <div className="relative z-10 mx-auto flex min-h-[34rem] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center sm:min-h-[39rem]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            The structured index for aesthetic treatments
          </p>
          <h1 className="max-w-2xl font-display text-4xl leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
            Understand treatments before you book.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Search products, devices, and procedures. See what each one does, then compare similar
            options side by side.
          </p>
          <div className="mt-8 w-full max-w-2xl rounded-2xl border border-rule bg-background/95 p-3 shadow-lift backdrop-blur">
            <SiteSearch index={searchIndex} variant="hero" />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Try “Botox”</span>
              <span>“Sculptra”</span>
              <span>“skin tightening”</span>
            </div>
          </div>
        </div>
      </section>

      {featuredTreatments.length ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionHeading>Popular treatments</SectionHeading>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with a profile, then compare it with a closely related option.
              </p>
            </div>
            <Link
              to="/explore"
              search={{}}
              className="hidden items-center gap-1 text-sm font-medium sm:inline-flex"
            >
              Explore all <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featuredTreatments.map((treatment) => (
              <li key={treatment.id}>
                <Link
                  to="/treatments/$slug"
                  params={{ slug: treatment.slug }}
                  className="group flex h-full flex-col rounded-2xl border border-rule bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card sm:p-4"
                >
                  <TreatmentVisual
                    name={treatment.name}
                    media={treatment.media}
                    className="aspect-square size-auto w-full border-0 bg-muted/55"
                  />
                  <span className="mt-3 font-medium leading-tight group-hover:text-primary">
                    {treatment.name}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {treatment.manufacturer || treatment.brand_name || treatment.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-16">
        <SectionHeading>Explore by goal</SectionHeading>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Browse the approaches commonly discussed for a concern without turning the catalog into a
          personal treatment recommendation.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GOAL_FILTERS.map((goal, index) => (
            <li key={goal.slug}>
              <Link
                to="/explore"
                search={{ goal: goal.slug }}
                className={`block h-full rounded-2xl border border-rule p-5 transition hover:-translate-y-0.5 hover:border-primary ${
                  index % 4 === 0
                    ? "bg-sage"
                    : index % 4 === 1
                      ? "bg-secondary"
                      : index % 4 === 2
                        ? "bg-muted"
                        : "bg-rose"
                }`}
              >
                <span className="font-display text-lg font-semibold">{goal.label}</span>
                <span className="mt-2 block text-sm text-muted-foreground">{goal.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {popularComparisons.length ? (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionHeading>Popular comparisons</SectionHeading>
              <p className="mt-2 text-sm text-muted-foreground">
                Clean, attribute-by-attribute views of options people commonly research together.
              </p>
            </div>
            <Link
              to="/compare"
              className="hidden items-center gap-1 text-sm font-medium sm:inline-flex"
            >
              Build a comparison <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularComparisons.slice(0, 6).map((comparison: PopularComparison) => (
              <li key={comparison.slug}>
                <Link
                  to="/compare/$slug"
                  params={{ slug: comparison.slug }}
                  className="flex h-full items-center gap-4 rounded-2xl border border-rule bg-card p-5 transition hover:border-primary hover:shadow-card"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"
                  >
                    <GitCompareArrows className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium">{comparison.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Results, downtime, trade-offs, and sources
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-16 grid overflow-hidden rounded-3xl border border-rule bg-card lg:grid-cols-[0.9fr_1.1fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"
          >
            <MapPin className="size-5" />
          </span>
          <h2 className="mt-5 font-display text-3xl">See typical prices near you.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Check researched regional estimates by ZIP or Canadian postal code. Pricing basis,
            source count, research date, and limitations stay visible.
          </p>
          <Link
            to="/prices"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Open local prices <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="border-t border-rule bg-muted/35 p-4 sm:p-6 lg:border-l lg:border-t-0">
          <RegionalPriceLookup
            treatments={treatments.map((treatment: TreatmentPickerRecord) => ({
              id: treatment.id,
              slug: treatment.slug,
              name: treatment.name,
            }))}
          />
        </div>
      </section>

      <section className="mt-16 flex flex-col items-start justify-between gap-5 border-t border-rule pt-10 sm:flex-row sm:items-center">
        <div className="flex max-w-2xl gap-4">
          <BookOpen className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl">Evidence stays attached to the facts.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Aesthetic Index uses structured profiles and source-backed comparisons. It does not
              diagnose, prescribe, or rank providers.
            </p>
          </div>
        </div>
        <Link
          to="/methodology"
          className="shrink-0 rounded-full border border-rule bg-card px-4 py-2 text-sm font-medium hover:border-primary"
        >
          Read our methodology
        </Link>
      </section>
    </>
  );
}
