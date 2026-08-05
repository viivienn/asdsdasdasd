import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { SITE_URL } from "./lib/site";
import { isPrivateCrawlerPath, normalizePublicPath } from "./lib/seo";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const requestUrl = new URL(request.url);
      const canonicalOrigin = new URL(SITE_URL);
      const knownLegacyHosts = new Set([
        `www.${canonicalOrigin.hostname}`,
        "aestheticindex.co",
        "www.aestheticindex.co",
      ]);
      const normalizedPath = normalizePublicPath(requestUrl.pathname);
      const isCanonicalHost = requestUrl.hostname === canonicalOrigin.hostname;
      const shouldNormalizeHost = knownLegacyHosts.has(requestUrl.hostname);
      const shouldNormalizeProtocol = isCanonicalHost && requestUrl.protocol !== "https:";
      const shouldNormalizePath = normalizedPath !== requestUrl.pathname;

      if (shouldNormalizeHost || shouldNormalizeProtocol || shouldNormalizePath) {
        requestUrl.protocol = canonicalOrigin.protocol;
        requestUrl.host = canonicalOrigin.host;
        requestUrl.pathname = normalizedPath;
        return Response.redirect(requestUrl, 308);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      if (!isPrivateCrawlerPath(requestUrl.pathname)) return normalized;
      const headers = new Headers(normalized.headers);
      headers.set("X-Robots-Tag", "noindex, nofollow");
      return new Response(normalized.body, {
        status: normalized.status,
        statusText: normalized.statusText,
        headers,
      });
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
