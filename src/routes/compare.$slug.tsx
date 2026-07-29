import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { fetchComparisonPair } from "@/lib/content.functions";
import {
  comparisonLabel,
  parsePairSlug,
  sourcePublisher,
  treatmentLabel,
  type Treatment,
  type TreatmentSource,
} from "@/lib/content-types";
import { resolveTemplate } from "@/lib/comparison-templates";
import { SITE_URL, absoluteUrl, breadcrumbJsonLd, organizationJsonLd } from "@/lib/site";
import { ComparisonGlance } from "@/components/comparison-glance";
import { ComparisonDetails } from "@/components/comparison-details";
import { CoverageRequestForm } from "@/components/demand-forms";
import { ComparisonDisclaimer } from "@/components/disclaimers";

export const Route = createFileRoute("/compare/$slug")({
  loader: async ({ params }) => {
    const pair = parsePairSlug(params.slug);
    if (!pair || pair[0] === pair[1]) throw notFound();

    const result = await fetchComparisonPair({ data: { a: pair[0], b: pair[1] } });
    if (!result.a || !result.b || !result.comparison || !result.reviewed) throw notFound();
    if (result.canonicalSlug !== params.slug) {
      throw redirect({
        to: "/compare/$slug",
        params: { slug: result.canonicalSlug },
        statusCode: 301,
      });
    }
    return result;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData?.a || !loaderData?.b || !loaderData.comparison) {
      return {
        meta: [
          { title: "Comparison unavailable | Aesthetic Index" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }

    const nameA = loaderData.a.name;
    const nameB = loaderData.b.name;
    const title = `${nameA} vs. ${nameB}: Results, Risks, Downtime & Cost | Aesthetic Index`;
    const description = `Compare ${nameA} and ${nameB} by purpose, results, downtime, risks, reversibility, longevity, and pricing basis.`;
    const url = absoluteUrl(`/compare/${params.slug}`);
    const reviewedAt = loaderData.comparison.last_reviewed_at ?? undefined;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: `${nameA} vs. ${nameB}` },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              organizationJsonLd(),
              breadcrumbJsonLd([
                { name: "Home", path: "/" },
                { name: "Compare", path: "/compare" },
                { name: `${nameA} vs. ${nameB}`, path: `/compare/${params.slug}` },
              ]),
              {
                "@type": ["Article", "MedicalWebPage"],
                "@id": url,
                url,
                headline: `${nameA} vs. ${nameB}`,
                description,
                inLanguage: "en",
                isAccessibleForFree: true,
                dateModified: reviewedAt,
                datePublished: reviewedAt,
                publisher: { "@id": `${SITE_URL}#organization` },
                about: [
                  { "@type": "MedicalTherapy", name: nameA },
                  { "@type": "MedicalTherapy", name: nameB },
                ],
                citation: loaderData.sources.map((source) => ({
                  "@type": "CreativeWork",
                  name: source.source_title,
                  url: source.source_url,
                  datePublished: source.publication_date ?? undefined,
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  errorComponent: () => <p>We couldn't load this comparison. Please refresh.</p>,
  notFoundComponent: NotFoundComparison,
  component: ComparisonPage,
});

function NotFoundComparison() {
  return (
    <div>
      <h1 className="font-display text-3xl">This comparison is not currently available.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Only completed, source-supported comparisons appear publicly.
      </p>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm">
        <li>
          <Link to="/compare" className="underline underline-offset-4">
            Browse comparisons
          </Link>
        </li>
        <li>
          <Link to="/treatments" className="underline underline-offset-4">
            Browse treatments
          </Link>
        </li>
        <li>
          <Link to="/compare" hash="request" className="underline underline-offset-4">
            Request a comparison
          </Link>
        </li>
      </ul>
    </div>
  );
}

function ComparisonPage() {
  const data = Route.useLoaderData();
  const { slug } = Route.useParams();
  const a = data.a as Treatment;
  const b = data.b as Treatment;
  const comparison = data.comparison!;
  const label = `${a.name} vs. ${b.name}`;
  const template = resolveTemplate(a, b, comparison.row_template);
  const sources = data.sources as TreatmentSource[];

  return (
    <>
      <Breadcrumb label={label} />

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">{label}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last reviewed{" "}
            {comparison.last_reviewed_at
              ? new Date(comparison.last_reviewed_at).toLocaleDateString()
              : ""}
          </p>
        </div>
        <Link
          to="/compare"
          className="rounded-full border border-rule bg-card px-4 py-2 text-sm font-medium hover:border-primary"
        >
          Change comparison
        </Link>
      </header>

      <ComparisonGlance
        a={a}
        b={b}
        nameA={a.name}
        nameB={b.name}
        oneLine={comparison.one_sentence_difference ?? ""}
        media={data.media ?? {}}
      />

      <ComparisonDetails
        a={a}
        b={b}
        nameA={a.name}
        nameB={b.name}
        template={template}
        sources={sources}
        label={label}
        comparison={comparison}
      />

      <section id="sources" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl">Sources</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Sources are grouped by treatment so the support for each record stays visible.
        </p>
        <SourcesByTreatment sources={sources} a={a} b={b} />
      </section>

      <section id="medical-disclaimer" className="scroll-mt-24">
        <ComparisonDisclaimer />
      </section>

      <section id="local-prices" className="mt-12 scroll-mt-24">
        <CoverageRequestForm treatmentSlug={a.slug} />
      </section>

      <RelatedComparisons currentSlug={slug} reviewedSlugs={data.reviewedSlugs ?? []} />
    </>
  );
}

function Breadcrumb({ label }: { label: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap gap-1">
        <li>
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link to="/compare" className="hover:text-foreground">
            Compare
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{label}</li>
      </ol>
    </nav>
  );
}

function RelatedComparisons({
  currentSlug,
  reviewedSlugs,
}: {
  currentSlug: string;
  reviewedSlugs: string[];
}) {
  const related = reviewedSlugs.filter((candidate) => candidate !== currentSlug).slice(0, 6);
  if (related.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl">More comparisons</h2>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {related.map((candidate) => (
          <li key={candidate}>
            <Link
              to="/compare/$slug"
              params={{ slug: candidate }}
              className="inline-block rounded-full border border-rule bg-card px-3 py-1.5 hover:border-primary"
            >
              {comparisonLabel(candidate)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SourcesByTreatment({
  sources,
  a,
  b,
}: {
  sources: TreatmentSource[];
  a: Treatment;
  b: Treatment;
}) {
  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2">
      {[a, b].map((treatment) => {
        const rows = sources.filter((source) => source.treatment_id === treatment.id);
        return (
          <div key={treatment.id}>
            <h3 className="text-base font-medium">{treatment.name}</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {rows.map((source) => (
                <li key={source.id}>
                  <a
                    href={source.source_url}
                    rel="nofollow noopener"
                    target="_blank"
                    className="underline underline-offset-4"
                  >
                    {source.source_title}
                  </a>
                  <span className="text-muted-foreground">
                    {" "}
                    · {sourcePublisher(source.source_url)}
                    {source.publication_date ? `, ${source.publication_date.slice(0, 10)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/treatments/$slug"
              params={{ slug: treatment.slug }}
              className="mt-3 inline-block text-sm underline underline-offset-4"
            >
              {treatmentLabel(treatment.slug, treatment.name)} profile
            </Link>
          </div>
        );
      })}
    </div>
  );
}
