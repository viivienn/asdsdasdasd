import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCompareIndex } from "@/lib/content.functions";
import { TreatmentPicker } from "@/components/treatment-picker";
import { SectionHeading } from "@/components/editorial";
import { ComparisonRequestForm } from "@/components/demand-forms";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/compare/")({
  loader: () => fetchCompareIndex(),
  head: () => ({
    meta: [
      { title: "Compare cosmetic treatments | Aesthetic Index" },
      {
        name: "description",
        content:
          "Pick two similar cosmetic treatments and compare results, downtime, risks, reversibility, and pricing basis.",
      },
      { property: "og:title", content: "Compare cosmetic treatments" },
      {
        property: "og:description",
        content:
          "Clean comparisons of related treatments and different approaches to the same goal.",
      },
      { property: "og:url", content: absoluteUrl("/compare") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/compare") }],
  }),
  errorComponent: () => <p>We couldn't load the comparison hub. Please refresh.</p>,
  component: CompareHub,
});

function CompareHub() {
  const { treatments, popularComparisons, familyRules } = Route.useLoaderData();
  return (
    <>
      <h1 className="font-display text-4xl">Compare treatments</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Choose a treatment, then add the closest match, another option in its family, or a
        beginner-friendly alternative.
      </p>

      <section className="mt-10">
        <SectionHeading>Build a comparison</SectionHeading>
        <div className="mt-4 card-soft p-4 sm:p-5">
          <TreatmentPicker treatments={treatments} familyRules={familyRules} />
        </div>
      </section>

      {popularComparisons.length ? (
        <section className="mt-14">
          <SectionHeading>Popular comparisons</SectionHeading>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {popularComparisons.map((comparison) => (
              <li key={comparison.slug}>
                <Link
                  to="/compare/$slug"
                  params={{ slug: comparison.slug }}
                  className="block rounded-xl border border-rule bg-card px-4 py-3 hover:border-primary"
                >
                  {comparison.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section id="request" className="mt-14 scroll-mt-24">
        <ComparisonRequestForm />
      </section>
    </>
  );
}
