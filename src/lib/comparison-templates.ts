// Comparison row templates.
//
// Different kinds of pairs deserve different rows: two neuromodulator brands
// are compared on dosing and onset, two lifting devices on energy type and
// tissue depth. A cross-category pair is explicitly not like-for-like.
import type { EntityType, Treatment } from "./content-types";

export type TemplateId =
  | "neuromodulator_brands"
  | "filler_families"
  | "filler_products"
  | "lifting_devices"
  | "resurfacing_devices"
  | "cross_category";

export interface DetailSection {
  id: string;
  title: string;
  keys: ReadonlyArray<keyof Treatment>;
}

export interface RowTemplate {
  id: TemplateId;
  label: string;
  /** Short attributes shown in the at-a-glance card. */
  glance: ReadonlyArray<{ key: keyof Treatment; label: string }>;
  sections: ReadonlyArray<DetailSection>;
  /** Rendered when the two records are not directly interchangeable. */
  likeForLike: boolean;
}

const RISK_SECTION: DetailSection = {
  id: "risks",
  title: "Risks and limitations",
  keys: [
    "major_risks",
    "most_likely_disappointment",
    "when_not_appropriate",
    "provider_variables",
    "skin_tone_notes",
  ],
};

const EVIDENCE_SECTION: DetailSection = {
  id: "evidence",
  title: "Evidence and regulatory status",
  keys: ["fda_status", "evidence_grade"],
};

export const TEMPLATES: Record<TemplateId, RowTemplate> = {
  neuromodulator_brands: {
    id: "neuromodulator_brands",
    label: "Neuromodulator brands",
    likeForLike: true,
    glance: [
      { key: "generic_name", label: "Active ingredient" },
      { key: "manufacturer", label: "Manufacturer" },
      { key: "result_timing", label: "Onset" },
      { key: "longevity_text", label: "Duration" },
    ],
    sections: [
      {
        id: "dosing",
        title: "Dosing and behaviour",
        keys: ["mechanism", "sessions_text", "expected_result_magnitude", "what_it_changes"],
      },
      {
        id: "experience",
        title: "Treatment experience",
        keys: ["appointment_time", "pain_level", "downtime_text", "bruising_text"],
      },
      RISK_SECTION,
      EVIDENCE_SECTION,
    ],
  },
  filler_families: {
    id: "filler_families",
    label: "Filler brand families",
    likeForLike: true,
    glance: [
      { key: "generic_name", label: "Base material" },
      { key: "manufacturer", label: "Manufacturer" },
      { key: "longevity_text", label: "Typical longevity" },
      { key: "reversibility", label: "Reversibility" },
    ],
    sections: [
      {
        id: "range",
        title: "Range and formulation",
        keys: ["mechanism", "adds_volume", "what_it_changes", "what_it_does_not_change"],
      },
      {
        id: "experience",
        title: "Treatment experience",
        keys: ["appointment_time", "pain_level", "downtime_text", "swelling_text"],
      },
      RISK_SECTION,
      EVIDENCE_SECTION,
    ],
  },
  filler_products: {
    id: "filler_products",
    label: "Specific filler products",
    likeForLike: true,
    glance: [
      { key: "generic_name", label: "Gel and anaesthetic" },
      { key: "treatment_class", label: "Firmness class" },
      { key: "longevity_text", label: "Typical longevity" },
      { key: "reversibility", label: "Reversibility" },
    ],
    sections: [
      {
        id: "placement",
        title: "Placement and effect",
        keys: ["primary_purpose", "adds_volume", "expected_result_magnitude", "what_it_changes"],
      },
      {
        id: "experience",
        title: "Treatment experience",
        keys: ["appointment_time", "pain_level", "downtime_text", "swelling_text", "bruising_text"],
      },
      RISK_SECTION,
      EVIDENCE_SECTION,
    ],
  },
  lifting_devices: {
    id: "lifting_devices",
    label: "Lifting and tightening devices",
    likeForLike: true,
    glance: [
      { key: "treatment_class", label: "Energy type" },
      { key: "sessions_text", label: "Typical sessions" },
      { key: "result_timing", label: "Results appear" },
      { key: "longevity_text", label: "Durability" },
    ],
    sections: [
      {
        id: "mechanism",
        title: "Energy and depth",
        keys: ["mechanism", "tightening_level", "what_it_changes", "what_it_does_not_change"],
      },
      {
        id: "experience",
        title: "Session and recovery",
        keys: ["appointment_time", "pain_level", "downtime_text", "swelling_text"],
      },
      RISK_SECTION,
      EVIDENCE_SECTION,
    ],
  },
  resurfacing_devices: {
    id: "resurfacing_devices",
    label: "Resurfacing treatments",
    likeForLike: true,
    glance: [
      { key: "treatment_class", label: "Mechanism" },
      { key: "sessions_text", label: "Typical sessions" },
      { key: "downtime_text", label: "Downtime" },
      { key: "longevity_text", label: "How long it lasts" },
    ],
    sections: [
      {
        id: "mechanism",
        title: "How the skin is treated",
        keys: ["mechanism", "what_it_changes", "what_it_does_not_change", "expected_result_magnitude"],
      },
      {
        id: "experience",
        title: "Session and recovery",
        keys: ["appointment_time", "pain_level", "downtime_text", "exercise_restrictions"],
      },
      RISK_SECTION,
      EVIDENCE_SECTION,
    ],
  },
  cross_category: {
    id: "cross_category",
    label: "Different categories",
    likeForLike: false,
    glance: [
      { key: "category", label: "Category" },
      { key: "primary_purpose", label: "Generally used for" },
      { key: "result_timing", label: "Results appear" },
      { key: "longevity_text", label: "Typically lasts" },
    ],
    sections: [
      {
        id: "purpose",
        title: "Purpose and mechanism",
        keys: [
          "mechanism",
          "what_it_changes",
          "what_it_does_not_change",
          "adds_volume",
          "tightening_level",
          "true_substitute_notes",
        ],
      },
      {
        id: "experience",
        title: "Sessions, downtime and recovery",
        keys: ["sessions_text", "appointment_time", "pain_level", "downtime_text", "swelling_text"],
      },
      { id: "longevity", title: "Longevity and reversibility", keys: ["longevity_text", "reversibility"] },
      RISK_SECTION,
      EVIDENCE_SECTION,
    ],
  },
};

function isNeuromodulator(t: Treatment) {
  return /neuromodulator|botulinum/i.test(`${t.category} ${t.treatment_class}`);
}

function isFiller(t: Treatment) {
  return /filler|hyaluronic/i.test(`${t.category} ${t.treatment_class}`);
}

function isResurfacing(t: Treatment) {
  return /facial|exfoliation|dermabrasion|microneedling/i.test(
    `${t.category} ${t.treatment_class}`,
  );
}

function isLifting(t: Treatment) {
  return /energy device|radiofrequency|ultrasound/i.test(`${t.category} ${t.treatment_class}`);
}

function sameFamily(a: Treatment, b: Treatment) {
  return a.category.toLowerCase() === b.category.toLowerCase();
}

/**
 * Resolves the row template for a pair. An explicit `row_template` on the
 * comparison record always wins; otherwise the template is derived from the
 * entity types and categories of the two records.
 */
export function resolveTemplate(
  a: Treatment | null,
  b: Treatment | null,
  stored?: string | null,
): RowTemplate {
  if (stored && stored in TEMPLATES) return TEMPLATES[stored as TemplateId];
  if (!a || !b) return TEMPLATES.cross_category;

  if (isNeuromodulator(a) && isNeuromodulator(b)) return TEMPLATES.neuromodulator_brands;

  if (isFiller(a) && isFiller(b)) {
    const productish: EntityType[] = ["product"];
    const bothProducts =
      productish.includes(a.entity_type) && productish.includes(b.entity_type);
    return bothProducts ? TEMPLATES.filler_products : TEMPLATES.filler_families;
  }

  if (isResurfacing(a) && isResurfacing(b)) return TEMPLATES.resurfacing_devices;
  if (isLifting(a) && isLifting(b)) return TEMPLATES.lifting_devices;
  if (sameFamily(a, b)) return TEMPLATES.cross_category;
  return TEMPLATES.cross_category;
}