import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/advertising-disclosure")({
  head: () => ({
    meta: [
      { title: "Advertising disclosure | Aesthetic Index" },
      {
        name: "description",
        content:
          "How Aesthetic Index labels advertising, affiliate links, and sponsored placements while preserving factual comparison data.",
      },
      { property: "og:title", content: "Advertising disclosure" },
      { property: "og:url", content: absoluteUrl("/advertising-disclosure") },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/advertising-disclosure") }],
  }),
  component: AdvertisingDisclosure,
});

function AdvertisingDisclosure() {
  return (
    <>
      <h1 className="font-display text-4xl">Advertising disclosure</h1>
      <p className="mt-6 max-w-3xl text-base leading-7">
        Aesthetic Index may display advertising, affiliate links, or sponsored placements.
        Commercial placements are clearly labeled and do not alter factual comparison fields, source
        citations, regulatory information, or the methodology used to present treatment information.
      </p>
    </>
  );
}
