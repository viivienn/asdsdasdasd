// Client-safe shared types and helpers for editorial content.

export type PublicationStatus = "draft" | "review" | "published";

export interface Treatment {
  id: string;
  name: string;
  slug: string;
  category: string;
  treatment_class: string;
  brand_name: string | null;
  generic_name: string | null;
  summary: string | null;
  primary_purpose: string | null;
  mechanism: string | null;
  adds_volume: string | null;
  tightening_level: string | null;
  result_timing: string | null;
  sessions_text: string | null;
  downtime_text: string | null;
  longevity_text: string | null;
  pain_level: string | null;
  reversibility: string | null;
  major_risks: string | null;
  most_likely_disappointment: string | null;
  marketing_misconception: string | null;
  provider_variables: string | null;
  skin_tone_notes: string | null;
  fda_status: string | null;
  evidence_grade: string | null;
  last_reviewed_at: string | null;
  publication_status: PublicationStatus;
  is_sample: boolean;
}

export interface TreatmentSource {
  id: string;
  claim_field: string;
  source_title: string;
  source_url: string;
  source_type: string;
  publication_date: string | null;
  evidence_level: string | null;
}

export interface Comparison {
  id: string;
  slug: string;
  one_sentence_difference: string | null;
  consider_a_when: string | null;
  consider_b_when: string | null;
  neither_when: string | null;
  common_misconception: string | null;
  publication_status: PublicationStatus;
  is_sample: boolean;
  last_reviewed_at: string | null;
}

export interface PriceObservation {
  id: string;
  clinic_name: string;
  clinic_website: string | null;
  currency: string;
  advertised_amount: string;
  regular_amount: string | null;
  pricing_unit: string;
  quantity: string | null;
  effective_unit_price: string | null;
  treatment_area: string | null;
  starts_at_price: boolean;
  membership_required: boolean;
  new_customer_only: boolean;
  minimum_purchase: string | null;
  manufacturer_reward_required: boolean;
  conditions: string | null;
  source_url: string;
  observed_at: string;
  verification_status: string;
}

/** Rows in the comparison table, in fixed editorial order. */
export const COMPARISON_ROWS = [
  { key: "primary_purpose", label: "What it is generally used for" },
  { key: "mechanism", label: "How it works" },
  { key: "adds_volume", label: "Adds volume" },
  { key: "tightening_level", label: "Tightening effect" },
  { key: "result_timing", label: "When results appear" },
  { key: "sessions_text", label: "Typical number of sessions" },
  { key: "downtime_text", label: "Downtime" },
  { key: "longevity_text", label: "How long it lasts" },
  { key: "pain_level", label: "Reported discomfort" },
  { key: "reversibility", label: "Reversibility" },
  { key: "major_risks", label: "Documented risks" },
  { key: "fda_status", label: "Regulatory status" },
] as const satisfies ReadonlyArray<{ key: keyof Treatment; label: string }>;

export const TREATMENT_PROFILE_ROWS = [
  { key: "primary_purpose", label: "Primary purpose" },
  { key: "mechanism", label: "Mechanism" },
  { key: "result_timing", label: "When results appear" },
  { key: "sessions_text", label: "Typical sessions" },
  { key: "downtime_text", label: "Downtime" },
  { key: "longevity_text", label: "Longevity" },
  { key: "pain_level", label: "Reported discomfort" },
  { key: "reversibility", label: "Reversibility" },
  { key: "major_risks", label: "Documented risks" },
  { key: "most_likely_disappointment", label: "Most common disappointment" },
  { key: "marketing_misconception", label: "Common marketing misconception" },
  { key: "provider_variables", label: "What varies by provider" },
  { key: "skin_tone_notes", label: "Skin-tone considerations" },
  { key: "fda_status", label: "Regulatory status" },
] as const satisfies ReadonlyArray<{ key: keyof Treatment; label: string }>;

/**
 * Comparison slugs are permanent URLs. Display order is taken from the slug so
 * the stored canonical pair order (a_id < b_id) never leaks into the UI.
 */
export const COMPARISON_DISPLAY_ORDER: Record<string, [string, string]> = {
  "sculptra-vs-radiesse": ["sculptra", "radiesse"],
  "sculptra-vs-ha-filler": ["sculptra", "ha-filler"],
  "botox-vs-dysport": ["botox", "dysport"],
  "thermage-vs-ultherapy": ["thermage-flx", "ultherapy"],
  "morpheus8-vs-ultherapy": ["morpheus8", "ultherapy"],
};

export const COMPARISON_SLUGS = Object.keys(COMPARISON_DISPLAY_ORDER);