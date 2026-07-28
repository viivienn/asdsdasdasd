import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, json, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "suggest_change",
  title: "Suggest a change",
  description:
    "File a proposed improvement to the site: new content, corrections, missing data, or a Lovable prompt to run. It lands in the owner's suggestion inbox. Nothing is published by this tool.",
  inputSchema: {
    targetType: z
      .enum(["treatment", "comparison", "price", "page", "other"])
      .describe("What the suggestion is about."),
    targetSlug: z.string().trim().optional().describe("Slug or path the suggestion applies to, if any."),
    title: z.string().trim().min(3).max(200).describe("Short summary of the suggestion."),
    body: z
      .string()
      .trim()
      .min(10)
      .max(8000)
      .describe("The detail: what to change and why. Include a ready-to-paste Lovable prompt when useful."),
    sources: z
      .array(z.string().url())
      .max(20)
      .default([])
      .describe("Source URLs backing any factual claim in the suggestion."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ targetType, targetSlug, title, body, sources }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("content_suggestions")
      .insert({
        created_by: ctx.getUserId()!,
        target_type: targetType,
        target_slug: targetSlug ?? null,
        title,
        body,
        sources: sources ?? [],
      })
      .select("id,status,created_at")
      .single();
    if (error) return fail(error.message);
    return json({ saved: true, suggestion: data });
  },
});