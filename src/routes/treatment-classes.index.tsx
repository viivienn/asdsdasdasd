import { createFileRoute, Link } from "@tanstack/react-router";
import { CLASS_LANDINGS } from "@/lib/seo-taxonomy";
import { pageMetadata } from "@/lib/site";

export const Route = createFileRoute("/treatment-classes/")({
  head: () =>
    pageMetadata({
      title: "Cosmetic treatment classes: products, devices & comparisons | Aesthetic Index",
      description:
        "Explore source-backed treatment classes, their published products or devices, limitations, and relevant side-by-side comparisons.",
      path: "/treatment-classes",
    }),
  component: TreatmentClassesIndex,
});

function TreatmentClassesIndex() {
  return (
    <>
      <h1 className="font-display text-4xl">Treatment classes</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Understand how products, devices, and procedures are grouped before comparing specific
        options.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLASS_LANDINGS.map((group) => (
          <li key={group.slug}>
            <Link
              to="/treatment-classes/$slug"
              params={{ slug: group.slug }}
              className="block h-full rounded-2xl border border-rule bg-card p-5 hover:border-primary"
            >
              <h2 className="font-display text-xl">{group.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{group.definition}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
