-- Align the public comparison freshness badge with the completed 2026-07-30
-- launch-content audit. The source-backed treatment records were updated in
-- the preceding migration, but the comparison verification timestamp remained
-- on the prior calendar day.

update public.comparisons
set
  last_verified_at = '2026-07-30T00:00:00Z'::timestamptz,
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
)
and publication_status = 'published'
and is_sample = false;

do $validation$
declare
  invalid_count integer;
begin
  select count(*)
  into invalid_count
  from public.comparisons
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
  )
  and last_verified_at <> '2026-07-30T00:00:00Z'::timestamptz;

  if invalid_count > 0 then
    raise exception '% launch comparisons have a stale verification date', invalid_count;
  end if;
end
$validation$;
