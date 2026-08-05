import type { RegionalPriceLanding } from "./content.server";

export const PRICE_INDEX_PATH = "/reports/aesthetic-treatment-price-index";

export function publicPriceIndexRows(pages: RegionalPriceLanding[]) {
  return pages
    .map((page) => ({
      treatment: page.treatment.name,
      treatment_slug: page.treatment.slug,
      market: page.estimate.region_name,
      market_slug: page.estimate.region_slug,
      country: page.estimate.country_code,
      currency: page.estimate.currency,
      pricing_basis: page.estimate.pricing_unit,
      treatment_area: page.estimate.treatment_area ?? "",
      low: page.estimate.estimated_low,
      midpoint: page.estimate.estimated_median ?? page.estimate.estimated_average ?? "",
      high: page.estimate.estimated_high,
      source_count: page.estimate.source_count,
      researched_at: page.estimate.researched_at,
      page_url: `/prices/${page.treatment.slug}/${page.estimate.region_slug}`,
    }))
    .sort((a, b) => a.market.localeCompare(b.market) || a.treatment.localeCompare(b.treatment));
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function renderPriceIndexCsv(pages: RegionalPriceLanding[]) {
  const rows = publicPriceIndexRows(pages);
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]) as Array<keyof (typeof rows)[number]>;
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");
}
