export type SearchKind = "comparison" | "treatment" | "category" | "brand" | "price";

export type SearchEntry = {
  label: string;
  sub: string;
  kind: SearchKind;
  slug: string;
};

export const POPULAR_SEARCHES: SearchEntry[] = [
  { label: "Botox vs. Dysport", sub: "Comparison", kind: "comparison", slug: "botox-vs-dysport" },
  {
    label: "Sculptra vs. Radiesse",
    sub: "Comparison",
    kind: "comparison",
    slug: "sculptra-vs-radiesse",
  },
  {
    label: "Thermage vs. Ultherapy",
    sub: "Comparison",
    kind: "comparison",
    slug: "thermage-vs-ultherapy",
  },
  {
    label: "Morpheus8 vs. Ultherapy",
    sub: "Comparison",
    kind: "comparison",
    slug: "morpheus8-vs-ultherapy",
  },
  {
    label: "Sculptra vs. HA filler",
    sub: "Comparison",
    kind: "comparison",
    slug: "sculptra-vs-ha-filler",
  },
];

export const MORE_COMPARISONS: SearchEntry[] = [
  {
    label: "HydraFacial vs. DiamondGlow",
    sub: "Comparison",
    kind: "comparison",
    slug: "hydrafacial-vs-diamondglow",
  },
];

/** Treatment classes — the "ingredient"-level concept: what kind of thing it is. */
export const CATEGORY_ENTRIES: SearchEntry[] = [
  { label: "Filler", sub: "Category", kind: "category", slug: "filler" },
  { label: "Neuromodulator", sub: "Category", kind: "category", slug: "neuromodulator" },
  { label: "Collagen stimulator", sub: "Category", kind: "category", slug: "collagen-stimulator" },
  { label: "Energy device", sub: "Category", kind: "category", slug: "energy-device" },
  { label: "Exfoliation facial", sub: "Category", kind: "category", slug: "exfoliation-facial" },
];

/** Brands — a family of products from one maker. */
export const BRAND_ENTRIES: SearchEntry[] = [
  { label: "Juvederm", sub: "Brand · HA filler", kind: "brand", slug: "juvederm" },
  { label: "Restylane", sub: "Brand · HA filler", kind: "brand", slug: "restylane" },
  { label: "Allergan", sub: "Brand", kind: "brand", slug: "botox" },
  { label: "Galderma", sub: "Brand", kind: "brand", slug: "dysport" },
];

export const TRENDING_TREATMENTS: SearchEntry[] = [
  { label: "Botox", sub: "Neuromodulator", kind: "treatment", slug: "botox" },
  { label: "Daxxify", sub: "Neuromodulator", kind: "treatment", slug: "daxxify" },
  { label: "Juvederm", sub: "HA filler", kind: "treatment", slug: "juvederm" },
  { label: "Sculptra", sub: "Collagen stimulator", kind: "treatment", slug: "sculptra" },
  { label: "Radiesse", sub: "Collagen stimulator", kind: "treatment", slug: "radiesse" },
  { label: "Restylane", sub: "HA filler", kind: "treatment", slug: "restylane" },
  { label: "Dysport", sub: "Neuromodulator", kind: "treatment", slug: "dysport" },
  { label: "Xeomin", sub: "Neuromodulator", kind: "treatment", slug: "xeomin" },
  { label: "Thermage", sub: "Energy device", kind: "treatment", slug: "thermage" },
  { label: "Ultherapy", sub: "Energy device", kind: "treatment", slug: "ultherapy" },
  { label: "Morpheus8", sub: "Energy device", kind: "treatment", slug: "morpheus8" },
  { label: "HydraFacial", sub: "Exfoliation facial", kind: "treatment", slug: "hydrafacial" },
  { label: "DiamondGlow", sub: "Exfoliation facial", kind: "treatment", slug: "diamondglow" },
];

export const PRICE_ENTRIES: SearchEntry[] = [
  {
    label: "Botox prices in San Francisco",
    sub: "Publicly listed prices",
    kind: "price",
    slug: "botox",
  },
];

export const SEARCH_ENTRIES: SearchEntry[] = [
  ...CATEGORY_ENTRIES,
  ...TRENDING_TREATMENTS,
  ...BRAND_ENTRIES,
  ...POPULAR_SEARCHES,
  ...MORE_COMPARISONS,
  ...PRICE_ENTRIES,
];

const KIND_RANK: Record<SearchKind, number> = {
  category: 0,
  treatment: 1,
  brand: 2,
  comparison: 3,
  price: 4,
};

export const GROUP_LABEL: Record<SearchKind, string> = {
  category: "Categories",
  treatment: "Treatments",
  brand: "Brands",
  comparison: "Comparisons",
  price: "Local prices",
};

export function searchEntries(query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = SEARCH_ENTRIES.map((e) => {
    const label = e.label.toLowerCase();
    const score = label.startsWith(q) ? 0 : label.includes(q) ? 1 : e.sub.toLowerCase().includes(q) ? 2 : -1;
    return { e, score };
  }).filter((x) => x.score >= 0);
  scored.sort((a, b) => a.score - b.score || KIND_RANK[a.e.kind] - KIND_RANK[b.e.kind]);
  return scored.slice(0, limit).map((x) => x.e);
}

/** Groups results in a stable order for the search overlay. */
export function groupEntries(entries: SearchEntry[]): { kind: SearchKind; items: SearchEntry[] }[] {
  const order: SearchKind[] = ["category", "treatment", "brand", "comparison", "price"];
  return order
    .map((kind) => ({ kind, items: entries.filter((e) => e.kind === kind) }))
    .filter((g) => g.items.length > 0);
}
