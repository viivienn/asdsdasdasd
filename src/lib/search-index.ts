export type SearchEntry = {
  label: string;
  sub: string;
  kind: "comparison" | "treatment" | "price";
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

export const TRENDING_TREATMENTS: SearchEntry[] = [
  { label: "Botox", sub: "Neuromodulator", kind: "treatment", slug: "botox" },
  { label: "Daxxify", sub: "Neuromodulator", kind: "treatment", slug: "daxxify" },
  { label: "Juvederm", sub: "HA filler", kind: "treatment", slug: "juvederm" },
  { label: "Sculptra", sub: "Collagen stimulator", kind: "treatment", slug: "sculptra" },
  { label: "Radiesse", sub: "Collagen stimulator", kind: "treatment", slug: "radiesse" },
  { label: "Restylane", sub: "HA filler", kind: "treatment", slug: "restylane" },
  { label: "Dysport", sub: "Neuromodulator", kind: "treatment", slug: "dysport" },
  { label: "Xeomin", sub: "Neuromodulator", kind: "treatment", slug: "xeomin" },
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
  ...POPULAR_SEARCHES,
  ...TRENDING_TREATMENTS,
  ...PRICE_ENTRIES,
];

export function searchEntries(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_ENTRIES.filter(
    (e) => e.label.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q),
  ).slice(0, 8);
}