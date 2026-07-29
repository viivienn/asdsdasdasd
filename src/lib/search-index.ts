import {
  ENTITY_LABEL,
  comparisonOtherSlug,
  type AvailableComparison,
  type PopularComparison,
  type TreatmentPickerRecord,
} from "./content-types.ts";

export type SearchKind = "comparison" | "treatment" | "category" | "brand" | "device";

export type SearchEntry = {
  label: string;
  sub: string;
  kind: SearchKind;
  slug: string;
};

export interface SearchIndex {
  entries: SearchEntry[];
  categories: SearchEntry[];
  popular: SearchEntry[];
  featuredTreatments: SearchEntry[];
}

export function buildSearchIndex(
  treatments: TreatmentPickerRecord[],
  comparisons: AvailableComparison[],
  popularComparisons: PopularComparison[],
): SearchIndex {
  const treatmentBySlug = new Map(treatments.map((treatment) => [treatment.slug, treatment]));

  const treatmentEntries: SearchEntry[] = treatments.map((treatment) => ({
    label: treatment.name,
    sub: `${ENTITY_LABEL[treatment.entity_type]} · ${treatment.category}`,
    kind:
      treatment.entity_type === "brand_family"
        ? "brand"
        : treatment.entity_type === "device"
          ? "device"
          : "treatment",
    slug: treatment.slug,
  }));

  const categories = [...new Set(treatments.map((treatment) => treatment.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map<SearchEntry>((category) => ({
      label: category,
      sub: "Treatment type",
      kind: "category",
      slug: category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));

  const comparisonEntries: SearchEntry[] = comparisons.flatMap((comparison) => {
    const a = treatmentBySlug.get(comparison.treatment_a_slug);
    const otherSlug = comparisonOtherSlug(comparison, comparison.treatment_a_slug);
    const b = otherSlug ? treatmentBySlug.get(otherSlug) : undefined;
    if (!a || !b) return [];
    return [
      {
        label: `${a.name} vs. ${b.name}`,
        sub: "Comparison",
        kind: "comparison" as const,
        slug: comparison.slug,
      },
    ];
  });

  const comparisonEntryBySlug = new Map(
    comparisonEntries.map((comparison) => [comparison.slug, comparison]),
  );
  const popular = popularComparisons
    .map((comparison) => comparisonEntryBySlug.get(comparison.slug))
    .filter((entry): entry is SearchEntry => Boolean(entry));

  const featuredTreatments = [...treatments]
    .sort((a, b) => a.sort_rank - b.sort_rank || a.name.localeCompare(b.name))
    .slice(0, 4)
    .map((treatment) => treatmentEntries.find((entry) => entry.slug === treatment.slug))
    .filter((entry): entry is SearchEntry => Boolean(entry));

  const seen = new Set<string>();
  const entries = [...categories, ...treatmentEntries, ...comparisonEntries].filter((entry) => {
    const key = `${entry.kind}:${entry.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { entries, categories, popular, featuredTreatments };
}

const KIND_RANK: Record<SearchKind, number> = {
  category: 0,
  treatment: 1,
  brand: 2,
  device: 3,
  comparison: 4,
};

export const GROUP_LABEL: Record<SearchKind, string> = {
  category: "Treatment types",
  treatment: "Treatments",
  brand: "Brands",
  device: "Devices",
  comparison: "Comparisons",
};

export function searchEntries(entries: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const scored = entries
    .map((entry) => {
      const label = entry.label.toLowerCase();
      const score = label.startsWith(normalized)
        ? 0
        : label.includes(normalized)
          ? 1
          : entry.sub.toLowerCase().includes(normalized)
            ? 2
            : -1;
      return { entry, score };
    })
    .filter((result) => result.score >= 0);
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      KIND_RANK[a.entry.kind] - KIND_RANK[b.entry.kind] ||
      a.entry.label.localeCompare(b.entry.label),
  );
  return scored.slice(0, limit).map((result) => result.entry);
}

export function groupEntries(entries: SearchEntry[]): { kind: SearchKind; items: SearchEntry[] }[] {
  const order: SearchKind[] = ["category", "treatment", "brand", "device", "comparison"];
  return order
    .map((kind) => ({ kind, items: entries.filter((entry) => entry.kind === kind) }))
    .filter((group) => group.items.length > 0);
}
