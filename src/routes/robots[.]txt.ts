import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";
import { PRIVATE_CRAWLER_PATHS } from "@/lib/seo";

const SEARCH_CRAWLERS = [
  "*",
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
] as const;

function searchGroup(userAgent: string) {
  return [
    `User-agent: ${userAgent}`,
    "Allow: /",
    ...PRIVATE_CRAWLER_PATHS.map((path) => `Disallow: ${path}`),
  ].join("\n");
}

export function robotsText() {
  return [
    ...SEARCH_CRAWLERS.map(searchGroup),
    ["User-agent: GPTBot", "Disallow: /"].join("\n"),
    ["User-agent: ClaudeBot", "Disallow: /"].join("\n"),
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join("\n\n");
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(robotsText(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
