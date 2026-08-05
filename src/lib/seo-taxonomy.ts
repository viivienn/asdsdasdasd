import type { Treatment } from "./content-types.ts";

export type LandingKind = "concern" | "class";

export type LandingConfig = {
  kind: LandingKind;
  slug: string;
  label: string;
  definition: string;
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
      "Expression lines are facial lines associated with repeated muscle movement. This page organizes the source-backed treatment records in the catalog that are classified for that concern.",
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
      "Volume and contour is a catalog category for source-backed profiles that discuss facial fullness, structural support, or contour as a primary purpose.",
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
      "Lift and tighten groups source-backed profiles for energy-based approaches whose records discuss skin firmness, tightening, or lifting.",
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
      "Texture and pores is a catalog category for source-backed profiles that discuss resurfacing, exfoliation, microneedling, or surface-quality goals.",
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
