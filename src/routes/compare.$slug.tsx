import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { fetchComparisonPair } from "@/lib/content.functions";
import {
  POPULAR_COMPARISON_SLUGS,
  canonicalPairSlug,
  comparisonLabel,
  pairDisallowed,
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
    if (!pair) throw notFound();
    const [a, b] = pair;

    const canonical = canonicalPairSlug(a, b);
    if (canonical !== params.slug) {
      throw redirect({ to: "/compare/$slug", params: { slug: canonical }, statusCode: 301 });
    }

    if (pairDisallowed(a, b)) {
      return { unsupported: true as const, slugA: a, slugB: b };
    }

    const res = await fetchComparisonPair({ data: { a, b, canonicalSlug: canonical } });
    // A pair is only a real page when both treatment records exist.
    if (!res.a || !res.b) throw notFound();
    return { unsupported: false as const, slugA: a, slugB: b, ...res };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Comparison unavailable — Aesthetic Index" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }
    const label = comparisonLabel(params.slug, [
      "a" in loaderData ? loaderData.a?.name : undefined,
      "b" in loaderData ? loaderData.b?.name : undefined,
    ]);

    if (loaderData.unsupported || !("reviewed" in loaderData) || !loaderData.reviewed) {
      return {
        meta: [
          { title: `${label} — Aesthetic Index` },
          {
            name: "description",
            content: `A preliminary side-by-side view of ${label}, generated from individual treatment records.`.slice(
              0,
              155,
            ),
          },
          { name: "robots", content: "noindex, follow" },
          { property: "og:title", content: label },
          { property: "og:type", content: "website" },
          { property: "og:url", content: absoluteUrl(`/compare/${params.slug}`) },
        ],
        links: [{ rel: "canonical", href: absoluteUrl(`/compare/${params.slug}`) }],
      };
    }

    const nameA = treatmentLabel(loaderData.slugA, loaderData.a?.name);
    const nameB = treatmentLabel(loaderData.slugB, loaderData.b?.name);
    const title = `${nameA} vs. ${nameB}: Results, Risks, Downtime & Cost | Aesthetic Index`;
    const description = `Compare ${nameA} and ${nameB} by purpose, results, downtime, risks, reversibility, longevity, and publicly listed local pricing.`;
    const url = absoluteUrl(`/compare/${params.slug}`);
    const reviewedAt = loaderData.comparison?.last_reviewed_at ?? undefined;
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
                name: `${nameA} vs. ${nameB}`,
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
                citation: (loaderData.sources as TreatmentSource[] | undefined)?.map((s) => ({
                  "@type": "CreativeWork",
                  name: s.source_title,
                  url: s.source_url,
                  datePublished: s.publication_date ?? undefined,
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
        We don't have treatment records for both of these treatments.
      </p>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm">
        <li>
          <Link to="/treatments" className="underline underline-offset-4">
            Browse treatments
          </Link>
        </li>
        <li>
          <Link to="/compare" className="underline underline-offset-4">
            Popular comparisons
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

function ComparisonPage() {
  const data = Route.useLoaderData();
  const { slug } = Route.useParams();

  if (data.unsupported) {
    return (
      <div>
        <h1 className="font-display text-3xl">We don't publish this comparison.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          These two selections are the same record, so a side-by-side view would not tell you
          anything.
        </p>
        <Link to="/compare" className="mt-4 inline-block underline underline-offset-4">
          Back to comparisons
        </Link>
      </div>
    );
  }

  const { a, b, slugA, slugB, comparison, reviewedSlugs } = data;
  const nameA = treatmentLabel(slugA, a?.name);
  const nameB = treatmentLabel(slugB, b?.name);
  const label = `${nameA} vs. ${nameB}`;
  const template = resolveTemplate(a, b, comparison?.row_template);
  const sources = (data.sources ?? []) as TreatmentSource[];
  const media = data.media ?? {};

  return (
    <>
      <Breadcrumb label={label} />

      <header className="mt-4">
        <h1 className="font-display text-4xl">{label}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {template.label} · compared on the attributes that actually differ
        </p>
      </header>

      <ComparisonGlance
        a={a}
        b={b}
        nameA={nameA}
        nameB={nameB}
        template={template}
        oneLine={comparison?.one_sentence_difference ?? null}
        media={media}
      />

      {comparison?.consider_a_when || comparison?.consider_b_when ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {comparison?.consider_a_when ? (
            <div className="rounded-xl border border-rule p-4">
              <h2 className="text-base font-medium">People often choose {nameA} when</h2>
              <p className="mt-2 text-sm">{comparison.consider_a_when}</p>
            </div>
          ) : null}
          {comparison?.consider_b_when ? (
            <div className="rounded-xl border border-rule p-4">
              <h2 className="text-base font-medium">People often choose {nameB} when</h2>
              <p className="mt-2 text-sm">{comparison.consider_b_when}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <ComparisonDetails
        a={a}
        b={b}
        nameA={nameA}
        nameB={nameB}
        template={template}
        sources={sources}
        label={label}
      />

      <section id="local-prices" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl">Local prices</h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          We do not publish national averages. Cost is shown only where a clinic advertises a price
          publicly, recorded with the page it came from and the date it was observed. Pricing units
          differ between treatments, so amounts are not directly interchangeable.
        </p>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          <li>
            <Link
              to="/prices/us/ca/$city/$treatment"
              params={{ city: "san-francisco", treatment: "botox" }}
              className="inline-block rounded-md border border-rule bg-card px-3 py-1.5 hover:border-primary"
            >
              San Francisco Botox prices
            </Link>
          </li>
          <li>
            <Link to="/methodology" className="underline underline-offset-4">
              How prices are collected
            </Link>
          </li>
        </ul>
      </section>

      <section id="sources" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl">Sources</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Sources are grouped by the specific claim they support, not pooled into one
          undifferentiated list.
        </p>
        <SourcesByClaim sources={sources} a={a} b={b} nameA={nameA} nameB={nameB} />
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {[slugA, slugB].map((s) => (
            <li key={s}>
              <Link to="/treatments/$slug" params={{ slug: s }} className="underline underline-offset-4">
                {treatmentLabel(s)} record
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="medical-disclaimer" className="scroll-mt-24">
        <ComparisonDisclaimer />
      </section>

      <RelatedComparisons currentSlug={slug} reviewedSlugs={reviewedSlugs ?? []} />

      <section className="mt-12">
        <CoverageRequestForm treatmentSlug={slugA} />
      </section>
    </>
  );
}

function RelatedComparisons({
  currentSlug,
  reviewedSlugs,
}: {
  currentSlug: string;
  reviewedSlugs: string[];
}) {
  const related = reviewedSlugs.filter((s) => s !== currentSlug).slice(0, 6);
  const fallback = POPULAR_COMPARISON_SLUGS.filter((s) => s !== currentSlug).slice(0, 6);
  const list = related.length > 0 ? related : fallback;
  if (list.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl">Related comparisons</h2>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {list.map((s) => (
          <li key={s}>
            <Link
              to="/compare/$slug"
              params={{ slug: s }}
              className="inline-block rounded-md border border-rule bg-card px-3 py-1.5 hover:border-primary"
            >
              {comparisonLabel(s)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Full source list, grouped by treatment and by the claim each source supports. */
function SourcesByClaim({
  sources,
  a,
  b,
  nameA,
  nameB,
}: {
  sources: TreatmentSource[];
  a: Treatment | null;
  b: Treatment | null;
  nameA: string;
  nameB: string;
}) {
  const groups = [
    { id: a?.id, name: nameA },
    { id: b?.id, name: nameB },
  ];
  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2">
      {groups.map((group) => {
        const rows = sources.filter((s) => group.id && s.treatment_id === group.id);
        return (
          <div key={group.name}>
            <h3 className="text-base font-medium">{group.name}</h3>
            {rows.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No sources recorded yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {rows.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.source_url}
                      rel="nofollow noopener"
                      target="_blank"
                      className="underline underline-offset-4"
                    >
                      {s.source_title}
                    </a>
                    <span className="text-muted-foreground">
                      {" "}
                      — {sourcePublisher(s.source_url)}
                      {s.publication_date ? `, ${s.publication_date.slice(0, 10)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
