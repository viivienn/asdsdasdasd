import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, json, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_suggestions",
  title: "List suggestions",
  description: "Read suggestions already filed in the inbox, so you do not repeat one.",
  inputSchema: {
    status: z.enum(["new", "accepted", "rejected"]).optional(),
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    let query = supabaseForUser(ctx)
      .from("content_suggestions")
      .select("id,target_type,target_slug,title,body,sources,status,created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return fail(error.message);
    return json({ count: data?.length ?? 0, suggestions: data });
  },
});
