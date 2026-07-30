import { createFileRoute } from "@tanstack/react-router";
import { Prose } from "@/components/editorial";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — how Aesthetic Index sources and compares" },
      {
        name: "description",
        content:
          "How treatment profiles support comparisons, how sources are shown, and how stored regional price estimates are researched and presented.",
      },
      { property: "og:title", content: "Methodology — Aesthetic Index" },
      { property: "og:url", content: absoluteUrl("/methodology") },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/methodology") }],
  }),
  component: Methodology,
});

function Methodology() {
  return (
    <>
      <h1 className="font-display text-4xl">Methodology</h1>
      <Prose>
        <h2 className="mt-10 text-2xl">How treatment information is sourced</h2>
        <p>
          Factual treatment fields are intended to trace back to recorded sources such as
          manufacturer instructions for use, regulatory documents, peer-reviewed literature, or
          professional society guidance. Missing fields are omitted rather than filled with
          generated medical prose.
        </p>

        <h2 className="mt-10 text-2xl">How comparisons are assembled</h2>
        <p>
          Comparison pages read matching structured fields from two individual treatment profiles. A
          separate editorial article is not required. Direct comparisons require compatible entity
          types and a shared broad treatment family. Selected different-approach comparisons use an
          explicit family rule and are labeled as treatments that are not direct substitutes.
        </p>
        <p>
          A page is only eligible for search indexing when both profiles are published, non-sample,
          source-supported, and complete enough for the relevant comparison template. Other valid
          long-tail comparisons may remain noindex while still being usable.
        </p>

        <h2 className="mt-10 text-2xl">How evidence grades work</h2>
        <p>
          Evidence grades describe the recorded strength of evidence for a claim, not whether a
          treatment is good or appropriate for an individual. A grade is shown only when stored in
          the treatment profile.
        </p>

        <h2 className="mt-10 text-2xl">How regional price estimates work</h2>
        <p>
          A ZIP or postal code is normalized and matched to a stored surrounding market. The site
          then reads a researched regional estimate from the database. No search engine, language
          model, crawler, or external pricing service is called when a visitor submits a code.
        </p>
        <p>
          Each estimate keeps its currency, pricing unit, treatment area when applicable, estimated
          average or median when available, estimated range, source count, methodology note, source
          URLs, and research date. Incompatible units, currencies, treatment areas, and promotion
          types are not combined.
        </p>
        <p>
          A regional estimate is not a quote and may not represent a provider located inside the
          exact postal area. Actual pricing varies by provider, quantity, treatment area, product,
          promotions, membership, and individual treatment needs.
        </p>

        <h2 className="mt-10 text-2xl">Why we do not diagnose or rank providers</h2>
        <p>
          Whether a treatment suits someone depends on anatomy, history, and goals that a public
          comparison cannot assess. Aesthetic Index presents factual differences and researched
          pricing context; it does not select a treatment or provider for the reader.
        </p>
      </Prose>
    </>
  );
}
