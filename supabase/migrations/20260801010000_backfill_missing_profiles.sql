-- These auth.users rows predate the handle_new_user signup trigger and
-- never got a matching profiles row, which breaks any FK referencing
-- profiles(id) (e.g. periods_user_id_fkey) for those accounts.
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
