-- Complete the source-backed MVP content audit without replaying or replacing
-- the existing catalog. IDs and clinic-related infrastructure are preserved.

begin;

-- These six rows already exist in the current repository/database, but they do
-- not yet meet the complete-profile publication gate. Keep their identities,
-- parents, and the limited supported facts while removing stale demo details.
update public.treatments
set
  publication_status = 'review',
  is_sample = false,
  last_reviewed_at = null,
  mechanism = null,
  intended_areas = '{}',
  what_it_changes = null,
  what_it_does_not_change = null,
  adds_volume = null,
  tightening_level = null,
  result_timing = null,
  sessions_text = null,
  appointment_time = null,
  downtime_text = null,
  swelling_text = null,
  bruising_text = null,
  exercise_restrictions = null,
  longevity_text = null,
  pain_level = null,
  reversibility = null,
  major_risks = null,
  most_likely_disappointment = null,
  marketing_misconception = null,
  provider_variables = null,
  skin_tone_notes = null,
  pricing_basis = null,
  expected_result_magnitude = null,
  true_substitute_notes = null,
  when_not_appropriate = null,
  canada_status = null,
  evidence_grade = null,
  at_a_glance = null,
  updated_at = now()
where slug = any(
  array[
    'neuromodulator',
    'collagen-stimulator',
    'energy-device',
    'xeomin',
    'daxxify',
    'restylane-lyft'
  ]
);

update public.treatments
set
  primary_purpose = case slug
    when 'neuromodulator' then
      'Commonly used to soften the appearance of movement-related facial lines.'
    when 'collagen-stimulator' then
      'Commonly used where a gradual change in facial fullness or skin quality is the goal.'
    when 'energy-device' then
      'Commonly used for skin tightening, lifting, resurfacing, or coagulation goals without injectables.'
    else null
  end,
  summary = case slug
    when 'neuromodulator' then
      'Injectable botulinum toxin products that temporarily reduce the activity of targeted facial muscles.'
    when 'collagen-stimulator' then
      'Injectables that work gradually through a tissue response rather than representing one interchangeable product.'
    when 'energy-device' then
      'A broad class that includes radiofrequency, ultrasound, and other energy-delivery devices with device-specific clearances and protocols.'
    when 'xeomin' then
      'A prescription botulinum toxin type A product.'
    when 'daxxify' then
      'A prescription botulinum toxin type A product.'
    when 'restylane-lyft' then
      'A specific Restylane hyaluronic-acid filler product; its profile remains in review until the full US/Canada and clinical field set is completed.'
  end,
  updated_at = now()
where slug = any(
  array[
    'neuromodulator',
    'collagen-stimulator',
    'energy-device',
    'xeomin',
    'daxxify',
    'restylane-lyft'
  ]
);

-- Keep the 15 complete launch subjects public and record the audit date. This
-- date means editorial/source verification, not clinician review.
update public.treatments
set
  last_reviewed_at = '2026-07-30T00:00:00Z'::timestamptz,
  updated_at = now()
where slug = any(
  array[
    'botox',
    'dysport',
    'ha-filler',
    'juvederm',
    'restylane',
    'juvederm-voluma',
    'restylane-kysse',
    'sculptra',
    'radiesse',
    'thermage',
    'ultherapy',
    'morpheus8',
    'potenza',
    'hydrafacial',
    'diamondglow'
  ]
)
and publication_status = 'published'
and is_sample = false;

-- Retain the narrow, currently supported US regulatory identity for three
-- incomplete product records. These rows remain review-only.
with payload as (
  select *
  from jsonb_to_recordset($sources$[
    {
      "treatment_slug": "xeomin",
      "claim_field": "fda_status",
      "source_title": "XEOMIN US Prescribing Information",
      "source_url": "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/125360s080lbl.pdf",
      "source_type": "FDA prescribing information",
      "publication_date": "2021-07-20",
      "evidence_level": "regulatory-primary",
      "notes": "US glabellar-line indication. The incomplete profile remains in review."
    },
    {
      "treatment_slug": "daxxify",
      "claim_field": "fda_status",
      "source_title": "DAXXIFY US Prescribing Information",
      "source_url": "https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/761127s000lbl.pdf",
      "source_type": "FDA prescribing information",
      "publication_date": "2022-09-08",
      "evidence_level": "regulatory-primary",
      "notes": "US glabellar-line indication. The incomplete profile remains in review."
    },
    {
      "treatment_slug": "restylane-lyft",
      "claim_field": "fda_status",
      "source_title": "RESTYLANE LYFT Summary of Safety and Effectiveness Data",
      "source_url": "https://www.accessdata.fda.gov/cdrh_docs/pdf4/P040024S086b.pdf",
      "source_type": "FDA SSED",
      "publication_date": "2018-05-31",
      "evidence_level": "regulatory-primary",
      "notes": "US cheek and midface indication. The incomplete profile remains in review."
    }
  ]$sources$::jsonb) as source(
    treatment_slug text,
    claim_field text,
    source_title text,
    source_url text,
    source_type text,
    publication_date date,
    evidence_level text,
    notes text
  )
)
insert into public.treatment_sources (
  treatment_id,
  claim_field,
  source_title,
  source_url,
  source_type,
  publication_date,
  retrieved_at,
  evidence_level,
  notes,
  is_sample
)
select
  treatment.id,
  payload.claim_field,
  payload.source_title,
  payload.source_url,
  payload.source_type,
  payload.publication_date,
  '2026-07-30T00:00:00Z'::timestamptz,
  payload.evidence_level,
  payload.notes,
  false
from payload
join public.treatments treatment on treatment.slug = payload.treatment_slug
where not exists (
  select 1
  from public.treatment_sources existing
  where existing.treatment_id = treatment.id
    and existing.claim_field = payload.claim_field
    and existing.source_url = payload.source_url
);

-- The original content import attached primary evidence to the decisive fields.
-- Map every remaining populated public field to the closest existing primary
-- evidence row. Repeated URLs are intentional because claim_field is singular.
with target_fields as (
  select
    treatment.id as treatment_id,
    treatment.slug as treatment_slug,
    field.claim_field
  from public.treatments treatment
  cross join lateral (
    values
      ('summary', treatment.summary),
      ('primary_purpose', treatment.primary_purpose),
      ('mechanism', treatment.mechanism),
      (
        'intended_areas',
        case
          when cardinality(treatment.intended_areas) > 0
          then array_to_string(treatment.intended_areas, ',')
        end
      ),
      ('what_it_changes', treatment.what_it_changes),
      ('what_it_does_not_change', treatment.what_it_does_not_change),
      ('adds_volume', treatment.adds_volume),
      ('tightening_level', treatment.tightening_level),
      ('result_timing', treatment.result_timing),
      ('sessions_text', treatment.sessions_text),
      ('appointment_time', treatment.appointment_time),
      ('downtime_text', treatment.downtime_text),
      ('swelling_text', treatment.swelling_text),
      ('bruising_text', treatment.bruising_text),
      ('exercise_restrictions', treatment.exercise_restrictions),
      ('longevity_text', treatment.longevity_text),
      ('pain_level', treatment.pain_level),
      ('reversibility', treatment.reversibility),
      ('major_risks', treatment.major_risks),
      ('most_likely_disappointment', treatment.most_likely_disappointment),
      ('marketing_misconception', treatment.marketing_misconception),
      ('provider_variables', treatment.provider_variables),
      ('skin_tone_notes', treatment.skin_tone_notes),
      ('pricing_basis', treatment.pricing_basis),
      ('expected_result_magnitude', treatment.expected_result_magnitude),
      ('true_substitute_notes', treatment.true_substitute_notes),
      ('when_not_appropriate', treatment.when_not_appropriate),
      ('fda_status', treatment.fda_status),
      ('canada_status', treatment.canada_status),
      ('evidence_grade', treatment.evidence_grade)
  ) as field(claim_field, claim_value)
  where treatment.slug = any(
    array[
      'botox',
      'dysport',
      'ha-filler',
      'juvederm',
      'restylane',
      'juvederm-voluma',
      'restylane-kysse',
      'sculptra',
      'radiesse',
      'thermage',
      'ultherapy',
      'morpheus8',
      'potenza',
      'hydrafacial',
      'diamondglow'
    ]
  )
  and treatment.publication_status = 'published'
  and treatment.is_sample = false
  and nullif(field.claim_value, '') is not null
  and not exists (
    select 1
    from public.treatment_sources existing
    where existing.treatment_id = treatment.id
      and existing.claim_field = field.claim_field
      and existing.is_sample = false
  )
),
preferences as (
  select
    target.*,
    case target.claim_field
      when 'canada_status' then array['canada_status']
      when 'fda_status' then array['fda_status']
      when 'major_risks' then array['major_risks','mechanism','primary_purpose']
      when 'when_not_appropriate' then array['major_risks','primary_purpose']
      when 'downtime_text' then array['major_risks','primary_purpose']
      when 'swelling_text' then array['major_risks','primary_purpose']
      when 'bruising_text' then array['major_risks','primary_purpose']
      when 'exercise_restrictions' then array['major_risks','primary_purpose']
      when 'reversibility' then array['reversibility','major_risks','mechanism']
      when 'provider_variables' then array['provider_variables','major_risks','mechanism']
      when 'skin_tone_notes' then array['skin_tone_notes','major_risks','primary_purpose']
      when 'evidence_grade' then array['evidence_grade','fda_status','primary_purpose']
      when 'longevity_text' then array['longevity_text','primary_purpose']
      when 'result_timing' then array['result_timing','primary_purpose']
      when 'sessions_text' then array['sessions_text','primary_purpose']
      when 'appointment_time' then array['appointment_time','primary_purpose']
      when 'pain_level' then array['pain_level','major_risks','primary_purpose']
      else array[
        target.claim_field,
        'primary_purpose',
        'mechanism',
        'major_risks',
        'fda_status'
      ]
    end as source_field_preference
  from target_fields target
),
ranked_sources as (
  select
    preference.treatment_id,
    preference.treatment_slug,
    preference.claim_field,
    source.source_title,
    source.source_url,
    source.source_type,
    source.publication_date,
    source.evidence_level,
    source.notes,
    row_number() over (
      partition by preference.treatment_id, preference.claim_field
      order by
        array_position(preference.source_field_preference, source.claim_field),
        case source.evidence_level
          when 'regulatory-primary' then 1
          when 'manufacturer-primary' then 2
          else 3
        end,
        source.created_at,
        source.id
    ) as source_rank
  from preferences preference
  join public.treatment_sources source
    on source.treatment_id = preference.treatment_id
   and source.claim_field = any(preference.source_field_preference)
   and source.is_sample = false
)
insert into public.treatment_sources (
  treatment_id,
  claim_field,
  source_title,
  source_url,
  source_type,
  publication_date,
  retrieved_at,
  evidence_level,
  notes,
  is_sample
)
select
  ranked.treatment_id,
  ranked.claim_field,
  ranked.source_title,
  ranked.source_url,
  ranked.source_type,
  ranked.publication_date,
  '2026-07-30T00:00:00Z'::timestamptz,
  ranked.evidence_level,
  concat(
    'Supports the published ',
    ranked.claim_field,
    ' field. ',
    coalesce(ranked.notes, '')
  ),
  false
from ranked_sources ranked
where ranked.source_rank = 1
and not exists (
  select 1
  from public.treatment_sources existing
  where existing.treatment_id = ranked.treatment_id
    and existing.claim_field = ranked.claim_field
    and existing.source_url = ranked.source_url
);

-- Refresh retrieved dates on the launch source map without changing provenance.
update public.treatment_sources source
set retrieved_at = '2026-07-30T00:00:00Z'::timestamptz
from public.treatments treatment
where treatment.id = source.treatment_id
and treatment.slug = any(
  array[
    'botox',
    'dysport',
    'ha-filler',
    'juvederm',
    'restylane',
    'juvederm-voluma',
    'restylane-kysse',
    'sculptra',
    'radiesse',
    'thermage',
    'ultherapy',
    'morpheus8',
    'potenza',
    'hydrafacial',
    'diamondglow'
  ]
)
and source.is_sample = false;

-- Complete the two LA cells that now have multiple compatible regular public
-- price observations. Promotions and first-patient prices are excluded.
with payload as (
  select *
  from jsonb_to_recordset($prices$[
    {
      "entity_slug": "potenza",
      "country": "US",
      "region_slug": "los-angeles",
      "region": "Los Angeles",
      "currency": "USD",
      "pricing_unit": "per full-face session",
      "treatment_area": "face",
      "estimated_average": null,
      "estimated_median": null,
      "estimated_low": 1200,
      "estimated_high": 1600,
      "source_count": 2,
      "source_urls": [
        "https://www.deluxemedspa.com/non-surgical/potenza/",
        "https://beautyranchspa.com/potenza-rf-microneedling-los-angeles/"
      ],
      "methodology_note": "Compared Beauty Ranch's starting single-session full-face price with Deluxe Med Spa's regular full-face price. First-patient and package prices were excluded.",
      "limitations": "Only two current public sources qualified. Protocol, tip, area, anaesthesia, and provider can materially change a quote.",
      "researched_at": "2026-07-30"
    },
    {
      "entity_slug": "diamondglow",
      "country": "US",
      "region_slug": "los-angeles",
      "region": "Los Angeles",
      "currency": "USD",
      "pricing_unit": "per facial session",
      "treatment_area": "face",
      "estimated_average": 227.67,
      "estimated_median": 199,
      "estimated_low": 199,
      "estimated_high": 285,
      "source_count": 3,
      "source_urls": [
        "https://www.dermfx.com/pricing/",
        "https://shop.shorrbeauty.com/pages/diamond-glow-facial",
        "https://beautyranchspa.com/pricing/"
      ],
      "methodology_note": "Used DermFX's $199 listed session, Shorr Beauty's $199 45-minute session, and Beauty Ranch's $285 regular price. Beauty Ranch's temporary $199 special was excluded.",
      "limitations": "Session duration, serum, extractions, dermaplaning, masks, and other add-ons differ among providers.",
      "researched_at": "2026-07-30"
    }
  ]$prices$::jsonb) as estimate(
    entity_slug text,
    country text,
    region_slug text,
    region text,
    currency text,
    pricing_unit text,
    treatment_area text,
    estimated_average numeric,
    estimated_median numeric,
    estimated_low numeric,
    estimated_high numeric,
    source_count integer,
    source_urls jsonb,
    methodology_note text,
    limitations text,
    researched_at date
  )
)
update public.regional_price_estimates estimate
set
  region_name = payload.region,
  currency = payload.currency,
  estimated_average = payload.estimated_average,
  estimated_median = payload.estimated_median,
  estimated_low = payload.estimated_low,
  estimated_high = payload.estimated_high,
  source_count = payload.source_count,
  source_urls = payload.source_urls,
  methodology_note = payload.methodology_note,
  limitations = payload.limitations,
  researched_at = payload.researched_at,
  publication_status = 'published',
  is_sample = false,
  updated_at = now()
from payload
join public.treatments treatment on treatment.slug = payload.entity_slug
where estimate.treatment_id = treatment.id
and estimate.comparison_group_slug is null
and estimate.country_code = payload.country
and estimate.region_slug = payload.region_slug
and estimate.pricing_unit = payload.pricing_unit
and coalesce(estimate.treatment_area, '') = coalesce(payload.treatment_area, '');

with payload as (
  select *
  from jsonb_to_recordset($prices$[
    {
      "entity_slug": "potenza",
      "country": "US",
      "region_slug": "los-angeles",
      "region": "Los Angeles",
      "currency": "USD",
      "pricing_unit": "per full-face session",
      "treatment_area": "face",
      "estimated_average": null,
      "estimated_median": null,
      "estimated_low": 1200,
      "estimated_high": 1600,
      "source_count": 2,
      "source_urls": [
        "https://www.deluxemedspa.com/non-surgical/potenza/",
        "https://beautyranchspa.com/potenza-rf-microneedling-los-angeles/"
      ],
      "methodology_note": "Compared Beauty Ranch's starting single-session full-face price with Deluxe Med Spa's regular full-face price. First-patient and package prices were excluded.",
      "limitations": "Only two current public sources qualified. Protocol, tip, area, anaesthesia, and provider can materially change a quote.",
      "researched_at": "2026-07-30"
    },
    {
      "entity_slug": "diamondglow",
      "country": "US",
      "region_slug": "los-angeles",
      "region": "Los Angeles",
      "currency": "USD",
      "pricing_unit": "per facial session",
      "treatment_area": "face",
      "estimated_average": 227.67,
      "estimated_median": 199,
      "estimated_low": 199,
      "estimated_high": 285,
      "source_count": 3,
      "source_urls": [
        "https://www.dermfx.com/pricing/",
        "https://shop.shorrbeauty.com/pages/diamond-glow-facial",
        "https://beautyranchspa.com/pricing/"
      ],
      "methodology_note": "Used DermFX's $199 listed session, Shorr Beauty's $199 45-minute session, and Beauty Ranch's $285 regular price. Beauty Ranch's temporary $199 special was excluded.",
      "limitations": "Session duration, serum, extractions, dermaplaning, masks, and other add-ons differ among providers.",
      "researched_at": "2026-07-30"
    }
  ]$prices$::jsonb) as estimate(
    entity_slug text,
    country text,
    region_slug text,
    region text,
    currency text,
    pricing_unit text,
    treatment_area text,
    estimated_average numeric,
    estimated_median numeric,
    estimated_low numeric,
    estimated_high numeric,
    source_count integer,
    source_urls jsonb,
    methodology_note text,
    limitations text,
    researched_at date
  )
)
insert into public.regional_price_estimates (
  treatment_id,
  comparison_group_slug,
  country_code,
  region_slug,
  region_name,
  currency,
  pricing_unit,
  treatment_area,
  estimated_average,
  estimated_median,
  estimated_low,
  estimated_high,
  source_count,
  source_urls,
  methodology_note,
  limitations,
  researched_at,
  publication_status,
  is_sample
)
select
  treatment.id,
  null,
  payload.country,
  payload.region_slug,
  payload.region,
  payload.currency,
  payload.pricing_unit,
  payload.treatment_area,
  payload.estimated_average,
  payload.estimated_median,
  payload.estimated_low,
  payload.estimated_high,
  payload.source_count,
  payload.source_urls,
  payload.methodology_note,
  payload.limitations,
  payload.researched_at,
  'published',
  false
from payload
join public.treatments treatment on treatment.slug = payload.entity_slug
where not exists (
  select 1
  from public.regional_price_estimates estimate
  where estimate.treatment_id = treatment.id
    and estimate.comparison_group_slug is null
    and estimate.country_code = payload.country
    and estimate.region_slug = payload.region_slug
    and estimate.pricing_unit = payload.pricing_unit
    and coalesce(estimate.treatment_area, '') = coalesce(payload.treatment_area, '')
);

-- Ensure the requested public launch set remains the featured indexable set.
update public.comparisons
set
  is_featured = true,
  is_indexable = true,
  publication_status = 'published',
  updated_at = now()
where slug = any(
  array[
    'botox-vs-dysport',
    'botox-vs-dermal-fillers',
    'juvederm-vs-restylane',
    'juvederm-voluma-vs-restylane-kysse',
    'sculptra-vs-radiesse',
    'thermage-vs-ultherapy',
    'morpheus8-vs-potenza',
    'hydrafacial-vs-diamondglow'
  ]
);

-- Fail atomically if the audit's publication and source invariants are not met.
do $validation$
declare
  invalid_count integer;
begin
  select count(*)
  into invalid_count
  from unnest(
    array[
      'neuromodulator',
      'collagen-stimulator',
      'energy-device',
      'xeomin',
      'daxxify',
      'restylane-lyft',
      'botox',
      'dysport',
      'ha-filler',
      'juvederm',
      'restylane',
      'juvederm-voluma',
      'restylane-kysse',
      'sculptra',
      'radiesse',
      'thermage',
      'ultherapy',
      'morpheus8',
      'potenza',
      'hydrafacial',
      'diamondglow'
    ]
  ) expected(slug)
  where not exists (
    select 1
    from public.treatments treatment
    where treatment.slug = expected.slug
  );
  if invalid_count > 0 then
    raise exception 'Content audit is missing % current treatment entities', invalid_count;
  end if;

  select count(*)
  into invalid_count
  from public.treatments treatment
  where treatment.slug = any(
    array[
      'neuromodulator',
      'collagen-stimulator',
      'energy-device',
      'xeomin',
      'daxxify',
      'restylane-lyft'
    ]
  )
  and treatment.publication_status <> 'review';
  if invalid_count > 0 then
    raise exception '% incomplete treatment entities remain published', invalid_count;
  end if;

  select count(*)
  into invalid_count
  from public.treatments treatment
  where treatment.slug = any(
    array[
      'botox',
      'dysport',
      'ha-filler',
      'juvederm',
      'restylane',
      'juvederm-voluma',
      'restylane-kysse',
      'sculptra',
      'radiesse',
      'thermage',
      'ultherapy',
      'morpheus8',
      'potenza',
      'hydrafacial',
      'diamondglow'
    ]
  )
  and (
    treatment.publication_status <> 'published'
    or treatment.is_sample
    or treatment.primary_purpose is null
    or treatment.mechanism is null
    or treatment.major_risks is null
    or treatment.fda_status is null
    or treatment.canada_status is null
    or treatment.evidence_grade is null
    or treatment.last_reviewed_at is null
    or exists (
      select 1
      from (
        values
          ('primary_purpose'),
          ('mechanism'),
          ('major_risks'),
          ('fda_status'),
          ('canada_status')
      ) required(claim_field)
      where not exists (
        select 1
        from public.treatment_sources source
        where source.treatment_id = treatment.id
          and source.claim_field = required.claim_field
          and source.is_sample = false
      )
    )
  );
  if invalid_count > 0 then
    raise exception '% launch treatment profiles fail the publication gate', invalid_count;
  end if;

  select count(*)
  into invalid_count
  from unnest(
    array[
      'botox-vs-dysport',
      'botox-vs-dermal-fillers',
      'juvederm-vs-restylane',
      'juvederm-voluma-vs-restylane-kysse',
      'sculptra-vs-radiesse',
      'thermage-vs-ultherapy',
      'morpheus8-vs-potenza',
      'hydrafacial-vs-diamondglow'
    ]
  ) expected(slug)
  where not exists (
    select 1
    from public.comparisons comparison
    where comparison.slug = expected.slug
      and comparison.publication_status = 'published'
      and comparison.is_featured
      and comparison.is_indexable
  );
  if invalid_count > 0 then
    raise exception '% requested comparisons fail the featured publication gate', invalid_count;
  end if;
end
$validation$;

-- No treatment_media, clinic, location, offer, submission, or clinic price
-- observation row is inserted, updated, or deleted by this migration.

commit;
