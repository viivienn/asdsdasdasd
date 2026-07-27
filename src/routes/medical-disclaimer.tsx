import { createFileRoute, Link } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

const LAST_UPDATED = "2026-07-27";

export const Route = createFileRoute("/medical-disclaimer")({
  head: () => ({
    meta: [
      { title: "Medical Disclaimer — Aesthetic Index" },
      {
        name: "description",
        content:
          "Aesthetic Index publishes general educational information and publicly sourced pricing observations. It does not provide medical advice, diagnosis, or personalized recommendations.",
      },
      { property: "og:title", content: "Medical Disclaimer" },
      {
        property: "og:description",
        content:
          "Educational purpose, no provider-patient relationship, no personalized recommendations, and how pricing observations should be read.",
      },
      { property: "og:url", content: absoluteUrl("/medical-disclaimer") },
      { property: "og:type", content: "article" },
      // Public and indexable, but not a search landing page.
      { name: "robots", content: "index, follow, noimageindex, max-snippet:0" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/medical-disclaimer") }],
  }),
  component: MedicalDisclaimer,
});

const SECTIONS: Array<{ heading: string; body: React.ReactNode }> = [
  {
    heading: "Educational purpose",
    body: (
      <p>
        Aesthetic Index provides general educational and informational content concerning cosmetic
        and aesthetic treatments. The content is not intended to constitute medical advice,
        diagnosis, treatment, prescribing, clinical decision-making, or a substitute for
        professional medical care.
      </p>
    ),
  },
  {
    heading: "No provider-patient relationship",
    body: (
      <p>
        Use of Aesthetic Index does not create a physician-patient, clinician-patient, or other
        healthcare-provider relationship between the user and Aesthetic Index, its contributors,
        reviewers, advertisers, data sources, or listed clinics.
      </p>
    ),
  },
  {
    heading: "No personalized recommendations",
    body: (
      <p>
        Aesthetic Index does not assess individual anatomy, health history, contraindications,
        allergies, medications, pregnancy status, prior procedures, or other personal factors.
        Treatment comparisons describe general characteristics and must not be interpreted as a
        recommendation that a particular treatment is appropriate for a particular person.
      </p>
    ),
  },
  {
    heading: "Risks and outcomes vary",
    body: (
      <p>
        All medical and cosmetic procedures involve potential risks. Outcomes, side effects,
        downtime, longevity, pain, complications, and satisfaction vary between individuals and
        providers. Information on the site cannot predict an individual result.
      </p>
    ),
  },
  {
    heading: "Seek professional care",
    body: (
      <p>
        Users should consult an appropriately qualified and licensed healthcare professional before
        beginning, stopping, selecting, or changing any treatment. Users experiencing a medical
        emergency or severe symptoms should contact emergency services or seek immediate
        professional medical care.
      </p>
    ),
  },
  {
    heading: "Pricing information",
    body: (
      <p>
        Prices are observations from publicly available sources or other clearly disclosed sources
        as of the displayed date. Aesthetic Index does not guarantee that a price is complete,
        current, available, or applicable to a particular user. Clinics may change pricing,
        requirements, promotions, products, providers, and availability without notice.
      </p>
    ),
  },
  {
    heading: "No endorsement",
    body: (
      <p>
        The appearance of a clinic, provider, product, manufacturer, treatment, price, link, or
        advertisement does not constitute endorsement. Sponsored or paid placements must be clearly
        labeled and must not influence editorial treatment comparisons.
      </p>
    ),
  },
  {
    heading: "Source limitations",
    body: (
      <>
        <p>
          Aesthetic Index attempts to use credible sources and clearly disclose evidence and update
          dates, but medical knowledge, regulatory status, product labeling, pricing, and clinical
          practices may change. Errors or omissions may occur.
        </p>
        <p>
          If you find an error, please write to{" "}
          <a href="mailto:corrections@aestheticindex.co" className="underline underline-offset-4">
            corrections@aestheticindex.co
          </a>{" "}
          — corrections are noted on the page rather than silently edited.
        </p>
      </>
    ),
  },
  {
    heading: "External websites",
    body: (
      <p>
        Links to clinic, manufacturer, government, publication, booking, or other third-party
        websites are provided for convenience and source transparency. Aesthetic Index does not
        control or guarantee the accuracy, availability, security, privacy practices, or services
        of third-party websites.
      </p>
    ),
  },
  {
    heading: "Limitation",
    body: (
      <p>
        Users are responsible for confirming treatment information, provider credentials,
        suitability, availability, and pricing directly with qualified professionals and relevant
        sources before making a decision.
      </p>
    ),
  },
];

function MedicalDisclaimer() {
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
          <li aria-current="page">Medical Disclaimer</li>
        </ol>
      </nav>

      <h1 className="mt-4 font-display text-4xl">Medical Disclaimer</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Aesthetic Index provides general educational information and aggregates publicly available
        pricing data. It does not provide medical advice, diagnosis, treatment recommendations, or
        guarantees of results.
      </p>

      <div className="mt-10 max-w-2xl space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed">{section.body}</div>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        Last updated:{" "}
        <time dateTime={LAST_UPDATED}>
          {new Date(`${LAST_UPDATED}T00:00:00Z`).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
        </time>
      </p>

      <p className="mt-6 text-sm">
        <Link to="/methodology" className="underline underline-offset-4">
          How we source and review content
        </Link>
      </p>
    </>
  );
}