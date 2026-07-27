import { createFileRoute, Link } from "@tanstack/react-router";
import { Prose } from "@/components/editorial";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — independent cosmetic treatment research" },
      {
        name: "description",
        content:
          "Why Aesthetic Index exists, why price transparency matters, and how editorial independence, sponsorship, and corrections are handled.",
      },
      { property: "og:title", content: "About Aesthetic Index" },
      {
        property: "og:description",
        content: "Independent cosmetic treatment comparisons. No sponsorships, no lead selling.",
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
          hands. Most information about these treatments is published by someone who profits from
          the booking. We compare treatments on the same criteria, in the same order, and say
          plainly when we do not know something.
        </p>

        <h2 className="mt-10 text-2xl">Why price transparency matters</h2>
        <p>
          Aesthetic pricing is deliberately hard to compare: per unit here, per area there,
          “starts at” everywhere, with membership and new-client conditions attached. That opacity
          is not an accident, and it costs patients real money. Publishing what clinics already
          advertise — with the source and the date — is the smallest honest step toward fixing it.
        </p>

        <h2 className="mt-10 text-2xl">Editorial independence</h2>
        <p>
          Clinics cannot pay to appear, to rank higher, or to have information removed. We do not
          sell leads, we do not take booking commissions, and no clinic reviews our content before
          publication.
        </p>

        <h2 className="mt-10 text-2xl">Sponsorship policy</h2>
        <p>
          We currently accept no sponsorships. If that ever changes, sponsored placements will be
          labelled on the page itself, excluded from comparison tables and price data, and disclosed
          here before they go live.
        </p>

        <h2 className="mt-10 text-2xl">Correction policy</h2>
        <p>
          If we get something wrong, tell us and we will fix it. Substantive corrections to medical
          content or prices are noted on the page rather than silently edited, along with the date
          of the change.
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