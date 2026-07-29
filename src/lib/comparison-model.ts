import type { Comparison, Treatment, TreatmentSource } from "./content-types.ts";

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
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function nonEmptyComparisonRows<T extends ComparisonRowDefinition>(
  a: Treatment | null | undefined,
  b: Treatment | null | undefined,
  rows: readonly T[],
): T[] {
  return rows.filter((row) => displayValue(a, row.key) || displayValue(b, row.key));
}

export function isReviewedComparison(
  a: Treatment | null,
  b: Treatment | null,
  comparison: Comparison | null,
  sources: TreatmentSource[],
): boolean {
  if (
    !a ||
    !b ||
    !comparison ||
    a.publication_status !== "published" ||
    b.publication_status !== "published" ||
    a.is_sample ||
    b.is_sample ||
    comparison.publication_status !== "published" ||
    comparison.is_sample ||
    !comparison.one_sentence_difference?.trim() ||
    !comparison.last_reviewed_at
  ) {
    return false;
  }

  const sourcedTreatmentIds = new Set(
    sources.map((source) => source.treatment_id).filter((id): id is string => Boolean(id)),
  );
  return sourcedTreatmentIds.has(a.id) && sourcedTreatmentIds.has(b.id);
}

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
