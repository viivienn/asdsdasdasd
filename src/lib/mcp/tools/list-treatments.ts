import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, json, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_treatments",
  title: "List treatments",
  description:
    "List the cosmetic treatment profiles on Aesthetic Index with their slug, category, review status and whether they are published.",
  inputSchema: {
    search: z.string().trim().optional().describe("Optional text to match against treatment name or slug."),
    limit: z.number().int().min(1).max(100).default(50).describe("Maximum number of rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    let query = supabaseForUser(ctx)
      .from("treatments")
      .select(
        "slug,name,category,treatment_class,brand_name,summary,publication_status,is_sample,last_reviewed_at,evidence_grade",
      )
      .order("name")
      .limit(limit ?? 50);
    if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) return fail(error.message);
    return json({ count: data?.length ?? 0, treatments: data });
  },
});