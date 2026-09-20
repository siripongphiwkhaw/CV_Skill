-- Per-account CV data, isolated by Supabase Auth identity (auth.users).
-- One row per account: id == auth.uid() of the owning account.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.cv_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  cv jsonb,
  profile jsonb,
  session jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cv_profiles enable row level security;
alter table public.cv_profiles force row level security;

-- Account can read only its own row.
create policy cv_profiles_select on public.cv_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Account can update only its own row.
create policy cv_profiles_update on public.cv_profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Account can insert only its own row (normally done by the trigger below,
-- kept here in case a client ever needs to upsert directly).
create policy cv_profiles_insert on public.cv_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Auto-create an empty cv_profiles row whenever a new account signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.cv_profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Keep updated_at current on every write.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cv_profiles_set_updated_at
  before update on public.cv_profiles
  for each row execute function private.set_updated_at();
