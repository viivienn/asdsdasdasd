import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { TaxonomyLanding } from "@/components/taxonomy-landing";
import { fetchTaxonomyLanding } from "@/lib/content.functions";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/site";

export const Route = createFileRoute("/concerns/$slug")({
  loader: async ({ params }) => {
    const data = await fetchTaxonomyLanding({ data: { kind: "concern", slug: params.slug } });
    if (!data) throw notFound();
    if (data.config.slug !== params.slug) {
      throw redirect({
        to: "/concerns/$slug",
        params: { slug: data.config.slug },
        statusCode: 301,
      });
    }
    return data;
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.config.label ?? params.slug.replaceAll("-", " ");
    const indexable = Boolean(loaderData?.treatments.length && loaderData?.sources.length);
    const path = `/concerns/${params.slug}`;
    return {
      ...pageMetadata({
        title: `Treatments for ${label}: options, differences & risks | Aesthetic Index`,
        description: loaderData?.config.definition ?? `Compare published approaches for ${label}.`,
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
                    { name: "Concerns", path: "/concerns" },
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
  notFoundComponent: () => <h1 className="font-display text-3xl">Concern not found</h1>,
  component: ConcernLandingPage,
});

function ConcernLandingPage() {
  return <TaxonomyLanding data={Route.useLoaderData()} />;
}
