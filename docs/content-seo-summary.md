# Focused content and SEO summary

Updated: 2026-08-05

This pass improves the clarity and extractability of existing source-backed content. It does not claim medical review, provide personal treatment advice, or guarantee search rankings or inclusion in generated answers.

## Pages changed

### Comparisons

The following eight existing comparison records now have a unique meta description and an 80–150 word answer-first summary. The universal comparison route continues to provide key differences, common questions, provider-dependent variables, both treatment-profile links, relevant directories, regional pricing, and visible claim-level sources.

- `/compare/botox-vs-dysport`
- `/compare/botox-vs-dermal-fillers`
- `/compare/juvederm-vs-restylane`
- `/compare/juvederm-voluma-vs-restylane-kysse`
- `/compare/sculptra-vs-radiesse`
- `/compare/thermage-vs-ultherapy`
- `/compare/morpheus8-vs-potenza`
- `/compare/hydrafacial-vs-diamondglow`

The new summaries synthesize fields already present in the two treatment profiles. A pair of primary supporting source links is displayed immediately below each summary; deeper questions retain field-level source links.

### Concern pages

These four concise, crawlable pages were created in this pull request and now explain how the main treatment categories differ without diagnosing the concern:

- `/concerns/expression-lines`
- `/concerns/volume-and-contour`
- `/concerns/lift-and-tighten`
- `/concerns/texture-and-pores`

### Treatment-class pages

These six crawlable class pages now include a definition, a plain-language mechanism summary, important within-class differences, a common comparison mistake, relevant profiles and comparisons, limitations, provider-dependent variables, and visible source documents:

- `/treatment-classes/neuromodulators`
- `/treatment-classes/hyaluronic-acid-dermal-fillers`
- `/treatment-classes/biostimulators`
- `/treatment-classes/radiofrequency-microneedling`
- `/treatment-classes/noninvasive-skin-tightening-devices`
- `/treatment-classes/hydradermabrasion-and-resurfacing-facials`

### Treatment profiles and regional pricing

The 15 published profiles were reviewed against the requested page fields. They already contain a title and H1, top summary, mechanism, uses, result timing, duration where supportable, downtime, risks, limitations, US and Canadian status, pricing basis, related comparisons, visible sources, and an editorial/source-verification date. They were not lengthened merely for SEO.

The existing `/prices/$treatment/$region` template already renders only published, source-backed estimates and includes currency, range, pricing basis, source count, research date, methodology, exclusions, limitations, source URLs, profile links, related comparisons, and pricing disclaimer. No new prices were researched or invented in this pass.

## Main sources represented

The comparison summaries reuse claims and source mappings already recorded in `content/mvp/treatment_sources.json`. Principal sources include:

- [BOTOX Cosmetic US Prescribing Information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/103000s5316s5319s5323s5326s5331lbl.pdf) — US Food and Drug Administration
- [DYSPORT US Prescribing Information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/125274s123lbl.pdf) — US Food and Drug Administration
- [FDA dermal-filler overview](https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/dermal-fillers-soft-tissue-fillers) — US Food and Drug Administration
- [Juvéderm Voluma XC Instructions for Use](https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S070C.pdf) — US Food and Drug Administration
- [Restylane Kysse Instructions for Use](https://www.restylaneusa.com/docs/Restylane-Kysse-IFU) — Galderma / Q-Med
- [Sculptra Aesthetic Instructions for Use](https://www.sculptrausa.com/docs/Sculptra-e-IFU) — Galderma
- [Radiesse (+) Instructions for Use](https://radiesse.com/app/uploads/2024/04/instructions-for-use-radiesse-plus-lidocaine.pdf) — Merz
- [Thermage FLX 510(k) summary K170758](https://www.accessdata.fda.gov/cdrh_docs/pdf17/K170758.pdf) — US Food and Drug Administration
- [Ulthera System 510(k) summary K121700](https://www.accessdata.fda.gov/cdrh_docs/pdf12/K121700.pdf) — US Food and Drug Administration
- [Morpheus8 510(k) summary K231790](https://www.accessdata.fda.gov/cdrh_docs/pdf23/K231790.pdf) — US Food and Drug Administration
- [Potenza 510(k) summary K192545](https://www.accessdata.fda.gov/cdrh_docs/pdf19/K192545.pdf) — US Food and Drug Administration
- [FDA RF-microneedling safety communication](https://www.fda.gov/medical-devices/safety-communications/potential-risks-certain-uses-radiofrequency-rf-microneedling-fda-safety-communication) — US Food and Drug Administration
- [HydraFacial electronic instructions for use](https://www.hydrafacial.com/pages/electronic-instructions-for-use-eifu) — HydraFacial
- [DiamondGlow: How It Works](https://www.diamondglow.com/how-it-works/) — Allergan Aesthetics
- [Health Canada Drug Product Database](https://health-products.canada.ca/dpd-bdpp/) and [Medical Devices Active Licence Listing](https://health-products.canada.ca/mdall-limh/) — Health Canada

The complete source-to-field mapping remains in `content/mvp/treatment_sources.json`.

## Claims intentionally not made

- No botulinum-toxin dose or potency-unit conversion.
- No diffusion-superiority or universal product winner.
- No claim that one syringe, vial, session, pulse count, line count, or treatment area is interchangeable with another.
- No guaranteed reversibility, duration, downtime, result, or price.
- No durable longevity claim for HydraFacial or DiamondGlow because the current evidence set does not support one.
- No broad claim that a branded facial or every marketed device use is “FDA approved.” Regulatory wording remains product-, model-, and indication-specific.
- No personal suitability recommendation, dosing instruction, or provider ranking.

## Pages intentionally left unpublished

The existing records for `neuromodulator`, `collagen-stimulator`, `energy-device`, `xeomin`, `daxxify`, and `restylane-lyft` remain in `review`. They are not safe to index until the full profile, US/Canada status, and claim-level sourcing gates are complete.

Regional treatment/market combinations without at least two compatible, current public pricing sources remain absent from the public directory, excluded from the sitemap, or unavailable through the route loader. The Aesthetic Treatment Price Index report also remains noindex and unavailable until its separate publication gate is enabled.

## Recommended next five content pages

Only create these after the underlying profiles meet the same publication and source gates:

1. Botox Cosmetic vs. Xeomin
2. Botox Cosmetic vs. Daxxify
3. Juvéderm Voluma XC vs. Restylane Lyft
4. Morpheus8 vs. Ultherapy
5. Thermage FLX vs. Morpheus8

## Manual review before deployment

- Apply `20260805010000_focused_content_seo_summaries.sql` to the connected Supabase/Lovable environment.
- Confirm all eight summaries render after the migration and that the displayed “Last verified” date is 2026-08-05.
- Spot-check the source links and regulatory wording against the live official documents; DPD and MDALL are live registries and can change.
- Confirm the six review-state profiles and unsupported regional price combinations remain absent from the sitemap.
- Review the summaries for house style and Canadian/US terminology. This is an editorial review request, not a claim of clinician review.
