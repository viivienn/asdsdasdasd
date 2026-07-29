import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { z } from "zod";
import { fetchCatalog } from "@/lib/content.functions";
import {
  ENTITY_GROUP_LABEL,
  type MarketCode,
  type Treatment,
  type TreatmentMedia,
} from "@/lib/content-types";
import { TreatmentVisual } from "@/components/treatment-visual";
import { SectionHeading } from "@/components/editorial";
import { absoluteUrl } from "@/lib/site";

interface CatalogEntryView extends Treatment {
  parent_name: string | null;
  parent_slug: string | null;
  media: TreatmentMedia | null;
  comparison_groups: string[];
  markets: MarketCode[];
}

const searchSchema = z.object({ type: z.string().optional() });
const GOAL_FILTERS = [
  { slug: "expression-lines", label: "Expression lines", keywords: ["neuromodulator"] },
  {
    slug: "volume-contour",
    label: "Volume & contour",
    keywords: ["filler", "biostimulator", "collagen stimulator"],
  },
  { slug: "lift-tighten", label: "Lift & tighten", keywords: ["energy device"] },
  {
    slug: "texture-pores",
    label: "Texture & pores",
    keywords: ["facial", "exfoliation", "microneedling"],
  },
] as const;

export const Route = createFileRoute("/explore/")({
  validateSearch: (search) => searchSchema.parse(search),
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
  const [market, setMarket] = useState<MarketCode>("US");
  const [goal, setGoal] = useState("");
  const selectedType = search.type ?? "";

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (entry.markets.length && !entry.markets.includes(market)) return false;
      if (
        selectedType &&
        slugify(entry.category) !== selectedType &&
        slugify(entry.entity_type) !== selectedType
      ) {
        return false;
      }
      if (goal) {
        const goalFilter = GOAL_FILTERS.find((item) => item.slug === goal);
        const haystack =
          `${entry.category} ${entry.treatment_class} ${entry.primary_purpose ?? ""}`.toLowerCase();
        if (goalFilter && !goalFilter.keywords.some((keyword) => haystack.includes(keyword))) {
          return false;
        }
      }
      return (
        !normalized ||
        [
          entry.name,
          entry.category,
          entry.primary_purpose,
          entry.manufacturer,
          entry.brand_name,
          entry.parent_name,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized))
      );
    });
  }, [entries, goal, market, query, selectedType]);

  const types = [...new Set(entries.map((entry) => entry.category).filter(Boolean))].sort();
  const brands = visible.filter((entry) => entry.entity_type === "brand_family");
  const devices = visible.filter((entry) => entry.entity_type === "device");
  const products = visible.filter((entry) => entry.entity_type === "product");
  const procedures = visible.filter((entry) => entry.entity_type === "procedure");
  const classes = visible.filter((entry) => entry.entity_type === "class");
  const marketPopular = popularComparisons.filter(
    (comparison) => !comparison.markets.length || comparison.markets.includes(market),
  );

  return (
    <>
      <header>
        <h1 className="font-display text-4xl">Explore</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Browse by goal, treatment type, brand, product, or device.
        </p>
      </header>

      <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="flex min-h-12 items-center gap-2 rounded-full border border-input bg-card px-4">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="sr-only">Search the treatment catalog</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search treatments, brands, products or devices"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <div
          className="inline-flex rounded-full border border-rule bg-card p-1"
          aria-label="Market"
        >
          {(["US", "CA"] as const).map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={market === code}
              onClick={() => setMarket(code)}
              className={`min-h-10 rounded-full px-4 text-sm ${
                market === code ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {code === "US" ? "United States" : "Canada"}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Market filters use recorded availability when present; unrecorded availability remains
        visible.
      </p>

      {!query && !selectedType ? (
        <section className="mt-12">
          <SectionHeading>Browse by treatment goal</SectionHeading>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {GOAL_FILTERS.map((item) => (
              <li key={item.slug}>
                <button
                  type="button"
                  aria-pressed={goal === item.slug}
                  onClick={() => setGoal((current) => (current === item.slug ? "" : item.slug))}
                  className={`block h-full w-full rounded-xl border p-4 text-left text-sm ${
                    goal === item.slug
                      ? "border-primary bg-secondary text-secondary-foreground"
                      : "border-rule bg-card hover:border-primary"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!query && !selectedType && types.length ? (
        <section className="mt-12">
          <SectionHeading>Browse by treatment type</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {types.map((type) => (
              <li key={type}>
                <Link
                  to="/explore"
                  search={{ type: slugify(type) }}
                  className="inline-flex rounded-full border border-rule bg-card px-4 py-2 text-sm hover:border-primary"
                >
                  {type}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {selectedType ? (
        <div className="mt-7">
          <Link to="/explore" search={{}} className="text-sm underline underline-offset-4">
            Clear treatment-type filter
          </Link>
        </div>
      ) : null}

      <CatalogSection title="Brands" entries={brands} />
      <CatalogSection title="Products" entries={products} />
      <CatalogSection title="Devices" entries={devices} />
      <CatalogSection title="Procedures" entries={procedures} />
      <CatalogSection title={ENTITY_GROUP_LABEL.class} entries={classes} />

      {visible.length === 0 ? (
        <p className="mt-12 rounded-xl border border-rule bg-card p-5 text-sm text-muted-foreground">
          No catalog records match those filters.
        </p>
      ) : null}

      {marketPopular.length ? (
        <section className="mt-12">
          <SectionHeading>Popular comparisons</SectionHeading>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {marketPopular.map((comparison) => (
              <li key={comparison.slug}>
                <Link
                  to="/compare/$slug"
                  params={{ slug: comparison.slug }}
                  className="block rounded-xl border border-rule bg-card p-4 hover:border-primary"
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

function CatalogSection({ title, entries }: { title: string; entries: CatalogEntryView[] }) {
  if (!entries.length) return null;
  return (
    <section className="mt-12">
      <SectionHeading>{title}</SectionHeading>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              to="/treatments/$slug"
              params={{ slug: entry.slug }}
              className="flex h-full items-center gap-3 rounded-xl border border-rule bg-card px-4 py-3 hover:border-primary"
            >
              <TreatmentVisual name={entry.name} media={entry.media} />
              <span className="min-w-0">
                <span className="block truncate font-medium">{entry.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
