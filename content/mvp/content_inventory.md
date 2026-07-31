# Aesthetic Index content inventory

Audited: 2026-07-30
Repository source of truth: the migration chain and JSON content pack at the latest inspected HEAD.

## Publication conclusion

- 21 current entities exist in the repository and database model.
- 15 source-complete launch profiles remain published and safe for public indexing under the existing application gate.
- 6 incomplete current records are retained with their stable slugs and IDs but set to `review`; they are not safe to index.
- `last_reviewed_at` is a source/editorial verification date. It does not claim review by a clinician.
- No media record is publishable because no reusable image rights have been verified.

## Entity audit

| Name | Slug | Type | Parent | Status | Sample | Comparison groups | Intended areas | Medical fields | US status | Canada status | Sources | Media | Price coverage | Safe to index | Missing work |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | ---: | --- | --- | --- | --- |
| Neuromodulators | `neuromodulator` | class | — | review | no | `neuromodulator` | — | 2/30 | incomplete | incomplete | 0 | absent | none | no | mechanism; risk/contraindication fields; complete US regulatory record; complete Canadian regulatory record; market mapping; media brief; regional price research; full claim-level sourcing and editorial completion |
| Collagen stimulators | `collagen-stimulator` | class | — | review | no | — | — | 2/30 | incomplete | incomplete | 0 | absent | none | no | mechanism; risk/contraindication fields; complete US regulatory record; complete Canadian regulatory record; market mapping; media brief; regional price research; full claim-level sourcing and editorial completion |
| Energy-based devices | `energy-device` | class | — | review | no | — | — | 2/30 | incomplete | incomplete | 0 | absent | none | no | mechanism; risk/contraindication fields; complete US regulatory record; complete Canadian regulatory record; market mapping; media brief; regional price research; full claim-level sourcing and editorial completion |
| Xeomin | `xeomin` | product | `neuromodulator` | review | no | `neuromodulator` | — | 2/30 | complete | incomplete | 1 | absent | none | no | mechanism; risk/contraindication fields; complete Canadian regulatory record; market mapping; media brief; regional price research; full claim-level sourcing and editorial completion |
| Daxxify | `daxxify` | product | `neuromodulator` | review | no | `neuromodulator` | — | 2/30 | complete | incomplete | 1 | absent | none | no | mechanism; risk/contraindication fields; complete Canadian regulatory record; market mapping; media brief; regional price research; full claim-level sourcing and editorial completion |
| Restylane Lyft | `restylane-lyft` | product | `restylane` | review | no | `dermal-filler`, `ha-filler-product` | — | 2/30 | complete | incomplete | 1 | absent | none | no | mechanism; risk/contraindication fields; complete Canadian regulatory record; market mapping; media brief; regional price research; full claim-level sourcing and editorial completion |
| Botox Cosmetic | `botox` | product | `neuromodulator` | published | no | `neuromodulator` | glabella, forehead, lateral canthal lines, platysma bands | 26/30 | complete | complete | 26 | review brief; no rights-cleared asset | 9: San Francisco Bay Area, Los Angeles, New York City, Miami, Austin, Chicago, Toronto, Vancouver, Montreal | yes | No launch blocker; original rights-cleared illustration still needed. |
| Dysport | `dysport` | product | `neuromodulator` | published | no | `neuromodulator` | glabella | 26/30 | complete | complete | 26 | review brief; no rights-cleared asset | 7: San Francisco Bay Area, Los Angeles, New York City, Miami, Austin, Chicago, Toronto | yes | No launch blocker; original rights-cleared illustration still needed. |
| Hyaluronic acid dermal fillers | `ha-filler` | class | — | published | no | `dermal-filler` | lips, perioral lines, cheeks, chin, jawline, nasolabial folds, temples, infraorbital hollow, dorsal hands | 27/30 | complete | complete | 27 | review brief; no rights-cleared asset | 8: San Francisco Bay Area, Los Angeles, New York City, Miami, Austin, Toronto, Vancouver, Montreal | yes | No launch blocker; original rights-cleared illustration still needed. |
| Juvéderm | `juvederm` | brand_family | `ha-filler` | published | no | `dermal-filler`, `ha-filler-brand-family` | cheeks, chin, temples, jawline, lips, perioral lines, nasolabial folds, infraorbital hollow | 26/30 | complete | complete | 26 | review brief; no rights-cleared asset | 1: Chicago | yes | No launch blocker; original rights-cleared illustration still needed. |
| Restylane | `restylane` | brand_family | `ha-filler` | published | no | `dermal-filler`, `ha-filler-brand-family` | lips, perioral lines, nasolabial folds, cheeks, chin, temples, infraorbital hollow, dorsal hands | 26/30 | complete | complete | 26 | review brief; no rights-cleared asset | 1: Chicago | yes | No launch blocker; original rights-cleared illustration still needed. |
| Juvéderm Voluma XC | `juvederm-voluma` | product | `juvederm` | published | no | `dermal-filler`, `ha-filler-product` | cheeks, chin, temples | 28/30 | complete | complete | 28 | review brief; no rights-cleared asset | 2: Los Angeles, Austin | yes | No launch blocker; original rights-cleared illustration still needed. |
| Restylane Kysse | `restylane-kysse` | product | `restylane` | published | no | `dermal-filler`, `ha-filler-product` | lips, upper perioral lines | 27/30 | complete | complete | 27 | review brief; no rights-cleared asset | 3: San Francisco Bay Area, Los Angeles, Austin | yes | No launch blocker; original rights-cleared illustration still needed. |
| Sculptra | `sculptra` | product | `collagen-stimulator` | published | no | `collagen-biostimulator` | cheek wrinkles, nasolabial folds, marionette lines, chin wrinkles | 26/30 | complete | complete | 26 | review brief; no rights-cleared asset | 9: San Francisco Bay Area, Los Angeles, New York City, Miami, Austin, Chicago, Toronto, Vancouver, Montreal | yes | No launch blocker; original rights-cleared illustration still needed. |
| Radiesse | `radiesse` | product | `collagen-stimulator` | published | no | `collagen-biostimulator` | nasolabial folds, lower face, jawline, dorsal hands | 26/30 | complete | complete | 26 | review brief; no rights-cleared asset | 5: Los Angeles, Austin, Chicago, Toronto, Vancouver | yes | No launch blocker; original rights-cleared illustration still needed. |
| Thermage FLX | `thermage` | device | `energy-device` | published | no | `noninvasive-lifting-device` | face, periorbital area, neck, body | 27/30 | complete | complete | 27 | review brief; no rights-cleared asset | 2: Toronto, Vancouver | yes | No launch blocker; original rights-cleared illustration still needed. |
| Ultherapy | `ultherapy` | device | `energy-device` | published | no | `noninvasive-lifting-device` | brow, submental area, neck, décolletage | 28/30 | complete | complete | 28 | review brief; no rights-cleared asset | 2: Toronto, Vancouver | yes | No launch blocker; original rights-cleared illustration still needed. |
| Morpheus8 | `morpheus8` | device | `energy-device` | published | no | `rf-microneedling-device` | face, neck, body, acne scars | 26/30 | complete | complete | 26 | review brief; no rights-cleared asset | 4: Los Angeles, Miami, Toronto, Montreal | yes | No launch blocker; original rights-cleared illustration still needed. |
| Potenza | `potenza` | device | `energy-device` | published | no | `rf-microneedling-device` | face, neck, body, scars | 26/30 | complete | complete | 26 | review brief; no rights-cleared asset | 1: Los Angeles | yes | No launch blocker; original rights-cleared illustration still needed. |
| HydraFacial | `hydrafacial` | procedure | — | published | no | `hydradermabrasion-procedure` | face, neck, décolletage, back | 27/30 | complete | complete | 27 | review brief; no rights-cleared asset | 3: Austin, Chicago, Montreal | yes | No launch blocker; original rights-cleared illustration still needed. |
| DiamondGlow | `diamondglow` | procedure | — | published | no | `hydradermabrasion-procedure` | face, neck, décolletage, body | 27/30 | complete | complete | 28 | review brief; no rights-cleared asset | 1: Los Angeles | yes | No launch blocker; original rights-cleared illustration still needed. |

## Current comparison groups

- `neuromodulator` — Neuromodulators: Botulinum toxin products used to reduce selected muscle activity.
- `dermal-filler` — Dermal fillers: Broad filler class and product records that add or restore volume.
- `ha-filler-brand-family` — HA filler brand families: Manufacturer portfolios of hyaluronic acid filler products.
- `ha-filler-product` — HA filler products: Specific hyaluronic acid filler formulations.
- `collagen-biostimulator` — Collagen biostimulators: Injectables with a clinically relevant tissue-stimulation component.
- `noninvasive-lifting-device` — Non-invasive lifting devices: Noninvasive energy devices used for modest lifting or tightening goals.
- `rf-microneedling-device` — RF microneedling devices: Devices combining needle penetration with radiofrequency coagulation.
- `resurfacing-device` — Resurfacing devices: Reserved for future direct comparisons of energy-based resurfacing devices.
- `hydradermabrasion-procedure` — Hydradermabrasion procedures: Branded superficial facial procedures combining exfoliation, suction, and topical delivery.

## Requested launch comparisons

1. [Botox vs. Dysport](../../src/routes/compare.$slug.tsx) — `botox-vs-dysport`, direct, featured and indexable
2. [Botox vs. dermal fillers](../../src/routes/compare.$slug.tsx) — `botox-vs-dermal-fillers`, different_approach, featured and indexable
3. [Juvéderm vs. Restylane](../../src/routes/compare.$slug.tsx) — `juvederm-vs-restylane`, direct, featured and indexable
4. [Juvéderm Voluma vs. Restylane Kysse](../../src/routes/compare.$slug.tsx) — `juvederm-voluma-vs-restylane-kysse`, direct, featured and indexable
5. [Sculptra vs. Radiesse](../../src/routes/compare.$slug.tsx) — `sculptra-vs-radiesse`, direct, featured and indexable
6. [Thermage FLX vs. Ultherapy](../../src/routes/compare.$slug.tsx) — `thermage-vs-ultherapy`, direct, featured and indexable
7. [Morpheus8 vs. Potenza](../../src/routes/compare.$slug.tsx) — `morpheus8-vs-potenza`, direct, featured and indexable
8. [HydraFacial vs. DiamondGlow](../../src/routes/compare.$slug.tsx) — `hydrafacial-vs-diamondglow`, direct, featured and indexable

## Artifact coverage

- 21 treatment entities
- 403 claim-level treatment-source records
- 15 treatment market mappings (published launch profiles only)
- 24 treatment-to-comparison-group mappings
- 8 featured comparisons
- 58 published regional price estimates across nine requested regions
- 61 postal-prefix mappings
- 15 non-publishable original-asset briefs and zero rights-cleared media assets
