create type public.treatment_entity_type as enum ('class','brand_family','product','device','procedure');

alter table public.treatments
  add column entity_type public.treatment_entity_type not null default 'product',
  add column parent_id uuid references public.treatments(id) on delete set null,
  add column manufacturer text,
  add column sort_rank integer not null default 0,
  add column at_a_glance jsonb;

update public.treatments set entity_type = 'class' where slug in ('ha-filler');
update public.treatments set entity_type = 'device' where slug in ('ultherapy','thermage','morpheus8');
update public.treatments set entity_type = 'procedure' where slug in ('hydrafacial','diamondglow');
update public.treatments set entity_type = 'product' where slug in ('botox','dysport','sculptra','radiesse');

update public.treatments set manufacturer = 'Allergan Aesthetics' where slug = 'botox';
update public.treatments set manufacturer = 'Galderma' where slug in ('dysport','sculptra','restylane');
update public.treatments set manufacturer = 'Merz Aesthetics' where slug in ('radiesse','ultherapy','xeomin');
update public.treatments set manufacturer = 'Solta Medical' where slug = 'thermage';
update public.treatments set manufacturer = 'InMode' where slug = 'morpheus8';
update public.treatments set manufacturer = 'BeautyHealth' where slug = 'hydrafacial';
update public.treatments set manufacturer = 'Allergan Aesthetics' where slug = 'diamondglow';

alter table public.comparisons add column row_template text;

create table public.treatment_media (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  url text not null,
  alt_text text not null,
  media_role text not null default 'product_shot',
  credit text not null,
  source_url text not null,
  license text not null,
  license_url text,
  rights_verified_at timestamptz,
  publication_status public.publication_status not null default 'draft',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint treatment_media_role_check check (media_role in ('product_shot','device','diagram')),
  constraint treatment_media_license_check check (license in ('manufacturer_press','cc_by','cc_by_sa','licensed','own_work'))
);

create index treatment_media_treatment_id_idx on public.treatment_media(treatment_id);

grant select on public.treatment_media to anon;
grant select on public.treatment_media to authenticated;
grant all on public.treatment_media to service_role;

alter table public.treatment_media enable row level security;

create policy "Public can read verified published media"
  on public.treatment_media for select
  using (publication_status = 'published' and is_sample = false and rights_verified_at is not null);

create policy "Admins manage media"
  on public.treatment_media for all
  to authenticated
  using ((select private.has_role(auth.uid(),'admin'::public.app_role)))
  with check ((select private.has_role(auth.uid(),'admin'::public.app_role)));

create trigger update_treatment_media_updated_at
  before update on public.treatment_media
  for each row execute function public.set_updated_at();