import type { MarketCode, RegionalPriceEstimate } from "./content-types.ts";

export type NormalizedPostalCode = {
  countryCode: MarketCode;
  value: string;
};

export type PostalRegionRow = {
  country_code: MarketCode;
  postal_prefix: string;
  region_slug: string;
  city_name: string | null;
};

export function normalizePostalCode(input: string): NormalizedPostalCode | null {
  const compact = input
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");
  if (/^\d{5}(?:\d{4})?$/.test(compact)) {
    return { countryCode: "US", value: compact };
  }
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(compact) || /^[A-Z]\d[A-Z]$/.test(compact)) {
    return { countryCode: "CA", value: compact };
  }
  return null;
}

export function resolvePostalRegion(
  postalCode: NormalizedPostalCode,
  rows: PostalRegionRow[],
): PostalRegionRow | null {
  return (
    rows
      .filter(
        (row) =>
          row.country_code === postalCode.countryCode &&
          postalCode.value.startsWith(row.postal_prefix.toUpperCase().replace(/\s+/g, "")),
      )
      .sort((a, b) => b.postal_prefix.length - a.postal_prefix.length)[0] ?? null
  );
}

export function selectRegionalEstimate(
  estimates: RegionalPriceEstimate[],
  treatmentId: string,
  comparisonGroups: string[],
): RegionalPriceEstimate | null {
  return (
    estimates.find((estimate) => estimate.treatment_id === treatmentId) ??
    estimates.find(
      (estimate) =>
        estimate.comparison_group_slug && comparisonGroups.includes(estimate.comparison_group_slug),
    ) ??
    null
  );
}
