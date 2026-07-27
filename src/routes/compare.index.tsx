import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCompareIndex } from "@/lib/content.functions";
import { TreatmentPicker } from "@/components/treatment-picker";
import { DemoNotice, SectionHeading } from "@/components/editorial";

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
      ...(loaderData?.isDemo ? [{ name: "robots", content: "noindex" }] : []),
    ],
    links: [{ rel: "canonical", href: "/compare" }],
  }),
  errorComponent: () => <p>We couldn't load the comparison hub. Please refresh.</p>,
  component: CompareHub,
});

function CompareHub() {
  const { treatments, slugs, isDemo } = Route.useLoaderData();
  return (
    <>
      {isDemo ? <DemoNotice /> : null}
      <h1 className="font-display text-4xl">Compare treatments</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Choose two treatments. We only open a comparison when a reviewed record exists — we do not
        generate conclusions for pairs we have not written.
      </p>

      <div className="mt-8 border border-rule bg-card p-5">
        <TreatmentPicker treatments={treatments} publishedSlugs={slugs} />
      </div>

      <section className="mt-14">
        <SectionHeading>Published comparisons</SectionHeading>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(slugs as string[]).map((slug: string) => (
            <li key={slug}>
              <Link
                to="/compare/$slug"
                params={{ slug }}
                className="block border border-rule bg-card px-4 py-3 hover:border-primary"
              >
                {slug.replace(/-vs-/, " vs. ").replace(/-/g, " ")}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 border border-rule bg-secondary p-5">
        <h2 className="text-xl">Request a comparison</h2>
        <p className="mt-2 max-w-2xl text-sm">
          Missing a pair? Email{" "}
          <a href="mailto:hello@aestheticindex.co" className="underline underline-offset-4">
            hello@aestheticindex.co
          </a>{" "}
          with the two treatments and we'll add it to the editorial queue.
        </p>
      </section>
    </>
  );
}