-- Validation guards for the source-backed US/Canada MVP import.
-- This migration is additive and does not alter or delete clinics, locations,
-- offers, price observations, submissions, or source observations.

begin;

-- The supplied media manifest contains briefs for future original artwork,
-- not reusable assets. Existing launch media without verified rights must stay
-- out of public reads.
update public.treatment_media media
set
  publication_status = 'review',
  updated_at = now()
from public.treatments treatment
where media.treatment_id = treatment.id
  and treatment.slug = any(array[
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
  ])
  and media.publication_status = 'published'
  and (
    media.is_sample = true
    or media.rights_verified_at is null
  );

-- A launch profile remains public only while its critical sourced fields,
-- source records, controlled areas, and non-demonstration text remain valid.
update public.treatments treatment
set
  publication_status = 'review',
  updated_at = now()
where treatment.slug = any(array[
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
  ])
  and treatment.publication_status = 'published'
  and (
    treatment.is_sample = true
    or treatment.primary_purpose is null
    or treatment.mechanism is null
    or treatment.major_risks is null
    or treatment.fda_status is null
    or treatment.canada_status is null
    or treatment.evidence_grade is null
    or treatment.last_reviewed_at is null
    or cardinality(treatment.intended_areas) = 0
    or to_jsonb(treatment)::text ~* '(demonstration text|pending sourcing|pending research)'
    or exists (
      select 1
      from unnest(treatment.intended_areas) intended_area
      where intended_area <> all(array[
        'glabella',
        'forehead',
        'lateral canthal lines',
        'platysma bands',
        'lips',
        'upper perioral lines',
        'perioral lines',
        'nasolabial folds',
        'marionette lines',
        'lower face',
        'cheeks',
        'cheek wrinkles',
        'chin',
        'chin wrinkles',
        'jawline',
        'temples',
        'infraorbital hollow',
        'dorsal hands',
        'periorbital area',
        'brow',
        'submental area',
        'neck',
        'décolletage',
        'face',
        'body',
        'back',
        'acne scars',
        'scars'
      ])
    )
    or not exists (
      select 1
      from public.treatment_sources source
      where source.treatment_id = treatment.id
        and source.is_sample = false
    )
  );

-- Comparison publication follows the two treatment publication states.
update public.comparisons comparison
set
  publication_status = 'review',
  is_indexable = false,
  updated_at = now()
from public.treatments treatment_a, public.treatments treatment_b
where comparison.slug = any(array[
    'botox-vs-dysport',
    'botox-vs-dermal-fillers',
    'juvederm-vs-restylane',
    'juvederm-voluma-vs-restylane-kysse',
    'sculptra-vs-radiesse',
    'thermage-vs-ultherapy',
    'morpheus8-vs-potenza',
    'hydrafacial-vs-diamondglow'
  ])
  and treatment_a.id = comparison.treatment_a_id
  and treatment_b.id = comparison.treatment_b_id
  and (
    treatment_a.publication_status <> 'published'
    or treatment_b.publication_status <> 'published'
    or treatment_a.is_sample = true
    or treatment_b.is_sample = true
  );

-- Invalid or mixed-currency aggregate rows remain available for editorial
-- correction but cannot be returned by the public RLS policy.
update public.regional_price_estimates estimate
set
  publication_status = 'review',
  updated_at = now()
from public.treatments treatment
where estimate.treatment_id = treatment.id
  and treatment.slug = any(array[
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
  ])
  and estimate.publication_status = 'published'
  and (
    estimate.is_sample = true
    or estimate.source_count < 1
    or case
      when jsonb_typeof(estimate.source_urls) = 'array'
        then jsonb_array_length(estimate.source_urls)
      else 0
    end = 0
    or btrim(estimate.pricing_unit) = ''
    or btrim(estimate.currency) = ''
    or btrim(estimate.methodology_note) = ''
    or estimate.limitations is null
    or btrim(estimate.limitations) = ''
    or estimate.researched_at is null
    or estimate.estimated_low > estimate.estimated_high
    or (
      estimate.country_code = 'US'
      and estimate.currency <> 'USD'
    )
    or (
      estimate.country_code = 'CA'
      and estimate.currency <> 'CAD'
    )
  );

-- Fail atomically if a published launch row can bypass the guards above.
do $validation$
declare
  invalid_count integer;
begin
  select count(*)
  into invalid_count
  from public.treatments treatment
  where treatment.slug = any(array[
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
  ])
    and treatment.publication_status = 'published'
    and not exists (
      select 1
      from public.treatment_sources source
      where source.treatment_id = treatment.id
        and source.is_sample = false
    );
  if invalid_count > 0 then
    raise exception '% published launch treatments have no source records', invalid_count;
  end if;

  select count(*)
  into invalid_count
  from public.treatment_media media
  join public.treatments treatment on treatment.id = media.treatment_id
  where treatment.slug = any(array[
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
  ])
    and media.publication_status = 'published'
    and (
      media.is_sample = true
      or media.rights_verified_at is null
    );
  if invalid_count > 0 then
    raise exception '% launch media rows are published without verified rights', invalid_count;
  end if;

  select count(*)
  into invalid_count
  from public.regional_price_estimates estimate
  where estimate.publication_status = 'published'
    and (
      estimate.source_count < 1
      or case
        when jsonb_typeof(estimate.source_urls) = 'array'
          then jsonb_array_length(estimate.source_urls)
        else 0
      end = 0
      or btrim(estimate.currency) = ''
      or btrim(estimate.pricing_unit) = ''
      or estimate.researched_at is null
      or estimate.estimated_low > estimate.estimated_high
      or (
        estimate.country_code = 'US'
        and estimate.currency <> 'USD'
      )
      or (
        estimate.country_code = 'CA'
        and estimate.currency <> 'CAD'
      )
    );
  if invalid_count > 0 then
    raise exception '% published regional estimates fail source, range, or currency validation', invalid_count;
  end if;
end
$validation$;

commit;
