import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { fetchComparisonPair } from "@/lib/content.functions";
import {
  comparisonLabel,
  parsePairSlug,
  sourcePublisher,
  treatmentLabel,
  type Comparison,
  type Treatment,
  type TreatmentSource,
} from "@/lib/content-types";
import { resolveTemplate } from "@/lib/comparison-templates";
import { SITE_URL, absoluteUrl, breadcrumbJsonLd, organizationJsonLd } from "@/lib/site";
import { ComparisonGlance } from "@/components/comparison-glance";
import { ComparisonDetails } from "@/components/comparison-details";
import { ComparisonDisclaimer } from "@/components/disclaimers";
import { RegionalPriceLookup } from "@/components/regional-price-lookup";
import { SaveComparisonButton } from "@/components/account-actions";
import { ComparisonSignupPrompt } from "@/components/comparison-signup-prompt";
import { consolidateTreatmentSources, formatEditorialDate } from "@/lib/presentation";
import { landingBasePath, relatedLandingsForTreatment } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/compare/$slug")({
  loader: async ({ params }) => {
    const pair = parsePairSlug(params.slug);
    if (!pair || pair[0] === pair[1]) throw notFound();

    const result = await fetchComparisonPair({ data: { a: pair[0], b: pair[1] } });
    if (!result.a || !result.b || !result.compatibility || !result.valid) throw notFound();
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
    if (!loaderData?.a || !loaderData?.b || !loaderData.compatibility) {
      return {
        meta: [
          { title: "Comparison unavailable | Aesthetic Index" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }

    const nameA = loaderData.a.name;
    const nameB = loaderData.b.name;
    const displayTitle = loaderData.comparison?.title_override ?? `${nameA} vs. ${nameB}`;
    const title = `${displayTitle}: Results, Risks, Downtime & Cost | Aesthetic Index`;
    const description = `Compare ${nameA} and ${nameB} by intended use, results, downtime, risks, reversibility, regulatory information, and typical pricing.`;
    const url = absoluteUrl(`/compare/${params.slug}`);
    const reviewedAt =
      loaderData.comparison?.last_verified_at ??
      loaderData.comparison?.last_reviewed_at ??
      undefined;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "robots",
          content: loaderData.indexable
            ? "index, follow, max-image-preview:large"
            : "noindex, follow",
        },
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
        Choose another pair from the compatible treatments in the comparison picker.
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
  const comparison = data.comparison;
  const label = comparison?.title_override ?? `${a.name} vs. ${b.name}`;
  const bottomLine = comparison?.one_sentence_difference ?? comparison?.description_override;
  const template = resolveTemplate(
    a,
    b,
    comparison?.row_template ?? data.compatibility?.templateKey,
  );
  const sources = data.sources as TreatmentSource[];

  return (
    <>
      <Breadcrumb label={label} />

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">{label}</h1>
          {comparison?.last_verified_at || comparison?.last_reviewed_at ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Last verified{" "}
              {formatEditorialDate(comparison.last_verified_at ?? comparison.last_reviewed_at!)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <SaveComparisonButton treatmentAId={a.id} treatmentBId={b.id} label={label} />
          <Link
            to="/compare"
            className="inline-flex min-h-11 items-center rounded-full border border-rule bg-card px-4 py-2 text-sm font-medium hover:border-primary"
          >
            Change comparison
          </Link>
        </div>
      </header>

      {data.compatibility?.mode === "different_approach" ? (
        <p className="mt-6 rounded-xl border border-rule bg-secondary px-4 py-3 text-sm">
          These treatments work differently and are not direct substitutes.
        </p>
      ) : null}

      {bottomLine ? (
        <section
          id="bottom-line"
          className="mt-7 scroll-mt-24 rounded-2xl border border-rule bg-card p-5"
        >
          <h2 className="font-display text-2xl">Bottom line</h2>
          <p className="mt-2 max-w-4xl text-base leading-7">{bottomLine}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              to="/treatments/$slug"
              params={{ slug: a.slug }}
              className="underline underline-offset-4"
            >
              Read the {a.name} profile
            </Link>
            <Link
              to="/treatments/$slug"
              params={{ slug: b.slug }}
              className="underline underline-offset-4"
            >
              Read the {b.name} profile
            </Link>
          </div>
        </section>
      ) : null}

      <KeyDifferences a={a} b={b} sources={sources} />

      <ComparisonGlance
        a={a}
        b={b}
        nameA={a.name}
        nameB={b.name}
        media={data.media ?? {}}
        template={template}
      />

      <ComparisonDetails
        a={a}
        b={b}
        nameA={a.name}
        nameB={b.name}
        template={template}
        sources={sources}
        label={label}
      />

      <ComparisonQuestions a={a} b={b} comparison={comparison} sources={sources} />

      <details id="sources" className="group mt-12 scroll-mt-24 border-y border-rule">
        <summary className="cursor-pointer list-none py-4 text-xl font-medium marker:hidden">
          <span className="flex items-center justify-between gap-3">
            Sources
            <span className="text-sm text-muted-foreground">
              <span className="group-open:hidden">Show</span>
              <span className="hidden group-open:inline">Hide</span>
            </span>
          </span>
        </summary>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Sources are grouped by treatment so the support for each record stays visible.
        </p>
        <SourcesByTreatment sources={sources} a={a} b={b} />
      </details>

      <section id="local-prices" className="mt-12 scroll-mt-24">
        <RegionalPriceLookup
          treatments={[
            { id: a.id, slug: a.slug, name: a.name },
            { id: b.id, slug: b.slug, name: b.name },
          ]}
        />
      </section>

      <section id="medical-disclaimer" className="scroll-mt-24">
        <ComparisonDisclaimer />
      </section>

      <RelatedComparisons
        currentSlug={slug}
        reviewedSlugs={data.reviewedSlugs ?? []}
        treatmentSlugs={[a.slug, b.slug]}
      />
      <RelatedDirectories a={a} b={b} />
      <ComparisonSignupPrompt comparisonSlug={slug} />
    </>
  );
}

function KeyDifferences({
  a,
  b,
  sources,
}: {
  a: Treatment;
  b: Treatment;
  sources: TreatmentSource[];
}) {
  const rows = [
    {
      label: "Primary purpose",
      field: "primary_purpose",
      a: a.primary_purpose,
      b: b.primary_purpose,
    },
    { label: "Technology or formulation", field: "mechanism", a: a.mechanism, b: b.mechanism },
    { label: "Pricing basis", field: "pricing_basis", a: a.pricing_basis, b: b.pricing_basis },
  ].filter((row) => row.a || row.b);
  if (!rows.length) return null;
  return (
    <section id="key-differences" className="mt-8 scroll-mt-24">
      <h2 className="font-display text-2xl">Key differences</h2>
      <dl className="mt-4 grid gap-3 lg:grid-cols-3">
        {rows.map((row) => {
          const supportingSources = [
            ...new Map(
              sources
                .filter((source) => source.claim_field === row.field)
                .map((source) => [source.source_url, source]),
            ).values(),
          ];
          return (
            <div key={row.label} className="rounded-2xl border border-rule bg-muted/35 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-3 space-y-2 text-sm leading-6">
                {row.a ? (
                  <p>
                    <strong>{a.name}:</strong> {row.a}
                  </p>
                ) : null}
                {row.b ? (
                  <p>
                    <strong>{b.name}:</strong> {row.b}
                  </p>
                ) : null}
                {supportingSources.length ? (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Sources:{" "}
                    {supportingSources.map((source, index) => (
                      <span key={source.source_url}>
                        {index ? ", " : ""}
                        <a
                          href={source.source_url}
                          target="_blank"
                          rel="nofollow noopener"
                          className="underline underline-offset-2"
                        >
                          {source.source_title}
                        </a>
                      </span>
                    ))}
                  </p>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function ComparisonQuestions({
  a,
  b,
  comparison,
  sources,
}: {
  a: Treatment;
  b: Treatment;
  comparison: Comparison | null;
  sources: TreatmentSource[];
}) {
  const questions: Array<{
    question: string;
    fields: Array<keyof Treatment>;
    answer: string | null;
  }> = [
    {
      question: "What is the main difference?",
      fields: ["primary_purpose"],
      answer: comparison?.one_sentence_difference ?? comparison?.description_override ?? null,
    },
    {
      question: "How do the technologies or formulations differ?",
      fields: ["mechanism"],
      answer:
        a.mechanism && b.mechanism ? `${a.name}: ${a.mechanism} ${b.name}: ${b.mechanism}` : null,
    },
    {
      question: "When do results typically appear?",
      fields: ["result_timing"],
      answer:
        a.result_timing && b.result_timing
          ? `${a.name}: ${a.result_timing} ${b.name}: ${b.result_timing}`
          : null,
    },
    {
      question: "How long can results last?",
      fields: ["longevity_text"],
      answer:
        a.longevity_text && b.longevity_text
          ? `${a.name}: ${a.longevity_text} ${b.name}: ${b.longevity_text}`
          : null,
    },
    {
      question: "How do the recorded regulatory uses differ?",
      fields: ["fda_status", "canada_status"],
      answer:
        a.fda_status && b.fda_status
          ? `${a.name} (United States): ${a.fda_status} ${b.name} (United States): ${b.fda_status}${
              a.canada_status && b.canada_status
                ? ` ${a.name} (Canada): ${a.canada_status} ${b.name} (Canada): ${b.canada_status}`
                : ""
            }`
          : null,
    },
    {
      question: "How should the pricing basis be compared?",
      fields: ["pricing_basis"],
      answer:
        a.pricing_basis && b.pricing_basis
          ? `${a.name} is recorded ${a.pricing_basis}; ${b.name} is recorded ${b.pricing_basis}. Different units, syringes, vials, sessions, areas, or packages should not be converted without an authoritative basis.`
          : null,
    },
    {
      question: "What remains provider-dependent?",
      fields: ["provider_variables"],
      answer:
        a.provider_variables && b.provider_variables
          ? `${a.name}: ${a.provider_variables} ${b.name}: ${b.provider_variables}`
          : null,
    },
    {
      question: "What does this comparison not establish?",
      fields: [],
      answer:
        "It does not establish a universal winner, personal suitability, an individual dose or protocol, a guaranteed result, or a clinic quote.",
    },
  ].filter((item): item is { question: string; fields: Array<keyof Treatment>; answer: string } =>
    Boolean(item.answer),
  );

  if (!questions.length) return null;
  return (
    <section id="questions" className="mt-12 scroll-mt-24">
      <h2 className="font-display text-2xl">Common comparison questions</h2>
      <div className="mt-4 divide-y divide-rule border-y border-rule">
        {questions.map((item) => {
          const claimSources = sources.filter((source) =>
            item.fields.includes(source.claim_field as keyof Treatment),
          );
          const uniqueSources = [
            ...new Map(claimSources.map((source) => [source.source_url, source])).values(),
          ];
          return (
            <article key={item.question} className="py-5">
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
              {uniqueSources.length ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Sources:{" "}
                  {uniqueSources.map((source, index) => (
                    <span key={source.source_url}>
                      {index ? ", " : ""}
                      <a
                        href={source.source_url}
                        target="_blank"
                        rel="nofollow noopener"
                        className="underline underline-offset-2"
                      >
                        {source.source_title}
                      </a>
                    </span>
                  ))}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RelatedDirectories({ a, b }: { a: Treatment; b: Treatment }) {
  const landings = [...relatedLandingsForTreatment(a), ...relatedLandingsForTreatment(b)];
  const unique = [
    ...new Map(landings.map((landing) => [`${landing.kind}:${landing.slug}`, landing])).values(),
  ];
  if (!unique.length) return null;
  return (
    <nav aria-label="Related treatment directories" className="mt-10">
      <h2 className="font-display text-2xl">Related treatment directories</h2>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {unique.map((landing) => (
          <li key={`${landing.kind}:${landing.slug}`}>
            <a
              href={`${landingBasePath(landing.kind)}/${landing.slug}`}
              className="inline-block rounded-full border border-rule bg-card px-3 py-1.5 hover:border-primary"
            >
              {landing.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
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
  treatmentSlugs,
}: {
  currentSlug: string;
  reviewedSlugs: string[];
  treatmentSlugs: [string, string];
}) {
  const related = reviewedSlugs
    .filter((candidate) => {
      if (candidate === currentSlug) return false;
      const pair = parsePairSlug(candidate);
      return Boolean(pair && pair.some((slug) => treatmentSlugs.includes(slug)));
    })
    .slice(0, 6);
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
        const rows = consolidateTreatmentSources(
          sources.filter((source) => source.treatment_id === treatment.id),
        );
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
                    {source.claim_fields.length > 1
                      ? ` · supports ${source.claim_fields.length} fields`
                      : ""}
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
