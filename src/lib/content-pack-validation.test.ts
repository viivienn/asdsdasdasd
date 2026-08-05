import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import type { Database } from "../integrations/supabase/types.ts";
import {
  isPublishableTreatmentMedia,
  type ComparisonFamilyRule,
  type TreatmentPickerRecord,
} from "./content-types.ts";
import {
  comparisonSlugForPair,
  nonEmptyComparisonRows,
  resolvePairCompatibility,
} from "./comparison-model.ts";
import { resolveTemplate } from "./comparison-templates.ts";

type Tables = Database["public"]["Tables"];

const generatedTypeProbe = {
  treatment: {
    intended_areas: ["face"],
    canada_status: null,
  } satisfies Pick<Tables["treatments"]["Insert"], "intended_areas" | "canada_status">,
  familyRule: {
    left_group_slug: "dermal-filler",
    right_group_slug: "neuromodulator",
    template_key: "cross_category",
    public_label: "Beginner comparison",
  } satisfies Tables["comparison_family_rules"]["Insert"],
  regionalEstimate: {
    country_code: "US",
    currency: "USD",
    estimated_high: 20,
    estimated_low: 10,
    methodology_note: "Stored methodology",
    pricing_unit: "per unit",
    region_name: "Test region",
    region_slug: "test-region",
    researched_at: "2026-07-29",
    source_count: 2,
    source_urls: ["https://example.com/one", "https://example.com/two"],
    treatment_id: "00000000-0000-0000-0000-000000000000",
  } satisfies Tables["regional_price_estimates"]["Insert"],
  postalRegion: {
    country_code: "US",
    postal_prefix: "941",
    region_slug: "san-francisco-bay-area",
  } satisfies Tables["postal_region_map"]["Insert"],
};
void generatedTypeProbe;

interface PackTreatment {
  [key: string]: unknown;
  name: string;
  slug: string;
  publication_status: "draft" | "review" | "published";
  is_sample: boolean;
  intended_areas: string[];
  primary_purpose: string | null;
  mechanism: string | null;
  major_risks: string | null;
  fda_status: string | null;
  canada_status: string | null;
  evidence_grade: string | null;
  last_reviewed_at: string | null;
}

interface PackSource {
  treatment_slug: string;
  claim_field: string;
  source_url: string;
}

interface PackComparison {
  slug: string;
  treatment_a_slug: string;
  treatment_b_slug: string;
  comparison_mode: "direct" | "different_approach";
  row_template: string;
  description_override: string;
  one_sentence_difference: string;
  is_featured: boolean;
  is_indexable: boolean;
  publication_status: "draft" | "review" | "published";
}

interface PackGroupMapping {
  treatment_slug: string;
  group_slug: string;
}

interface PackFamilyRule {
  left_group_slug: string;
  right_group_slug: string;
  comparison_mode: "different_approach";
  template_key: string;
  public_label: string;
  is_active: boolean;
}

interface PackPriceEstimate {
  entity_slug: string;
  country: "US" | "CA";
  region_slug: string;
  currency: string;
  pricing_unit: string;
  estimated_low: number;
  estimated_high: number;
  source_count: number;
  source_urls: string[];
  researched_at: string;
  publication_status: "draft" | "review" | "published";
}

interface PackMedia {
  treatment_slug: string;
  publish: boolean;
  publication_status: "draft" | "review" | "published";
  rights_status: string;
}

const contentUrl = new URL("../../content/mvp/", import.meta.url);
const readJson = async <T>(name: string): Promise<T> =>
  JSON.parse(await readFile(new URL(name, contentUrl), "utf8")) as T;

const [
  treatmentDocument,
  sourceDocument,
  groupDocument,
  mappingDocument,
  familyRuleDocument,
  comparisonDocument,
  legacyComparisonDocument,
  priceDocument,
  mediaDocument,
] = await Promise.all([
  readJson<{ treatments: PackTreatment[] }>("treatments.json"),
  readJson<{ sources: PackSource[] }>("treatment_sources.json"),
  readJson<{ treatment_area_values: string[] }>("comparison_groups.json"),
  readJson<{ mappings: PackGroupMapping[] }>("treatment_comparison_groups.json"),
  readJson<{ rules: PackFamilyRule[] }>("comparison_family_rules.json"),
  readJson<{ comparisons: PackComparison[] }>("featured_comparisons.json"),
  readJson<{ comparisons: PackComparison[] }>("indexable_comparisons.json"),
  readJson<{ estimates: PackPriceEstimate[] }>("regional_price_estimates.json"),
  readJson<{ media: PackMedia[] }>("treatment_media.json"),
]);

const treatments = treatmentDocument.treatments;
const sources = sourceDocument.sources;
const comparisons = comparisonDocument.comparisons;
const prices = priceDocument.estimates;
const media = mediaDocument.media;
const treatmentBySlug = new Map(treatments.map((row) => [row.slug, row]));
const groupsByTreatment = new Map<string, string[]>();
for (const mapping of mappingDocument.mappings) {
  const groups = groupsByTreatment.get(mapping.treatment_slug) ?? [];
  groups.push(mapping.group_slug);
  groupsByTreatment.set(mapping.treatment_slug, groups);
}
const familyRules: ComparisonFamilyRule[] = familyRuleDocument.rules.map((rule, index) => ({
  id: `rule-${index}`,
  ...rule,
}));

function picker(slug: string): TreatmentPickerRecord {
  const treatment = treatmentBySlug.get(slug);
  assert.ok(treatment, `Missing treatment ${slug}`);
  return {
    ...treatment,
    id: slug,
    parent_id: null,
    comparison_groups: groupsByTreatment.get(slug) ?? [],
    markets: ["US", "CA"],
    media: null,
  } as unknown as TreatmentPickerRecord;
}

test("generated database types cover the source-pack schema", () => {
  assert.ok(generatedTypeProbe.treatment.intended_areas.length);
  assert.equal(generatedTypeProbe.familyRule.template_key, "cross_category");
  assert.equal(generatedTypeProbe.regionalEstimate.currency, "USD");
  assert.equal(generatedTypeProbe.postalRegion.country_code, "US");
});

test("every published treatment is complete, source-backed, and non-demonstration", () => {
  const published = treatments.filter((row) => row.publication_status === "published");
  const review = treatments.filter((row) => row.publication_status === "review");
  assert.equal(treatments.length, 21);
  assert.equal(published.length, 15);
  assert.deepEqual(review.map((row) => row.slug).sort(), [
    "collagen-stimulator",
    "daxxify",
    "energy-device",
    "neuromodulator",
    "restylane-lyft",
    "xeomin",
  ]);
  assert.ok(review.every((row) => row.last_reviewed_at === null));
  assert.equal(new Set(published.map((row) => row.slug)).size, published.length);

  const sourcedMedicalFields = [
    "summary",
    "primary_purpose",
    "mechanism",
    "intended_areas",
    "what_it_changes",
    "what_it_does_not_change",
    "adds_volume",
    "tightening_level",
    "result_timing",
    "sessions_text",
    "appointment_time",
    "downtime_text",
    "swelling_text",
    "bruising_text",
    "exercise_restrictions",
    "longevity_text",
    "pain_level",
    "reversibility",
    "major_risks",
    "most_likely_disappointment",
    "marketing_misconception",
    "provider_variables",
    "skin_tone_notes",
    "pricing_basis",
    "expected_result_magnitude",
    "true_substitute_notes",
    "when_not_appropriate",
    "fda_status",
    "canada_status",
    "evidence_grade",
  ] as const;

  for (const treatment of published) {
    assert.equal(treatment.is_sample, false, `${treatment.slug} is marked as sample`);
    for (const field of [
      "primary_purpose",
      "mechanism",
      "major_risks",
      "fda_status",
      "canada_status",
      "evidence_grade",
      "last_reviewed_at",
    ] as const) {
      assert.ok(treatment[field], `${treatment.slug} is missing ${field}`);
    }
    assert.ok(
      sources.some(
        (source) =>
          source.treatment_slug === treatment.slug && source.source_url.startsWith("https://"),
      ),
      `${treatment.slug} has no source record`,
    );
    for (const field of sourcedMedicalFields) {
      const value = treatment[field];
      if (value === null || value === undefined || value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      assert.ok(
        sources.some(
          (source) => source.treatment_slug === treatment.slug && source.claim_field === field,
        ),
        `${treatment.slug}.${field} has no claim-level source`,
      );
    }
  }

  const publicPayload = {
    treatments: published,
    comparisons: comparisons.filter((row) => row.publication_status === "published"),
    prices: prices.filter((row) => row.publication_status === "published"),
  };
  assert.doesNotMatch(
    JSON.stringify(publicPayload),
    /demonstration text|pending sourcing|pending research/i,
  );
});

test("featured comparison artifact remains compatible with the legacy import filename", () => {
  assert.deepEqual(comparisonDocument.comparisons, legacyComparisonDocument.comparisons);
  assert.equal(comparisons.length, 8);
});

test("launch comparisons have concise metadata and answer-first bottom lines", () => {
  assert.equal(comparisons.length, 8);
  for (const comparison of comparisons) {
    const wordCount = comparison.one_sentence_difference.trim().split(/\s+/).length;
    assert.ok(
      wordCount >= 80 && wordCount <= 150,
      `${comparison.slug} bottom line has ${wordCount} words`,
    );
    assert.ok(
      comparison.description_override.length >= 100 &&
        comparison.description_override.length <= 160,
      `${comparison.slug} meta description has ${comparison.description_override.length} characters`,
    );
    assert.doesNotMatch(comparison.one_sentence_difference, /\b(best|perfect|risk-free)\b/i);
    assert.doesNotMatch(comparison.one_sentence_difference, /(?<!not )\bguaranteed\b/i);
  }
});

test("published intended areas use the controlled values", () => {
  const allowed = new Set(groupDocument.treatment_area_values);
  assert.ok(allowed.size > 0);
  for (const treatment of treatments.filter((row) => row.publication_status === "published")) {
    assert.ok(treatment.intended_areas.length > 0, `${treatment.slug} has no intended areas`);
    for (const area of treatment.intended_areas) {
      assert.ok(allowed.has(area), `${treatment.slug} uses invalid intended area ${area}`);
    }
  }
});

test("Botox vs. dermal fillers resolves and renders as a different approach", () => {
  const botox = picker("botox");
  const filler = picker("ha-filler");
  const comparison = comparisons.find((row) => row.slug === "botox-vs-dermal-fillers");
  assert.ok(comparison);
  const compatibility = resolvePairCompatibility(botox, filler, familyRules);
  assert.equal(compatibility?.mode, "different_approach");
  assert.equal(
    compatibility && comparisonSlugForPair(botox, filler, compatibility),
    comparison.slug,
  );
  const template = resolveTemplate(botox, filler, comparison.row_template);
  assert.equal(template.likeForLike, false);
  assert.ok(nonEmptyComparisonRows(botox, filler, template.glance).length > 0);
});

test("Voluma vs. Kysse resolves and renders despite different intended areas", () => {
  const voluma = picker("juvederm-voluma");
  const kysse = picker("restylane-kysse");
  const comparison = comparisons.find((row) => row.slug === "juvederm-voluma-vs-restylane-kysse");
  assert.ok(comparison);
  assert.equal(
    voluma.intended_areas.some((area) => kysse.intended_areas.includes(area)),
    false,
  );
  const compatibility = resolvePairCompatibility(voluma, kysse, familyRules);
  assert.equal(compatibility?.mode, "direct");
  assert.equal(
    compatibility && comparisonSlugForPair(voluma, kysse, compatibility),
    comparison.slug,
  );
  const template = resolveTemplate(voluma, kysse, comparison.row_template);
  assert.ok(nonEmptyComparisonRows(voluma, kysse, template.glance).length > 0);
});

test("different-approach pages render the non-substitute notice", async () => {
  const route = await readFile(new URL("../routes/compare.$slug.tsx", import.meta.url), "utf8");
  assert.match(route, /mode === "different_approach"/);
  assert.match(route, /These treatments work differently and are not direct substitutes\./);
});

test("published regional estimates retain sources, units, dates, ranges, and currencies", () => {
  const published = prices.filter((row) => row.publication_status === "published");
  assert.equal(published.length, 58);
  assert.deepEqual(new Set(published.map((row) => row.currency)), new Set(["USD", "CAD"]));

  for (const estimate of published) {
    assert.ok(estimate.source_urls.length > 0);
    assert.equal(estimate.source_count, estimate.source_urls.length);
    assert.ok(estimate.source_urls.every((url) => url.startsWith("https://")));
    assert.ok(estimate.pricing_unit.trim());
    assert.ok(estimate.researched_at);
    assert.ok(
      estimate.estimated_low <= estimate.estimated_high,
      `${estimate.entity_slug}/${estimate.region_slug} has an inverted range`,
    );
    assert.equal(estimate.currency, estimate.country === "US" ? "USD" : "CAD");
  }
});

test("unpublished or unverified media cannot pass the rendering gate", async () => {
  assert.equal(media.length, 15);
  assert.ok(
    media.every(
      (row) =>
        row.publish === false &&
        row.publication_status !== "published" &&
        row.rights_status === "new own-work asset required",
    ),
  );
  assert.equal(
    isPublishableTreatmentMedia({
      publication_status: "review",
      is_sample: false,
      rights_verified_at: "2026-07-29",
    }),
    false,
  );
  assert.equal(
    isPublishableTreatmentMedia({
      publication_status: "published",
      is_sample: false,
      rights_verified_at: null,
    }),
    false,
  );
  assert.equal(
    isPublishableTreatmentMedia({
      publication_status: "published",
      is_sample: false,
      rights_verified_at: "2026-07-29",
    }),
    true,
  );

  const [mediaSchema, server, guardMigration] = await Promise.all([
    readFile(
      new URL(
        "../../supabase/migrations/20260728055118_46d138a9-ad04-4fe8-b424-fdd9d838cc1b.sql",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("./content.server.ts", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../../supabase/migrations/20260730020000_source_backed_mvp_validation_guards.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  assert.match(
    mediaSchema,
    /publication_status = 'published' and is_sample = false and rights_verified_at is not null/i,
  );
  assert.match(server, /isPublishableTreatmentMedia/);
  assert.match(guardMigration, /update public\.treatment_media media/i);
});

test("the additive audit preserves treatment IDs and the migration chain covers every requested table", async () => {
  const [sourceMigration, initialContentMigration] = await Promise.all([
    readFile(
      new URL(
        "../../supabase/migrations/20260730040000_complete_mvp_content_audit.sql",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../../supabase/migrations/20260730010000_source_backed_mvp_content.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  const guardMigration = await readFile(
    new URL(
      "../../supabase/migrations/20260730020000_source_backed_mvp_validation_guards.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(sourceMigration, /update public\.treatments\b/i);
  assert.doesNotMatch(sourceMigration, /insert into public\.treatments\b/i);
  assert.doesNotMatch(sourceMigration, /\bid\s*=\s*excluded\.id\b/i);
  const contentMigrationChain = `${initialContentMigration}\n${sourceMigration}`;
  for (const table of [
    "treatments",
    "treatment_sources",
    "comparison_groups",
    "treatment_comparison_groups",
    "comparison_family_rules",
    "treatment_markets",
    "comparisons",
    "regional_price_estimates",
    "postal_region_map",
  ]) {
    assert.match(
      contentMigrationChain,
      new RegExp(`(?:insert into|update) public\\.${table}\\b`, "i"),
      `Content migration chain does not import ${table}`,
    );
  }
  assert.match(guardMigration, /update public\.treatment_media\b/i);
});

test("content migrations leave clinic and submission structures intact", async () => {
  const [baseSchema, sourceMigration, guardMigration] = await Promise.all([
    readFile(
      new URL(
        "../../supabase/migrations/20260727071810_0477923b-b665-4f2b-be5a-8df24d8d7fe3.sql",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../../supabase/migrations/20260730040000_complete_mvp_content_audit.sql",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../../supabase/migrations/20260730020000_source_backed_mvp_validation_guards.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  for (const table of ["clinics", "locations", "offers", "price_observations"]) {
    assert.match(baseSchema, new RegExp(`create table public\\.${table}\\b`, "i"));
  }
  assert.match(
    baseSchema,
    /clinic_id uuid not null references public\.clinics\(id\) on delete cascade/i,
  );
  assert.match(
    baseSchema,
    /location_id uuid not null references public\.locations\(id\) on delete cascade/i,
  );

  const protectedTables = [
    "clinics",
    "locations",
    "offers",
    "price_observations",
    "city_requests",
    "comparison_requests",
    "price_alert_interest",
    "content_suggestions",
    "submission_audit",
  ];
  for (const migration of [sourceMigration, guardMigration]) {
    for (const table of protectedTables) {
      assert.doesNotMatch(
        migration,
        new RegExp(
          `\\b(?:insert\\s+into|update|delete\\s+from|alter\\s+table|drop\\s+table)\\s+public\\.${table}\\b`,
          "i",
        ),
        `Content migration mutates protected table ${table}`,
      );
    }
  }
});
