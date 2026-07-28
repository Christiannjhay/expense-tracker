-- Supabase Auth already stores credentials in auth.users (email, hashed
-- password, etc.) — that table is managed by the Auth service and should
-- not be duplicated. This migration adds a public.profiles table that
-- mirrors each auth.users row (1 profile per account) for app-specific
-- data and for easy querying from the client without touching the
-- protected auth schema.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

-- Users can read only their own profile.
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Users can update only their own profile. `id` and `email` stay
-- server-controlled (via the trigger below), so only add columns like
-- full_name to the with-check list as the schema grows.
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert/delete policies: rows are created by the trigger below
-- (as SECURITY DEFINER, which bypasses RLS) and removed automatically
-- via the on-delete-cascade foreign key when the auth.users row is
-- deleted. Direct client inserts/deletes are denied by default.

-- Creates a profile row automatically whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
