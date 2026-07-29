create type public.comparison_mode as enum ('direct', 'curated_cross_category');

alter table public.comparisons
  add column comparison_mode public.comparison_mode not null default 'direct';

alter table public.treatments
  add column pricing_basis text;

create table public.comparison_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.treatment_comparison_groups (
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  comparison_group_id uuid not null references public.comparison_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (treatment_id, comparison_group_id)
);

create table public.treatment_markets (
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  country_code text not null check (country_code in ('US', 'CA')),
  created_at timestamptz not null default now(),
  primary key (treatment_id, country_code)
);

create table public.comparison_markets (
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  country_code text not null check (country_code in ('US', 'CA')),
  sort_rank integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (comparison_id, country_code)
);

create index treatment_comparison_groups_group_id_idx
  on public.treatment_comparison_groups(comparison_group_id);
create index treatment_markets_country_code_idx
  on public.treatment_markets(country_code);
create index comparison_markets_country_code_sort_rank_idx
  on public.comparison_markets(country_code, sort_rank);

insert into public.comparison_groups (slug, name) values
  ('neuromodulator-brand', 'Neuromodulator brands'),
  ('ha-filler-family', 'HA filler families'),
  ('cheek-midface-filler-product', 'Cheek and midface filler products'),
  ('collagen-biostimulator', 'Collagen biostimulators'),
  ('noninvasive-lifting-device', 'Non-invasive lifting devices'),
  ('hydradermabrasion-facial', 'Hydradermabrasion facials')
on conflict (slug) do nothing;

insert into public.treatment_comparison_groups (treatment_id, comparison_group_id)
select t.id, g.id
from public.treatments t
join (values
  ('neuromodulator-brand', 'botox'),
  ('neuromodulator-brand', 'dysport'),
  ('neuromodulator-brand', 'xeomin'),
  ('neuromodulator-brand', 'daxxify'),
  ('ha-filler-family', 'juvederm'),
  ('ha-filler-family', 'restylane'),
  -- The existing record is named "Juvéderm Voluma XC" and uses this legacy slug.
  ('cheek-midface-filler-product', 'juvederm-voluma'),
  ('cheek-midface-filler-product', 'restylane-lyft'),
  ('collagen-biostimulator', 'sculptra'),
  ('collagen-biostimulator', 'radiesse'),
  -- The existing record is named "Thermage FLX" and uses this legacy slug.
  ('noninvasive-lifting-device', 'thermage'),
  ('noninvasive-lifting-device', 'ultherapy'),
  ('hydradermabrasion-facial', 'hydrafacial'),
  ('hydradermabrasion-facial', 'diamondglow')
) as mapping(group_slug, treatment_slug) on mapping.treatment_slug = t.slug
join public.comparison_groups g on g.slug = mapping.group_slug
on conflict do nothing;

update public.comparisons
set comparison_mode = 'curated_cross_category'
where slug in ('sculptra-vs-ha-filler', 'morpheus8-vs-ultherapy');

grant select on public.comparison_groups, public.treatment_comparison_groups,
  public.treatment_markets, public.comparison_markets to anon, authenticated;
grant all on public.comparison_groups, public.treatment_comparison_groups,
  public.treatment_markets, public.comparison_markets to service_role;

alter table public.comparison_groups enable row level security;
alter table public.treatment_comparison_groups enable row level security;
alter table public.treatment_markets enable row level security;
alter table public.comparison_markets enable row level security;

create policy "Public reads comparison groups" on public.comparison_groups for select using (true);
create policy "Public reads treatment group mappings" on public.treatment_comparison_groups
  for select using (
    exists (
      select 1
      from public.treatments t
      where t.id = treatment_id
        and t.publication_status = 'published'
        and t.is_sample = false
    )
  );
create policy "Public reads treatment markets" on public.treatment_markets
  for select using (
    exists (
      select 1
      from public.treatments t
      where t.id = treatment_id
        and t.publication_status = 'published'
        and t.is_sample = false
    )
  );
create policy "Public reads comparison markets" on public.comparison_markets
  for select using (
    exists (
      select 1
      from public.comparisons c
      where c.id = comparison_id
        and c.publication_status = 'published'
        and c.is_sample = false
    )
  );

create policy "Admins manage comparison groups" on public.comparison_groups for all to authenticated
  using ((select private.has_role(auth.uid(),'admin'::public.app_role)))
  with check ((select private.has_role(auth.uid(),'admin'::public.app_role)));
create policy "Admins manage treatment group mappings" on public.treatment_comparison_groups for all to authenticated
  using ((select private.has_role(auth.uid(),'admin'::public.app_role)))
  with check ((select private.has_role(auth.uid(),'admin'::public.app_role)));
create policy "Admins manage treatment markets" on public.treatment_markets for all to authenticated
  using ((select private.has_role(auth.uid(),'admin'::public.app_role)))
  with check ((select private.has_role(auth.uid(),'admin'::public.app_role)));
create policy "Admins manage comparison markets" on public.comparison_markets for all to authenticated
  using ((select private.has_role(auth.uid(),'admin'::public.app_role)))
  with check ((select private.has_role(auth.uid(),'admin'::public.app_role)));
