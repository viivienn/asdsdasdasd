import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { fetchComparisonPair } from "@/lib/content.functions";
import {
  COMPARISON_ROWS,
  POPULAR_COMPARISON_SLUGS,
  canonicalPairSlug,
  comparisonLabel,
  pairDisallowed,
  parsePairSlug,
  treatmentLabel,
  type Treatment,
} from "@/lib/content-types";
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
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `${nameA} vs. ${nameB}` },
        { property: "og:description", content: description },
        { property: "og:url", content: `/compare/${params.slug}` },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `/compare/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${nameA} vs. ${nameB}`,
            description,
            dateModified: loaderData.comparison?.last_reviewed_at ?? undefined,
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
      {comparison?.one_sentence_difference ? (
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {comparison.one_sentence_difference}
        </p>
      ) : null}

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
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Side by side</p>
        <h2 className="mt-1 text-2xl">{label}: attribute-by-attribute comparison</h2>
        <ComparisonTable a={a} b={b} nameA={nameA} nameB={nameB} label={label} />
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

      <ComparisonDisclaimer />

      <section className="mt-12">
        <h2 className="text-2xl">Sources</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {data.sources.map((s) => (
            <li key={s.id}>
              <a
                href={s.source_url}
                rel="nofollow noopener"
                target="_blank"
                className="underline underline-offset-4"
              >
                {s.source_title}
              </a>
              <span className="text-muted-foreground"> · {s.source_type}</span>
            </li>
          ))}
        </ul>
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
