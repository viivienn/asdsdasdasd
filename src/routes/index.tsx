import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCompareIndex } from "@/lib/content.functions";
import { TreatmentPicker } from "@/components/treatment-picker";
import { DemoNotice, Prose, SectionHeading } from "@/components/editorial";
import { CoverageRequestForm } from "@/components/demand-forms";

const POPULAR: Array<[string, string]> = [
  ["sculptra-vs-radiesse", "Sculptra vs. Radiesse"],
  ["sculptra-vs-ha-filler", "Sculptra vs. HA filler"],
  ["botox-vs-dysport", "Botox vs. Dysport"],
  ["thermage-vs-ultherapy", "Thermage vs. Ultherapy"],
  ["morpheus8-vs-ultherapy", "Morpheus8 vs. Ultherapy"],
];

export const Route = createFileRoute("/")({
  loader: () => fetchCompareIndex(),
  head: ({ loaderData }) => ({
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
          "Results, downtime, risks, reversibility, and publicly listed local prices — in one clear place.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
      ...(loaderData?.isDemo ? [{ name: "robots", content: "noindex" }] : []),
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  errorComponent: () => <p>We couldn't load this page. Please refresh.</p>,
  component: Home,
});

function Home() {
  const { treatments, slugs, isDemo } = Route.useLoaderData();

  return (
    <>
      {isDemo ? <DemoNotice /> : null}

      <section className="max-w-3xl">
        <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl">
          Compare cosmetic treatments before you book.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          See results, downtime, risks, reversibility, and publicly listed local prices in one clear
          place.
        </p>
        <div className="mt-8 border border-rule bg-card p-5">
          <TreatmentPicker treatments={treatments} publishedSlugs={slugs} />
        </div>
        <p className="mt-4 text-sm">
          <Link
            to="/prices/us/ca/$city/$treatment"
            params={{ city: "san-francisco", treatment: "botox" }}
            className="underline underline-offset-4"
          >
            See San Francisco Botox prices
          </Link>
        </p>
      </section>

      <section className="mt-16">
        <SectionHeading>Popular comparisons</SectionHeading>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {POPULAR.map(([slug, label]) => (
            <li key={slug}>
              <Link
                to="/compare/$slug"
                params={{ slug }}
                className="block border border-rule bg-card p-4 transition-colors hover:border-primary"
              >
                <span className="text-lg">{label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Side-by-side on results, downtime, risks, and reversibility.
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <SectionHeading>Browse treatments</SectionHeading>
        <ul className="mt-5 flex flex-wrap gap-2">
          {[...treatments]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((t) => (
              <li key={t.id}>
                <Link
                  to="/treatments/$slug"
                  params={{ slug: t.slug }}
                  className="inline-block border border-rule bg-card px-3 py-1.5 text-sm hover:border-primary"
                >
                  {t.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section className="mt-16">
        <SectionHeading>How Aesthetic Index works</SectionHeading>
        <Prose>
          <p className="mt-4">
            We write structured comparisons instead of rankings. Every row in a comparison table
            answers the same question for both treatments, so differences are visible rather than
            argued.
          </p>
          <p>
            For pricing, we only publish amounts a clinic has advertised publicly, with a link to
            the page and the date we saw it. We do not estimate, model, or average prices we cannot
            show you.
          </p>
          <p>
            We do not diagnose, recommend treatments, or rank providers.{" "}
            <Link to="/methodology" className="underline underline-offset-4">
              Read the full methodology
            </Link>
            .
          </p>
        </Prose>
      </section>

      <section className="mt-16">
        <SectionHeading>Local pricing coverage</SectionHeading>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Coverage starts in San Francisco and expands by demand.
        </p>
        <div className="mt-5">
          <CoverageRequestForm />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading>Methodology and trust</SectionHeading>
        <Prose>
          <p className="mt-4">
            Aesthetic Index takes no clinic sponsorships, sells no leads, and accepts no payment for
            placement. Corrections are published, not quietly edited.
          </p>
          <p>
            <Link to="/about" className="underline underline-offset-4">
              About Aesthetic Index
            </Link>
          </p>
        </Prose>
      </section>
    </>
  );
}