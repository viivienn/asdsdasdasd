// Client-safe shared types and helpers for editorial content.

export type PublicationStatus = "draft" | "review" | "published";

export type EntityType = "class" | "brand_family" | "product" | "device" | "procedure";

export const ENTITY_LABEL: Record<EntityType, string> = {
  class: "Treatment class",
  brand_family: "Brand family",
  product: "Product",
  device: "Device",
  procedure: "Procedure",
};

export const ENTITY_GROUP_LABEL: Record<EntityType, string> = {
  class: "Treatment classes",
  brand_family: "Brand families",
  product: "Products",
  device: "Devices & technologies",
  procedure: "Procedures",
};

export const ENTITY_ORDER: EntityType[] = [
  "class",
  "brand_family",
  "product",
  "device",
  "procedure",
];

export interface AtAGlance {
  onset?: string;
  duration?: string;
  downtime?: string;
  discomfort?: string;
  reversibility?: string;
}

/** Ordered fields of the at-a-glance summary card. */
export const GLANCE_FIELDS = [
  { key: "onset", label: "Results appear" },
  { key: "duration", label: "Typically lasts" },
  { key: "downtime", label: "Downtime" },
  { key: "discomfort", label: "Reported discomfort" },
  { key: "reversibility", label: "Reversibility" },
] as const satisfies ReadonlyArray<{ key: keyof AtAGlance; label: string }>;

export interface TreatmentMedia {
  id: string;
  url: string;
  alt_text: string;
  media_role: string;
  credit: string;
  source_url: string;
  license: string;
  license_url: string | null;
}

export interface Treatment {
  id: string;
  name: string;
  slug: string;
  category: string;
  treatment_class: string;
  brand_name: string | null;
  generic_name: string | null;
  manufacturer: string | null;
  entity_type: EntityType;
  parent_id: string | null;
  sort_rank: number;
  at_a_glance: AtAGlance | null;
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
  appointment_time: string | null;
  swelling_text: string | null;
  bruising_text: string | null;
  exercise_restrictions: string | null;
  what_it_changes: string | null;
  what_it_does_not_change: string | null;
  expected_result_magnitude: string | null;
  true_substitute_notes: string | null;
  when_not_appropriate: string | null;
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
  treatment_id?: string;
}

export interface Comparison {
  id: string;
  slug: string;
  one_sentence_difference: string | null;
  consider_a_when: string | null;
  consider_b_when: string | null;
  neither_when: string | null;
  common_misconception: string | null;
  row_template: string | null;
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
  { key: "what_it_changes", label: "What it primarily changes" },
  { key: "what_it_does_not_change", label: "What it does not change" },
  { key: "adds_volume", label: "Adds volume" },
  { key: "tightening_level", label: "Tightening effect" },
  { key: "result_timing", label: "When results appear" },
  { key: "expected_result_magnitude", label: "Expected result magnitude" },
  { key: "sessions_text", label: "Typical number of sessions" },
  { key: "appointment_time", label: "Appointment time" },
  { key: "downtime_text", label: "Downtime" },
  { key: "swelling_text", label: "Swelling" },
  { key: "bruising_text", label: "Bruising" },
  { key: "exercise_restrictions", label: "Exercise restrictions" },
  { key: "longevity_text", label: "How long it lasts" },
  { key: "pain_level", label: "Reported discomfort" },
  { key: "reversibility", label: "Reversibility" },
  { key: "major_risks", label: "Documented risks" },
  { key: "most_likely_disappointment", label: "Most likely disappointment" },
  { key: "provider_variables", label: "Provider-dependent variables" },
  { key: "skin_tone_notes", label: "Skin-tone considerations" },
  { key: "true_substitute_notes", label: "Whether they are true substitutes" },
  { key: "when_not_appropriate", label: "When this treatment may not be appropriate" },
  { key: "fda_status", label: "Regulatory status" },
  { key: "evidence_grade", label: "Evidence status" },
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
  { key: "when_not_appropriate", label: "When this treatment may not be appropriate" },
  { key: "fda_status", label: "Regulatory status" },
  { key: "evidence_grade", label: "Evidence status" },
] as const satisfies ReadonlyArray<{ key: keyof Treatment; label: string }>;

/**
 * The compact "Quick comparison" table shown directly under the bottom line.
 * Deliberately short: the distinctions people ask for most often.
 */
export const QUICK_COMPARISON_ROWS = [
  { key: "primary_purpose", label: "Primary purpose" },
  { key: "treatment_class", label: "Treatment class" },
  { key: "adds_volume", label: "Adds volume" },
  { key: "tightening_level", label: "Tightening effect" },
  { key: "result_timing", label: "Results onset" },
  { key: "sessions_text", label: "Typical sessions" },
  { key: "downtime_text", label: "Downtime" },
  { key: "longevity_text", label: "Longevity" },
  { key: "reversibility", label: "Reversibility" },
  { key: "evidence_grade", label: "Evidence status" },
] as const satisfies ReadonlyArray<{ key: keyof Treatment; label: string }>;

/**
 * Detailed comparison sections. The ids are stable page anchors and are also
 * used for in-page navigation and citation-friendly deep links.
 */
export const COMPARISON_SECTIONS = [
  {
    id: "purpose",
    title: "Purpose and mechanism",
    keys: [
      "primary_purpose",
      "mechanism",
      "what_it_changes",
      "what_it_does_not_change",
      "adds_volume",
      "tightening_level",
      "true_substitute_notes",
    ],
  },
  {
    id: "results",
    title: "Results",
    keys: ["result_timing", "expected_result_magnitude", "sessions_text"],
  },
  {
    id: "experience",
    title: "Treatment experience",
    keys: ["appointment_time", "pain_level"],
  },
  {
    id: "downtime",
    title: "Downtime and recovery",
    keys: ["downtime_text", "swelling_text", "bruising_text", "exercise_restrictions"],
  },
  { id: "longevity", title: "How long results last", keys: ["longevity_text"] },
  { id: "reversibility", title: "Reversibility", keys: ["reversibility"] },
  {
    id: "risks",
    title: "Risks and limitations",
    keys: [
      "major_risks",
      "most_likely_disappointment",
      "when_not_appropriate",
      "provider_variables",
      "skin_tone_notes",
    ],
  },
  {
    id: "evidence",
    title: "Evidence and regulatory status",
    keys: ["fda_status", "evidence_grade"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  keys: ReadonlyArray<keyof Treatment>;
}>;

const ROW_LABELS: Record<string, string> = Object.fromEntries(
  COMPARISON_ROWS.map((r) => [r.key, r.label]),
);

export function comparisonRowLabel(key: keyof Treatment): string {
  return ROW_LABELS[key] ?? String(key).replace(/_/g, " ");
}

/** Publisher shown next to a source, derived from the source URL host. */
export function sourcePublisher(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown publisher";
  }
}

/**
 * Comparison slugs are permanent URLs. Display order is taken from the slug so
 * the stored canonical pair order (a_id < b_id) never leaks into the UI.
 */
export const COMPARISON_DISPLAY_ORDER: Record<string, [string, string]> = {
  "sculptra-vs-radiesse": ["sculptra", "radiesse"],
  "sculptra-vs-ha-filler": ["sculptra", "ha-filler"],
  "botox-vs-dysport": ["botox", "dysport"],
  "thermage-vs-ultherapy": ["thermage", "ultherapy"],
  "morpheus8-vs-ultherapy": ["morpheus8", "ultherapy"],
  "hydrafacial-vs-diamondglow": ["hydrafacial", "diamondglow"],
  "botox-vs-xeomin": ["botox", "xeomin"],
  "botox-vs-daxxify": ["botox", "daxxify"],
  "juvederm-vs-restylane": ["juvederm", "restylane"],
  "juvederm-voluma-vs-restylane-lyft": ["juvederm-voluma", "restylane-lyft"],
  "juvederm-voluma-vs-sculptra": ["juvederm-voluma", "sculptra"],
};

export const COMPARISON_SLUGS = Object.keys(COMPARISON_DISPLAY_ORDER);

export type Region = "us" | "ca" | "both";

/**
 * Curated pairs surfaced as "Popular comparisons", tagged by the market where
 * the pair is commonly searched. Availability differs between the US and
 * Canada, so the two strips are not identical.
 */
export const POPULAR_COMPARISONS: Array<{ slug: string; region: Region }> = [
  { slug: "botox-vs-dysport", region: "both" },
  { slug: "botox-vs-xeomin", region: "both" },
  { slug: "botox-vs-daxxify", region: "us" },
  { slug: "juvederm-vs-restylane", region: "both" },
  { slug: "juvederm-voluma-vs-restylane-lyft", region: "both" },
  { slug: "juvederm-voluma-vs-sculptra", region: "us" },
  { slug: "sculptra-vs-radiesse", region: "both" },
  { slug: "sculptra-vs-ha-filler", region: "both" },
  { slug: "thermage-vs-ultherapy", region: "both" },
  { slug: "morpheus8-vs-ultherapy", region: "ca" },
  { slug: "hydrafacial-vs-diamondglow", region: "us" },
];

export function popularComparisons(region: Region): string[] {
  return POPULAR_COMPARISONS.filter((p) => p.region === region || p.region === "both").map(
    (p) => p.slug,
  );
}

export const POPULAR_COMPARISON_SLUGS = POPULAR_COMPARISONS.map((p) => p.slug);

/** Display labels for treatment slugs that are not simple title case. */
export const TREATMENT_LABELS: Record<string, string> = {
  "ha-filler": "HA filler",
  thermage: "Thermage FLX",
  botox: "Botox",
  dysport: "Dysport",
  sculptra: "Sculptra",
  radiesse: "Radiesse",
  morpheus8: "Morpheus8",
  ultherapy: "Ultherapy",
  daxxify: "Daxxify",
  xeomin: "Xeomin",
  juvederm: "Juvéderm",
  restylane: "Restylane",
  hydrafacial: "HydraFacial",
  diamondglow: "DiamondGlow",
};

export function treatmentLabel(slug: string, name?: string | null): string {
  if (name) return name;
  return (
    TREATMENT_LABELS[slug] ??
    slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ")
  );
}

/**
 * One permanent URL per unordered pair. Curated slugs keep their historical
 * order; every other pair is normalized alphabetically.
 */
export function canonicalPairSlug(a: string, b: string): string {
  for (const [slug, pair] of Object.entries(COMPARISON_DISPLAY_ORDER)) {
    if ((pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a)) return slug;
  }
  const [x, y] = [a, b].sort((p, q) => p.localeCompare(q));
  return `${x}-vs-${y}`;
}

/** Split a comparison slug into its two treatment slugs, in display order. */
export function parsePairSlug(slug: string): [string, string] | null {
  const known = COMPARISON_DISPLAY_ORDER[slug];
  if (known) return known;
  const idx = slug.indexOf("-vs-");
  if (idx <= 0) return null;
  const a = slug.slice(0, idx);
  const b = slug.slice(idx + 4);
  if (!a || !b) return null;
  if (!/^[a-z0-9-]+$/.test(a) || !/^[a-z0-9-]+$/.test(b)) return null;
  return [a, b];
}

export function comparisonLabel(slug: string, names?: [string?, string?]): string {
  const pair = parsePairSlug(slug);
  if (!pair) return slug.replace(/-/g, " ");
  return `${treatmentLabel(pair[0], names?.[0])} vs. ${treatmentLabel(pair[1], names?.[1])}`;
}

/** Pairs we deliberately refuse to render because the comparison misleads. */
export function pairDisallowed(a: string, b: string): boolean {
  return a === b;
}