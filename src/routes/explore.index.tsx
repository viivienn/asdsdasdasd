import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCatalog } from "@/lib/content.functions";
import {
  ENTITY_ORDER,
  ENTITY_GROUP_LABEL,
  ENTITY_DESCRIPTION,
  type EntityType,
} from "@/lib/content-types";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/explore/")({
  loader: () => fetchCatalog(),
  head: () => ({
    meta: [
      { title: "Explore cosmetic treatments, brands and devices | Aesthetic Index" },
      {
        name: "description",
        content:
          "Browse the catalog by treatment class, brand family, specific product, device and procedure — each record links to its comparisons and sources.",
      },
      { property: "og:title", content: "Explore cosmetic treatments, brands and devices" },
      {
        property: "og:description",
        content:
          "Browse treatment classes, brand families, specific products, devices and procedures.",
      },
      { property: "og:url", content: absoluteUrl("/explore") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/explore") }],
  }),
  errorComponent: () => <p>We couldn't load the catalog. Please refresh.</p>,
  component: Explore,
});

function Explore() {
  const { entries } = Route.useLoaderData();

  return (
    <>
      <h1 className="font-display text-4xl">Explore</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Everything in our records, grouped by what kind of thing it is: a broad treatment class, a
        brand family, a specific product, a device, or a procedure.
      </p>

      {ENTITY_ORDER.map((type: EntityType) => {
        const group = entries.filter((e) => e.entity_type === type);
        if (group.length === 0) return null;
        return (
          <section key={type} className="mt-12">
            <h2 className="text-2xl">{ENTITY_GROUP_LABEL[type]}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {ENTITY_DESCRIPTION[type]}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/treatments/$slug"
                    params={{ slug: e.slug }}
                    className="flex h-full items-center gap-3 rounded-lg border border-rule bg-card px-4 py-3 hover:border-primary"
                  >
                    {e.media ? (
                      <img
                        src={e.media.url}
                        alt={e.media.alt_text}
                        loading="lazy"
                        className="h-10 w-10 shrink-0 rounded object-contain"
                      />
                    ) : null}
                    <span>
                      <span className="block">{e.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {e.parent_name ? `${e.parent_name} · ` : ""}
                        {e.category}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="mt-12 text-sm text-muted-foreground">
        Looking for a side-by-side view?{" "}
        <Link to="/compare" className="underline underline-offset-4">
          Build a comparison
        </Link>
        .
      </p>
    </>
  );
}