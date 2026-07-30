import { createFileRoute, Link } from "@tanstack/react-router";
import { Prose } from "@/components/editorial";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Aesthetic Index" },
      {
        name: "description",
        content:
          "Why Aesthetic Index exists, how source-backed treatment comparisons work, and how commercial placements remain separate from factual fields.",
      },
      { property: "og:title", content: "About Aesthetic Index" },
      {
        property: "og:description",
        content: "Source-backed cosmetic treatment comparisons with sources shown.",
      },
      { property: "og:url", content: absoluteUrl("/about") },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/about") }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <h1 className="font-display text-4xl">About Aesthetic Index</h1>
      <Prose>
        <h2 className="mt-10 text-2xl">Mission</h2>
        <p>
          Aesthetic Index exists to make cosmetic treatment decisions legible before money changes
          hands. We compare treatments on consistent criteria and show the sources supporting the
          available factual fields.
        </p>

        <h2 className="mt-10 text-2xl">Why price transparency matters</h2>
        <p>
          Aesthetic pricing is difficult to compare: per unit here, per area there, “starts at”
          elsewhere, with membership and new-client conditions attached. Regional estimates make the
          pricing basis, researched range, source count, and research date visible without
          presenting the result as a clinic quote.
        </p>

        <h2 className="mt-10 text-2xl">Editorial separation</h2>
        <p>
          Commercial placements do not change treatment attributes, source citations, regulatory
          information, comparison compatibility, or the methodology used to present factual
          information. Any advertising, affiliate link, or sponsored placement is labeled.
        </p>
        <p>
          <Link to="/advertising-disclosure" className="underline underline-offset-4">
            Read the advertising disclosure
          </Link>
          .
        </p>

        <h2 id="corrections" className="mt-10 scroll-mt-24 text-2xl">
          Correction policy
        </h2>
        <p>
          If we get something wrong, tell us and we will fix it. Substantive corrections to medical
          content or pricing data are noted with the date of the change.
        </p>

        <h2 className="mt-10 text-2xl">Contact</h2>
        <p>
          General:{" "}
          <a href="mailto:hello@aestheticindex.co" className="underline underline-offset-4">
            hello@aestheticindex.co
          </a>
          <br />
          Corrections:{" "}
          <a href="mailto:corrections@aestheticindex.co" className="underline underline-offset-4">
            corrections@aestheticindex.co
          </a>
        </p>
        <p>
          <Link to="/methodology" className="underline underline-offset-4">
            Read the methodology
          </Link>
        </p>
      </Prose>
    </>
  );
}
