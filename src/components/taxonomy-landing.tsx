import { Link } from "@tanstack/react-router";
import { MedicalDisclaimerLink } from "@/components/disclaimers";
import { TreatmentVisual } from "@/components/treatment-visual";
import { comparisonLabel, sourcePublisher } from "@/lib/content-types";
import type { TaxonomyLandingData } from "@/lib/content.server";
import { consolidateTreatmentSources } from "@/lib/presentation";
import { CLASS_LANDINGS, landingBasePath, treatmentMatchesLanding } from "@/lib/seo-taxonomy";

export function TaxonomyLanding({ data }: { data: TaxonomyLandingData }) {
  const { config, treatments, comparisons, sources } = data;
  const documents = consolidateTreatmentSources(sources);
  const classNames = [...new Set(treatments.map((treatment) => treatment.treatment_class))];
  const relatedClasses =
    config.kind === "concern"
      ? CLASS_LANDINGS.filter((landing) =>
          treatments.some((treatment) => treatmentMatchesLanding(treatment, landing)),
        )
      : [];

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap gap-1">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a href={landingBasePath(config.kind)}>
              {config.kind === "concern" ? "Concerns" : "Treatment classes"}
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{config.label}</li>
        </ol>
      </nav>

      <header className="mt-5 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {config.kind === "concern" ? "Treatment concern" : "Treatment class"}
        </p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{config.label}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{config.definition}</p>
      </header>

      {relatedClasses.length ? (
        <section className="mt-10" aria-labelledby="approaches-heading">
          <h2 id="approaches-heading" className="font-display text-2xl">
            How the approach categories differ
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            These classes use different materials, technologies, or treatment methods. Open a class
            page to compare its published profiles and limitations; inclusion here is not a
            recommendation.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {relatedClasses.map((landing) => (
              <li key={landing.slug}>
                <Link
                  to="/treatment-classes/$slug"
                  params={{ slug: landing.slug }}
                  className="inline-block rounded-full border border-rule bg-card px-3 py-1.5 text-sm hover:border-primary"
                >
                  {landing.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : classNames.length ? (
        <section className="mt-10" aria-labelledby="approaches-heading">
          <h2 id="approaches-heading" className="font-display text-2xl">
            Published categories in this class
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            These labels come from the published treatment records. They organize research; they do
            not recommend an option.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {classNames.map((name) => (
              <li
                key={name}
                className="rounded-full border border-rule bg-card px-3 py-1.5 text-sm"
              >
                {name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="profiles-heading">
        <h2 id="profiles-heading" className="font-display text-2xl">
          Source-backed profiles
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((treatment) => (
            <li key={treatment.id}>
              <Link
                to="/treatments/$slug"
                params={{ slug: treatment.slug }}
                className="flex h-full gap-4 rounded-2xl border border-rule bg-card p-4 hover:border-primary"
              >
                <TreatmentVisual
                  slug={treatment.slug}
                  name={treatment.name}
                  media={treatment.media}
                  className="size-20 shrink-0"
                />
                <span className="min-w-0">
                  <span className="block font-medium">{treatment.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {treatment.treatment_class}
                  </span>
                  {treatment.summary ? (
                    <span className="mt-2 line-clamp-3 block text-sm text-muted-foreground">
                      {treatment.summary}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {comparisons.length ? (
        <section className="mt-12" aria-labelledby="comparisons-heading">
          <h2 id="comparisons-heading" className="font-display text-2xl">
            Relevant comparisons
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {comparisons.map((comparison) => (
              <li key={comparison.slug}>
                <Link
                  to="/compare/$slug"
                  params={{ slug: comparison.slug }}
                  className="inline-block rounded-full border border-rule bg-card px-3 py-1.5 hover:border-primary"
                >
                  {comparisonLabel(comparison.slug)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-rule bg-secondary p-5">
          <h2 className="font-display text-xl">Important limitations</h2>
          <p className="mt-2 text-sm leading-6">{config.limitations}</p>
        </article>
        <article className="rounded-2xl border border-rule bg-muted p-5">
          <h2 className="font-display text-xl">Provider-dependent considerations</h2>
          <p className="mt-2 text-sm leading-6">{config.providerConsiderations}</p>
        </article>
      </section>

      {documents.length ? (
        <section id="sources" className="mt-12 scroll-mt-24">
          <h2 className="font-display text-2xl">Sources represented on this page</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Factual treatment details remain attached to the individual profiles and claims. These
            are the source documents represented by the linked published records.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {documents.map((source) => (
              <li key={source.id}>
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="nofollow noopener"
                  className="underline underline-offset-4"
                >
                  {source.source_title}
                </a>{" "}
                <span className="text-muted-foreground">
                  · {sourcePublisher(source.source_url)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <aside className="mt-12 border-t border-rule pt-6 text-sm text-muted-foreground">
        This directory is educational and does not diagnose a concern or recommend a treatment.{" "}
        <MedicalDisclaimerLink />
      </aside>
    </>
  );
}
