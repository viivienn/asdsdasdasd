import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { fail, json, supabaseForUser, unauthenticated } from "../supabase";
import { SITE_URL } from "@/lib/site";

const STATIC_PAGES = [
  { path: "/", purpose: "Search-first homepage" },
  { path: "/treatments", purpose: "Treatment index" },
  { path: "/compare", purpose: "Comparison index and builder" },
  { path: "/methodology", purpose: "How data is sourced and checked" },
  { path: "/medical-disclaimer", purpose: "Medical disclaimer" },
  { path: "/about", purpose: "About and corrections policy" },
  { path: "/sitemap.xml", purpose: "Machine-readable sitemap" },
];

export default defineTool({
  name: "list_site_pages",
  title: "List site pages",
  description:
    "List every public URL on Aesthetic Index (static pages, treatment pages, comparison pages) so you can open and review them on the live site.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const [{ data: treatments, error }, { data: comparisons }] = await Promise.all([
      supabase.from("treatments").select("slug,name").order("name"),
      supabase.from("comparisons").select("slug"),
    ]);
    if (error) return fail(error.message);
    return json({
      siteUrl: SITE_URL,
      note: "Open these URLs directly to see how the pages look.",
      staticPages: STATIC_PAGES.map((p) => ({ ...p, url: `${SITE_URL}${p.path}` })),
      treatmentPages: (treatments ?? []).map((t) => ({
        name: t.name,
        url: `${SITE_URL}/treatments/${t.slug}`,
      })),
      comparisonPages: (comparisons ?? []).map((c) => ({
        url: `${SITE_URL}/compare/${(c as { slug: string }).slug}`,
      })),
    });
  },
});