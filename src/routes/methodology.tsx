import { createFileRoute } from "@tanstack/react-router";
import { Prose } from "@/components/editorial";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — how Aesthetic Index sources and verifies" },
      {
        name: "description",
        content:
          "How treatment information is sourced, how evidence grades work, how prices are collected and normalized, and how stale records are handled.",
      },
      { property: "og:title", content: "Methodology — Aesthetic Index" },
      {
        property: "og:description",
        content: "How we source treatment information, collect prices, and handle stale records.",
      },
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
          Every factual row on a treatment or comparison page is meant to trace back to a recorded
          source: manufacturer instructions for use, regulatory clearance documents, peer-reviewed
          literature, or professional society guidance. Missing fields are omitted from the public
          comparison rather than filled with plausible text.
        </p>
        <p>
          Incomplete comparisons are excluded from normal navigation, search engines, and the
          sitemap until the relevant records, distinction, sources, and review date are complete.
        </p>

        <h2 className="mt-10 text-2xl">How evidence grades work</h2>
        <p>
          Evidence grades describe how strong the published evidence is for a claim, not how good a
          treatment is. A grade is only shown once the underlying sources are attached to the claim.
          We do not assign grades editorially in the absence of sources.
        </p>

        <h2 className="mt-10 text-2xl">How price data is collected</h2>
        <p>
          Prices are collected by hand from pages a clinic publishes itself. Each observation stores
          the amount, the unit, the URL, and the date it was seen. Observations are immutable: when
          a price changes we add a new record rather than editing the old one, so the history stays
          auditable.
        </p>

        <h2 className="mt-10 text-2xl">How prices are normalized</h2>
        <p>
          Clinics advertise differently — per unit, per area, per session, per package. Where an
          advertised amount can be converted to a per-unit figure without assumption, we show the
          effective per-unit price alongside the original. Where it cannot, we show only what was
          advertised. Conditions such as “new clients only”, membership requirements, and minimum
          purchases are recorded as separate fields, not buried in footnotes.
        </p>

        <h2 className="mt-10 text-2xl">What “publicly listed” means</h2>
        <p>
          The clinic itself published the amount on a page anyone can visit. It is not a quote, not
          a phone estimate, and not a number a third party reported to us.
        </p>

        <h2 className="mt-10 text-2xl">What “verified” means</h2>
        <p>
          A person re-opened the source URL, confirmed the amount still appears there, and recorded
          the date. Anything short of that is shown as unverified.
        </p>

        <h2 className="mt-10 text-2xl">How stale records are handled</h2>
        <p>
          Every price carries the date it was observed, displayed on the row. Records whose source
          page no longer shows the price are marked expired and excluded from any summary figure. We
          would rather show fewer prices than confident, stale ones.
        </p>

        <h2 className="mt-10 text-2xl">Why we do not diagnose or rank providers</h2>
        <p>
          Whether a treatment suits you depends on your anatomy, history, and goals — none of which
          a website can assess. We also do not rank clinics: ranking requires outcome data that is
          not publicly available, and inventing a ranking would mislead. We compare treatments and
          report prices. Your clinician decides the rest.
        </p>
      </Prose>
    </>
  );
}
