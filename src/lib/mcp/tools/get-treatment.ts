import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, json, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_treatment",
  title: "Get treatment profile",
  description:
    "Read one treatment profile in full, including every editorial field and its cited sources. Use this to find gaps to fill.",
  inputSchema: { slug: z.string().trim().min(1).describe("Treatment slug, e.g. 'botox'.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail(`No treatment found with slug "${slug}".`);
    const { data: sources } = await supabase
      .from("treatment_sources")
      .select("*")
      .eq("treatment_id", data.id);
    const missingFields = Object.entries(data)
      .filter(([, v]) => v === null || v === "")
      .map(([k]) => k);
    return json({ treatment: data, sources: sources ?? [], missingFields });
  },
});
