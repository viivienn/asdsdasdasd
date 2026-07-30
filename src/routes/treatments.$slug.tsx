import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchTreatment } from "@/lib/content.functions";
import {
  TREATMENT_PROFILE_ROWS,
  comparisonOtherSlug,
  type Treatment,
  type TreatmentSource,
} from "@/lib/content-types";
import { EvidenceState } from "@/components/editorial";
import { RegionalPriceLookup } from "@/components/regional-price-lookup";
import { TreatmentDisclaimer } from "@/components/disclaimers";
import { CompareWith, MatchGate } from "@/components/treatment-actions";
import { TreatmentVisual } from "@/components/treatment-visual";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/treatments/$slug")({
  loader: async ({ params }) => {
    const result = await fetchTreatment({ data: { slug: params.slug } });
    if (!result.data.treatment) throw notFound();
    return result;
  },
  head: ({ params, loaderData }) => {
    const treatment = loaderData?.data.treatment;
    if (!treatment) {
      return {
        meta: [{ title: "Unavailable | Aesthetic Index" }, { name: "robots", content: "noindex" }],
      };
    }
    const description =
      treatment.summary ??
      `What ${treatment.name} changes, how it works, downtime, longevity, and risks.`;
    const reviewed = Boolean(treatment.last_reviewed_at && loaderData.data.sources.length);
    return {
      meta: [
        { title: `${treatment.name}: Results, Downtime & Risks | Aesthetic Index` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: treatment.name },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:url", content: absoluteUrl(`/treatments/${params.slug}`) },
        { property: "og:type", content: "article" },
        { name: "robots", content: reviewed ? "index, follow" : "noindex, follow" },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/treatments/${params.slug}`) }],
    };
  },
  errorComponent: () => <p>We couldn't load this treatment. Please refresh.</p>,
  notFoundComponent: () => (
    <div>
      <h1 className="font-display text-3xl">Treatment not found</h1>
      <p className="mt-3">
        <Link to="/treatments" className="underline underline-offset-4">
          Browse all treatments
        </Link>
      </p>
    </div>
  ),
  component: TreatmentPage,
});

function TreatmentPage() {
  const { slug } = Route.useParams();
  const { data, experience } = Route.useLoaderData();
  const treatment = data.treatment as Treatment;
  const sources = data.sources as TreatmentSource[];
  const pickerTreatment = experience.treatments.find((entry) => entry.slug === slug);
  const related = experience.comparisons.filter((comparison) =>
    [comparison.treatment_a_slug, comparison.treatment_b_slug].includes(slug),
  );
  const profileRows = TREATMENT_PROFILE_ROWS.filter((row) => {
    const value = treatment[row.key];
    return typeof value === "string" && value.trim();
  });

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap gap-1">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/treatments" className="hover:text-foreground">
              Treatments
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{treatment.name}</li>
        </ol>
      </nav>

      <header className="mt-5 grid gap-5 sm:grid-cols-[8rem_1fr] sm:items-center">
        <TreatmentVisual
          name={treatment.name}
          media={pickerTreatment?.media ?? null}
          className="size-28 sm:size-32"
          showCredit
        />
        <div>
          <h1 className="font-display text-4xl">{treatment.name}</h1>
          {treatment.summary ? (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{treatment.summary}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="uppercase tracking-wider">{treatment.treatment_class}</span>
            {treatment.last_reviewed_at ? (
              <span>Reviewed {new Date(treatment.last_reviewed_at).toLocaleDateString()}</span>
            ) : null}
            {sources.length ? <EvidenceState state="sourced" /> : null}
          </div>
        </div>
      </header>

      {pickerTreatment ? (
        <div className="mt-7">
          <CompareWith
            slug={slug}
            name={treatment.name}
            treatments={experience.treatments}
            familyRules={experience.familyRules}
          />
        </div>
      ) : null}

      <div className="mt-6 max-w-2xl">
        <MatchGate name={treatment.name} />
      </div>

      {profileRows.length ? (
        <section className="mt-10">
          <h2 className="text-2xl">At a glance</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-rule bg-card">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">{treatment.name} attributes</caption>
              <tbody>
                {profileRows.map((row) => (
                  <tr key={row.key} className="border-b border-rule align-top last:border-0">
                    <th
                      scope="row"
                      className="w-1/3 bg-muted/35 px-4 py-3 text-left font-normal text-muted-foreground"
                    >
                      {row.label}
                    </th>
                    <td className="px-4 py-3 leading-6">{String(treatment[row.key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {sources.length ? (
        <section className="mt-12">
          <h2 className="text-2xl">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.source_url}
                  rel="nofollow noopener"
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  {source.source_title}
                </a>
                <span className="ml-2 text-muted-foreground">
                  {source.source_type}
                  {source.evidence_level ? ` · ${source.evidence_level}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-2xl">Related comparisons</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {related.map((comparison) => {
              const otherSlug = comparisonOtherSlug(comparison, slug);
              const other = experience.treatments.find((entry) => entry.slug === otherSlug);
              return (
                <li key={comparison.slug}>
                  <Link
                    to="/compare/$slug"
                    params={{ slug: comparison.slug }}
                    className="inline-block rounded-full border border-rule bg-card px-3 py-1.5 hover:border-primary"
                  >
                    {treatment.name} vs. {other?.name ?? otherSlug}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <RegionalPriceLookup
          treatments={[{ id: treatment.id, slug: treatment.slug, name: treatment.name }]}
        />
      </section>

      <TreatmentDisclaimer />
    </>
  );
}
