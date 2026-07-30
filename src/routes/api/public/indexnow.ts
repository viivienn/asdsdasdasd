// IndexNow notification endpoint.
//
// Called manually (or by an editorial workflow) when a reviewed page is added,
// materially updated, or removed. It is deliberately NOT wired to every write:
// minor database edits must not be submitted.
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SITE_URL } from "@/lib/site";

const bodySchema = z.object({
  urls: z.array(z.string().url()).min(1).max(100),
});

export const Route = createFileRoute("/api/public/indexnow")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.INDEXNOW_KEY;
        const token = process.env.INDEXNOW_TOKEN;
        if (!key || !token) {
          return Response.json({ error: "IndexNow is not configured." }, { status: 503 });
        }
        // Editorial-only endpoint: a shared token, not public access.
        if (request.headers.get("x-indexnow-token") !== token) {
          return new Response("Unauthorized", { status: 401 });
        }

        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid payload." }, { status: 400 });
        }

        const host = new URL(SITE_URL).host;
        const urlList = parsed.urls.filter((u) => new URL(u).host === host);
        if (urlList.length === 0) {
          return Response.json({ error: "No URLs on the canonical host." }, { status: 400 });
        }

        const res = await fetch("https://api.indexnow.org/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            host,
            key,
            keyLocation: `${SITE_URL}/indexnow-key.txt`,
            urlList,
          }),
        });

        console.info("indexnow submit", { count: urlList.length, status: res.status });
        return Response.json({ submitted: urlList.length, status: res.status });
      },
    },
  },
});
