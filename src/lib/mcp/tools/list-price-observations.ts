import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, json, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_price_observations",
  title: "List price observations",
  description:
    "Read the publicly listed clinic price observations collected for a treatment, newest first.",
  inputSchema: {
    treatmentSlug: z
      .string()
      .trim()
      .optional()
      .describe("Optional treatment slug filter, e.g. 'botox'."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ treatmentSlug, limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    let treatmentId: string | undefined;
    if (treatmentSlug) {
      const { data: t } = await supabase
        .from("treatments")
        .select("id")
        .eq("slug", treatmentSlug)
        .maybeSingle();
      if (!t) return fail(`No treatment found with slug "${treatmentSlug}".`);
      treatmentId = t.id;
    }
    let query = supabase
      .from("price_observations")
      .select("*")
      .order("observed_at", { ascending: false })
      .limit(limit ?? 50);
    if (treatmentId) query = query.eq("treatment_id", treatmentId);
    const { data, error } = await query;
    if (error) return fail(error.message);
    return json({ count: data?.length ?? 0, observations: data });
  },
});
