const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

export const FEATURES = {
  countrySelector: false,
  regionalPriceEstimates: true,
  clinicPriceDirectory: false,
  advertising: false,
  priceIndexReport: viteEnv?.VITE_PRICE_INDEX_REPORT_PUBLISHED === "true",
} as const;
