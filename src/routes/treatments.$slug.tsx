import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchTreatment } from "@/lib/content.functions";
import { TREATMENT_PROFILE_ROWS, COMPARISON_DISPLAY_ORDER } from "@/lib/content-types";
import type { Treatment, TreatmentSource } from "@/lib/content-types";
import { DemoNotice, EvidenceState } from "@/components/editorial";
import { CoverageRequestForm } from "@/components/demand-forms";
import { TreatmentDisclaimer } from "@/components/disclaimers";

export const Route = createFileRoute("/treatments/$slug")({
  loader: async ({ params }) => {
    const res = await fetchTreatment({ data: { slug: params.slug } });
    if (!res.data.treatment) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData?.data.treatment) {
      return {
        meta: [{ title: "Unavailable — Aesthetic Index" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = loaderData.data.treatment;
    const description =
      t.summary ??
      `What ${t.name} changes, what it does not change, how long it lasts, and what can go wrong.`;
    return {
      meta: [
        { title: `${t.name} — what it does, downtime, risks | Aesthetic Index` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${t.name}` },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:url", content: `/treatments/${params.slug}` },
        { property: "og:type", content: "article" },
        ...(loaderData.isDemo ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      ],
      links: [{ rel: "canonical", href: `/treatments/${params.slug}` }],
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
  const { data, isDemo } = Route.useLoaderData();
  const t = data.treatment as Treatment;
  const sources = data.sources as TreatmentSource[];
  const related = Object.entries(COMPARISON_DISPLAY_ORDER).filter(([, pair]) =>
    pair.includes(slug),
  );

  return (
    <>
      {isDemo ? <DemoNotice /> : null}

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
          <li aria-current="page">{t.name}</li>
        </ol>
      </nav>

      <h1 className="mt-4 font-display text-4xl">{t.name}</h1>
      {t.summary ? (
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t.summary}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="uppercase tracking-wider">{t.treatment_class}</span>
        <span>
          Last reviewed:{" "}
          {t.last_reviewed_at
            ? new Date(t.last_reviewed_at).toLocaleDateString()
            : "Not yet reviewed"}
        </span>
        <EvidenceState state={isDemo ? "unsourced" : "sourced"} />
      </div>

      <section className="mt-10">
        <h2 className="text-2xl">Profile</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{t.name} attributes</caption>
            <tbody>
              {TREATMENT_PROFILE_ROWS.map((row) => {
                const value = t[row.key];
                return (
                  <tr key={row.key} className="border-b border-rule align-top">
                    <th
                      scope="row"
                      className="w-1/3 py-3 pr-4 text-left font-normal text-muted-foreground"
                    >
                      {row.label}
                    </th>
                    <td className="py-3">
                      {typeof value === "string" && value.trim() !== "" ? (
                        value
                      ) : (
                        <span className="text-muted-foreground">Not yet recorded</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Sources</h2>
        {sources.length === 0 ? (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            No sources are recorded for this profile yet. Until they are, this page is prototype
            content and is excluded from search engines.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {sources.map((s) => (
              <li key={s.id}>
                <a href={s.source_url} rel="nofollow noopener" className="underline underline-offset-4">
                  {s.source_title}
                </a>
                <span className="ml-2 text-muted-foreground">
                  {s.source_type}
                  {s.evidence_level ? ` · ${s.evidence_level}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl">Related comparisons</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {related.map(([s]) => (
              <li key={s}>
                <Link
                  to="/compare/$slug"
                  params={{ slug: s }}
                  className="inline-block border border-rule bg-card px-3 py-1.5 hover:border-primary"
                >
                  {s.replace(/-vs-/, " vs. ").replace(/-/g, " ")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <CoverageRequestForm treatmentSlug={slug} />
      </section>

      <TreatmentDisclaimer />
    </>
  );
}