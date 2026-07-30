import type {
  Comparison,
  ComparisonFamilyRule,
  ComparisonMode,
  Treatment,
  TreatmentPickerRecord,
  TreatmentSource,
} from "./content-types.ts";
import { canonicalPairSlug } from "./content-types.ts";
import { resolveTemplate } from "./comparison-templates.ts";

export function addPickerSelection<T>(selected: readonly T[], item: T, maximum = 2): T[] {
  return selected.length >= maximum ? [...selected] : [...selected, item];
}

export type ComparisonRowDefinition = {
  key: keyof Treatment;
  label: string;
};

export function displayValue(
  treatment: Treatment | null | undefined,
  key: keyof Treatment,
): string | null {
  const value = treatment?.[key];
  if (Array.isArray(value)) {
    return value.length ? value.map((item) => String(item).replace(/-/g, " ")).join(", ") : null;
  }
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function nonEmptyComparisonRows<T extends ComparisonRowDefinition>(
  a: Treatment | null | undefined,
  b: Treatment | null | undefined,
  rows: readonly T[],
): T[] {
  return rows.filter((row) => displayValue(a, row.key) || displayValue(b, row.key));
}

export const BROAD_COMPARISON_GROUPS = new Set([
  // Legacy group slugs stay readable while the additive migration is applied.
  "neuromodulator-brand",
  "ha-filler-family",
  "cheek-midface-filler-product",
  "hydradermabrasion-facial",
  "neuromodulator",
  "dermal-filler",
  "ha-filler-brand-family",
  "ha-filler-product",
  "collagen-biostimulator",
  "noninvasive-lifting-device",
  "rf-microneedling-device",
  "resurfacing-device",
  "hydradermabrasion-procedure",
]);

export type PairCompatibility = {
  mode: ComparisonMode;
  templateKey: string;
  publicLabel: string;
};

export type CompatibleTreatmentOption = {
  treatment: TreatmentPickerRecord;
  section: "closest" | "family" | "beginner";
  compatibility: PairCompatibility;
};

function sharedBroadGroups(
  a: Pick<TreatmentPickerRecord, "comparison_groups">,
  b: Pick<TreatmentPickerRecord, "comparison_groups">,
) {
  const groups = new Set(a.comparison_groups.filter((group) => BROAD_COMPARISON_GROUPS.has(group)));
  return b.comparison_groups.filter((group) => groups.has(group));
}

function normalizedRuleGroups(left: string, right: string): [string, string] {
  return [left, right].sort((a, b) => a.localeCompare(b)) as [string, string];
}

function templateForSharedGroups(
  groups: string[],
  a: TreatmentPickerRecord,
  b: TreatmentPickerRecord,
): string {
  if (groups.includes("neuromodulator") || groups.includes("neuromodulator-brand")) {
    return "neuromodulator_brands";
  }
  if (groups.includes("ha-filler-product") || groups.includes("cheek-midface-filler-product")) {
    return "filler_products";
  }
  if (
    groups.includes("ha-filler-brand-family") ||
    groups.includes("ha-filler-family") ||
    groups.includes("dermal-filler")
  ) {
    return "filler_families";
  }
  if (groups.includes("noninvasive-lifting-device")) return "lifting_devices";
  if (
    groups.includes("rf-microneedling-device") ||
    groups.includes("resurfacing-device") ||
    groups.includes("hydradermabrasion-procedure") ||
    groups.includes("hydradermabrasion-facial")
  ) {
    return "resurfacing_devices";
  }
  return resolveTemplate(a, b).id;
}

export function resolvePairCompatibility(
  a: TreatmentPickerRecord,
  b: TreatmentPickerRecord,
  familyRules: ComparisonFamilyRule[],
): PairCompatibility | null {
  if (a.id === b.id || a.slug === b.slug) return null;

  const shared = sharedBroadGroups(a, b);
  if (a.entity_type === b.entity_type && shared.length) {
    return {
      mode: "direct",
      templateKey: templateForSharedGroups(shared, a, b),
      publicLabel: "Like-for-like comparison",
    };
  }

  for (const rule of familyRules) {
    if (!rule.is_active) continue;
    for (const groupA of a.comparison_groups) {
      for (const groupB of b.comparison_groups) {
        const [left, right] = normalizedRuleGroups(groupA, groupB);
        if (left === rule.left_group_slug && right === rule.right_group_slug) {
          return {
            mode: "different_approach",
            templateKey: rule.template_key,
            publicLabel: rule.public_label,
          };
        }
      }
    }
  }
  return null;
}

export function comparisonSlugForPair(
  a: Pick<Treatment, "slug">,
  b: Pick<Treatment, "slug">,
  compatibility: PairCompatibility,
): string {
  const publicSlug = (slug: string) =>
    compatibility.mode === "different_approach" && slug === "ha-filler" ? "dermal-fillers" : slug;
  return canonicalPairSlug(publicSlug(a.slug), publicSlug(b.slug));
}

export function resolveComparisonRouteSlug(slug: string): string {
  return slug === "dermal-fillers" ? "ha-filler" : slug;
}

const MINIMUM_COMPARISON_KEYS: Array<keyof Treatment> = [
  "primary_purpose",
  "mechanism",
  "result_timing",
  "downtime_text",
  "longevity_text",
  "reversibility",
  "major_risks",
  "pricing_basis",
];

export function hasMinimumComparisonProfile(treatment: Treatment): boolean {
  if (
    treatment.publication_status !== "published" ||
    treatment.is_sample ||
    !treatment.primary_purpose?.trim() ||
    !treatment.mechanism?.trim()
  ) {
    return false;
  }
  const completed = MINIMUM_COMPARISON_KEYS.filter((key) => displayValue(treatment, key)).length;
  return completed >= 5;
}

export function listCompatibleTreatmentOptions(
  selected: TreatmentPickerRecord,
  treatments: TreatmentPickerRecord[],
  familyRules: ComparisonFamilyRule[],
): CompatibleTreatmentOption[] {
  const selectedAreas = new Set(selected.intended_areas);
  return treatments
    .filter((candidate) => candidate.id !== selected.id)
    .flatMap((candidate) => {
      const compatibility = resolvePairCompatibility(selected, candidate, familyRules);
      if (!compatibility || !hasMinimumComparisonProfile(candidate)) return [];
      const overlappingAreas = candidate.intended_areas.some((area) => selectedAreas.has(area));
      const section: CompatibleTreatmentOption["section"] =
        compatibility.mode === "different_approach"
          ? "beginner"
          : overlappingAreas
            ? "closest"
            : "family";
      return [{ treatment: candidate, section, compatibility }];
    })
    .sort((a, b) => {
      const rank = { closest: 0, family: 1, beginner: 2 };
      return (
        rank[a.section] - rank[b.section] ||
        a.treatment.sort_rank - b.treatment.sort_rank ||
        a.treatment.name.localeCompare(b.treatment.name)
      );
    });
}

export function isIndexableComparison(
  a: Treatment | null,
  b: Treatment | null,
  comparison: Comparison | null,
  sources: TreatmentSource[],
): boolean {
  if (
    !a ||
    !b ||
    !hasMinimumComparisonProfile(a) ||
    !hasMinimumComparisonProfile(b) ||
    !comparison?.is_indexable ||
    comparison.publication_status !== "published" ||
    comparison.is_sample
  ) {
    return false;
  }

  const sourcedTreatmentIds = new Set(
    sources.map((source) => source.treatment_id).filter((id): id is string => Boolean(id)),
  );
  return sourcedTreatmentIds.has(a.id) && sourcedTreatmentIds.has(b.id);
}

/** Backward-compatible alias for older call sites while comparison rows become optional. */
export const isReviewedComparison = isIndexableComparison;

export function nextPickerIndex(
  current: number,
  key: "ArrowDown" | "ArrowUp" | "Home" | "End",
  itemCount: number,
): number {
  if (itemCount <= 0) return -1;
  if (key === "Home") return 0;
  if (key === "End") return itemCount - 1;
  if (key === "ArrowDown") return Math.min(current + 1, itemCount - 1);
  return Math.max(current - 1, 0);
}
