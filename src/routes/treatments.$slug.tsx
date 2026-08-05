import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchRegionalPriceDirectory, fetchTreatment } from "@/lib/content.functions";
import {
  TREATMENT_PROFILE_ROWS,
  comparisonOtherSlug,
  type Treatment,
  type TreatmentSource,
} from "@/lib/content-types";
import { EvidenceState } from "@/components/editorial";
import { RegionalPriceLookup } from "@/components/regional-price-lookup";
import { TreatmentDisclaimer } from "@/components/disclaimers";
import { CompareWith } from "@/components/treatment-actions";
import { AccountValueCard, SaveTreatmentButton } from "@/components/account-actions";
import { TreatmentVisual } from "@/components/treatment-visual";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/site";
import { consolidateTreatmentSources, formatEditorialDate } from "@/lib/presentation";
import type { AvailableComparison, TreatmentPickerRecord } from "@/lib/content-types";
import { landingBasePath, relatedLandingsForTreatment } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/treatments/$slug")({
  loader: async ({ params }) => {
    const [result, regionalPricePages] = await Promise.all([
      fetchTreatment({ data: { slug: params.slug } }),
      fetchRegionalPriceDirectory(),
    ]);
    if (!result.data.treatment) throw notFound();
    return {
      ...result,
      regionalPricePages: regionalPricePages.filter((page) => page.treatment.slug === params.slug),
    };
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
    const path = `/treatments/${params.slug}`;
    const pickerTreatment = loaderData.experience.treatments.find(
      (entry) => entry.id === treatment.id,
    );
    return {
      ...pageMetadata({
        title: `${treatment.name}: uses, results, risks, downtime & cost | Aesthetic Index`,
        description,
        path,
        indexable: reviewed,
        type: "article",
        image: pickerTreatment?.media?.url,
      }),
      scripts: reviewed
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  organizationJsonLd(),
                  breadcrumbJsonLd([
                    { name: "Home", path: "/" },
                    { name: "Treatments", path: "/treatments" },
                    { name: treatment.name, path },
                  ]),
                  {
                    "@type": "MedicalWebPage",
                    "@id": absoluteUrl(path),
                    url: absoluteUrl(path),
                    name: treatment.name,
                    description,
                    dateModified: treatment.last_reviewed_at,
                    publisher: { "@id": `${SITE_URL}#organization` },
                    about: { "@type": "MedicalTherapy", name: treatment.name },
                    citation: loaderData.data.sources.map((source) => ({
                      "@type": "CreativeWork",
                      name: source.source_title,
                      url: source.source_url,
                      datePublished: source.publication_date ?? undefined,
                    })),
                  },
                ],
              }),
            },
          ]
        : [],
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
  const { data, experience, regionalPricePages } = Route.useLoaderData();
  const treatment = data.treatment as Treatment;
  const sources = data.sources as TreatmentSource[];
  const sourceDocuments = consolidateTreatmentSources(sources);
  const pickerTreatment = experience.treatments.find(
    (entry: TreatmentPickerRecord) => entry.slug === slug,
  );
  const related = experience.comparisons.filter((comparison: AvailableComparison) =>
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

      <header className="mt-6 grid gap-7 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="flex min-h-[22rem] items-center justify-center rounded-2xl bg-muted/55 p-6 sm:min-h-[28rem]">
          <TreatmentVisual
            slug={slug}
            name={treatment.name}
            media={pickerTreatment?.media ?? null}
            className="aspect-[4/5] h-auto w-full max-w-sm border-0 bg-transparent shadow-none"
            showCredit
            priority
          />
        </div>
        <div className="lg:py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {treatment.manufacturer || treatment.brand_name || treatment.treatment_class}
          </p>
          <h1 className="font-display text-4xl">{treatment.name}</h1>
          {treatment.summary ? (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{treatment.summary}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="uppercase tracking-wider">{treatment.treatment_class}</span>
            {treatment.last_reviewed_at ? (
              <span>Reviewed {formatEditorialDate(treatment.last_reviewed_at)}</span>
            ) : null}
            {sources.length ? <EvidenceState state="sourced" /> : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <SaveTreatmentButton treatmentId={treatment.id} treatmentName={treatment.name} />
            {pickerTreatment ? (
              <CompareWith
                slug={slug}
                name={treatment.name}
                treatments={experience.treatments}
                familyRules={experience.familyRules}
              />
            ) : null}
            <Link
              to="/prices"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              See local prices
            </Link>
          </div>
          <div className="mt-6 max-w-2xl">
            <AccountValueCard treatmentName={treatment.name} />
          </div>
        </div>
      </header>

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
            {sourceDocuments.map((source) => (
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
                  {source.claim_fields.length > 1
                    ? ` · supports ${source.claim_fields.length} profile fields`
                    : ""}
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
            {related.map((comparison: AvailableComparison) => {
              const otherSlug = comparisonOtherSlug(comparison, slug);
              const other = experience.treatments.find(
                (entry: TreatmentPickerRecord) => entry.slug === otherSlug,
              );
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

      <RelatedDirectories treatment={treatment} />

      <section className="mt-12">
        <RegionalPriceLookup
          treatments={[{ id: treatment.id, slug: treatment.slug, name: treatment.name }]}
        />
      </section>

      {regionalPricePages.length ? (
        <section className="mt-10">
          <h2 className="text-2xl">Published regional price estimates</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {regionalPricePages.map((page: { estimate: { region_slug: string; region_name: string } }) => (
              <li key={page.estimate.region_slug}>
                <Link
                  to="/prices/$treatment/$region"
                  params={{ treatment: treatment.slug, region: page.estimate.region_slug }}
                  className="inline-block rounded-full border border-rule bg-card px-3 py-1.5 hover:border-primary"
                >
                  {treatment.name} cost in {page.estimate.region_name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <TreatmentDisclaimer />
    </>
  );
}

function RelatedDirectories({ treatment }: { treatment: Treatment }) {
  const landings = relatedLandingsForTreatment(treatment);
  if (!landings.length) return null;
  return (
    <nav aria-label="Related treatment directories" className="mt-12">
      <h2 className="text-2xl">Related directories</h2>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {landings.map((landing) => (
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
