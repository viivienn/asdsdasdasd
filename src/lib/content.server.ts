// Server-only data access for editorial content.
//
// Public pages read through the publishable-key client with RLS enforced, so
// only published, non-sample rows can ever reach a visitor. The service-role
// client is used solely for submission bookkeeping and for location lookups
// that carry no editorial content.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  Comparison,
  PriceObservation,
  Treatment,
  TreatmentMedia,
  TreatmentSource,
  TreatmentPickerRecord,
  PopularComparison,
  MarketCode,
  AvailableComparison,
  ComparisonExperience,
  ComparisonFamilyRule,
  RegionalPriceEstimate,
  RegionalPriceResult,
} from "./content-types";
import { canonicalPairSlug } from "./content-types";
import {
  comparisonSlugForPair,
  hasMinimumComparisonProfile,
  isIndexableComparison,
  resolveComparisonRouteSlug,
  resolvePairCompatibility,
} from "./comparison-model";
import {
  normalizePostalCode,
  resolvePostalRegion,
  selectRegionalEstimate,
  type PostalRegionRow,
} from "./regional-pricing";

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
  "id,name,slug,category,treatment_class,brand_name,generic_name,manufacturer,intended_areas,entity_type,parent_id,sort_rank,at_a_glance,summary,primary_purpose,mechanism,adds_volume,tightening_level,result_timing,sessions_text,downtime_text,longevity_text,pain_level,reversibility,major_risks,most_likely_disappointment,marketing_misconception,provider_variables,skin_tone_notes,appointment_time,swelling_text,bruising_text,exercise_restrictions,what_it_changes,what_it_does_not_change,expected_result_magnitude,true_substitute_notes,when_not_appropriate,pricing_basis,fda_status,evidence_grade,last_reviewed_at,publication_status,is_sample";

const PRE_AREAS_TREATMENT_COLUMNS = TREATMENT_COLUMNS.replace(",intended_areas", "");
const LEGACY_TREATMENT_COLUMNS = PRE_AREAS_TREATMENT_COLUMNS.replace(",pricing_basis", "");

async function loadTreatmentRows(
  client: ReturnType<typeof publicClient>,
  options: { slug?: string; slugs?: string[]; ordered?: boolean } = {},
): Promise<Treatment[]> {
  // Dynamic column fallback keeps the app readable before Lovable applies the migration.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema = client as any;
  const run = async (columns: string) => {
    let query = schema.from("treatments").select(columns);
    if (options.slug) query = query.eq("slug", options.slug);
    if (options.slugs) query = query.in("slug", options.slugs);
    if (options.ordered) query = query.order("sort_rank").order("name");
    return query;
  };
  let result = await run(TREATMENT_COLUMNS);
  if (result.error) result = await run(PRE_AREAS_TREATMENT_COLUMNS);
  if (result.error) result = await run(LEGACY_TREATMENT_COLUMNS);
  return scrubTreatments(result.data ?? []).map((treatment) => ({
    ...treatment,
    intended_areas: treatment.intended_areas ?? [],
    pricing_basis: treatment.pricing_basis ?? null,
  }));
}

const MEDIA_COLUMNS =
  "id,treatment_id,url,alt_text,media_role,credit,source_url,license,license_url";

export interface DemoAware<T> {
  data: T;
  isDemo: boolean;
}

const PLACEHOLDER = /demonstration text|pending sourcing|pending research/i;

/**
 * Placeholder editorial strings never reach a public page. Public components
 * omit missing values instead of showing prototype copy.
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
  const data = await loadTreatmentRows(publicClient(), { ordered: true });
  return { data, isDemo: false };
}

export interface CatalogEntry extends Treatment {
  parent_name: string | null;
  parent_slug: string | null;
  media: TreatmentMedia | null;
}

/**
 * The public catalog: every published, non-sample record, resolved against its
 * parent record and its first rights-verified image.
 */
export async function listCatalog(): Promise<CatalogEntry[]> {
  const client = publicClient();
  const [rows, media] = await Promise.all([
    loadTreatmentRows(client, { ordered: true }),
    client.from("treatment_media").select(MEDIA_COLUMNS),
  ]);
  const list = rows;
  const byId = new Map(list.map((t) => [t.id, t]));
  const mediaByTreatment = new Map<string, TreatmentMedia>();
  for (const m of (media.data ?? []) as unknown as Array<
    TreatmentMedia & { treatment_id: string }
  >) {
    if (!mediaByTreatment.has(m.treatment_id)) mediaByTreatment.set(m.treatment_id, m);
  }
  return list.map((t) => {
    const parent = t.parent_id ? byId.get(t.parent_id) : undefined;
    return {
      ...t,
      parent_name: parent?.name ?? null,
      parent_slug: parent?.slug ?? null,
      media: mediaByTreatment.get(t.id) ?? null,
    };
  });
}

/** Rights-verified, published imagery for a set of treatments. */
export async function listMediaFor(ids: string[]): Promise<Record<string, TreatmentMedia>> {
  if (ids.length === 0) return {};
  const { data } = await publicClient()
    .from("treatment_media")
    .select(MEDIA_COLUMNS)
    .in("treatment_id", ids);
  const out: Record<string, TreatmentMedia> = {};
  for (const m of (data ?? []) as unknown as Array<TreatmentMedia & { treatment_id: string }>) {
    if (!out[m.treatment_id]) out[m.treatment_id] = m;
  }
  return out;
}

export async function getTreatmentBySlug(
  slug: string,
): Promise<DemoAware<{ treatment: Treatment | null; sources: TreatmentSource[] }>> {
  const client = publicClient();
  const rows = await loadTreatmentRows(client, { slug });
  const treatment = rows[0] ?? null;

  if (treatment) {
    const sources = await client
      .from("treatment_sources")
      .select("id,claim_field,source_title,source_url,source_type,publication_date,evidence_level")
      .eq("treatment_id", treatment.id);
    return {
      data: {
        treatment,
        sources: (sources.data ?? []) as unknown as TreatmentSource[],
      },
      isDemo: false,
    };
  }

  return { data: { treatment: null, sources: [] }, isDemo: false };
}

const COMPARISON_COLUMNS =
  "id,slug,treatment_a_id,treatment_b_id,one_sentence_difference,consider_a_when,consider_b_when,neither_when,common_misconception,row_template,comparison_mode,title_override,description_override,is_featured,is_indexable,sort_rank,last_verified_at,publication_status,is_sample,last_reviewed_at";

const LEGACY_COMPARISON_COLUMNS =
  "id,slug,treatment_a_id,treatment_b_id,one_sentence_difference,consider_a_when,consider_b_when,neither_when,common_misconception,row_template,comparison_mode,publication_status,is_sample,last_reviewed_at";

const PRE_MODE_COMPARISON_COLUMNS =
  "id,slug,treatment_a_id,treatment_b_id,one_sentence_difference,consider_a_when,consider_b_when,neither_when,common_misconception,row_template,publication_status,is_sample,last_reviewed_at";

async function loadComparisonRows(client: ReturnType<typeof publicClient>): Promise<Comparison[]> {
  // Dynamic column fallback keeps the app readable before Lovable applies the migration.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema = client as any;
  const current = await schema.from("comparisons").select(COMPARISON_COLUMNS);
  if (!current.error) return (current.data ?? []) as Comparison[];

  // Allows the app to stay readable while Lovable applies this branch's
  // migration. Market-aware compatibility remains disabled until then.
  let legacy = await schema.from("comparisons").select(LEGACY_COMPARISON_COLUMNS);
  if (legacy.error) legacy = await schema.from("comparisons").select(PRE_MODE_COMPARISON_COLUMNS);
  return (legacy.data ?? []).map((row: Partial<Comparison>) => ({
    ...row,
    comparison_mode:
      String(row.comparison_mode) === "different_approach" ||
      String(row.comparison_mode) === "curated_cross_category"
        ? "different_approach"
        : "direct",
    title_override: null,
    description_override: null,
    is_featured: false,
    is_indexable: false,
    sort_rank: 0,
    last_verified_at: null,
  })) as Comparison[];
}

async function loadFamilyRules(
  client: ReturnType<typeof publicClient>,
): Promise<ComparisonFamilyRule[]> {
  // The fallback is intentionally empty while the additive migration is pending.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema = client as any;
  const result = await schema
    .from("comparison_family_rules")
    .select(
      "id,left_group_slug,right_group_slug,comparison_mode,template_key,public_label,is_active",
    )
    .eq("is_active", true);
  if (result.error) return [];
  return (result.data ?? []) as ComparisonFamilyRule[];
}

function reviewedComparisonsFromRows(
  treatments: Treatment[],
  comparisons: Comparison[],
  sources: TreatmentSource[],
): AvailableComparison[] {
  const treatmentsById = new Map(treatments.map((treatment) => [treatment.id, treatment]));
  return comparisons.flatMap((comparison) => {
    const a = treatmentsById.get(comparison.treatment_a_id) ?? null;
    const b = treatmentsById.get(comparison.treatment_b_id) ?? null;
    if (!isIndexableComparison(a, b, comparison, sources) || !a || !b) return [];
    return [
      {
        slug: comparison.slug,
        treatment_a_slug: a.slug,
        treatment_b_slug: b.slug,
        comparison_mode: comparison.comparison_mode,
        last_reviewed_at: comparison.last_verified_at ?? comparison.last_reviewed_at,
        is_featured: comparison.is_featured,
        is_indexable: comparison.is_indexable,
      },
    ];
  });
}

/**
 * Picker and Explore data comes entirely from public database rows. A missing
 * market mapping means "not recorded", never "unavailable".
 */
export async function listComparisonExperience(): Promise<ComparisonExperience> {
  const client = publicClient();
  const [
    treatmentsResult,
    mediaResult,
    groupsResult,
    marketsResult,
    comparisonRows,
    comparisonMarketsResult,
    sourcesResult,
    familyRules,
  ] = await Promise.all([
    loadTreatmentRows(client, { ordered: true }),
    client.from("treatment_media").select(MEDIA_COLUMNS),
    client.from("treatment_comparison_groups").select("treatment_id,comparison_groups!inner(slug)"),
    client.from("treatment_markets").select("treatment_id,country_code"),
    loadComparisonRows(client),
    client.from("comparison_markets").select("comparison_id,country_code,sort_rank"),
    client
      .from("treatment_sources")
      .select(
        "id,treatment_id,claim_field,source_title,source_url,source_type,publication_date,evidence_level",
      ),
    loadFamilyRules(client),
  ]);

  const base = treatmentsResult;
  const sources = (sourcesResult.data ?? []) as unknown as TreatmentSource[];
  const comparisons = reviewedComparisonsFromRows(base, comparisonRows, sources);
  const comparisonById = new Map(comparisonRows.map((comparison) => [comparison.id, comparison]));
  const availableBySlug = new Map(comparisons.map((comparison) => [comparison.slug, comparison]));
  const treatmentBySlug = new Map(base.map((treatment) => [treatment.slug, treatment]));
  const media = new Map<string, TreatmentMedia>();
  for (const row of mediaResult.data ?? []) {
    if (!media.has(row.treatment_id)) media.set(row.treatment_id, row as TreatmentMedia);
  }
  const groups = new Map<string, string[]>();
  for (const row of groupsResult.data ?? []) {
    const values = groups.get(row.treatment_id) ?? [];
    const relation = row.comparison_groups as unknown as
      { slug: string } | Array<{ slug: string }> | null;
    const slug = Array.isArray(relation) ? relation[0]?.slug : relation?.slug;
    if (slug) values.push(slug);
    groups.set(row.treatment_id, values);
  }
  const markets = new Map<string, MarketCode[]>();
  for (const row of marketsResult.data ?? []) {
    const values = markets.get(row.treatment_id) ?? [];
    values.push(row.country_code as MarketCode);
    markets.set(row.treatment_id, values);
  }

  const popularMap = new Map<string, PopularComparison>();
  for (const comparison of comparisons.filter((row) => row.is_featured)) {
    const stored = comparisonRows.find((row) => row.slug === comparison.slug);
    const a = treatmentBySlug.get(comparison.treatment_a_slug);
    const b = treatmentBySlug.get(comparison.treatment_b_slug);
    popularMap.set(comparison.slug, {
      slug: comparison.slug,
      label: `${a?.name ?? comparison.treatment_a_slug} vs. ${
        b?.name ?? comparison.treatment_b_slug
      }`,
      markets: [],
      sort_rank: stored?.sort_rank ?? 0,
    });
  }
  for (const row of comparisonMarketsResult.data ?? []) {
    const stored = comparisonById.get(row.comparison_id);
    if (!stored) continue;
    const comparison = availableBySlug.get(stored.slug);
    if (!comparison) continue;
    const existing = popularMap.get(comparison.slug);
    if (!existing) continue;
    existing.markets.push(row.country_code as MarketCode);
    popularMap.set(existing.slug, existing);
  }

  return {
    treatments: base.map((t) => ({
      ...t,
      media: media.get(t.id) ?? null,
      comparison_groups: groups.get(t.id) ?? [],
      markets: markets.get(t.id) ?? [],
    })),
    comparisons,
    popularComparisons: [...popularMap.values()].sort(
      (a, b) => a.sort_rank - b.sort_rank || a.label.localeCompare(b.label),
    ),
    familyRules,
  };
}

export async function getComparisonBySlug(slug: string): Promise<DemoAware<Comparison | null>> {
  const pub = await publicClient()
    .from("comparisons")
    .select(COMPARISON_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  return { data: (pub.data as unknown as Comparison) ?? null, isDemo: false };
}

export async function listComparisonSlugs(): Promise<DemoAware<string[]>> {
  const pub = await publicClient().from("comparisons").select("slug");
  return { data: (pub.data ?? []).map((r) => r.slug as string), isDemo: false };
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
  indexable: boolean;
  valid: boolean;
  compatibility: ReturnType<typeof resolvePairCompatibility>;
  media: Record<string, TreatmentMedia>;
  canonicalSlug: string;
}

/**
 * Resolves a treatment pair into a comparison context. Treatment existence and
 * compatibility come from the public profiles and broad-family rules. Optional
 * pair metadata controls featured placement and search indexing.
 */
export async function getComparisonContext(
  slugA: string,
  slugB: string,
): Promise<ComparisonContext> {
  const client = publicClient();
  const resolvedA = resolveComparisonRouteSlug(slugA);
  const resolvedB = resolveComparisonRouteSlug(slugB);
  const experience = await listComparisonExperience();
  const a = experience.treatments.find((t) => t.slug === resolvedA) ?? null;
  const b = experience.treatments.find((t) => t.slug === resolvedB) ?? null;
  const compatibility = a && b ? resolvePairCompatibility(a, b, experience.familyRules) : null;

  const comparisonRows = await loadComparisonRows(client);
  const comparison =
    a && b
      ? (comparisonRows.find(
          (row) =>
            (row.treatment_a_id === a.id && row.treatment_b_id === b.id) ||
            (row.treatment_a_id === b.id && row.treatment_b_id === a.id),
        ) ?? null)
      : null;

  let sources: TreatmentSource[] = [];
  let media: Record<string, TreatmentMedia> = {};
  if (a && b) {
    const { data: sourceRows } = await client
      .from("treatment_sources")
      .select(
        "id,treatment_id,claim_field,source_title,source_url,source_type,publication_date,evidence_level",
      )
      .in("treatment_id", [a.id, b.id]);
    sources = (sourceRows ?? []) as unknown as TreatmentSource[];
    media = await listMediaFor([a.id, b.id]);
  }

  const indexable = isIndexableComparison(a, b, comparison, sources);
  const reviewed = indexable;
  const valid = Boolean(
    a && b && compatibility && hasMinimumComparisonProfile(a) && hasMinimumComparisonProfile(b),
  );
  const generatedCanonical =
    a && b && compatibility
      ? comparisonSlugForPair(a, b, compatibility)
      : canonicalPairSlug(slugA, slugB);
  return {
    a,
    b,
    comparison,
    sources,
    reviewed,
    indexable,
    valid,
    compatibility,
    media,
    canonicalSlug:
      compatibility?.mode === "different_approach"
        ? generatedCanonical
        : (comparison?.slug ?? generatedCanonical),
  };
}

/** Canonical slugs of comparisons that meet every reviewed-publication rule. */
export async function listReviewedComparisonSlugs(): Promise<string[]> {
  return (await listReviewedComparisons()).map((c) => c.slug);
}

/** Reviewed comparisons with the real review date used as sitemap lastmod. */
export async function listReviewedComparisons(): Promise<AvailableComparison[]> {
  const client = publicClient();
  const [treatmentsResult, comparisons, sourcesResult] = await Promise.all([
    loadTreatmentRows(client),
    loadComparisonRows(client),
    client
      .from("treatment_sources")
      .select(
        "id,treatment_id,claim_field,source_title,source_url,source_type,publication_date,evidence_level",
      ),
  ]);
  return reviewedComparisonsFromRows(
    treatmentsResult,
    comparisons,
    (sourcesResult.data ?? []) as unknown as TreatmentSource[],
  );
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
    .select(
      "observed_at,locations!inner(city_slug,country_code,region_code,is_indexable),treatments!inner(slug)",
    );
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

export async function getRegionalPriceEstimate(
  postalCodeInput: string,
  treatmentSlug: string,
): Promise<{ ok: true; result: RegionalPriceResult } | { ok: false; error: string }> {
  const postalCode = normalizePostalCode(postalCodeInput);
  if (!postalCode) {
    return { ok: false, error: "Enter a valid US ZIP code or Canadian postal code." };
  }

  const client = publicClient();
  const treatmentRows = await loadTreatmentRows(client, { slug: treatmentSlug });
  const treatment = treatmentRows[0];
  if (!treatment) return { ok: false, error: "That treatment is not available." };

  // These additive tables may not exist until Lovable applies the migration.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema = client as any;
  const [regionRows, groupRows] = await Promise.all([
    schema
      .from("postal_region_map")
      .select("country_code,postal_prefix,region_slug,city_name")
      .eq("country_code", postalCode.countryCode),
    schema
      .from("treatment_comparison_groups")
      .select("comparison_groups!inner(slug)")
      .eq("treatment_id", treatment.id),
  ]);

  if (regionRows.error) {
    return { ok: false, error: "Local estimates are not available yet." };
  }
  const region = resolvePostalRegion(postalCode, (regionRows.data ?? []) as PostalRegionRow[]);
  if (!region) {
    return { ok: false, error: "We do not map that ZIP or postal code yet." };
  }

  const estimatesResult = await schema
    .from("regional_price_estimates")
    .select(
      "id,treatment_id,comparison_group_slug,country_code,region_slug,region_name,currency,pricing_unit,treatment_area,estimated_average,estimated_median,estimated_low,estimated_high,source_count,source_urls,methodology_note,researched_at",
    )
    .eq("country_code", postalCode.countryCode)
    .eq("region_slug", region.region_slug);

  if (estimatesResult.error) {
    return { ok: false, error: "Local estimates are not available yet." };
  }
  const groups = (groupRows.data ?? []).flatMap((row: Record<string, unknown>) => {
    const relation = row.comparison_groups as { slug: string } | Array<{ slug: string }> | null;
    return Array.isArray(relation) ? relation.map((value) => value.slug) : (relation?.slug ?? []);
  });
  const estimates = (estimatesResult.data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    estimated_average: row.estimated_average == null ? null : String(row.estimated_average),
    estimated_median: row.estimated_median == null ? null : String(row.estimated_median),
    estimated_low: String(row.estimated_low),
    estimated_high: String(row.estimated_high),
    source_urls: Array.isArray(row.source_urls)
      ? row.source_urls.filter((value): value is string => typeof value === "string")
      : [],
  })) as RegionalPriceEstimate[];
  const estimate = selectRegionalEstimate(estimates, treatment.id, groups);

  return {
    ok: true,
    result: {
      postalCode: postalCodeInput.trim().toUpperCase(),
      countryCode: postalCode.countryCode,
      regionName:
        estimate?.region_name ?? region.city_name ?? region.region_slug.replace(/-/g, " "),
      estimate,
    },
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
