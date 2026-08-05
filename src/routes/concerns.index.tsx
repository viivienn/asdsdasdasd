import { createFileRoute, Link } from "@tanstack/react-router";
import { CONCERN_LANDINGS } from "@/lib/seo-taxonomy";
import { pageMetadata } from "@/lib/site";

export const Route = createFileRoute("/concerns/")({
  head: () =>
    pageMetadata({
      title: "Cosmetic treatment concerns: compare approaches | Aesthetic Index",
      description:
        "Browse source-backed cosmetic treatment profiles and comparisons by concern without receiving a personalized treatment recommendation.",
      path: "/concerns",
    }),
  component: ConcernsIndex,
});

function ConcernsIndex() {
  return (
    <>
      <h1 className="font-display text-4xl">Explore treatment concerns</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        These directories organize published profiles and comparisons. They do not diagnose a
        concern or decide which treatment is appropriate for a person.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {CONCERN_LANDINGS.map((concern) => (
          <li key={concern.slug}>
            <Link
              to="/concerns/$slug"
              params={{ slug: concern.slug }}
              className="block h-full rounded-2xl border border-rule bg-card p-5 hover:border-primary"
            >
              <h2 className="font-display text-xl">{concern.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{concern.definition}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
