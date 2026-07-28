import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, json, supabaseForUser, unauthenticated } from "../supabase";

/** Editorial prose fields an admin may fill in over MCP. */
const EDITABLE = [
  "summary",
  "primary_purpose",
  "mechanism",
  "result_timing",
  "sessions_text",
  "downtime_text",
  "longevity_text",
  "major_risks",
  "most_likely_disappointment",
  "marketing_misconception",
  "provider_variables",
  "skin_tone_notes",
  "appointment_time",
  "swelling_text",
  "bruising_text",
  "exercise_restrictions",
  "what_it_changes",
  "what_it_does_not_change",
  "expected_result_magnitude",
  "true_substitute_notes",
  "when_not_appropriate",
  "fda_status",
] as const;

export default defineTool({
  name: "update_treatment_fields",
  title: "Update treatment fields",
  description:
    "Update editorial text fields on a treatment profile. Admin-only: it fails for non-admin accounts. Never write medical advice, diagnosis or dosage; keep phrasing neutral and factual.",
  inputSchema: {
    slug: z.string().trim().min(1).describe("Treatment slug to update."),
    fields: z
      .record(z.enum(EDITABLE), z.string().trim().min(1).max(2000))
      .describe("Map of editable field name to new text."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ slug, fields }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const entries = Object.entries(fields ?? {}).filter(([k]) =>
      (EDITABLE as readonly string[]).includes(k),
    );
    if (entries.length === 0) return fail("No editable fields supplied.");
    const patch = Object.fromEntries(entries) as Record<string, string>;
    const { data, error } = await supabaseForUser(ctx)
      .from("treatments")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
      .eq("slug", slug)
      .select("slug," + entries.map(([k]) => k).join(","));
    if (error) return fail(error.message);
    if (!data || data.length === 0)
      return fail(
        "Nothing was updated. Either the slug does not exist or this account is not an admin of Aesthetic Index. Use suggest_change instead.",
      );
    return json({ updated: data[0] });
  },
});