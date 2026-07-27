import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCompareIndex } from "@/lib/content.functions";
import { TreatmentPicker } from "@/components/treatment-picker";
import { SectionHeading } from "@/components/editorial";
import { ComparisonRequestForm } from "@/components/demand-forms";
import { POPULAR_COMPARISON_SLUGS } from "@/lib/content-types";

const LABELS: Record<string, string> = {
  "sculptra-vs-radiesse": "Sculptra vs. Radiesse",
  "sculptra-vs-ha-filler": "Sculptra vs. HA Filler",
  "botox-vs-dysport": "Botox vs. Dysport",
  "thermage-vs-ultherapy": "Thermage vs. Ultherapy",
  "morpheus8-vs-ultherapy": "Morpheus8 vs. Ultherapy",
};

function comparisonLabel(slug: string) {
  return LABELS[slug] ?? slug.replace(/-vs-/, " vs. ").replace(/-/g, " ");
}

export const Route = createFileRoute("/compare/")({
  loader: () => fetchCompareIndex(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Compare cosmetic treatments — Aesthetic Index" },
      {
        name: "description",
        content:
          "Pick two cosmetic treatments and see a structured, like-for-like comparison of results, downtime, risks, and reversibility.",
      },
      { property: "og:title", content: "Compare cosmetic treatments" },
      {
        property: "og:description",
        content: "Structured, like-for-like comparisons of cosmetic treatments.",
      },
      { property: "og:url", content: "/compare" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/compare" }],
  }),
  errorComponent: () => <p>We couldn't load the comparison hub. Please refresh.</p>,
  component: CompareHub,
});

function CompareHub() {
  const { treatments } = Route.useLoaderData();
  return (
    <>
      <h1 className="font-display text-4xl">Compare treatments</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Start from a popular pair, or build your own side-by-side view from any two treatments in
        our records.
      </p>

      <section className="mt-10">
        <SectionHeading>Popular comparisons</SectionHeading>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {POPULAR_COMPARISON_SLUGS.map((slug) => (
            <li key={slug}>
              <Link
                to="/compare/$slug"
                params={{ slug }}
                className="block border border-rule bg-card px-4 py-3 hover:border-primary"
              >
                <span className="block">{comparisonLabel(slug)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <SectionHeading>Compare any two treatments</SectionHeading>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pick any two treatments to open their side-by-side view.
        </p>
        <div className="mt-4 border border-rule bg-card p-5">
          <TreatmentPicker treatments={treatments} />
        </div>
      </section>

      <section id="request" className="mt-14 scroll-mt-24">
        <ComparisonRequestForm />
      </section>
    </>
  );
}