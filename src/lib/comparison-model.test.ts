import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  canonicalPairSlug,
  type AvailableComparison,
  type Comparison,
  type ComparisonFamilyRule,
  type Treatment,
  type TreatmentPickerRecord,
  type TreatmentSource,
} from "./content-types.ts";
import {
  addPickerSelection,
  comparisonSlugForPair,
  isIndexableComparison,
  listCompatibleTreatmentOptions,
  nextPickerIndex,
  nonEmptyComparisonRows,
  resolvePairCompatibility,
} from "./comparison-model.ts";
import {
  normalizePostalCode,
  resolvePostalRegion,
  selectRegionalEstimate,
} from "./regional-pricing.ts";
import { buildSearchIndex } from "./search-index.ts";

const baseTreatment: Treatment = {
  id: "a",
  name: "Alpha",
  slug: "alpha",
  category: "Device",
  treatment_class: "Device",
  brand_name: null,
  generic_name: null,
  manufacturer: "Example manufacturer",
  intended_areas: ["face"],
  entity_type: "device",
  parent_id: null,
  sort_rank: 0,
  at_a_glance: null,
  summary: null,
  primary_purpose: "Structured purpose",
  mechanism: "Structured mechanism",
  adds_volume: null,
  tightening_level: null,
  result_timing: "Structured timing",
  sessions_text: null,
  downtime_text: "Structured downtime",
  longevity_text: "Structured longevity",
  pain_level: null,
  reversibility: "Structured reversibility",
  major_risks: "Structured risks",
  most_likely_disappointment: null,
  marketing_misconception: null,
  provider_variables: null,
  skin_tone_notes: null,
  appointment_time: null,
  swelling_text: null,
  bruising_text: null,
  exercise_restrictions: null,
  what_it_changes: null,
  what_it_does_not_change: null,
  expected_result_magnitude: null,
  true_substitute_notes: null,
  when_not_appropriate: null,
  pricing_basis: "Per treatment",
  fda_status: null,
  canada_status: null,
  evidence_grade: null,
  last_reviewed_at: "2026-07-01",
  publication_status: "published",
  is_sample: false,
};

function pickerTreatment(
  slug: string,
  groups: string[],
  overrides: Partial<TreatmentPickerRecord> = {},
): TreatmentPickerRecord {
  return {
    ...baseTreatment,
    id: slug,
    name: slug,
    slug,
    comparison_groups: groups,
    markets: [],
    media: null,
    ...overrides,
  };
}

const beginnerRule: ComparisonFamilyRule = {
  id: "rule",
  left_group_slug: "dermal-filler",
  right_group_slug: "neuromodulator",
  comparison_mode: "different_approach",
  template_key: "cross_category",
  public_label: "Beginner comparison",
  is_active: true,
};

test("picker never grows beyond two selections", () => {
  assert.deepEqual(addPickerSelection(["a"], "b"), ["a", "b"]);
  assert.deepEqual(addPickerSelection(["a", "b"], "c"), ["a", "b"]);
});

test("direct same-family products compare even with different intended areas", () => {
  const volume = pickerTreatment("voluma", ["ha-filler-product"], {
    entity_type: "product",
    intended_areas: ["cheeks"],
  });
  const kysse = pickerTreatment("kysse", ["ha-filler-product"], {
    entity_type: "product",
    intended_areas: ["lips"],
  });
  assert.deepEqual(resolvePairCompatibility(volume, kysse, []), {
    mode: "direct",
    templateKey: "filler_products",
    publicLabel: "Like-for-like comparison",
  });
  assert.equal(listCompatibleTreatmentOptions(volume, [volume, kysse], [])[0]?.section, "family");
});

test("Botox and dermal fillers resolve as a separately labelled beginner comparison", () => {
  const botox = pickerTreatment("botox", ["neuromodulator"], { entity_type: "product" });
  const filler = pickerTreatment("ha-filler", ["dermal-filler"], { entity_type: "class" });
  const compatibility = resolvePairCompatibility(botox, filler, [beginnerRule]);
  assert.equal(compatibility?.mode, "different_approach");
  assert.equal(
    listCompatibleTreatmentOptions(botox, [botox, filler], [beginnerRule])[0]?.section,
    "beginner",
  );
  assert.equal(
    compatibility && comparisonSlugForPair(botox, filler, compatibility),
    "botox-vs-dermal-fillers",
  );
});

test("unrelated treatment families are rejected", () => {
  const filler = pickerTreatment("filler", ["dermal-filler"], { entity_type: "product" });
  const laser = pickerTreatment("laser", ["resurfacing-device"], { entity_type: "device" });
  assert.equal(resolvePairCompatibility(filler, laser, [beginnerRule]), null);
});

test("compatible pair resolution does not require a comparisons row", () => {
  const alpha = pickerTreatment("alpha", ["noninvasive-lifting-device"]);
  const beta = pickerTreatment("beta", ["noninvasive-lifting-device"]);
  const compatibility = resolvePairCompatibility(alpha, beta, []);
  assert.equal(compatibility?.mode, "direct");
  assert.equal(compatibility && comparisonSlugForPair(alpha, beta, compatibility), "alpha-vs-beta");
});

test("canonical fallback is identical for a reversed pair", () => {
  assert.equal(canonicalPairSlug("beta", "alpha"), "alpha-vs-beta");
  assert.equal(canonicalPairSlug("alpha", "beta"), "alpha-vs-beta");
});

test("empty comparison fields are omitted", () => {
  const b = { ...baseTreatment, id: "b", slug: "beta", name: "Beta" };
  const rows = nonEmptyComparisonRows(baseTreatment, b, [
    { key: "primary_purpose", label: "Best known for" },
    { key: "pain_level", label: "Pain" },
  ]);
  assert.deepEqual(
    rows.map((row) => row.key),
    ["primary_purpose"],
  );
});

test("featured comparisons are indexable only with complete profiles and sources", () => {
  const b = { ...baseTreatment, id: "b", slug: "beta", name: "Beta" };
  const comparison: Comparison = {
    id: "comparison",
    slug: "alpha-vs-beta",
    treatment_a_id: "a",
    treatment_b_id: "b",
    one_sentence_difference: null,
    consider_a_when: null,
    consider_b_when: null,
    neither_when: null,
    common_misconception: null,
    row_template: null,
    comparison_mode: "direct",
    title_override: null,
    description_override: null,
    is_featured: true,
    is_indexable: true,
    sort_rank: 1,
    last_verified_at: "2026-07-01",
    publication_status: "published",
    is_sample: false,
    last_reviewed_at: null,
  };
  const sources: TreatmentSource[] = [
    {
      id: "source-a",
      treatment_id: "a",
      claim_field: "primary_purpose",
      source_title: "Source A",
      source_url: "https://example.com/a",
      source_type: "official",
      publication_date: null,
      evidence_level: null,
    },
    {
      id: "source-b",
      treatment_id: "b",
      claim_field: "primary_purpose",
      source_title: "Source B",
      source_url: "https://example.com/b",
      source_type: "official",
      publication_date: null,
      evidence_level: null,
    },
  ];
  assert.equal(isIndexableComparison(baseTreatment, b, comparison, sources), true);
  assert.equal(isIndexableComparison(baseTreatment, b, null, sources), false);
  assert.equal(isIndexableComparison(baseTreatment, b, comparison, sources.slice(0, 1)), false);
});

test("regional estimate resolves from stored ZIP and Canadian postal prefixes", () => {
  assert.deepEqual(normalizePostalCode("94063"), { countryCode: "US", value: "94063" });
  assert.deepEqual(normalizePostalCode("M5V 2T6"), { countryCode: "CA", value: "M5V2T6" });
  const rows = [
    { country_code: "US" as const, postal_prefix: "940", region_slug: "bay", city_name: null },
    {
      country_code: "US" as const,
      postal_prefix: "94063",
      region_slug: "peninsula",
      city_name: "Redwood City",
    },
    {
      country_code: "CA" as const,
      postal_prefix: "M5V",
      region_slug: "toronto",
      city_name: "Toronto",
    },
  ];
  assert.equal(resolvePostalRegion(normalizePostalCode("94063")!, rows)?.region_slug, "peninsula");
  assert.equal(resolvePostalRegion(normalizePostalCode("M5V 2T6")!, rows)?.region_slug, "toronto");
});

test("regional estimate selects an exact treatment before its broad family", () => {
  const common = {
    country_code: "US" as const,
    region_slug: "bay-area",
    region_name: "Bay Area",
    currency: "USD",
    pricing_unit: "per_unit",
    treatment_area: null,
    estimated_average: null,
    estimated_median: null,
    estimated_low: "10",
    estimated_high: "20",
    source_count: 2,
    source_urls: [],
    methodology_note: "Stored research",
    limitations: "Small public sample.",
    researched_at: "2026-07-01",
  };
  const family = {
    ...common,
    id: "family",
    treatment_id: null,
    comparison_group_slug: "neuromodulator",
  };
  const exact = {
    ...common,
    id: "exact",
    treatment_id: "botox",
    comparison_group_slug: null,
  };
  assert.equal(selectRegionalEstimate([family, exact], "botox", ["neuromodulator"])?.id, "exact");
});

test("search index removes duplicate comparison links", () => {
  const treatments = [
    pickerTreatment("alpha", ["noninvasive-lifting-device"]),
    pickerTreatment("beta", ["noninvasive-lifting-device"]),
  ];
  const duplicate: AvailableComparison = {
    slug: "alpha-vs-beta",
    treatment_a_slug: "alpha",
    treatment_b_slug: "beta",
    comparison_mode: "direct",
    last_reviewed_at: "2026-07-01",
    is_featured: true,
    is_indexable: true,
  };
  const index = buildSearchIndex(
    treatments,
    [duplicate, duplicate],
    [{ slug: duplicate.slug, label: "Alpha vs. Beta", markets: [], sort_rank: 1 }],
  );
  assert.equal(index.entries.filter((entry) => entry.kind === "comparison").length, 1);
  assert.equal(index.popular.length, 1);
});

test("keyboard navigation stays within the available options", () => {
  assert.equal(nextPickerIndex(0, "ArrowDown", 3), 1);
  assert.equal(nextPickerIndex(2, "ArrowDown", 3), 2);
  assert.equal(nextPickerIndex(0, "ArrowUp", 3), 0);
  assert.equal(nextPickerIndex(1, "Home", 3), 0);
  assert.equal(nextPickerIndex(1, "End", 3), 2);
});

test("public feature and navigation contracts match the MVP direction", async () => {
  const [
    features,
    explore,
    home,
    about,
    disclosure,
    shell,
    sitemap,
    priceIndex,
    priceRoute,
    server,
    migration,
  ] = await Promise.all([
    readFile(new URL("./features.ts", import.meta.url), "utf8"),
    readFile(new URL("../routes/explore.index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/about.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/advertising-disclosure.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/site-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/sitemap[.]xml.ts", import.meta.url), "utf8"),
    readFile(new URL("../routes/prices.index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/prices.us.ca.$city.$treatment.tsx", import.meta.url), "utf8"),
    readFile(new URL("./content.server.ts", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../../supabase/migrations/20260729020000_universal_comparisons_and_regional_prices.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  assert.match(features, /countrySelector:\s*false/);
  assert.match(features, /clinicPriceDirectory:\s*false/);
  assert.doesNotMatch(explore, />United States<|>Canada</);
  assert.doesNotMatch(home + about, /no sponsorships/i);
  assert.match(disclosure, /Commercial placements are clearly labeled/);
  assert.match(shell, /to="\/prices"/);
  assert.doesNotMatch(shell, /to="\/prices\/us\/ca\/\$city\/\$treatment"/);
  assert.match(sitemap, /FEATURES\.clinicPriceDirectory/);
  assert.match(priceIndex, /RegionalPriceLookup/);
  assert.match(priceRoute, /Clinic price directory unavailable/);
  assert.match(server, /from\("regional_price_estimates"\)/);
  assert.doesNotMatch(server, /\bfetch\s*\(/);
  assert.doesNotMatch(
    migration,
    /drop table|alter table public\.(clinics|price_observations|offers)/i,
  );
});

test("discovery is the homepage and comparison remains a separate tool", async () => {
  const [home, compare, shell, treatmentActions, explore] = await Promise.all([
    readFile(new URL("../routes/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/compare.index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/site-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/treatment-actions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/explore.index.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /<SiteSearch index=\{searchIndex\} variant="hero"/);
  assert.doesNotMatch(home, /<TreatmentPicker/);
  assert.match(compare, /<TreatmentPicker/);
  assert.match(shell, /function ExploreMenu/);
  assert.match(shell, /onMouseEnter=\{openMenu\}/);
  assert.match(shell, /to="\/prices"/);
  assert.match(treatmentActions, /listCompatibleTreatmentOptions/);
  assert.match(treatmentActions, /role="listbox"/);
  assert.match(explore, /Browse by treatment goal/);
  assert.match(explore, /Treatment classes/);
});

test("mobile picker keeps the dialog and listbox accessibility contract", async () => {
  const source = await readFile(
    new URL("../components/treatment-picker.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /h-\[100dvh\]/);
  assert.match(source, /role="listbox"/);
  assert.match(source, /role="option"/);
  assert.match(source, /aria-selected=/);
  assert.match(source, /min-h-11/);
});
