-- Trip expenses need a different category set than everyday spending
-- (flights/hotels vs rent/groceries). 'context' splits categories into
-- the general-purpose set (used by month + period types) and a
-- trip-only set.
alter table public.categories
  add column context text not null default 'general'
  check (context in ('general', 'trip'));

-- Re-scope the uniqueness constraints per context, so "Transport"
-- (general) and a differently-named trip category don't collide, and
-- a user could in principle have same-named categories in each context.
drop index public.categories_default_name_unique;
drop index public.categories_user_name_unique;
create unique index categories_default_name_unique
  on public.categories (name, context) where is_default = true;
create unique index categories_user_name_unique
  on public.categories (user_id, name, context) where user_id is not null;

insert into public.categories (name, is_default, user_id, context) values
  ('Flights', true, null, 'trip'),
  ('Accommodation', true, null, 'trip'),
  ('Local Transport', true, null, 'trip'),
  ('Sightseeing & Activities', true, null, 'trip'),
  ('Travel Insurance', true, null, 'trip'),
  ('Souvenirs', true, null, 'trip'),
  ('Dining Out', true, null, 'trip');
