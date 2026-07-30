-- Universal comparison and regional-estimate infrastructure.
-- This migration is additive: existing treatment facts, sources, clinics,
-- price observations, offers, and prior migrations remain intact.

do $$
begin
  if exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'comparison_mode'
      and e.enumlabel = 'curated_cross_category'
  ) then
    alter type public.comparison_mode
      rename value 'curated_cross_category' to 'different_approach';
  end if;
end
$$;

alter table public.treatments
  add column if not exists intended_areas text[] not null default '{}';

alter table public.comparisons
  add column if not exists title_override text,
  add column if not exists description_override text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_indexable boolean not null default false,
  add column if not exists sort_rank integer not null default 0,
  add column if not exists last_verified_at timestamptz;

create table if not exists public.comparison_family_rules (
  id uuid primary key default gen_random_uuid(),
  left_group_slug text not null references public.comparison_groups(slug) on delete cascade,
  right_group_slug text not null references public.comparison_groups(slug) on delete cascade,
  comparison_mode public.comparison_mode not null default 'different_approach',
  template_key text not null,
  public_label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comparison_family_rules_order check (left_group_slug < right_group_slug),
  unique (left_group_slug, right_group_slug)
);

create table if not exists public.regional_price_estimates (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid references public.treatments(id) on delete cascade,
  comparison_group_slug text references public.comparison_groups(slug) on delete cascade,
  country_code text not null check (country_code in ('US', 'CA')),
  region_slug text not null,
  region_name text not null,
  currency text not null,
  pricing_unit text not null,
  treatment_area text,
  estimated_average numeric(12,2),
  estimated_median numeric(12,2),
  estimated_low numeric(12,2) not null,
  estimated_high numeric(12,2) not null,
  source_count integer not null check (source_count >= 0),
  source_urls jsonb not null default '[]'::jsonb,
  methodology_note text not null,
  researched_at date not null,
  publication_status public.publication_status not null default 'draft',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint regional_price_estimates_subject check (
    num_nonnulls(treatment_id, comparison_group_slug) = 1
  ),
  constraint regional_price_estimates_range check (estimated_low <= estimated_high)
);

create table if not exists public.postal_region_map (
  id uuid primary key default gen_random_uuid(),
  country_code text not null check (country_code in ('US', 'CA')),
  postal_prefix text not null,
  region_slug text not null,
  city_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, postal_prefix)
);

create index if not exists regional_price_estimates_treatment_region_idx
  on public.regional_price_estimates(treatment_id, country_code, region_slug);
create index if not exists regional_price_estimates_group_region_idx
  on public.regional_price_estimates(comparison_group_slug, country_code, region_slug);
create index if not exists postal_region_map_lookup_idx
  on public.postal_region_map(country_code, postal_prefix);

insert into public.comparison_groups (slug, name) values
  ('neuromodulator', 'Neuromodulators'),
  ('dermal-filler', 'Dermal fillers'),
  ('ha-filler-brand-family', 'HA filler brand families'),
  ('ha-filler-product', 'HA filler products'),
  ('collagen-biostimulator', 'Collagen biostimulators'),
  ('noninvasive-lifting-device', 'Non-invasive lifting devices'),
  ('rf-microneedling-device', 'RF microneedling devices'),
  ('resurfacing-device', 'Resurfacing devices'),
  ('hydradermabrasion-procedure', 'Hydradermabrasion procedures')
on conflict (slug) do update set name = excluded.name;

insert into public.treatment_comparison_groups (treatment_id, comparison_group_id)
select t.id, g.id
from public.treatments t
join (values
  ('neuromodulator', 'neuromodulator'),
  ('neuromodulator', 'botox'),
  ('neuromodulator', 'dysport'),
  ('neuromodulator', 'xeomin'),
  ('neuromodulator', 'daxxify'),
  ('dermal-filler', 'ha-filler'),
  ('dermal-filler', 'juvederm'),
  ('dermal-filler', 'restylane'),
  ('dermal-filler', 'juvederm-voluma'),
  ('dermal-filler', 'restylane-lyft'),
  ('ha-filler-brand-family', 'juvederm'),
  ('ha-filler-brand-family', 'restylane'),
  ('ha-filler-product', 'juvederm-voluma'),
  ('ha-filler-product', 'restylane-lyft'),
  ('collagen-biostimulator', 'sculptra'),
  ('collagen-biostimulator', 'radiesse'),
  ('noninvasive-lifting-device', 'thermage'),
  ('noninvasive-lifting-device', 'ultherapy'),
  ('rf-microneedling-device', 'morpheus8'),
  ('hydradermabrasion-procedure', 'hydrafacial'),
  ('hydradermabrasion-procedure', 'diamondglow')
) as mapping(group_slug, treatment_slug) on mapping.treatment_slug = t.slug
join public.comparison_groups g on g.slug = mapping.group_slug
on conflict do nothing;

insert into public.comparison_family_rules (
  left_group_slug,
  right_group_slug,
  comparison_mode,
  template_key,
  public_label,
  is_active
) values (
  'dermal-filler',
  'neuromodulator',
  'different_approach',
  'cross_category',
  'Beginner comparison',
  true
)
on conflict (left_group_slug, right_group_slug) do update set
  comparison_mode = excluded.comparison_mode,
  template_key = excluded.template_key,
  public_label = excluded.public_label,
  is_active = excluded.is_active,
  updated_at = now();

-- Pair metadata only: the public matrix still comes from the two profiles.
-- Indexability remains gated in application code by profile completeness and
-- source records, so this row cannot promote incomplete medical content.
insert into public.comparisons (
  treatment_a_id,
  treatment_b_id,
  slug,
  comparison_mode,
  row_template,
  is_featured,
  is_indexable,
  sort_rank,
  publication_status,
  is_sample
)
select
  least(botox.id, filler.id),
  greatest(botox.id, filler.id),
  'botox-vs-dermal-fillers',
  'different_approach',
  'cross_category',
  true,
  true,
  20,
  'published',
  false
from public.treatments botox
cross join public.treatments filler
where botox.slug = 'botox'
  and filler.slug = 'ha-filler'
on conflict (pair_key) do update set
  slug = excluded.slug,
  comparison_mode = excluded.comparison_mode,
  row_template = excluded.row_template,
  is_featured = excluded.is_featured,
  is_indexable = excluded.is_indexable,
  sort_rank = excluded.sort_rank,
  publication_status = excluded.publication_status,
  is_sample = excluded.is_sample,
  updated_at = now();

update public.comparisons
set
  is_featured = true,
  is_indexable = true
where slug in (
  'botox-vs-dysport',
  'botox-vs-dermal-fillers',
  'juvederm-vs-restylane',
  'sculptra-vs-radiesse',
  'thermage-vs-ultherapy',
  'hydrafacial-vs-diamondglow'
);

grant select on public.comparison_family_rules, public.regional_price_estimates,
  public.postal_region_map to anon, authenticated;
grant all on public.comparison_family_rules, public.regional_price_estimates,
  public.postal_region_map to service_role;

alter table public.comparison_family_rules enable row level security;
alter table public.regional_price_estimates enable row level security;
alter table public.postal_region_map enable row level security;

create policy "Public reads active comparison family rules"
  on public.comparison_family_rules for select
  using (is_active = true);

create policy "Public reads published regional price estimates"
  on public.regional_price_estimates for select
  using (publication_status = 'published' and is_sample = false);

create policy "Public reads postal region mappings"
  on public.postal_region_map for select
  using (true);

create policy "Admins manage comparison family rules"
  on public.comparison_family_rules for all to authenticated
  using ((select private.has_role(auth.uid(),'admin'::public.app_role)))
  with check ((select private.has_role(auth.uid(),'admin'::public.app_role)));

create policy "Admins manage regional price estimates"
  on public.regional_price_estimates for all to authenticated
  using ((select private.has_role(auth.uid(),'admin'::public.app_role)))
  with check ((select private.has_role(auth.uid(),'admin'::public.app_role)));

create policy "Admins manage postal region mappings"
  on public.postal_region_map for all to authenticated
  using ((select private.has_role(auth.uid(),'admin'::public.app_role)))
  with check ((select private.has_role(auth.uid(),'admin'::public.app_role)));

create trigger comparison_family_rules_updated_at
  before update on public.comparison_family_rules
  for each row execute function public.set_updated_at();
create trigger regional_price_estimates_updated_at
  before update on public.regional_price_estimates
  for each row execute function public.set_updated_at();
create trigger postal_region_map_updated_at
  before update on public.postal_region_map
  for each row execute function public.set_updated_at();
