import type { Treatment } from "./content-types.ts";

export type LandingKind = "concern" | "class";

export type LandingConfig = {
  kind: LandingKind;
  slug: string;
  label: string;
  definition: string;
  howItWorks: string;
  keyDifferences?: string;
  commonMistakes?: string;
  limitations: string;
  providerConsiderations: string;
  keywords: string[];
  aliases?: string[];
};

export const CONCERN_LANDINGS: LandingConfig[] = [
  {
    kind: "concern",
    slug: "expression-lines",
    label: "Expression lines",
    definition:
      "Expression lines are facial lines associated with repeated muscle movement, such as frown lines, forehead lines, and lines at the outer corners of the eyes.",
    howItWorks:
      "Neuromodulator products temporarily reduce activity in selected injected muscles. They do not add volume or resurface the skin, so a line that remains when the face is at rest may involve a different or additional concern.",
    limitations:
      "A public catalog cannot determine whether a line is movement-related, static, or caused by another factor, and it cannot establish personal treatment suitability.",
    providerConsiderations:
      "Product selection, treatment area, technique, medical history, and the result that is realistic for an individual remain provider-dependent.",
    keywords: ["neuromodulator", "botulinum toxin"],
  },
  {
    kind: "concern",
    slug: "volume-and-contour",
    aliases: ["volume-contour"],
    label: "Volume and contour",
    definition:
      "Volume and contour describes changes in facial fullness, projection, shape, or structural support rather than changes caused primarily by muscle movement.",
    howItWorks:
      "Hyaluronic acid fillers place gel for product- and area-specific volume or contour. Biostimulator profiles describe a tissue-response component and may develop on a different timeline. The material, treatment area, and reversibility therefore matter more than the broad label alone.",
    limitations:
      "Treatments grouped here can use different materials and mechanisms and should not be assumed to be interchangeable.",
    providerConsiderations:
      "Anatomy, treatment area, material, placement, quantity, reversibility, and future treatment plans require an individual clinical discussion.",
    keywords: ["filler", "biostimulator", "collagen stimulator", "volume", "contour"],
  },
  {
    kind: "concern",
    slug: "lift-and-tighten",
    aliases: ["lift-tighten"],
    label: "Lift and tighten",
    definition:
      "Lift and tighten is a broad goal used for treatments intended to improve skin firmness or create a modest lifting effect without adding filler volume.",
    howItWorks:
      "Noninvasive devices may use radiofrequency or focused ultrasound, while radiofrequency microneedling combines needles with RF energy. Those approaches differ in delivery method, treatment depth, downtime, and protocol variables and are not equivalent to surgery.",
    limitations:
      "The words “lift” and “tighten” do not establish the magnitude of change, and treatments in this category can use different technologies and treatment depths.",
    providerConsiderations:
      "Device model, treatment area, settings, technique, anatomy, and expectations remain provider-dependent.",
    keywords: ["energy device", "tightening", "ultrasound", "radiofrequency", "rf microneedling"],
  },
  {
    kind: "concern",
    slug: "texture-and-pores",
    aliases: ["texture-pores"],
    label: "Texture and pores",
    definition:
      "Texture and pores describes surface irregularity, roughness, or the visible appearance of pores rather than one diagnosis with one standard treatment.",
    howItWorks:
      "Superficial facials exfoliate or remove surface debris and can create a temporary polished appearance. RF microneedling creates controlled needle channels and delivers energy below the surface, so its recovery and risk profile differ from a hydradermabrasion-style facial.",
    limitations:
      "Texture concerns can have different causes, and a public page cannot determine which approach, if any, fits an individual.",
    providerConsiderations:
      "Technology, treatment intensity, skin history, skin tone, downtime tolerance, and complication planning require individual assessment.",
    keywords: ["facial", "exfoliation", "microneedling", "resurfacing", "texture", "pores"],
  },
];

export const CLASS_LANDINGS: LandingConfig[] = [
  {
    kind: "class",
    slug: "neuromodulators",
    label: "Neuromodulators",
    definition:
      "Neuromodulators are the catalog class for published botulinum-toxin injectable profiles. Each product retains its own regulatory, formulation, unit, and source record.",
    howItWorks:
      "Botulinum toxin products act at the neuromuscular junction to temporarily reduce activity in specifically injected muscles.",
    keyDifferences:
      "Products differ in formulation, labelled treatment areas, dosing instructions, and potency units. The visible result also depends on the muscle pattern, treatment area, dose, and technique.",
    commonMistakes:
      "Do not convert units between products or assume that the lowest advertised per-unit price represents an equivalent dose or total treatment.",
    limitations:
      "Products in this class are not interchangeable by name or potency unit, and this directory does not establish dose equivalence.",
    providerConsiderations:
      "Product, treatment area, dosing, technique, contraindications, and expected result require a qualified clinician.",
    keywords: ["neuromodulator", "botulinum toxin"],
  },
  {
    kind: "class",
    slug: "hyaluronic-acid-dermal-fillers",
    label: "Hyaluronic acid dermal fillers",
    definition:
      "This class groups published hyaluronic-acid filler families and products while preserving their product-specific intended uses and source records.",
    howItWorks:
      "Hyaluronic acid filler gel is injected beneath the skin to add or restore volume, shape, or support in product-specific treatment areas.",
    keyDifferences:
      "Filler families contain multiple products with different technologies, textures, labelled areas, and expected duration. A named lip product and a named cheek product are not direct substitutes simply because both contain hyaluronic acid.",
    commonMistakes:
      "Do not compare family names or syringe prices without identifying the exact product, treatment area, amount, and treatment plan.",
    limitations:
      "A family name does not make every product suitable for the same area or purpose, and products should not be compared only by syringe price.",
    providerConsiderations:
      "Product selection, treatment plane, quantity, anatomy, reversibility planning, and complication management remain provider-dependent.",
    keywords: ["hyaluronic acid", "dermal filler", "ha filler"],
  },
  {
    kind: "class",
    slug: "biostimulators",
    label: "Biostimulators",
    definition:
      "Biostimulators groups published injectable profiles whose records describe a tissue response or collagen-stimulating component.",
    howItWorks:
      "These products contain different materials that can support a tissue response after injection. Some also provide an immediate carrier-gel effect, while others are described primarily through gradual change.",
    keyDifferences:
      "Material, preparation, placement, immediate volume, treatment course, timing, and management of unwanted outcomes differ among products.",
    commonMistakes:
      "Do not assume every collagen-stimulating injectable produces the same immediate effect, follows the same session schedule, or can be dissolved with hyaluronidase.",
    limitations:
      "The products in this class use different materials and should not be assumed to have identical timing, placement, or effects.",
    providerConsiderations:
      "Product, dilution or preparation, placement, treatment course, anatomy, and management of unwanted outcomes require clinical judgment.",
    keywords: ["biostimulator", "collagen stimulator"],
  },
  {
    kind: "class",
    slug: "radiofrequency-microneedling",
    label: "Radiofrequency microneedling",
    definition:
      "Radiofrequency microneedling groups published device profiles that combine needles with radiofrequency energy delivery.",
    howItWorks:
      "Needles enter the skin and deliver radiofrequency energy at settings chosen for the device, tip, depth, treatment area, and protocol.",
    keyDifferences:
      "Platforms can differ in handpieces, needle configurations, insulated or non-insulated delivery, energy modes, software, and cleared indications.",
    commonMistakes:
      "Do not treat a device name as a complete protocol. Depth, energy, passes, area, anesthesia, and operator technique can materially change the experience and risk profile.",
    limitations:
      "Device names do not describe one universal protocol; configurations, depth, energy, tips, and treatment areas can differ.",
    providerConsiderations:
      "Device model, settings, passes, depth, anesthesia, skin history, and complication planning remain provider-dependent.",
    keywords: ["rf microneedling", "radiofrequency microneedling"],
  },
  {
    kind: "class",
    slug: "noninvasive-skin-tightening-devices",
    label: "Noninvasive skin-tightening devices",
    definition:
      "This class groups published noninvasive energy-device profiles whose records discuss tightening or lifting goals.",
    howItWorks:
      "The published devices deliver energy without needles: Thermage FLX uses monopolar radiofrequency, while Ultherapy uses microfocused ultrasound with imaging.",
    keyDifferences:
      "Energy type, visualization, target depth, applicator or transducer, treatment pattern, discomfort, and area-based protocols differ by device.",
    commonMistakes:
      "Do not equate the words tightening and lifting with a predictable surgical-level change or compare prices without matching the treated area and complete protocol.",
    limitations:
      "Different energy types, devices, treatment depths, and protocols should not be treated as equivalent, and the class name does not predict an individual result.",
    providerConsiderations:
      "Device, treatment area, settings, anatomy, medical history, and expectations remain provider-dependent.",
    keywords: [
      "monopolar radiofrequency",
      "microfocused ultrasound",
      "skin-tightening",
      "skin tightening",
    ],
  },
  {
    kind: "class",
    slug: "hydradermabrasion-and-resurfacing-facials",
    label: "Hydradermabrasion and resurfacing facials",
    definition:
      "This class groups published platform profiles for clinic facials that combine cleansing, exfoliation, extraction, infusion, or resurfacing steps as recorded in their source-backed profiles.",
    howItWorks:
      "These superficial procedures combine mechanical or fluid-assisted exfoliation with suction and topical solution delivery. The handpiece and resurfacing method differ by platform.",
    keyDifferences:
      "Tip design, abrasion method, suction, topical solutions, protocol tier, session length, and included add-ons can differ even when clinics use similar facial labels.",
    commonMistakes:
      "Do not interpret topical infusion as injectable delivery or compare promotional facial names without checking the full protocol and included products.",
    limitations:
      "Protocol names and included steps vary, so session labels and prices are not automatically comparable across platforms or clinics.",
    providerConsiderations:
      "Protocol, treatment intensity, consumables, skin history, and aftercare remain provider-dependent.",
    keywords: ["hydradermabrasion", "dermal infusion", "facial", "resurfacing"],
  },
];

export const LANDINGS = [...CONCERN_LANDINGS, ...CLASS_LANDINGS];

export function landingBasePath(kind: LandingKind) {
  return kind === "concern" ? "/concerns" : "/treatment-classes";
}

export function findLanding(kind: LandingKind, slug: string): LandingConfig | null {
  return (
    LANDINGS.find(
      (entry) =>
        entry.kind === kind && (entry.slug === slug || entry.aliases?.includes(slug) === true),
    ) ?? null
  );
}

export function treatmentSearchText(treatment: Treatment): string {
  return [
    treatment.name,
    treatment.category,
    treatment.treatment_class,
    treatment.summary,
    treatment.primary_purpose,
    treatment.mechanism,
    treatment.what_it_changes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function treatmentMatchesLanding(treatment: Treatment, landing: LandingConfig): boolean {
  const text = treatmentSearchText(treatment);
  return landing.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function relatedLandingsForTreatment(treatment: Treatment) {
  return LANDINGS.filter((landing) => treatmentMatchesLanding(treatment, landing));
}
