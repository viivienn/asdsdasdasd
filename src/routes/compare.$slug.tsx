import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { fetchComparisonPair } from "@/lib/content.functions";
import {
  COMPARISON_ROWS,
  COMPARISON_SECTIONS,
  QUICK_COMPARISON_ROWS,
  POPULAR_COMPARISON_SLUGS,
  canonicalPairSlug,
  comparisonLabel,
  comparisonRowLabel,
  pairDisallowed,
  parsePairSlug,
  sourcePublisher,
  treatmentLabel,
  type Treatment,
  type TreatmentSource,
} from "@/lib/content-types";
import { SITE_URL, absoluteUrl, breadcrumbJsonLd, organizationJsonLd } from "@/lib/site";
import { EvidenceState, Prose } from "@/components/editorial";
import { ComparisonRequestForm, CoverageRequestForm } from "@/components/demand-forms";
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
          { property: "og:url", content: `/compare/${params.slug}` },
        ],
        links: [{ rel: "canonical", href: `/compare/${params.slug}` }],
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

function ComparisonTable({
  a,
  b,
  nameA,
  nameB,
  label,
}: {
  a: Treatment | null;
  b: Treatment | null;
  nameA: string;
  nameB: string;
  label: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <caption className="sr-only">{label}: attribute-by-attribute comparison</caption>
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className="w-1/3 py-2 pr-4 font-medium">
              Attribute
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              {nameA}
            </th>
            <th scope="col" className="py-2 font-medium">
              {nameB}
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.key} className="border-b border-rule align-top">
              <th scope="row" className="py-3 pr-4 text-left font-normal text-muted-foreground">
                {row.label}
              </th>
              <td className="py-3 pr-4">{cell(a, row.key)}</td>
              <td className="py-3">{cell(b, row.key)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonPage() {
  const { slug } = Route.useParams();
  const data = Route.useLoaderData();

  if (data.unsupported) {
    return (
      <div>
        <h1 className="font-display text-3xl">This comparison is not currently available.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          These two selections don't produce a meaningful side-by-side view.
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

  const { a, b, comparison, reviewed, reviewedSlugs, slugA, slugB } = data;
  const nameA = treatmentLabel(slugA, a?.name);
  const nameB = treatmentLabel(slugB, b?.name);
  const label = `${nameA} vs. ${nameB}`;

  if (!reviewed) {
    return (
      <>
        <Breadcrumb label={label} />
        <h1 className="mt-4 font-display text-4xl">{label}</h1>

        <aside
          role="note"
          className="mt-6 border border-rule bg-muted px-4 py-3 text-sm text-muted-foreground"
        >
          <p className="font-medium text-foreground">Editorial review in progress</p>
          <p className="mt-1 max-w-3xl">
            This preliminary side-by-side view is generated from our individual treatment records.
            A comparison-specific editorial review has not yet been completed. It is educational
            information only and should not be interpreted as a personalized treatment
            recommendation.
          </p>
        </aside>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Side by side</p>
          <h2 className="mt-1 text-2xl">{label}: attribute-by-attribute view</h2>
          <ComparisonTable a={a} b={b} nameA={nameA} nameB={nameB} label={label} />
        </section>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a
            href="#request-review"
            className="inline-flex items-center bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Request editorial review
          </a>
          <Link
            to="/treatments/$slug"
            params={{ slug: slugA }}
            className="inline-flex items-center border border-input bg-card px-4 py-2 hover:border-primary"
          >
            {nameA} treatment record
          </Link>
          <Link
            to="/treatments/$slug"
            params={{ slug: slugB }}
            className="inline-flex items-center border border-input bg-card px-4 py-2 hover:border-primary"
          >
            {nameB} treatment record
          </Link>
        </div>

        <ComparisonDisclaimer />

        <RelatedComparisons currentSlug={slug} reviewedSlugs={reviewedSlugs} />

        <section id="request-review" className="mt-12 scroll-mt-24">
          <ComparisonRequestForm
            defaultA={nameA}
            defaultB={nameB}
            heading="Request an editorial review of this comparison"
            description="Tell us why this pair matters to you. Requests help us prioritise which comparisons we research and review next. We can't promise a review date."
            submitLabel="Request editorial review"
          />
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb label={label} />

      <h1 className="mt-4 font-display text-4xl">{label}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          Last reviewed:{" "}
          {comparison?.last_reviewed_at
            ? new Date(comparison.last_reviewed_at).toLocaleDateString()
            : "—"}
        </span>
        <EvidenceState state="reviewed" />
        <Link
          to="/compare"
          className="inline-flex items-center border border-input bg-card px-3 py-1.5 hover:border-primary"
        >
          Change treatments
        </Link>
      </div>

      <section id="bottom-line" className="mt-8 scroll-mt-24 border border-rule bg-card p-5">
        <h2 className="text-2xl">Bottom line</h2>
        <p className="mt-3 max-w-3xl">
          {comparison?.one_sentence_difference}{" "}
          {a?.true_substitute_notes ? `${a.true_substitute_notes} ` : ""}
          Neither treatment is universally better than the other. They are compared here on
          purpose, results, downtime, longevity, reversibility and documented risks. Whether
          either is appropriate depends on individual clinical factors that only an in-person
          assessment can establish.
        </p>
      </section>

      <nav aria-label="On this page" className="mt-6 text-sm">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          {[
            ["quick-comparison", "Quick comparison"],
            ...COMPARISON_SECTIONS.map((s) => [s.id, s.title] as const),
            ["cost", "Cost"],
            ["local-prices", "Local prices"],
            ["sources", "Sources"],
            ["medical-disclaimer", "Medical disclaimer"],
          ].map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`} className="hover:text-foreground hover:underline">
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="quick-comparison" className="mt-10 scroll-mt-24">
        <h2 className="text-2xl">Quick comparison</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">{label}: quick comparison of key distinctions</caption>
            <thead>
              <tr className="border-b border-rule text-left">
                <th scope="col" className="w-1/3 py-2 pr-4 font-medium">
                  Distinction
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  {nameA}
                </th>
                <th scope="col" className="py-2 font-medium">
                  {nameB}
                </th>
              </tr>
            </thead>
            <tbody>
              {QUICK_COMPARISON_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-rule align-top">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-left font-normal text-muted-foreground"
                  >
                    {row.label}
                  </th>
                  <td className="py-3 pr-4">{cell(a, row.key)}</td>
                  <td className="py-3">{cell(b, row.key)}</td>
                </tr>
              ))}
              <tr className="border-b border-rule align-top">
                <th scope="row" className="py-3 pr-4 text-left font-normal text-muted-foreground">
                  Pricing basis
                </th>
                <td className="py-3 pr-4" colSpan={2}>
                  Publicly advertised clinic prices only, recorded with a source link and an
                  observation date. No estimates or modelled averages.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="border border-rule bg-card p-4">
          <h2 className="text-base font-medium">Consider {nameA} when…</h2>
          <p className="mt-2 text-sm text-muted-foreground">{comparison?.consider_a_when}</p>
        </article>
        <article className="border border-rule bg-card p-4">
          <h2 className="text-base font-medium">Consider {nameB} when…</h2>
          <p className="mt-2 text-sm text-muted-foreground">{comparison?.consider_b_when}</p>
        </article>
        <article className="border border-rule bg-card p-4">
          <h2 className="text-base font-medium">Neither is a direct fit when…</h2>
          <p className="mt-2 text-sm text-muted-foreground">{comparison?.neither_when}</p>
        </article>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl">Detailed comparison</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Every attribute below comes from the two individual treatment records. Where a claim is
          sourced, the supporting reference is linked next to that row.
        </p>
        {COMPARISON_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="mt-10 scroll-mt-24">
            <h3 className="text-xl">{section.title}</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <caption className="sr-only">
                  {label}: {section.title}
                </caption>
                <thead>
                  <tr className="border-b border-rule text-left">
                    <th scope="col" className="w-1/3 py-2 pr-4 font-medium">
                      Attribute
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {nameA}
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      {nameB}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.keys.map((key) => (
                    <tr key={key} className="border-b border-rule align-top">
                      <th
                        scope="row"
                        className="py-3 pr-4 text-left font-normal text-muted-foreground"
                      >
                        {comparisonRowLabel(key)}
                      </th>
                      <td className="py-3 pr-4">
                        {cell(a, key)}
                        <RowSources sources={data.sources as TreatmentSource[]} treatmentId={a?.id} claim={key} />
                      </td>
                      <td className="py-3">
                        {cell(b, key)}
                        <RowSources sources={data.sources as TreatmentSource[]} treatmentId={b?.id} claim={key} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </section>

      <section id="cost" className="mt-14 scroll-mt-24">
        <h2 className="text-2xl">Cost</h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          We do not publish national averages. Cost is shown only where a clinic advertises a
          price publicly, recorded with the page it came from and the date it was observed.
          Pricing units differ between treatments (per unit, per syringe, per session), so amounts
          across these two treatments are not directly interchangeable.
        </p>
      </section>

      <section id="local-prices" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl">Local prices</h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Publicly listed local pricing currently starts with San Francisco.
        </p>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          <li>
            <Link
              to="/prices/us/ca/$city/$treatment"
              params={{ city: "san-francisco", treatment: "botox" }}
              className="inline-block border border-rule bg-card px-3 py-1.5 hover:border-primary"
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

      {comparison?.common_misconception ? (
        <section className="mt-12">
          <h2 className="text-2xl">Common marketing misconception</h2>
          <Prose>
            <p className="mt-3">{comparison.common_misconception}</p>
          </Prose>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-2xl">Questions to ask at consultation</h2>
        <ul className="mt-3 max-w-2xl list-disc space-y-2 pl-5 text-sm">
          <li>Which of these two do you use more often for my goal, and why?</li>
          <li>
            How many sessions do you expect, and what is the estimated total cost across the full
            treatment course?
          </li>
          <li>What result would be realistic if I stop after one session?</li>
          <li>What options would I have if I were unhappy with the outcome?</li>
          <li>
            What complications or unwanted outcomes have you personally managed with this
            treatment?
          </li>
        </ul>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          These are general consultation prompts, not personalized medical advice.
        </p>
      </section>

      <section id="sources" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl">Sources</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Sources are grouped by the specific claim they support, not pooled into one
          undifferentiated list.
        </p>
        <SourcesByClaim sources={data.sources as TreatmentSource[]} a={a} b={b} nameA={nameA} nameB={nameB} />
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {[slugA, slugB].map((s) => (
            <li key={s}>
              <Link
                to="/treatments/$slug"
                params={{ slug: s }}
                className="underline underline-offset-4"
              >
                {treatmentLabel(s)} treatment record
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="medical-disclaimer" className="scroll-mt-24">
        <ComparisonDisclaimer />
      </section>

      <RelatedComparisons currentSlug={slug} reviewedSlugs={reviewedSlugs} />

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
              className="inline-block border border-rule bg-card px-3 py-1.5 hover:border-primary"
            >
              {comparisonLabel(s)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function cell(t: Treatment | null | undefined, key: keyof Treatment) {
  const value = t?.[key];
  if (typeof value !== "string" || value.trim() === "") {
    return <span className="text-muted-foreground">Not yet recorded</span>;
  }
  return value;
}
