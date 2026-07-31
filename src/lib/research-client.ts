import { supabase } from "@/integrations/supabase/client";
import { canonicalPair, type PendingAccountIntent } from "@/lib/account-flow";

export type SavedTreatmentView = {
  id: string;
  createdAt: string;
  treatment: { id: string; name: string; slug: string; summary: string | null };
};

export type SavedComparisonView = {
  id: string;
  createdAt: string;
  pairKey: string;
  treatmentA: { id: string; name: string; slug: string };
  treatmentB: { id: string; name: string; slug: string };
  slug: string | null;
};

export type PriceSubscriptionView = {
  id: string;
  treatmentId: string | null;
  comparisonGroupSlug: string | null;
  postalCode: string | null;
  regionSlug: string | null;
  isActive: boolean;
  treatment: { name: string; slug: string } | null;
};

export async function isTreatmentSaved(userId: string, treatmentId: string) {
  const { data, error } = await supabase
    .from("saved_treatments")
    .select("id")
    .eq("user_id", userId)
    .eq("treatment_id", treatmentId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function saveTreatment(userId: string, treatmentId: string) {
  const { error } = await supabase
    .from("saved_treatments")
    .upsert({ user_id: userId, treatment_id: treatmentId }, { onConflict: "user_id,treatment_id" });
  if (error) throw error;
}

export async function removeSavedTreatment(userId: string, treatmentId: string) {
  const { error } = await supabase
    .from("saved_treatments")
    .delete()
    .eq("user_id", userId)
    .eq("treatment_id", treatmentId);
  if (error) throw error;
}

export async function isComparisonSaved(
  userId: string,
  treatmentAId: string,
  treatmentBId: string,
) {
  const { pairKey } = canonicalPair(treatmentAId, treatmentBId);
  const { data, error } = await supabase
    .from("saved_comparisons")
    .select("id")
    .eq("user_id", userId)
    .eq("canonical_pair_key", pairKey)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function saveComparison(userId: string, treatmentAId: string, treatmentBId: string) {
  const pair = canonicalPair(treatmentAId, treatmentBId);
  const { error } = await supabase.from("saved_comparisons").upsert(
    {
      user_id: userId,
      treatment_a_id: pair.treatmentAId,
      treatment_b_id: pair.treatmentBId,
      canonical_pair_key: pair.pairKey,
    },
    { onConflict: "user_id,canonical_pair_key" },
  );
  if (error) throw error;
}

export async function removeSavedComparison(
  userId: string,
  treatmentAId: string,
  treatmentBId: string,
) {
  const { pairKey } = canonicalPair(treatmentAId, treatmentBId);
  const { error } = await supabase
    .from("saved_comparisons")
    .delete()
    .eq("user_id", userId)
    .eq("canonical_pair_key", pairKey);
  if (error) throw error;
}

export async function completePendingSave(userId: string, intent: PendingAccountIntent) {
  if (intent.type === "save_treatment") {
    await saveTreatment(userId, intent.treatmentId);
    return true;
  }
  if (intent.type === "save_comparison") {
    await saveComparison(userId, intent.treatmentAId, intent.treatmentBId);
    return true;
  }
  return false;
}

export async function saveResearchPreference(
  userId: string,
  postalCode: string,
  regionSlug: string | null,
) {
  const { error } = await supabase.from("user_research_preferences").upsert(
    {
      user_id: userId,
      postal_code: postalCode.trim() || null,
      region_slug: regionSlug,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function createPriceSubscription(input: {
  userId: string;
  treatmentId?: string;
  comparisonGroupSlug?: string;
  postalCode: string;
  regionSlug?: string | null;
}) {
  const row = {
    user_id: input.userId,
    treatment_id: input.treatmentId ?? null,
    comparison_group_slug: input.comparisonGroupSlug ?? null,
    postal_code: input.postalCode.trim() || null,
    region_slug: input.regionSlug ?? null,
    is_active: true,
  };
  let lookup = supabase.from("price_update_subscriptions").select("id").eq("user_id", input.userId);
  lookup = input.treatmentId
    ? lookup.eq("treatment_id", input.treatmentId)
    : lookup.eq("comparison_group_slug", input.comparisonGroupSlug!);
  lookup = input.postalCode.trim()
    ? lookup.eq("postal_code", input.postalCode.trim())
    : lookup.is("postal_code", null);
  lookup = input.regionSlug
    ? lookup.eq("region_slug", input.regionSlug)
    : lookup.is("region_slug", null);
  const existing = await lookup.maybeSingle();
  if (existing.error) throw existing.error;

  const result = existing.data
    ? await supabase
        .from("price_update_subscriptions")
        .update({ is_active: true })
        .eq("id", existing.data.id)
        .eq("user_id", input.userId)
    : await supabase.from("price_update_subscriptions").insert(row);
  if (result.error) throw result.error;
}

export async function removePriceSubscription(userId: string, subscriptionId: string) {
  const { error } = await supabase
    .from("price_update_subscriptions")
    .delete()
    .eq("id", subscriptionId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function loadResearchLibrary(userId: string) {
  const [savedTreatments, savedComparisons, preference, subscriptions, comparisons] =
    await Promise.all([
      supabase
        .from("saved_treatments")
        .select(
          "id, created_at, treatment:treatments!saved_treatments_treatment_id_fkey(id,name,slug,summary)",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("saved_comparisons")
        .select(
          "id, created_at, canonical_pair_key, treatment_a:treatments!saved_comparisons_treatment_a_id_fkey(id,name,slug), treatment_b:treatments!saved_comparisons_treatment_b_id_fkey(id,name,slug)",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_research_preferences")
        .select("postal_code, region_slug")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("price_update_subscriptions")
        .select(
          "id, treatment_id, comparison_group_slug, postal_code, region_slug, is_active, treatment:treatments(name,slug)",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("comparisons").select("slug, pair_key"),
    ]);

  for (const result of [
    savedTreatments,
    savedComparisons,
    preference,
    subscriptions,
    comparisons,
  ]) {
    if (result.error) throw result.error;
  }

  const comparisonSlugs = new Map((comparisons.data ?? []).map((row) => [row.pair_key, row.slug]));

  return {
    savedTreatments: (savedTreatments.data ?? []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      treatment: row.treatment,
    })) as SavedTreatmentView[],
    savedComparisons: (savedComparisons.data ?? []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      pairKey: row.canonical_pair_key,
      treatmentA: row.treatment_a,
      treatmentB: row.treatment_b,
      slug: comparisonSlugs.get(row.canonical_pair_key) ?? null,
    })) as SavedComparisonView[],
    preference: preference.data,
    subscriptions: (subscriptions.data ?? []).map((row) => ({
      id: row.id,
      treatmentId: row.treatment_id,
      comparisonGroupSlug: row.comparison_group_slug,
      postalCode: row.postal_code,
      regionSlug: row.region_slug,
      isActive: row.is_active,
      treatment: row.treatment,
    })) as PriceSubscriptionView[],
  };
}
