-- Reconcile public.profiles with Supabase Auth: enable RLS, add
-- ownership policies, and auto-create a profile row on signup via
-- trigger. username has no signup UI yet, so it must be nullable.
alter table public.profiles alter column username drop not null;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

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

-- periods: user owns their own rows via user_id.
alter table public.periods enable row level security;
alter table public.periods force row level security;

create policy "Users can view own periods"
  on public.periods for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own periods"
  on public.periods for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own periods"
  on public.periods for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own periods"
  on public.periods for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- categories: user's own rows, plus shared is_default=true rows
-- (user_id is null on those) which are readable by everyone but not
-- editable by users.
alter table public.categories enable row level security;
alter table public.categories force row level security;

create policy "Users can view own or default categories"
  on public.categories for select
  to authenticated
  using ((select auth.uid()) = user_id or is_default = true);

create policy "Users can insert own categories"
  on public.categories for insert
  to authenticated
  with check ((select auth.uid()) = user_id and coalesce(is_default, false) = false);

create policy "Users can update own categories"
  on public.categories for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and coalesce(is_default, false) = false);

create policy "Users can delete own categories"
  on public.categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- expenses: no direct user_id, ownership derived through periods.
alter table public.expenses enable row level security;
alter table public.expenses force row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  to authenticated
  using (
    exists (
      select 1 from public.periods p
      where p.id = expenses.period_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Users can insert own expenses"
  on public.expenses for insert
  to authenticated
  with check (
    exists (
      select 1 from public.periods p
      where p.id = expenses.period_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Users can update own expenses"
  on public.expenses for update
  to authenticated
  using (
    exists (
      select 1 from public.periods p
      where p.id = expenses.period_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.periods p
      where p.id = expenses.period_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Users can delete own expenses"
  on public.expenses for delete
  to authenticated
  using (
    exists (
      select 1 from public.periods p
      where p.id = expenses.period_id
        and p.user_id = (select auth.uid())
    )
  );
