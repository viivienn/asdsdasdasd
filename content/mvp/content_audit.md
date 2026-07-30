# Source-backed MVP content audit

Research completed: 2026-07-29  
Experience: one universal United States and Canada website, with no country tabs

## Outcome

The pack completes the 15 comparison subjects required for the eight launch pairs, adds the missing `restylane-kysse` and `potenza` records, refreshes outdated regulatory wording, creates claim-level source rows, and adds comparison, market, price, postal, and media metadata.

All 15 launch profiles meet the repository’s publication gate. Nulls remain where a field could not be supported responsibly: notably most `pain_level` values and durable longevity for RF microneedling and superficial facials. A null is preferable to a clinic-derived or marketing-derived estimate.

No clinic page was used for a clinical mechanism, regulatory indication, contraindication, product equivalence, dosing conversion, or treatment-suitability claim. Clinic and marketplace pages are used only in the regional-price dataset.

## Research hierarchy

1. FDA prescribing information, approval letters, PMA/SSED records, 510(k) summaries, device listings, and safety communications.
2. Health Canada Drug Product Database and Medical Devices Active Licence Listing.
3. Official manufacturer prescribing information, patient labelling, and instructions for use.
4. Peer-reviewed systematic reviews when a label does not establish comparative magnitude, discomfort, or evidence quality.
5. Clinic menus, booking pages, and credible marketplaces only for public price observations.

The FDA treats dermal-filler approval as product- and indication-specific, not as a class-wide approval ([FDA dermal fillers](https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/dermal-fillers-soft-tissue-fillers), [FDA-approved fillers](https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/fda-approved-dermal-fillers)). Health Canada’s MDALL similarly provides active licences for Class II–IV devices, while Class I devices do not receive an MDALL device licence ([Health Canada MDALL guidance](https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/licences/medical-devices-active-licence-listing.html)).

## Entity findings

### Botox vs. Dysport

Botox Cosmetic’s current US label includes glabellar, lateral-canthal, forehead, and platysma-band indications and describes onabotulinumtoxinA’s SNAP-25 mechanism, boxed warning, contraindications, and approximately three-to-four-month glabellar effect ([FDA Botox Cosmetic label](https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/103000s5316s5319s5323s5326s5331lbl.pdf)). Health Canada lists Botox Cosmetic DIN 02531445 as approved ([Health Canada DPD](https://health-products.canada.ca/dpd-bdpp/info?code=102058&lang=eng)).

Dysport’s US cosmetic indication remains moderate-to-severe glabellar lines in adults younger than 65, with retreatment no more often than every three months. Its label explicitly states that potency units are not interchangeable with another botulinum toxin product ([FDA Dysport label](https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/125274s123lbl.pdf)). Health Canada lists Dysport Aesthetic DIN 02387735 as marketed ([Health Canada DPD](https://health-products.canada.ca/dpd-bdpp/info?code=87332&lang=eng)).

No onset-superiority or dose-conversion claim is published. Regional prices retain each brand’s raw units.

### Botox vs. dermal fillers

This is a `different_approach` comparison between the Botox product and the `ha-filler` class. The profile rows carry the distinction:

- Botox reduces selected muscle activity and does not add volume.
- HA filler occupies soft-tissue space and does not reduce muscle contraction.
- Botox is not immediately reversible.
- Many HA fillers may often be reduced with clinician-administered hyaluronidase, but that use is off-label in the US and complete reversal is not guaranteed ([review of hyaluronidase use](https://pmc.ncbi.nlm.nih.gov/articles/PMC5242216/)).

The comparison’s recommendation, winner, candidate, and “best for” fields are null. FDA safety guidance supports the filler vascular-risk language, including rare necrosis, blindness, and stroke ([FDA filler safety guidance](https://www.fda.gov/consumers/consumer-updates/dermal-filler-dos-and-donts-wrinkles-lips-and-more)).

### Juvéderm vs. Restylane

Both are brand families, not single products. The Juvéderm manufacturer page enumerates distinct products and treatment areas ([Juvéderm treatment areas](https://www.juvederm.com/treatment-areas)); Restylane does the same for its portfolio ([Restylane products and areas](https://www.restylaneusa.com/explore-restylane)). The audit therefore rejects family-wide duration, equivalence, or superiority claims.

FDA status is described through product-specific PMAs rather than a family approval ([Juvéderm PMA example](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P050047S052), [Restylane PMA P040024](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P040024)). Health Canada company records show active Class III device licences for both portfolios ([Allergan MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=112685&lang=eng), [Q-Med MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=108608&lang=eng)).

### Juvéderm Voluma vs. Restylane Kysse

The pair is intentionally allowed even though the intended areas differ. Voluma’s current US labelling covers deep structural augmentation of cheeks, chin, and temples and describes its 20 mg/mL cross-linked HA formulation with lidocaine ([Voluma IFU](https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S070C.pdf), [FDA PMA P110033/S070](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P110033S070)).

Kysse is approved for lip augmentation and upper perioral rhytids, with a pivotal-study 60% responder rate at week 48 ([FDA PMA P140029/S021](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P140029S021), [FDA SSED](https://www.accessdata.fda.gov/cdrh_docs/pdf14/P140029S021B.pdf), [Kysse IFU](https://www.restylaneusa.com/docs/Restylane-Kysse-IFU)).

The profiles explicitly state that they are not true substitutes. Health Canada lists Voluma with lidocaine under licence 77899 and Kysse under licence 95283 in the manufacturers’ active MDALL records ([Allergan MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=112685&lang=eng), [Q-Med MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=108608&lang=eng)).

### Sculptra vs. Radiesse

Sculptra is PLLA-SCA and develops gradually over a typical two-to-three-session course; the current US information includes cheek fine lines and wrinkles and warns about papules, nodules, granuloma, and vascular injection ([Sculptra IFU](https://www.sculptrausa.com/docs/Sculptra-e-IFU), [FDA PMA P030050/S039](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMA/pma.cfm?id=P030050S039), [FDA SSED](https://www.accessdata.fda.gov/cdrh_docs/pdf3/P030050S039B.pdf)).

Radiesse contains calcium-hydroxylapatite microspheres in a gel carrier and provides immediate filler volume before a longer tissue response. It is not dissolvable with hyaluronidase ([Radiesse (+) IFU](https://radiesse.com/app/uploads/2024/04/instructions-for-use-radiesse-plus-lidocaine.pdf), [FDA PMA family](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P050052S148)).

Health Canada lists active Class III licences for Sculptra 71658, Radiesse 78893, and Radiesse (+) 95140 ([Q-Med MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=108608&lang=eng), [Merz MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=116080&lang=eng)).

### Thermage FLX vs. Ultherapy

Thermage FLX uses 6.78 MHz monopolar radiofrequency with surface cooling and controlled tissue coagulation ([FDA 510(k) K170758](https://www.accessdata.fda.gov/cdrh_docs/pdf17/K170758.pdf)). Manufacturer duration language is labelled as a manufacturer estimate rather than independent certainty ([Thermage](https://www.thermage.com/)). A systematic review supports describing efficacy as modest and heterogeneous rather than facelift-like ([systematic review](https://pubmed.ncbi.nlm.nih.gov/35877937/)).

Ultherapy uses imaging-guided microfocused ultrasound and has US clearances for brow, submental, and neck lifting and décolletage lines ([FDA K121700](https://www.accessdata.fda.gov/cdrh_docs/pdf12/K121700.pdf), [FDA K134032](https://www.accessdata.fda.gov/cdrh_docs/pdf13/k134032.pdf), [Ultherapy IFU](https://ultherapy.com/app/uploads/2023/02/1015107_Ultherapy_IFU_2023.pdf)). Systematic reviews support modest results, moderate average discomfort, and mostly transient adverse events, with protocols and follow-up varying ([2024 meta-analysis](https://pubmed.ncbi.nlm.nih.gov/39540440/), [2023 review](https://pubmed.ncbi.nlm.nih.gov/36674277/)).

Health Canada lists Thermage FLX licence 112966 and the Ulthera System licence 79689 ([Solta MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=126264&lang=eng), [Ulthera MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=128516&lang=eng)).

### Morpheus8 vs. Potenza

Morpheus8’s K231790 record supports specified electrocoagulation, hemostasis, and soft-tissue coagulation/contraction uses and limits energy above 62 mJ per pin to Fitzpatrick I–IV ([FDA K231790](https://www.accessdata.fda.gov/cdrh_docs/pdf23/K231790.pdf)).

Potenza’s K192545 clearance is narrower: dermatologic and general surgical procedures for electrocoagulation and hemostasis. It is not rewritten as an FDA-cleared wrinkle, acne-scar, or skin-tightening indication ([FDA K192545](https://www.accessdata.fda.gov/cdrh_docs/pdf19/K192545.pdf)). Tip and mode variety comes from manufacturer technical material and is not used as proof of superiority ([Potenza physician brochure](https://www.cynosure.com/wp-content/uploads/2021/04/PRD_4362_Potenza-Physician-Brochure-Fusion-Tip-web.pdf)).

The FDA’s October 2025 safety communication reports serious complications with certain RF-microneedling uses, including burns, scarring, fat loss, disfigurement, and nerve damage ([FDA safety communication](https://www.fda.gov/medical-devices/safety-communications/potential-risks-certain-uses-radiofrequency-rf-microneedling-fda-safety-communication)). Health Canada active records include InMode Morpheus8 configurations and Potenza licence 106699 ([InMode MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=129694&lang=eng), [Jeisys MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=132079&lang=eng)).

### HydraFacial vs. DiamondGlow

HydraFacial combines superficial exfoliation, suction, and topical-fluid delivery according to the manufacturer’s treatment description and model-specific eIFU hub ([HydraFacial treatment](https://hydrafacial.com/treatment/), [HydraFacial eIFU](https://www.hydrafacial.com/pages/electronic-instructions-for-use-eifu)). A HydraFacial-branded PMA, De Novo, or 510(k) indication was not identified in the FDA databases during this review, so the procedure is not described as “FDA approved.” Health Canada’s active record lists microdermabrasion systems under Class II licence 79154 ([HydraFacial MDALL](https://health-products.canada.ca/mdall-limh/information?companyId=120660&lang=eng)).

DiamondGlow uses diamond-tip superficial abrasion, suction, and simultaneous topical delivery ([DiamondGlow mechanism](https://www.diamondglow.com/how-it-works/), [DiamondGlow FAQ](https://www.diamondglow.com/faq/)). FDA records list the underlying Envy Medical/SilkPeel/Dermalinfusion powered-dermabrasion family as Class I product code GFE, and a device report identifies the pathway as 510(k)-exempt ([FDA device listing](https://www.accessdata.fda.gov/scrIpts/cdrh/cfdocs/cfRL/rl.cfm?lid=964029&lpcd=GFE), [FDA MAUDE record](https://www.accessdata.fda.gov/scripts/cdrh/cfmaude/detail.cfm?mdrfoi__id=9919070&pc=GFE)).

No durable longevity is published for either facial. Both profiles limit the expected result to temporary superficial cosmetic improvement.

## Comparison and market audit

All eight requested comparisons are featured and indexable only after the two sourced profiles exist:

1. Botox vs. Dysport
2. Botox vs. dermal fillers
3. Juvéderm vs. Restylane
4. Juvéderm Voluma vs. Restylane Kysse
5. Sculptra vs. Radiesse
6. Thermage FLX vs. Ultherapy
7. Morpheus8 vs. Potenza
8. HydraFacial vs. DiamondGlow

Every launch treatment and comparison maps to both `US` and `CA`. This is availability/regulatory metadata inside one universal route system, not a country switcher.

The controlled intended-area values are stored on profiles. Voluma and Kysse remain comparable because both are specific HA products, while `true_substitute_notes` and the highlighted area rows prevent an equivalence inference.

## Regional price methodology

Regular public pricing is isolated from promotions, memberships, new-patient offers, and packages. For example, the Bay Area source set distinguishes Nob Hill’s regular and member Botox prices ([Nob Hill](https://nobhillaesthetics.com/pages/botox)); Los Angeles keeps Skinsation’s regular and member columns separate ([Skinsation](https://skinsationla.com/membership/)); Toronto keeps Signature’s single and package columns separate ([Signature](https://signaturemedispa.com/price-list/)); and Montreal uses Elle’s regular rather than trial prices ([Elle](https://elle.clinic/our-price-list/)).

Representative current regional sources include:

- San Francisco Bay Area: [Epi Center](https://epicentermedspa.com/botox-and-dysport/), [Nob Hill Aesthetics](https://nobhillaesthetics.com/pages/fillers/), [Serenity](https://serenitymedspa.com/specials/)
- Los Angeles: [DermFX](https://www.dermfx.com/pricing/), [My Med Spa LA](https://www.mymedspala.com/pricing), [Go Smooch](https://www.gosmoochla.com/pricing-face), [2026 LA directory methodology](https://medicalspareviews.com/guides/med-spa-pricing-los-angeles-2026/)
- New York City: [Elite Aesthetics](https://eliteaestheticsnyc.com/pricing/), [Ratio NYC](https://www.ratio.nyc/pricing), [PBK Medspa](https://pbkmedspa.com/pricing/)
- Miami: [4Beauty](https://4beautymedspa.com/menu/), [Miami Skin Spa](https://www.miamiskinspa.com/pricing/), [2026 Miami market index](https://medspafind.com/blog/best-med-spas-in-miami-2026)
- Austin: [The Med Spa Austin](https://www.themedspaaustin.com/wp-content/uploads/2024/03/2024-Medspa-Austin-Menu.pdf), [Austin MD](https://austinmdclinic.com/pricing/), [Austin Plastic Surgeon](https://www.austinplasticsurgeon.com/about/pricing/medspa/), [Vetiver HydraFacial](https://www.vetiverskinstudio.com/hydrafacial)
- Chicago: [Chicago Aesthetics](https://chicagoaesthetics.com/treatment-pricing/), [Shah Facial Plastics](https://www.shahfacialplastics.com/pricing/), [Stay Beautiful](https://staybeautifulmedspa.com/wp-content/uploads/2025/01/Price-List.pdf)
- Toronto: [Signature](https://signaturemedispa.com/price-list/), [ART Clinic](https://www.artclinic.ca/pricing), [Precision Esthetics](https://precision-estheticsinc.com/med-spa/), [Bar Beauty Morpheus8](https://barbeauty.ca/morpheus-8-cost-toronto-2026/)
- Vancouver: [Medical Rejuvenation Centre](https://mrcbc.com/price-list/), [Azin Yazdani](https://www.azinyazdani.com/book-online), [Vancouver Laser](https://shop.vancouverlaser.com/collections/anti-aging-and-needling)
- Montreal: [Elle](https://elle.clinic/our-price-list/), [Clinique DUÓ](https://cliniqueduo.com/tarifs-et-financement/), [La Clé](https://cliniquelacle.com/en), [Four Seasons HydraFacial](https://www.fourseasons.com/montreal/spa/hydrafacial/)

### Price publication coverage

`P` means the JSON contains a published estimate with at least two usable sources. `—` means the treatment/region cell was researched but withheld because there were too few sources, incompatible areas/units, promotion-only pricing, or quote-only pages.

| Treatment | SF Bay | LA | NYC | Miami | Austin | Chicago | Toronto | Vancouver | Montreal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Botox | P | P | P | P | P | P | P | P | P |
| Dysport | P | P | P | P | P | P | P | — | — |
| HA filler class | P | P | P | P | P | — | P | P | P |
| Juvéderm family | — | — | — | — | — | P | — | — | — |
| Restylane family | — | — | — | — | — | P | — | — | — |
| Juvéderm Voluma | — | P | — | — | P | — | — | — | — |
| Restylane Kysse | P | P | — | — | P | — | — | — | — |
| Sculptra | P | P | P | P | P | P | P | P | P |
| Radiesse | — | P | — | — | P | P | P | P | — |
| Thermage FLX | — | — | — | — | — | — | P | P | — |
| Ultherapy | — | — | — | — | — | — | P | P | — |
| Morpheus8 | — | P | — | P | — | — | P | — | P |
| Potenza | — | — | — | — | — | — | — | — | — |
| HydraFacial | — | — | — | — | P | P | — | — | P |
| DiamondGlow | — | — | — | — | — | — | — | — | — |

The Chicago HA class is represented by separate Juvéderm and Restylane family estimates rather than a pooled class estimate. Potenza and DiamondGlow were often quote-only or had only one regular public price in a city; they remain absent rather than borrowing category prices. Every published estimate includes its own URLs, method, limitations, and research date.

## Media and rights audit

No manufacturer image, before/after photograph, product shot, or clinic media is included. Availability on an official site does not establish reuse rights. `treatment_media.json` recommends original neutral diagrams and states what each illustration must not imply.

The SQL migration deliberately inserts no `treatment_media` rows. Existing media is not deleted or republished. The repository’s public-media gate continues to require a permitted licence plus `rights_verified_at`.

## Migration safety audit

The migration:

- adds `canada_status` and regional-estimate `limitations` additively;
- updates treatment rows by `slug`, preserving existing IDs;
- inserts only missing slugs;
- resolves parents after upsert;
- updates or inserts source rows by treatment, claim field, and URL without creating duplicates;
- inserts mappings with conflict-safe joins;
- canonicalizes comparison IDs with `least`/`greatest` and updates by `pair_key`;
- nulls recommendation fields for the Botox-versus-fillers comparison;
- publishes only rows marked published in this pack;
- does not delete treatments, clinics, locations, offers, submissions, price observations, or existing media;
- removes only obsolete launch-group mappings when the replacement mapping for that same launch entity exists;
- performs no media insert and cannot publish unlicensed media.

## Known limitations and next review

- DPD and MDALL are live registries; licence status and product monographs should be rechecked at the next review.
- Negative FDA database findings for a branded facial are recorded as “not identified in this review,” never as proof that no model record exists.
- Brand-family profiles cannot substitute for checking the exact product IFU.
- Regional prices are snapshots, not quotes. Taxes, consultation fees, injector tier, amount, area, device line/pulse count, and packages can materially change total cost.
- The next medical/regulatory review should occur by 2027-01-29 or sooner after a label, licence, safety communication, or device recall changes.
