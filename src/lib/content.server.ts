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
  "id,name,slug,category,treatment_class,brand_name,generic_name,summary,primary_purpose,mechanism,adds_volume,tightening_level,result_timing,sessions_text,downtime_text,longevity_text,pain_level,reversibility,major_risks,most_likely_disappointment,marketing_misconception,provider_variables,skin_tone_notes,fda_status,evidence_grade,last_reviewed_at,publication_status,is_sample";

export interface DemoAware<T> {
  data: T;
  isDemo: boolean;
}

export async function listTreatments(): Promise<DemoAware<Treatment[]>> {
  const pub = await publicClient()
    .from("treatments")
    .select(TREATMENT_COLUMNS)
    .order("name");
  if (pub.data && pub.data.length > 0) {
    return { data: pub.data as unknown as Treatment[], isDemo: false };
  }
  const admin = await prototypeClient();
  const proto = await admin.from("treatments").select(TREATMENT_COLUMNS).order("name");
  return { data: (proto.data ?? []) as unknown as Treatment[], isDemo: true };
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
        treatment: pub.data as unknown as Treatment,
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
    data: { treatment: (proto.data as unknown as Treatment) ?? null, sources: [] },
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
export async function listCityPrices(
  citySlug: string,
  treatmentSlug: string,
): Promise<{ observations: PriceObservation[]; cityKnown: boolean }> {
  const client = publicClient();
  const admin = await prototypeClient();

  const loc = await admin
    .from("locations")
    .select("id,city_slug,is_indexable")
    .eq("country_code", "us")
    .eq("region_code", "ca")
    .eq("city_slug", citySlug)
    .maybeSingle();

  if (!loc.data) return { observations: [], cityKnown: false };

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

  return { observations, cityKnown: true };
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