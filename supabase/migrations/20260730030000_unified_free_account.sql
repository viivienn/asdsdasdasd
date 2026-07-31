-- Unified free-account research library.
-- Public editorial tables and their policies are intentionally unchanged.

create table public.saved_treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, treatment_id)
);

create table public.saved_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treatment_a_id uuid not null references public.treatments(id) on delete cascade,
  treatment_b_id uuid not null references public.treatments(id) on delete cascade,
  canonical_pair_key text not null,
  created_at timestamptz not null default now(),
  constraint saved_comparisons_canonical_order check (treatment_a_id < treatment_b_id),
  constraint saved_comparisons_pair_key_matches check (
    canonical_pair_key = treatment_a_id::text || ':' || treatment_b_id::text
  ),
  unique (user_id, canonical_pair_key)
);

create table public.user_research_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  postal_code text,
  region_slug text,
  updated_at timestamptz not null default now()
);

create table public.price_update_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treatment_id uuid references public.treatments(id) on delete cascade,
  comparison_group_slug text references public.comparison_groups(slug) on delete cascade,
  postal_code text,
  region_slug text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_update_subscription_subject check (
    treatment_id is not null or comparison_group_slug is not null
  )
);

create unique index price_update_subscriptions_treatment_unique
  on public.price_update_subscriptions (user_id, treatment_id, coalesce(postal_code, ''), coalesce(region_slug, ''))
  where treatment_id is not null;

create unique index price_update_subscriptions_group_unique
  on public.price_update_subscriptions (user_id, comparison_group_slug, coalesce(postal_code, ''), coalesce(region_slug, ''))
  where comparison_group_slug is not null;

alter table public.saved_treatments enable row level security;
alter table public.saved_comparisons enable row level security;
alter table public.user_research_preferences enable row level security;
alter table public.price_update_subscriptions enable row level security;

revoke all on public.saved_treatments from anon;
revoke all on public.saved_comparisons from anon;
revoke all on public.user_research_preferences from anon;
revoke all on public.price_update_subscriptions from anon;

grant select, insert, update, delete on public.saved_treatments to authenticated;
grant select, insert, update, delete on public.saved_comparisons to authenticated;
grant select, insert, update, delete on public.user_research_preferences to authenticated;
grant select, insert, update, delete on public.price_update_subscriptions to authenticated;

grant all on public.saved_treatments to service_role;
grant all on public.saved_comparisons to service_role;
grant all on public.user_research_preferences to service_role;
grant all on public.price_update_subscriptions to service_role;

create policy "saved_treatments own read"
  on public.saved_treatments for select to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "saved_treatments own insert"
  on public.saved_treatments for insert to authenticated
  with check (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "saved_treatments own update"
  on public.saved_treatments for update to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)))
  with check (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "saved_treatments own delete"
  on public.saved_treatments for delete to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));

create policy "saved_comparisons own read"
  on public.saved_comparisons for select to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "saved_comparisons own insert"
  on public.saved_comparisons for insert to authenticated
  with check (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "saved_comparisons own update"
  on public.saved_comparisons for update to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)))
  with check (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "saved_comparisons own delete"
  on public.saved_comparisons for delete to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));

create policy "user_research_preferences own read"
  on public.user_research_preferences for select to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "user_research_preferences own insert"
  on public.user_research_preferences for insert to authenticated
  with check (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "user_research_preferences own update"
  on public.user_research_preferences for update to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)))
  with check (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "user_research_preferences own delete"
  on public.user_research_preferences for delete to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));

create policy "price_update_subscriptions own read"
  on public.price_update_subscriptions for select to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "price_update_subscriptions own insert"
  on public.price_update_subscriptions for insert to authenticated
  with check (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "price_update_subscriptions own update"
  on public.price_update_subscriptions for update to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)))
  with check (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));
create policy "price_update_subscriptions own delete"
  on public.price_update_subscriptions for delete to authenticated
  using (user_id = auth.uid() or (select private.has_role(auth.uid(), 'admin'::public.app_role)));

create trigger user_research_preferences_updated_at
  before update on public.user_research_preferences
  for each row execute function public.set_updated_at();

create trigger price_update_subscriptions_updated_at
  before update on public.price_update_subscriptions
  for each row execute function public.set_updated_at();
