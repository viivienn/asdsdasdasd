create type public.suggestion_status as enum ('new','accepted','rejected');

create table public.content_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  target_type text not null check (target_type in ('treatment','comparison','price','page','other')),
  target_slug text,
  title text not null check (char_length(title) between 3 and 200),
  body text not null check (char_length(body) between 10 and 8000),
  sources text[] not null default '{}',
  status public.suggestion_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.content_suggestions to authenticated;
grant all on public.content_suggestions to service_role;

alter table public.content_suggestions enable row level security;

create policy "suggestions insert own" on public.content_suggestions
  for insert to authenticated with check (created_by = auth.uid());
create policy "suggestions read own or admin" on public.content_suggestions
  for select to authenticated using (created_by = auth.uid() or (select private.has_role(auth.uid(),'admin'::app_role)));
create policy "suggestions admin update" on public.content_suggestions
  for update to authenticated using ((select private.has_role(auth.uid(),'admin'::app_role))) with check ((select private.has_role(auth.uid(),'admin'::app_role)));
create policy "suggestions admin delete" on public.content_suggestions
  for delete to authenticated using ((select private.has_role(auth.uid(),'admin'::app_role)));

create trigger content_suggestions_updated_at
  before update on public.content_suggestions
  for each row execute function public.set_updated_at();