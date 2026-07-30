# Aesthetic Index launch inventory

Reviewed: 2026-07-29

## Repository and schema inspected

The working branch is `codex/universal-comparisons-pricing` at commit `6bee9c8`. The repository was clean before this content-pack work began.

The current local schema is defined by the migration chain through:

- [`20260729010000_comparison_compatibility_and_markets.sql`](../../supabase/migrations/20260729010000_comparison_compatibility_and_markets.sql)
- [`20260729020000_universal_comparisons_and_regional_prices.sql`](../../supabase/migrations/20260729020000_universal_comparisons_and_regional_prices.sql)

The deployed Supabase project was inspected read-only. It still reflects the earlier schema and has not applied the two newest comparison/pricing migrations. It contains 19 non-sample treatment records; the local migrations and application code are therefore authoritative for this pack.

## Existing entities before this pack

| Entity type | Existing slugs |
|---|---|
| Class | `neuromodulator`, `ha-filler`, `collagen-stimulator`, `energy-device` |
| Brand family | `juvederm`, `restylane` |
| Product | `botox`, `dysport`, `xeomin`, `daxxify`, `juvederm-voluma`, `restylane-lyft`, `sculptra`, `radiesse` |
| Device | `thermage`, `ultherapy`, `morpheus8` |
| Procedure | `hydrafacial`, `diamondglow` |

## Missing launch entities added

| Slug | Type | Parent | Reason |
|---|---|---|---|
| `restylane-kysse` | Product | `restylane` | Required for Juvéderm Voluma vs. Restylane Kysse |
| `potenza` | Device | `energy-device` | Required for Morpheus8 vs. Potenza |

The post-migration inventory is 21 records. Existing IDs are preserved because the migration updates by slug and inserts only when a slug does not exist.

## Launch comparison subjects

| Entity | Slug | Type | Parent | Pack status |
|---|---|---|---|---|
| Botox Cosmetic | `botox` | Product | `neuromodulator` | Published |
| Dysport | `dysport` | Product | `neuromodulator` | Published |
| Hyaluronic acid dermal fillers | `ha-filler` | Class | — | Published |
| Juvéderm | `juvederm` | Brand family | `ha-filler` | Published |
| Restylane | `restylane` | Brand family | `ha-filler` | Published |
| Juvéderm Voluma XC | `juvederm-voluma` | Product | `juvederm` | Published |
| Restylane Kysse | `restylane-kysse` | Product | `restylane` | Published |
| Sculptra | `sculptra` | Product | `collagen-stimulator` | Published |
| Radiesse | `radiesse` | Product | `collagen-stimulator` | Published |
| Thermage FLX | `thermage` | Device | `energy-device` | Published |
| Ultherapy | `ultherapy` | Device | `energy-device` | Published |
| Morpheus8 | `morpheus8` | Device | `energy-device` | Published |
| Potenza | `potenza` | Device | `energy-device` | Published |
| HydraFacial | `hydrafacial` | Procedure | — | Published |
| DiamondGlow | `diamondglow` | Procedure | — | Published |

## Current treatment fields

The launch payload uses the repository’s current treatment fields:

`name`, `slug`, `entity_type`, `parent_id`, `manufacturer`, `category`, `treatment_class`, `generic_name`, `brand_name`, `summary`, `primary_purpose`, `mechanism`, `intended_areas`, `what_it_changes`, `what_it_does_not_change`, `adds_volume`, `tightening_level`, `result_timing`, `sessions_text`, `appointment_time`, `downtime_text`, `swelling_text`, `bruising_text`, `exercise_restrictions`, `longevity_text`, `pain_level`, `reversibility`, `major_risks`, `most_likely_disappointment`, `marketing_misconception`, `provider_variables`, `skin_tone_notes`, `expected_result_magnitude`, `true_substitute_notes`, `when_not_appropriate`, `pricing_basis`, `fda_status`, `evidence_grade`, `last_reviewed_at`, `publication_status`, and `is_sample`.

This pack adds `canada_status` because the existing schema had no responsible place for a distinct Canadian regulatory statement. It also adds `limitations` to regional estimates because methodology and limitations are separate required fields.

## Existing comparison and publication rules

- Public treatment reads require `publication_status = 'published'` and `is_sample = false`.
- A public indexable comparison requires both profiles to be published/non-sample, satisfy the application’s minimum-profile gate, have source rows on both sides, and have a published/indexable comparison record.
- `botox-vs-dermal-fillers` uses `different_approach` with `cross_category`. Its recommendation fields are null, so the structural distinction comes from profile rows.
- Comparison groups and market rows drive compatibility and universal availability. US and Canada are metadata on the same experience; they do not create country tabs.
- Public treatment media requires a published, non-sample row with `rights_verified_at` populated and a permitted licence value. This pack inserts no media.
- Regional estimates require a published, non-sample row and exactly one subject: a treatment or comparison group.

## Existing groups reconciled

The canonical broad groups are:

`neuromodulator`, `dermal-filler`, `ha-filler-brand-family`, `ha-filler-product`, `collagen-biostimulator`, `noninvasive-lifting-device`, `rf-microneedling-device`, `resurfacing-device`, and `hydradermabrasion-procedure`.

Older demonstration-era group slugs (`neuromodulator-brand`, `ha-filler-family`, `cheek-midface-filler-product`, and `hydradermabrasion-facial`) are not used by the new mappings. The migration does not delete them because downstream references cannot be assumed absent; it only removes obsolete launch mappings after sourced replacements are inserted.
