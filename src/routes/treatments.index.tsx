import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchTreatments } from "@/lib/content.functions";
import { DemoNotice } from "@/components/editorial";
import type { Treatment } from "@/lib/content-types";

const FILTERS = [
  "All",
  "Injectable",
  "Neuromodulator",
  "Biostimulator",
  "Filler",
  "Energy device",
] as const;

export const Route = createFileRoute("/treatments/")({
  loader: () => fetchTreatments(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Cosmetic treatments A–Z — Aesthetic Index" },
      {
        name: "description",
        content:
          "Structured profiles of injectables, biostimulators, fillers, and energy devices — what each changes, what it doesn't, and how long it lasts.",
      },
      { property: "og:title", content: "Cosmetic treatments A–Z" },
      {
        property: "og:description",
        content: "Structured profiles of injectables, biostimulators, fillers, and energy devices.",
      },
      { property: "og:url", content: "/treatments" },
      { property: "og:type", content: "website" },
      ...(loaderData?.isDemo ? [{ name: "robots", content: "noindex" }] : []),
    ],
    links: [{ rel: "canonical", href: "/treatments" }],
  }),
  errorComponent: () => <p>We couldn't load treatments. Please refresh.</p>,
  component: TreatmentsIndex,
});

function matches(t: Treatment, filter: string) {
  if (filter === "All") return true;
  const haystack = `${t.category} ${t.treatment_class}`.toLowerCase();
  return haystack.includes(filter.toLowerCase().replace(" device", ""));
}

function TreatmentsIndex() {
  const { data, isDemo } = Route.useLoaderData();
  const [filter, setFilter] = useState<string>("All");
  const treatments = (data as Treatment[])
    .filter((t) => matches(t, filter))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {isDemo ? <DemoNotice /> : null}
      <h1 className="font-display text-4xl">Treatments</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Eight treatments in this release. Each profile answers the same questions in the same order.
      </p>

      <fieldset className="mt-8">
        <legend className="text-sm font-medium">Filter by category</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <label
              key={f}
              className={`cursor-pointer border px-3 py-1.5 text-sm ${
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-rule bg-card"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={f}
                checked={filter === f}
                onChange={() => setFilter(f)}
                className="sr-only"
              />
              {f}
            </label>
          ))}
        </div>
      </fieldset>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {treatments.map((t) => (
          <li key={t.id}>
            <Link
              to="/treatments/$slug"
              params={{ slug: t.slug }}
              className="block h-full border border-rule bg-card p-4 hover:border-primary"
            >
              <span className="text-lg">{t.name}</span>
              <span className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                {t.treatment_class}
              </span>
              {t.summary ? (
                <span className="mt-2 block text-sm text-muted-foreground">{t.summary}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      {treatments.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No treatments in this category yet.</p>
      ) : null}
    </>
  );
}