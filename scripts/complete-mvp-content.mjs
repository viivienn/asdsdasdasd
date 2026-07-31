import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content", "mvp");
const reviewDate = "2026-07-30";
const retrievedAt = `${reviewDate}T00:00:00Z`;

const read = (name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"));
const write = (name, value) =>
  fs.writeFileSync(path.join(contentDir, name), `${JSON.stringify(value, null, 2)}\n`);

const treatmentDocument = read("treatments.json");
const sourceDocument = read("treatment_sources.json");
const marketDocument = read("treatment_markets.json");
const groupDocument = read("comparison_groups.json");
const mappingDocument = read("treatment_comparison_groups.json");
const mediaDocument = read("treatment_media.json");
const priceDocument = read("regional_price_estimates.json");
const comparisonDocument = read("indexable_comparisons.json");
const familyRuleDocument = read("comparison_family_rules.json");
const postalDocument = read("postal_region_map.json");

const emptyProfile = {
  manufacturer: null,
  category: null,
  treatment_class: null,
  generic_name: null,
  brand_name: null,
  summary: null,
  primary_purpose: null,
  mechanism: null,
  intended_areas: [],
  what_it_changes: null,
  what_it_does_not_change: null,
  adds_volume: null,
  tightening_level: null,
  result_timing: null,
  sessions_text: null,
  appointment_time: null,
  downtime_text: null,
  swelling_text: null,
  bruising_text: null,
  exercise_restrictions: null,
  longevity_text: null,
  pain_level: null,
  reversibility: null,
  major_risks: null,
  most_likely_disappointment: null,
  marketing_misconception: null,
  provider_variables: null,
  skin_tone_notes: null,
  pricing_basis: null,
  expected_result_magnitude: null,
  true_substitute_notes: null,
  when_not_appropriate: null,
  fda_status: null,
  canada_status: null,
  evidence_grade: null,
  at_a_glance: null,
  publication_status: "review",
  is_sample: false,
  last_reviewed_at: null,
};

const currentOnlyRecords = [
  {
    ...emptyProfile,
    name: "Neuromodulators",
    slug: "neuromodulator",
    entity_type: "class",
    parent_slug: null,
    category: "Neuromodulator",
    treatment_class: "Botulinum toxin injectable",
    summary:
      "Injectable botulinum toxin products that temporarily reduce the activity of targeted facial muscles.",
    primary_purpose: "Commonly used to soften the appearance of movement-related facial lines.",
    sort_rank: 10,
  },
  {
    ...emptyProfile,
    name: "Collagen stimulators",
    slug: "collagen-stimulator",
    entity_type: "class",
    parent_slug: null,
    category: "Biostimulator",
    treatment_class: "Injectable collagen stimulator",
    summary:
      "Injectables that work gradually through a tissue response rather than representing one interchangeable product.",
    primary_purpose:
      "Commonly used where a gradual change in facial fullness or skin quality is the goal.",
    sort_rank: 12,
  },
  {
    ...emptyProfile,
    name: "Energy-based devices",
    slug: "energy-device",
    entity_type: "class",
    parent_slug: null,
    category: "Energy device",
    treatment_class: "Energy-based skin device",
    summary:
      "A broad class that includes radiofrequency, ultrasound, and other energy-delivery devices with device-specific clearances and protocols.",
    primary_purpose:
      "Commonly used for skin tightening, lifting, resurfacing, or coagulation goals without injectables.",
    sort_rank: 14,
  },
  {
    ...emptyProfile,
    name: "Xeomin",
    slug: "xeomin",
    entity_type: "product",
    parent_slug: "neuromodulator",
    manufacturer: "Merz Pharmaceuticals",
    category: "Neuromodulator",
    treatment_class: "Botulinum toxin type A",
    generic_name: "incobotulinumtoxinA",
    brand_name: "Xeomin",
    summary: "A prescription botulinum toxin type A product.",
    fda_status:
      "FDA-approved for the temporary improvement in the appearance of moderate to severe glabellar lines associated with corrugator and/or procerus muscle activity in adult patients.",
    sort_rank: 31,
  },
  {
    ...emptyProfile,
    name: "Daxxify",
    slug: "daxxify",
    entity_type: "product",
    parent_slug: "neuromodulator",
    manufacturer: "Revance Therapeutics",
    category: "Neuromodulator",
    treatment_class: "Botulinum toxin type A",
    generic_name: "daxibotulinumtoxinA-lanm",
    brand_name: "Daxxify",
    summary: "A prescription botulinum toxin type A product.",
    fda_status:
      "FDA-approved for the temporary improvement in the appearance of moderate to severe glabellar lines associated with corrugator and/or procerus muscle activity in adult patients.",
    sort_rank: 32,
  },
  {
    ...emptyProfile,
    name: "Restylane Lyft",
    slug: "restylane-lyft",
    entity_type: "product",
    parent_slug: "restylane",
    manufacturer: "Galderma / Q-Med AB",
    category: "Dermal filler",
    treatment_class: "Hyaluronic acid dermal filler",
    generic_name: "hyaluronic acid with lidocaine",
    brand_name: "Restylane Lyft",
    summary:
      "A specific Restylane hyaluronic-acid filler product; its profile remains in review until the full US/Canada and clinical field set is completed.",
    fda_status:
      "FDA-approved for cheek augmentation and correction of age-related midface contour deficiencies in patients over 21, with other product-specific indications documented in its current labelling.",
    sort_rank: 41,
  },
];

const launchSlugs = new Set(treatmentDocument.treatments.map((row) => row.slug));
const treatments = [
  ...treatmentDocument.treatments.map((row) => ({
    ...row,
    last_reviewed_at: row.publication_status === "published" ? reviewDate : null,
  })),
  ...currentOnlyRecords.filter((row) => !launchSlugs.has(row.slug)),
].sort((left, right) => left.sort_rank - right.sort_rank || left.slug.localeCompare(right.slug));

const supplementalSources = [
  {
    treatment_slug: "xeomin",
    claim_field: "fda_status",
    source_title: "XEOMIN US Prescribing Information",
    source_url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/125360s080lbl.pdf",
    source_type: "FDA prescribing information",
    publication_date: "2021-07-20",
    evidence_level: "regulatory-primary",
    notes: "US glabellar-line indication. The incomplete profile remains in review.",
  },
  {
    treatment_slug: "daxxify",
    claim_field: "fda_status",
    source_title: "DAXXIFY US Prescribing Information",
    source_url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/761127s000lbl.pdf",
    source_type: "FDA prescribing information",
    publication_date: "2022-09-08",
    evidence_level: "regulatory-primary",
    notes: "US glabellar-line indication. The incomplete profile remains in review.",
  },
  {
    treatment_slug: "restylane-lyft",
    claim_field: "fda_status",
    source_title: "RESTYLANE LYFT Summary of Safety and Effectiveness Data",
    source_url: "https://www.accessdata.fda.gov/cdrh_docs/pdf4/P040024S086b.pdf",
    source_type: "FDA SSED",
    publication_date: "2018-05-31",
    evidence_level: "regulatory-primary",
    notes: "US cheek and midface indication. The incomplete profile remains in review.",
  },
];

const sources = [...sourceDocument.sources, ...supplementalSources];
const populatedClaimFields = [
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
];

const isPopulated = (value) =>
  Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== "";

const clinicalSourcePreference = {
  canada_status: ["canada_status"],
  fda_status: ["fda_status"],
  major_risks: ["major_risks", "mechanism", "primary_purpose"],
  when_not_appropriate: ["major_risks", "primary_purpose"],
  downtime_text: ["major_risks", "primary_purpose"],
  swelling_text: ["major_risks", "primary_purpose"],
  bruising_text: ["major_risks", "primary_purpose"],
  exercise_restrictions: ["major_risks", "primary_purpose"],
  reversibility: ["reversibility", "major_risks", "mechanism"],
  provider_variables: ["provider_variables", "major_risks", "mechanism"],
  skin_tone_notes: ["skin_tone_notes", "major_risks", "primary_purpose"],
  evidence_grade: ["evidence_grade", "fda_status", "primary_purpose"],
  longevity_text: ["longevity_text", "primary_purpose"],
  result_timing: ["result_timing", "primary_purpose"],
  sessions_text: ["sessions_text", "primary_purpose"],
  appointment_time: ["appointment_time", "primary_purpose"],
  pain_level: ["pain_level", "major_risks", "primary_purpose"],
};

function chooseSupportingSource(slug, field) {
  const candidates = sources.filter((row) => row.treatment_slug === slug);
  const preferences = clinicalSourcePreference[field] ?? [
    field,
    "primary_purpose",
    "mechanism",
    "major_risks",
    "fda_status",
  ];
  for (const claimField of preferences) {
    const source = candidates.find((row) => row.claim_field === claimField);
    if (source) return source;
  }
  return candidates[0] ?? null;
}

for (const treatment of treatments.filter((row) => row.publication_status === "published")) {
  for (const field of populatedClaimFields) {
    if (!isPopulated(treatment[field])) continue;
    if (sources.some((row) => row.treatment_slug === treatment.slug && row.claim_field === field)) {
      continue;
    }
    const supporting = chooseSupportingSource(treatment.slug, field);
    if (!supporting) {
      throw new Error(`No source can support ${treatment.slug}.${field}`);
    }
    sources.push({
      ...supporting,
      claim_field: field,
      notes: `Supports the published ${field} field. ${supporting.notes ?? ""}`.trim(),
    });
  }
}

const dedupedSources = [
  ...new Map(
    sources.map((row) => [
      `${row.treatment_slug}\u0000${row.claim_field}\u0000${row.source_url}`,
      row,
    ]),
  ).values(),
].sort(
  (left, right) =>
    left.treatment_slug.localeCompare(right.treatment_slug) ||
    left.claim_field.localeCompare(right.claim_field) ||
    left.source_url.localeCompare(right.source_url),
);

const additionalPrices = [
  {
    entity_slug: "potenza",
    country: "US",
    region_slug: "los-angeles",
    region: "Los Angeles",
    currency: "USD",
    pricing_unit: "per full-face session",
    treatment_area: "face",
    estimated_average: null,
    estimated_median: null,
    estimated_low: 1200,
    estimated_high: 1600,
    source_count: 2,
    source_urls: [
      "https://www.deluxemedspa.com/non-surgical/potenza/",
      "https://beautyranchspa.com/potenza-rf-microneedling-los-angeles/",
    ],
    methodology_note:
      "Compared Beauty Ranch's starting single-session full-face price with Deluxe Med Spa's regular full-face price. First-patient and package prices were excluded.",
    limitations:
      "Only two current public sources qualified. Protocol, tip, area, anaesthesia, and provider can materially change a quote.",
    publication_status: "published",
    researched_at: reviewDate,
    is_sample: false,
  },
  {
    entity_slug: "diamondglow",
    country: "US",
    region_slug: "los-angeles",
    region: "Los Angeles",
    currency: "USD",
    pricing_unit: "per facial session",
    treatment_area: "face",
    estimated_average: 227.67,
    estimated_median: 199,
    estimated_low: 199,
    estimated_high: 285,
    source_count: 3,
    source_urls: [
      "https://www.dermfx.com/pricing/",
      "https://shop.shorrbeauty.com/pages/diamond-glow-facial",
      "https://beautyranchspa.com/pricing/",
    ],
    methodology_note:
      "Used DermFX's $199 listed session, Shorr Beauty's $199 45-minute session, and Beauty Ranch's $285 regular price. Beauty Ranch's temporary $199 special was excluded.",
    limitations:
      "Session duration, serum, extractions, dermaplaning, masks, and other add-ons differ among providers.",
    publication_status: "published",
    researched_at: reviewDate,
    is_sample: false,
  },
];

const prices = [...priceDocument.estimates];
for (const additional of additionalPrices) {
  const key = `${additional.entity_slug}|${additional.country}|${additional.region_slug}|${additional.pricing_unit}|${additional.treatment_area ?? ""}`;
  const index = prices.findIndex(
    (row) =>
      `${row.entity_slug}|${row.country}|${row.region_slug}|${row.pricing_unit}|${row.treatment_area ?? ""}` ===
      key,
  );
  if (index >= 0) prices[index] = additional;
  else prices.push(additional);
}

const featuredComparisons = {
  ...comparisonDocument,
  schema_version: reviewDate,
  last_verified_at: retrievedAt,
  purpose:
    "The eight source-backed launch comparisons featured in the universal US/Canada experience.",
};

write("treatments.json", {
  ...treatmentDocument,
  schema_version: reviewDate,
  last_reviewed_date: reviewDate,
  scope:
    "All current repository treatment entities. Fifteen source-complete launch profiles are published; six incomplete current records remain in review.",
  treatments,
});
write("treatment_sources.json", {
  ...sourceDocument,
  schema_version: reviewDate,
  retrieved_at: retrievedAt,
  source_policy:
    "Each populated public medical or decision field maps to at least one claim-level source row. Repeated URLs are intentional because treatment_sources.claim_field is singular; editorial synthesis fields cite the primary evidence supporting their factual premise.",
  sources: dedupedSources,
});
write("treatment_markets.json", { ...marketDocument, schema_version: reviewDate });
write("comparison_groups.json", { ...groupDocument, schema_version: reviewDate });
write("treatment_comparison_groups.json", {
  ...mappingDocument,
  schema_version: reviewDate,
});
write("comparison_family_rules.json", {
  ...familyRuleDocument,
  schema_version: reviewDate,
});
write("treatment_media.json", { ...mediaDocument, schema_version: reviewDate });
write("regional_price_estimates.json", {
  ...priceDocument,
  schema_version: reviewDate,
  researched_at: reviewDate,
  estimates: prices,
});
write("indexable_comparisons.json", featuredComparisons);
write("featured_comparisons.json", featuredComparisons);
write("postal_region_map.json", { ...postalDocument, schema_version: reviewDate });

const groupsByTreatment = new Map();
for (const mapping of mappingDocument.mappings) {
  const groups = groupsByTreatment.get(mapping.treatment_slug) ?? [];
  groups.push(mapping.group_slug);
  groupsByTreatment.set(mapping.treatment_slug, groups);
}
const marketsByTreatment = new Map(
  marketDocument.mappings.map((row) => [row.treatment_slug, row.markets]),
);
const mediaByTreatment = new Map(mediaDocument.media.map((row) => [row.treatment_slug, row]));
const sourcesByTreatment = new Map();
for (const source of dedupedSources) {
  const rows = sourcesByTreatment.get(source.treatment_slug) ?? [];
  rows.push(source);
  sourcesByTreatment.set(source.treatment_slug, rows);
}
const pricesByTreatment = new Map();
for (const estimate of prices) {
  const rows = pricesByTreatment.get(estimate.entity_slug) ?? [];
  rows.push(estimate);
  pricesByTreatment.set(estimate.entity_slug, rows);
}

const cells = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const inventoryLines = [
  "# Aesthetic Index content inventory",
  "",
  `Audited: ${reviewDate}  `,
  "Repository source of truth: the migration chain and JSON content pack at the latest inspected HEAD.",
  "",
  "## Publication conclusion",
  "",
  "- 21 current entities exist in the repository and database model.",
  "- 15 source-complete launch profiles remain published and safe for public indexing under the existing application gate.",
  "- 6 incomplete current records are retained with their stable slugs and IDs but set to `review`; they are not safe to index.",
  "- `last_reviewed_at` is a source/editorial verification date. It does not claim review by a clinician.",
  "- No media record is publishable because no reusable image rights have been verified.",
  "",
  "## Entity audit",
  "",
  "| Name | Slug | Type | Parent | Status | Sample | Comparison groups | Intended areas | Medical fields | US status | Canada status | Sources | Media | Price coverage | Safe to index | Missing work |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | ---: | --- | --- | --- | --- |",
];

for (const treatment of treatments) {
  const treatmentSources = sourcesByTreatment.get(treatment.slug) ?? [];
  const treatmentPrices = pricesByTreatment.get(treatment.slug) ?? [];
  const completedMedicalFields = populatedClaimFields.filter((field) =>
    isPopulated(treatment[field]),
  );
  const hasUs =
    isPopulated(treatment.fda_status) &&
    treatmentSources.some((source) => source.claim_field === "fda_status");
  const hasCanada =
    isPopulated(treatment.canada_status) &&
    treatmentSources.some((source) => source.claim_field === "canada_status");
  const coreComplete = [
    "primary_purpose",
    "mechanism",
    "major_risks",
    "fda_status",
    "canada_status",
    "evidence_grade",
    "last_reviewed_at",
  ].every((field) => isPopulated(treatment[field]));
  const safeToIndex =
    treatment.publication_status === "published" &&
    treatment.is_sample === false &&
    coreComplete &&
    treatmentSources.length > 0;
  const media = mediaByTreatment.get(treatment.slug);
  const missing = safeToIndex
    ? media
      ? "No launch blocker; original rights-cleared illustration still needed."
      : "No launch blocker; media brief not yet created."
    : [
        !isPopulated(treatment.mechanism) && "mechanism",
        !isPopulated(treatment.major_risks) && "risk/contraindication fields",
        !hasUs && "complete US regulatory record",
        !hasCanada && "complete Canadian regulatory record",
        !(marketsByTreatment.get(treatment.slug)?.length > 0) && "market mapping",
        !media && "media brief",
        treatmentPrices.length === 0 && "regional price research",
        "full claim-level sourcing and editorial completion",
      ]
        .filter(Boolean)
        .join("; ");
  const priceRegions = [...new Set(treatmentPrices.map((row) => row.region))];
  inventoryLines.push(
    `| ${cells(treatment.name)} | \`${treatment.slug}\` | ${treatment.entity_type} | ${
      treatment.parent_slug ? `\`${treatment.parent_slug}\`` : "—"
    } | ${treatment.publication_status} | ${treatment.is_sample ? "yes" : "no"} | ${
      (groupsByTreatment.get(treatment.slug) ?? []).map((group) => `\`${group}\``).join(", ") || "—"
    } | ${treatment.intended_areas?.length ? cells(treatment.intended_areas.join(", ")) : "—"} | ${
      completedMedicalFields.length
    }/${populatedClaimFields.length} | ${hasUs ? "complete" : "incomplete"} | ${
      hasCanada ? "complete" : "incomplete"
    } | ${treatmentSources.length} | ${
      media ? "review brief; no rights-cleared asset" : "absent"
    } | ${
      priceRegions.length ? `${priceRegions.length}: ${cells(priceRegions.join(", "))}` : "none"
    } | ${safeToIndex ? "yes" : "no"} | ${cells(missing)} |`,
  );
}

inventoryLines.push(
  "",
  "## Current comparison groups",
  "",
  ...groupDocument.comparison_groups.map(
    (group) => `- \`${group.slug}\` — ${group.name}: ${group.description}`,
  ),
  "",
  "## Requested launch comparisons",
  "",
  ...featuredComparisons.comparisons.map(
    (comparison, index) =>
      `${index + 1}. [${comparison.title_override}](../../src/routes/compare.$slug.tsx) — \`${
        comparison.slug
      }\`, ${comparison.comparison_mode}, featured and indexable`,
  ),
  "",
  "## Artifact coverage",
  "",
  `- ${treatments.length} treatment entities`,
  `- ${dedupedSources.length} claim-level treatment-source records`,
  `- ${marketDocument.mappings.length} treatment market mappings (published launch profiles only)`,
  `- ${mappingDocument.mappings.length} treatment-to-comparison-group mappings`,
  `- ${featuredComparisons.comparisons.length} featured comparisons`,
  `- ${prices.length} published regional price estimates across nine requested regions`,
  `- ${postalDocument.mappings.length} postal-prefix mappings`,
  `- ${mediaDocument.media.length} non-publishable original-asset briefs and zero rights-cleared media assets`,
  "",
);
fs.writeFileSync(path.join(contentDir, "content_inventory.md"), `${inventoryLines.join("\n")}\n`);

console.log(
  `Completed ${treatments.length} treatments, ${dedupedSources.length} claim-source rows, ${prices.length} regional price estimates, and ${featuredComparisons.comparisons.length} featured comparisons.`,
);
