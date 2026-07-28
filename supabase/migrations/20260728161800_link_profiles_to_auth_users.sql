-- profiles.id had no foreign key to auth.users, so deleting a user
-- left an orphaned profile row behind instead of cascading.
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;
