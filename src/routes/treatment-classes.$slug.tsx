import { createFileRoute, notFound } from "@tanstack/react-router";
import { TaxonomyLanding } from "@/components/taxonomy-landing";
import { fetchTaxonomyLanding } from "@/lib/content.functions";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/site";

export const Route = createFileRoute("/treatment-classes/$slug")({
  loader: async ({ params }) => {
    const data = await fetchTaxonomyLanding({ data: { kind: "class", slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.config.label ?? params.slug.replaceAll("-", " ");
    const indexable = Boolean(loaderData?.treatments.length && loaderData?.sources.length);
    const path = `/treatment-classes/${params.slug}`;
    return {
      ...pageMetadata({
        title: `${label}: options, results, risks & comparisons | Aesthetic Index`,
        description: loaderData?.config.definition ?? `Explore published ${label} profiles.`,
        path,
        indexable,
        type: "article",
      }),
      scripts: indexable
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  organizationJsonLd(),
                  breadcrumbJsonLd([
                    { name: "Home", path: "/" },
                    { name: "Treatment classes", path: "/treatment-classes" },
                    { name: label, path },
                  ]),
                  {
                    "@type": "MedicalWebPage",
                    "@id": absoluteUrl(path),
                    url: absoluteUrl(path),
                    name: label,
                    description: loaderData?.config.definition,
                    publisher: { "@id": `${SITE_URL}#organization` },
                    citation: loaderData?.sources.map((source) => source.source_url),
                  },
                ],
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => <h1 className="font-display text-3xl">Treatment class not found</h1>,
  component: TreatmentClassLandingPage,
});

function TreatmentClassLandingPage() {
  return <TaxonomyLanding data={Route.useLoaderData()} />;
}
