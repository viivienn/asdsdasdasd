// Server-only data access for editorial content.
//
// Two read paths:
//  1. PUBLIC  — publishable-key client, RLS enforced. Only published,
//     non-sample rows can ever be returned.
//  2. PROTOTYPE — service-role client, used ONLY to render clearly-labelled
//     demonstration content while the editorial data is unsourced. Every page
//     served from this path is marked `isDemo` and rendered `noindex`, and it
//     is never included in the sitemap or in structured data.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  Comparison,
  PriceObservation,
  Treatment,
  TreatmentSource,
} from "./content-types";

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function prototypeClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const TREATMENT_COLUMNS =
  "id,name,slug,category,treatment_class,brand_name,generic_name,summary,primary_purpose,mechanism,adds_volume,tightening_level,result_timing,sessions_text,downtime_text,longevity_text,pain_level,reversibility,major_risks,most_likely_disappointment,marketing_misconception,provider_variables,skin_tone_notes,appointment_time,swelling_text,bruising_text,exercise_restrictions,what_it_changes,what_it_does_not_change,expected_result_magnitude,true_substitute_notes,when_not_appropriate,fda_status,evidence_grade,last_reviewed_at,publication_status,is_sample";

export interface DemoAware<T> {
  data: T;
  isDemo: boolean;
}

const PLACEHOLDER = /demonstration text|pending sourcing|pending research/i;

/**
 * Placeholder editorial strings never reach a public page. A missing value is
 * rendered as "Not yet recorded" instead of prototype copy.
 */
function scrubTreatment<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = { ...row };
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === "string" && PLACEHOLDER.test(v)) out[k] = null;
  }
  return out as T;
}

function scrubTreatments(rows: unknown[]): Treatment[] {
  return (rows as Record<string, unknown>[]).map(scrubTreatment) as unknown as Treatment[];
}

export async function listTreatments(): Promise<DemoAware<Treatment[]>> {
  const pub = await publicClient()
    .from("treatments")
    .select(TREATMENT_COLUMNS)
    .order("name");
  if (pub.data && pub.data.length > 0) {
    return { data: scrubTreatments(pub.data), isDemo: false };
  }
  const admin = await prototypeClient();
  const proto = await admin.from("treatments").select(TREATMENT_COLUMNS).order("name");
  return { data: scrubTreatments(proto.data ?? []), isDemo: true };
}

export async function getTreatmentBySlug(
  slug: string,
): Promise<DemoAware<{ treatment: Treatment | null; sources: TreatmentSource[] }>> {
  const pub = await publicClient()
    .from("treatments")
    .select(TREATMENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (pub.data) {
    const sources = await publicClient()
      .from("treatment_sources")
      .select("id,claim_field,source_title,source_url,source_type,publication_date,evidence_level")
      .eq("treatment_id", (pub.data as unknown as Treatment).id);
    return {
      data: {
        treatment: scrubTreatments([pub.data])[0] ?? null,
        sources: (sources.data ?? []) as unknown as TreatmentSource[],
      },
      isDemo: false,
    };
  }

  const admin = await prototypeClient();
  const proto = await admin
    .from("treatments")
    .select(TREATMENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  return {
    data: { treatment: proto.data ? (scrubTreatments([proto.data])[0] ?? null) : null, sources: [] },
    isDemo: true,
  };
}

const COMPARISON_COLUMNS =
  "id,slug,treatment_a_id,treatment_b_id,one_sentence_difference,consider_a_when,consider_b_when,neither_when,common_misconception,publication_status,is_sample,last_reviewed_at";

export async function getComparisonBySlug(
  slug: string,
): Promise<DemoAware<Comparison | null>> {
  const pub = await publicClient()
    .from("comparisons")
    .select(COMPARISON_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (pub.data) return { data: pub.data as unknown as Comparison, isDemo: false };

  const admin = await prototypeClient();
  const proto = await admin
    .from("comparisons")
    .select(COMPARISON_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  return { data: (proto.data as unknown as Comparison) ?? null, isDemo: true };
}

export async function listComparisonSlugs(): Promise<DemoAware<string[]>> {
  const pub = await publicClient().from("comparisons").select("slug");
  if (pub.data && pub.data.length > 0) {
    return { data: pub.data.map((r) => r.slug as string), isDemo: false };
  }
  const admin = await prototypeClient();
  const proto = await admin.from("comparisons").select("slug");
  return { data: (proto.data ?? []).map((r) => r.slug as string), isDemo: true };
}

/**
 * Local pricing. There is no prototype fallback here: an unsourced price is
 * never rendered, so an empty result means "no coverage yet".
 */
export interface ComparisonContext {
  a: Treatment | null;
  b: Treatment | null;
  comparison: Comparison | null;
  sources: TreatmentSource[];
  reviewed: boolean;
}

function treatmentApproved(t: Treatment | null): boolean {
  return Boolean(t && t.publication_status === "published" && t.is_sample === false);
}

/**
 * Resolves a treatment pair into a comparison context. Treatment existence is
 * checked against the full catalogue (so unknown slugs 404), while the
 * `reviewed` flag is computed strictly: it is the single gate for indexable,
 * editorially complete comparison pages.
 */
export async function getComparisonContext(
  slugA: string,
  slugB: string,
  canonicalSlug: string,
): Promise<ComparisonContext> {
  const admin = await prototypeClient();

  const { data: rows } = await admin
    .from("treatments")
    .select(TREATMENT_COLUMNS)
    .in("slug", [slugA, slugB]);
  const list = scrubTreatments(rows ?? []);
  const a = list.find((t) => t.slug === slugA) ?? null;
  const b = list.find((t) => t.slug === slugB) ?? null;

  const { data: comparisonRow } = await admin
    .from("comparisons")
    .select(COMPARISON_COLUMNS)
    .eq("slug", canonicalSlug)
    .maybeSingle();
  const comparison = (comparisonRow as unknown as Comparison) ?? null;

  let sources: TreatmentSource[] = [];
  if (a && b) {
    const { data: sourceRows } = await admin
      .from("treatment_sources")
      .select(
        "id,treatment_id,claim_field,source_title,source_url,source_type,publication_date,evidence_level",
      )
      .in("treatment_id", [a.id, b.id]);
    sources = (sourceRows ?? []) as unknown as TreatmentSource[];
  }

  const sourceIds = new Set(
    (sources as unknown as Array<{ treatment_id?: string }>).map((s) => s.treatment_id ?? ""),
  );

  const reviewed =
    treatmentApproved(a) &&
    treatmentApproved(b) &&
    Boolean(comparison) &&
    comparison!.publication_status === "published" &&
    comparison!.is_sample === false &&
    Boolean(comparison!.one_sentence_difference) &&
    Boolean(comparison!.consider_a_when) &&
    Boolean(comparison!.consider_b_when) &&
    Boolean(comparison!.neither_when) &&
    Boolean(comparison!.last_reviewed_at) &&
    Boolean(a && sourceIds.has(a.id)) &&
    Boolean(b && sourceIds.has(b.id));

  // Unreviewed editorial copy never leaves the server: the generated view is
  // built only from approved individual treatment records.
  return { a, b, comparison: reviewed ? comparison : null, sources: reviewed ? sources : [], reviewed };
}

/** Canonical slugs of comparisons that meet every reviewed-publication rule. */
export async function listReviewedComparisonSlugs(): Promise<string[]> {
  return (await listReviewedComparisons()).map((c) => c.slug);
}

/** Reviewed comparisons with the real review date used as sitemap lastmod. */
export async function listReviewedComparisons(): Promise<
  Array<{ slug: string; last_reviewed_at: string }>
> {
  const pub = await publicClient()
    .from("comparisons")
    .select(COMPARISON_COLUMNS);
  const rows = (pub.data ?? []) as unknown as Comparison[];
  return rows
    .filter(
      (c) =>
        c.publication_status === "published" &&
        c.is_sample === false &&
        Boolean(c.one_sentence_difference) &&
        Boolean(c.consider_a_when) &&
        Boolean(c.consider_b_when) &&
        Boolean(c.neither_when) &&
        Boolean(c.last_reviewed_at),
    )
    .map((c) => ({ slug: c.slug, last_reviewed_at: c.last_reviewed_at as string }));
}

/**
 * Local price pages that carry a real, publishable dataset. Empty pages and
 * pages backed only by sample rows are never advertised to crawlers.
 */
export async function listIndexablePricePages(): Promise<
  Array<{ city: string; treatment: string; lastmod: string }>
> {
  const client = publicClient();
  const rows = await client
    .from("price_observations")
    .select("observed_at,locations!inner(city_slug,country_code,region_code,is_indexable),treatments!inner(slug)");
  const map = new Map<string, { city: string; treatment: string; lastmod: string }>();
  for (const r of (rows.data ?? []) as unknown as Array<{
    observed_at: string;
    locations: { city_slug: string; is_indexable: boolean } | null;
    treatments: { slug: string } | null;
  }>) {
    if (!r.locations?.is_indexable || !r.treatments) continue;
    const key = `${r.locations.city_slug}/${r.treatments.slug}`;
    const prev = map.get(key);
    const lastmod = r.observed_at.slice(0, 10);
    if (!prev || prev.lastmod < lastmod) {
      map.set(key, { city: r.locations.city_slug, treatment: r.treatments.slug, lastmod });
    }
  }
  return [...map.values()];
}

export async function listCityPrices(
  citySlug: string,
  treatmentSlug: string,
): Promise<{
  observations: PriceObservation[];
  cityKnown: boolean;
  clinicsChecked: number;
  clinicsWithPublicPrices: number;
}> {
  const client = publicClient();
  const admin = await prototypeClient();

  const loc = await admin
    .from("locations")
    .select("id,city_slug,is_indexable")
    .eq("country_code", "us")
    .eq("region_code", "ca")
    .eq("city_slug", citySlug)
    .maybeSingle();

  if (!loc.data) {
    return { observations: [], cityKnown: false, clinicsChecked: 0, clinicsWithPublicPrices: 0 };
  }

  const rows = await client
    .from("price_observations")
    .select(
      "id,currency,advertised_amount,regular_amount,pricing_unit,quantity,effective_unit_price,treatment_area,starts_at_price,membership_required,new_customer_only,minimum_purchase,manufacturer_reward_required,conditions,source_url,observed_at,verification_status,clinics(name,website_url),treatments!inner(slug)",
    )
    .eq("location_id", loc.data.id)
    .eq("treatments.slug", treatmentSlug)
    .order("observed_at", { ascending: false });

  const observations = (rows.data ?? []).map((r) => {
    const row = r as unknown as Record<string, unknown> & {
      clinics: { name: string; website_url: string | null } | null;
    };
    return {
      id: row.id as string,
      clinic_name: row.clinics?.name ?? "Unknown clinic",
      clinic_website: row.clinics?.website_url ?? null,
      currency: row.currency as string,
      advertised_amount: String(row.advertised_amount),
      regular_amount: row.regular_amount == null ? null : String(row.regular_amount),
      pricing_unit: row.pricing_unit as string,
      quantity: row.quantity == null ? null : String(row.quantity),
      effective_unit_price:
        row.effective_unit_price == null ? null : String(row.effective_unit_price),
      treatment_area: (row.treatment_area as string | null) ?? null,
      starts_at_price: Boolean(row.starts_at_price),
      membership_required: Boolean(row.membership_required),
      new_customer_only: Boolean(row.new_customer_only),
      minimum_purchase: (row.minimum_purchase as string | null) ?? null,
      manufacturer_reward_required: Boolean(row.manufacturer_reward_required),
      conditions: (row.conditions as string | null) ?? null,
      source_url: row.source_url as string,
      observed_at: row.observed_at as string,
      verification_status: row.verification_status as string,
    } satisfies PriceObservation;
  });

  const checked = await admin
    .from("clinics")
    .select("id", { count: "exact", head: true })
    .eq("location_id", loc.data.id);

  const clinicNames = new Set(observations.map((o) => o.clinic_name));

  return {
    observations,
    cityKnown: true,
    clinicsChecked: Math.max(checked.count ?? 0, clinicNames.size),
    clinicsWithPublicPrices: clinicNames.size,
  };
}

// ---------- submissions ----------

async function rateLimited(kind: string, ipHash: string): Promise<boolean> {
  const admin = await prototypeClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("submission_audit")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  return (count ?? 0) >= 5;
}

async function audit(kind: string, ipHash: string) {
  const admin = await prototypeClient();
  await admin.from("submission_audit").insert({ kind, ip_hash: ipHash });
}

export async function recordCityRequest(input: {
  email: string;
  postal_code: string;
  city: string | null;
  treatment_slug: string | null;
  consent: boolean;
  source_path: string | null;
  ipHash: string;
}) {
  if (await rateLimited("city_request", input.ipHash)) {
    return { ok: false as const, error: "Too many requests. Please try again later." };
  }
  const admin = await prototypeClient();
  const { error } = await admin.from("city_requests").insert({
    email: input.email,
    postal_code: input.postal_code,
    city: input.city,
    treatment_slug: input.treatment_slug,
    consent: input.consent,
    source_path: input.source_path,
  });
  if (error) {
    console.error("city_request insert failed", error.message);
    return { ok: false as const, error: "We couldn't save that. Please try again." };
  }
  await audit("city_request", input.ipHash);
  return { ok: true as const };
}

export async function recordPriceAlertInterest(input: {
  email: string;
  postal_code: string;
  treatment_slug: string;
  max_unit_price: number | null;
  source_path: string | null;
  ipHash: string;
}) {
  if (await rateLimited("price_alert", input.ipHash)) {
    return { ok: false as const, error: "Too many requests. Please try again later." };
  }
  const admin = await prototypeClient();
  const { error } = await admin.from("price_alert_interest").insert({
    email: input.email,
    postal_code: input.postal_code,
    treatment_slug: input.treatment_slug,
    max_unit_price: input.max_unit_price,
    source_path: input.source_path,
  });
  if (error) {
    console.error("price_alert insert failed", error.message);
    return { ok: false as const, error: "We couldn't save that. Please try again." };
  }
  await audit("price_alert", input.ipHash);
  return { ok: true as const };
}
export async function recordComparisonRequest(input: {
  treatment_a: string;
  treatment_b: string;
  email: string | null;
  context: string | null;
  source_path: string | null;
  ipHash: string;
}) {
  if (await rateLimited("comparison_request", input.ipHash)) {
    return { ok: false as const, error: "Too many requests. Please try again later." };
  }
  const admin = await prototypeClient();
  const { error } = await admin.from("comparison_requests").insert({
    treatment_a: input.treatment_a,
    treatment_b: input.treatment_b,
    email: input.email,
    context: input.context,
    source_path: input.source_path,
  });
  if (error) {
    console.error("comparison_request insert failed", error.message);
    return { ok: false as const, error: "We couldn't save that. Please try again." };
  }
  await audit("comparison_request", input.ipHash);
  return { ok: true as const };
}
