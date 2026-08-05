import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE, pageMetadata } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageMetadata({
      title: "Corrections and contact | Aesthetic Index",
      description:
        "Contact Aesthetic Index about factual corrections, pricing-source updates, accessibility, or general questions.",
      path: "/contact",
      type: "article",
    }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex gap-1">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Contact</li>
        </ol>
      </nav>
      <h1 className="mt-4 font-display text-4xl">Corrections and contact</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Send the page URL, the specific statement or price record, and a primary source when one is
        available. Do not send medical records or other sensitive health information.
      </p>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-rule bg-card p-5">
          <h2 className="font-display text-2xl">Factual corrections</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Medical, regulatory, comparison, and pricing-source corrections.
          </p>
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="mt-4 inline-block underline underline-offset-4"
          >
            {SITE.contactEmail}
          </a>
        </article>
        <article className="rounded-2xl border border-rule bg-card p-5">
          <h2 className="font-display text-2xl">General questions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Product feedback, accessibility issues, and general questions.
          </p>
          <a
            href="mailto:hello@aestheticindex.co"
            className="mt-4 inline-block underline underline-offset-4"
          >
            hello@aestheticindex.co
          </a>
        </article>
      </section>
      <p className="mt-8 text-sm">
        <Link to="/about" hash="corrections" className="underline underline-offset-4">
          Read the correction policy
        </Link>
      </p>
    </>
  );
}
