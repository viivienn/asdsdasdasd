import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  canonicalPairSlug,
  directCompatibleComparisons,
  type AvailableComparison,
  type Treatment,
  type TreatmentPickerRecord,
  type TreatmentSource,
} from "./content-types.ts";
import {
  addPickerSelection,
  isReviewedComparison,
  nextPickerIndex,
  nonEmptyComparisonRows,
} from "./comparison-model.ts";
import { buildSearchIndex } from "./search-index.ts";

const baseTreatment: Treatment = {
  id: "a",
  name: "Alpha",
  slug: "alpha",
  category: "Device",
  treatment_class: "Device",
  brand_name: null,
  generic_name: null,
  manufacturer: null,
  entity_type: "device",
  parent_id: null,
  sort_rank: 0,
  at_a_glance: null,
  summary: null,
  primary_purpose: "Lifting",
  mechanism: null,
  adds_volume: null,
  tightening_level: null,
  result_timing: null,
  sessions_text: null,
  downtime_text: null,
  longevity_text: null,
  pain_level: null,
  reversibility: null,
  major_risks: null,
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
  pricing_basis: null,
  fda_status: null,
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

test("picker never grows beyond two selections", () => {
  assert.deepEqual(addPickerSelection(["a"], "b"), ["a", "b"]);
  assert.deepEqual(addPickerSelection(["a", "b"], "c"), ["a", "b"]);
});

test("direct compatibility requires a shared group and excludes curated pairs", () => {
  const treatments = [
    pickerTreatment("alpha", ["lifting"]),
    pickerTreatment("beta", ["lifting"]),
    pickerTreatment("gamma", ["injectable"]),
  ];
  const comparisons: AvailableComparison[] = [
    {
      slug: "alpha-vs-beta",
      treatment_a_slug: "alpha",
      treatment_b_slug: "beta",
      comparison_mode: "direct",
      last_reviewed_at: "2026-07-01",
    },
    {
      slug: "alpha-vs-gamma",
      treatment_a_slug: "alpha",
      treatment_b_slug: "gamma",
      comparison_mode: "curated_cross_category",
      last_reviewed_at: "2026-07-01",
    },
  ];

  assert.deepEqual(directCompatibleComparisons("alpha", treatments, comparisons), [
    { treatmentSlug: "beta", comparisonSlug: "alpha-vs-beta" },
  ]);
});

test("canonical fallback is identical for a reversed pair", () => {
  assert.equal(canonicalPairSlug("beta", "alpha"), "alpha-vs-beta");
  assert.equal(canonicalPairSlug("alpha", "beta"), "alpha-vs-beta");
});

test("empty quick-comparison rows are omitted", () => {
  const b = { ...baseTreatment, id: "b", slug: "beta", name: "Beta" };
  const rows = nonEmptyComparisonRows(baseTreatment, b, [
    { key: "primary_purpose", label: "Best known for" },
    { key: "downtime_text", label: "Downtime" },
  ]);
  assert.deepEqual(
    rows.map((row) => row.key),
    ["primary_purpose"],
  );
});

test("only complete, sourced comparisons count as reviewed", () => {
  const b = { ...baseTreatment, id: "b", slug: "beta", name: "Beta" };
  const comparison = {
    id: "comparison",
    slug: "alpha-vs-beta",
    treatment_a_id: "a",
    treatment_b_id: "b",
    one_sentence_difference: "A concise sourced distinction.",
    consider_a_when: null,
    consider_b_when: null,
    neither_when: null,
    common_misconception: null,
    row_template: null,
    comparison_mode: "direct" as const,
    publication_status: "published" as const,
    is_sample: false,
    last_reviewed_at: "2026-07-01",
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
  assert.equal(isReviewedComparison(baseTreatment, b, comparison, sources), true);
  assert.equal(
    isReviewedComparison(baseTreatment, b, { ...comparison, last_reviewed_at: null }, sources),
    false,
  );
  assert.equal(isReviewedComparison(baseTreatment, b, comparison, sources.slice(0, 1)), false);
});

test("search index removes duplicate comparison links", () => {
  const treatments = [pickerTreatment("alpha", ["lifting"]), pickerTreatment("beta", ["lifting"])];
  const duplicate: AvailableComparison = {
    slug: "alpha-vs-beta",
    treatment_a_slug: "alpha",
    treatment_b_slug: "beta",
    comparison_mode: "direct",
    last_reviewed_at: "2026-07-01",
  };
  const index = buildSearchIndex(
    treatments,
    [duplicate, duplicate],
    [{ slug: duplicate.slug, label: "Alpha vs. Beta", markets: ["US"], sort_rank: 1 }],
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

test("mobile picker source keeps the dialog and listbox accessibility contract", async () => {
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
