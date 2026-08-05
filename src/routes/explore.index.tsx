import { useMemo, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { z } from "zod";
import { fetchCatalog } from "@/lib/content.functions";
import {
  ENTITY_DESCRIPTION,
  ENTITY_GROUP_LABEL,
  type EntityType,
  type MarketCode,
  type Treatment,
  type TreatmentMedia,
} from "@/lib/content-types";
import { TreatmentVisual } from "@/components/treatment-visual";
import { SectionHeading } from "@/components/editorial";
import { GOAL_FILTERS, matchesGoal, slugifyType } from "@/lib/taxonomy";
import { absoluteUrl } from "@/lib/site";

interface CatalogEntryView extends Treatment {
  parent_name: string | null;
  parent_slug: string | null;
  media: TreatmentMedia | null;
  comparison_groups: string[];
  markets: MarketCode[];
}

const entitySchema = z.enum(["class", "brand_family", "product", "device", "procedure"]);
const searchSchema = z.object({
  type: z.string().optional(),
  goal: z.string().optional(),
  entity: entitySchema.optional(),
});

const ENTITY_TABS: Array<{ entity: EntityType; label: string }> = [
  { entity: "product", label: "Products" },
  { entity: "brand_family", label: "Brands" },
  { entity: "device", label: "Devices" },
  { entity: "procedure", label: "Procedures" },
  { entity: "class", label: "Treatment classes" },
];

export const Route = createFileRoute("/explore/")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (
      search.goal &&
      !search.type &&
      !search.entity &&
      GOAL_FILTERS.some((goal) => goal.slug === search.goal)
    ) {
      throw redirect({
        to: "/concerns/$slug",
        params: { slug: search.goal },
        statusCode: 301,
      });
    }
  },
  loader: () => fetchCatalog(),
  head: () => ({
    meta: [
      { title: "Explore cosmetic treatments, brands and devices | Aesthetic Index" },
      {
        name: "description",
        content:
          "Browse cosmetic treatment goals, treatment types, brand families, products, devices, and completed comparisons.",
      },
      { property: "og:title", content: "Explore cosmetic treatments, brands and devices" },
      { property: "og:url", content: absoluteUrl("/explore") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/explore") }],
  }),
  errorComponent: () => <p>We couldn't load the catalog. Please refresh.</p>,
  component: Explore,
});

function Explore() {
  const { entries, popularComparisons } = Route.useLoaderData() as {
    entries: CatalogEntryView[];
    popularComparisons: Array<{ slug: string; label: string; markets: MarketCode[] }>;
  };
  const search = Route.useSearch();
  const [query, setQuery] = useState("");
  const selectedType = search.type ?? "";
  const selectedGoal = search.goal ?? "";
  const selectedEntity = search.entity;

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (selectedEntity && entry.entity_type !== selectedEntity) return false;
      if (
        selectedType &&
        slugifyType(entry.category) !== selectedType &&
        slugifyType(entry.treatment_class) !== selectedType
      ) {
        return false;
      }
      const goalHaystack =
        `${entry.category} ${entry.treatment_class} ${entry.primary_purpose ?? ""}`.toLowerCase();
      if (selectedGoal && !matchesGoal(goalHaystack, selectedGoal)) return false;
      return (
        !normalized ||
        [
          entry.name,
          entry.category,
          entry.treatment_class,
          entry.primary_purpose,
          entry.manufacturer,
          entry.brand_name,
          entry.parent_name,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized))
      );
    });
  }, [entries, query, selectedEntity, selectedGoal, selectedType]);

  const types = [...new Set(entries.map((entry) => entry.category).filter(Boolean))].sort();
  const grouped = new Map<EntityType, CatalogEntryView[]>(
    ENTITY_TABS.map(({ entity }) => [
      entity,
      visible.filter((entry) => entry.entity_type === entity),
    ]),
  );
  const hasFilters = Boolean(query || selectedType || selectedGoal || selectedEntity);

  return (
    <>
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Treatment catalog
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Explore Aesthetic Index</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Understand the difference between treatment classes, brands, products, devices, and
          procedures before you compare them.
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-3xl">
        <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-input bg-card px-4 shadow-card">
          <Search aria-hidden="true" className="size-5 text-muted-foreground" />
          <span className="sr-only">Search the treatment catalog</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search treatments, brands, products or devices"
            className="w-full bg-transparent text-base outline-none"
          />
        </label>
      </div>

      <nav aria-label="Explore catalog sections" className="mt-9">
        <ul className="flex flex-wrap justify-center gap-2">
          <li>
            <Link
              to="/explore"
              search={{}}
              className={`inline-flex rounded-full border px-4 py-2 text-sm ${
                !selectedEntity && !selectedGoal && !selectedType
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-rule bg-card hover:border-primary"
              }`}
            >
              Everything
            </Link>
          </li>
          {ENTITY_TABS.map(({ entity, label }) => (
            <li key={entity}>
              <Link
                to="/explore"
                search={{ entity }}
                className={`inline-flex rounded-full border px-4 py-2 text-sm ${
                  selectedEntity === entity
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-rule bg-card hover:border-primary"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {!query && !selectedEntity && !selectedType ? (
        <section className="mt-14">
          <SectionHeading>Browse by treatment goal</SectionHeading>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GOAL_FILTERS.map((goal, index) => (
              <li key={goal.slug}>
                <Link
                  to="/explore"
                  search={{ goal: selectedGoal === goal.slug ? undefined : goal.slug }}
                  className={`block h-full rounded-2xl border p-4 transition hover:border-primary ${
                    selectedGoal === goal.slug
                      ? "border-primary bg-primary text-primary-foreground"
                      : index % 2
                        ? "border-rule bg-secondary"
                        : "border-rule bg-sage"
                  }`}
                >
                  <span className="font-medium">{goal.label}</span>
                  <span
                    className={`mt-1 block text-xs ${
                      selectedGoal === goal.slug
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {goal.detail}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!query && !selectedEntity && !selectedGoal && types.length ? (
        <section className="mt-14">
          <SectionHeading>Browse by treatment type</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {types.map((type) => (
              <li key={type}>
                <Link
                  to="/explore"
                  search={{ type: slugifyType(type) }}
                  className="inline-flex rounded-full border border-rule bg-card px-4 py-2 text-sm hover:border-primary"
                >
                  {type}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasFilters ? (
        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl bg-muted/55 px-4 py-3">
          <p className="text-sm">
            {visible.length} {visible.length === 1 ? "result" : "results"}
          </p>
          <Link to="/explore" search={{}} className="text-sm underline underline-offset-4">
            Clear filters
          </Link>
        </div>
      ) : null}

      {ENTITY_TABS.map(({ entity, label }) => (
        <CatalogSection
          key={entity}
          title={label}
          description={ENTITY_DESCRIPTION[entity]}
          entries={grouped.get(entity) ?? []}
          showAll={!selectedEntity && !hasFilters}
          entity={entity}
        />
      ))}

      {visible.length === 0 ? (
        <p className="mt-12 rounded-xl border border-rule bg-card p-5 text-sm text-muted-foreground">
          No catalog records match those filters.
        </p>
      ) : null}

      {popularComparisons.length && !hasFilters ? (
        <section className="mt-16 border-t border-rule pt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionHeading>Popular comparisons</SectionHeading>
              <p className="mt-2 text-sm text-muted-foreground">
                Structured side-by-side views of related treatments and treatment approaches.
              </p>
            </div>
            <Link to="/compare" className="hidden items-center gap-1 text-sm sm:inline-flex">
              Compare anything <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {popularComparisons.map((comparison) => (
              <li key={comparison.slug}>
                <Link
                  to="/compare/$slug"
                  params={{ slug: comparison.slug }}
                  className="block rounded-xl border border-rule bg-card p-4 font-medium hover:border-primary"
                >
                  {comparison.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function CatalogSection({
  title,
  description,
  entries,
  showAll,
  entity,
}: {
  title: string;
  description: string;
  entries: CatalogEntryView[];
  showAll: boolean;
  entity: EntityType;
}) {
  if (!entries.length) return null;
  const shown = showAll ? entries.slice(0, 8) : entries;
  return (
    <section id={entity} className="mt-14 scroll-mt-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <SectionHeading>{title}</SectionHeading>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {showAll && entries.length > shown.length ? (
          <Link
            to="/explore"
            search={{ entity }}
            className="hidden items-center gap-1 text-sm font-medium sm:inline-flex"
          >
            See all {ENTITY_GROUP_LABEL[entity].toLowerCase()}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((entry) => (
          <li key={entry.id}>
            <Link
              to="/treatments/$slug"
              params={{ slug: entry.slug }}
              className="group flex h-full flex-col rounded-2xl border border-rule bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
            >
              <TreatmentVisual
                slug={entry.slug}
                name={entry.name}
                media={entry.media}
                className="aspect-square size-auto w-full border-0 bg-muted/55"
              />
              <span className="mt-3 min-w-0">
                <span className="block truncate font-medium group-hover:text-primary">
                  {entry.name}
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {entry.parent_name ? `${entry.parent_name} · ` : ""}
                  {entry.category}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
