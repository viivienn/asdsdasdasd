import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, json, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_comparisons",
  title: "List comparisons",
  description:
    "List the side-by-side treatment comparison pages, including their slug, the two treatments compared and review status.",
  inputSchema: { limit: z.number().int().min(1).max(100).default(50) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("comparisons")
      .select("*")
      .limit(limit ?? 50);
    if (error) return fail(error.message);
    return json({ count: data?.length ?? 0, comparisons: data });
  },
});