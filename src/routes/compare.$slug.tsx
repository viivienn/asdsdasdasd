import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchComparison } from "@/lib/content.functions";
import {
  COMPARISON_DISPLAY_ORDER,
  COMPARISON_ROWS,
  type Treatment,
} from "@/lib/content-types";
import { DemoNotice, EvidenceState, Prose } from "@/components/editorial";
import { CoverageRequestForm } from "@/components/demand-forms";

export const Route = createFileRoute("/compare/$slug")({
  loader: async ({ params }) => {
    if (!COMPARISON_DISPLAY_ORDER[params.slug]) throw notFound();
    const res = await fetchComparison({ data: { slug: params.slug } });
    if (!res.comparison.data) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const pair = COMPARISON_DISPLAY_ORDER[params.slug];
    const label = pair
      ? `${titleCase(pair[0])} vs. ${titleCase(pair[1])}`
      : "Treatment comparison";
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — Aesthetic Index" }, { name: "robots", content: "noindex" }],
      };
    }
    const description =
      loaderData.comparison.data?.one_sentence_difference ??
      `A structured comparison of ${label} across results, downtime, risks, and reversibility.`;
    return {
      meta: [
        { title: `${label} — Aesthetic Index` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${label}` },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:url", content: `/compare/${params.slug}` },
        { property: "og:type", content: "article" },
        ...(loaderData.comparison.isDemo ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: [{ rel: "canonical", href: `/compare/${params.slug}` }],
    };
  },
  errorComponent: () => <p>We couldn't load this comparison. Please refresh.</p>,
  notFoundComponent: () => (
    <div>
      <h1 className="font-display text-3xl">This comparison is not published yet</h1>
      <p className="mt-3 text-muted-foreground">
        We only publish comparisons we have written and reviewed.
      </p>
      <p className="mt-4">
        <Link to="/compare" className="underline underline-offset-4">
          Browse published comparisons
        </Link>
      </p>
    </div>
  ),
  component: ComparisonPage,
});

function titleCase(slug: string) {
  const map: Record<string, string> = {
    "ha-filler": "HA filler",
    "thermage-flx": "Thermage FLX",
    botox: "Botox",
    dysport: "Dysport",
    sculptra: "Sculptra",
    radiesse: "Radiesse",
    morpheus8: "Morpheus8",
    ultherapy: "Ultherapy",
  };
  return map[slug] ?? slug;
}

function ComparisonPage() {
  const { slug } = Route.useParams();
  const { comparison, treatments } = Route.useLoaderData();
  const record = comparison.data!;
  const [slugA, slugB] = COMPARISON_DISPLAY_ORDER[slug];
  const list = treatments.data as Treatment[];
  const a = list.find((t) => t.slug === slugA);
  const b = list.find((t) => t.slug === slugB);
  const label = `${titleCase(slugA)} vs. ${titleCase(slugB)}`;

  return (
    <>
      {comparison.isDemo ? <DemoNotice /> : null}

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

      <h1 className="mt-4 font-display text-4xl">{label}</h1>
      {record.one_sentence_difference ? (
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {record.one_sentence_difference}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          Last reviewed:{" "}
          {record.last_reviewed_at
            ? new Date(record.last_reviewed_at).toLocaleDateString()
            : "Not yet reviewed"}
        </span>
        <EvidenceState state={comparison.isDemo ? "unsourced" : "sourced"} />
        <Link to="/compare" className="underline underline-offset-4">
          Change treatments
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="border border-rule bg-card p-4">
          <h2 className="text-base font-medium">Consider {titleCase(slugA)} when…</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {record.consider_a_when ?? "Not yet written."}
          </p>
        </article>
        <article className="border border-rule bg-card p-4">
          <h2 className="text-base font-medium">Consider {titleCase(slugB)} when…</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {record.consider_b_when ?? "Not yet written."}
          </p>
        </article>
        <article className="border border-rule bg-card p-4">
          <h2 className="text-base font-medium">Neither is a direct fit when…</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {record.neither_when ?? "Not yet written."}
          </p>
        </article>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl">Side by side</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">
              {label}: attribute-by-attribute comparison
            </caption>
            <thead>
              <tr className="border-b border-rule text-left">
                <th scope="col" className="w-1/3 py-2 pr-4 font-medium">
                  Attribute
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  {titleCase(slugA)}
                </th>
                <th scope="col" className="py-2 font-medium">
                  {titleCase(slugB)}
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
      </section>

      {record.common_misconception ? (
        <section className="mt-12">
          <h2 className="text-2xl">Common marketing misconception</h2>
          <Prose>
            <p className="mt-3">{record.common_misconception}</p>
          </Prose>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-2xl">Questions to ask at consultation</h2>
        <ul className="mt-3 max-w-2xl list-disc space-y-2 pl-5 text-sm">
          <li>Which of these two do you use more often for my goal, and why?</li>
          <li>How many sessions do you expect, and what is the total cost across them?</li>
          <li>What does the result look like if I stop after one session?</li>
          <li>What is your plan if I am unhappy with the outcome?</li>
          <li>What are the risks you have personally seen with this treatment?</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Sources</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {comparison.isDemo
            ? "No sources are recorded for this page yet. It is prototype content and is excluded from search engines."
            : "Sources are listed on each treatment profile."}
        </p>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          {[slugA, slugB].map((s) => (
            <li key={s}>
              <Link
                to="/treatments/$slug"
                params={{ slug: s }}
                className="underline underline-offset-4"
              >
                {titleCase(s)} profile
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Related comparisons</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {Object.keys(COMPARISON_DISPLAY_ORDER)
            .filter((s) => s !== slug)
            .map((s) => (
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

      <section className="mt-12">
        <CoverageRequestForm treatmentSlug={slugA} />
      </section>

      <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
        This page is educational and is not medical advice. Only a licensed clinician who has
        examined you can say whether a treatment is appropriate.
      </p>
    </>
  );
}

function cell(t: Treatment | undefined, key: keyof Treatment) {
  const value = t?.[key];
  if (typeof value !== "string" || value.trim() === "") {
    return <span className="text-muted-foreground">Not yet recorded</span>;
  }
  return value;
}