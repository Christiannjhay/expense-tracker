-- These 3 collided with pre-existing default categories of the same
-- name (from an earlier seed migration); none had any expenses.
delete from public.categories where id in (20, 22, 23);

-- Prevent this from happening again: only one default category per
-- name, and no duplicate category names within a single user's own
-- categories.
create unique index categories_default_name_unique
  on public.categories (name) where is_default = true;
create unique index categories_user_name_unique
  on public.categories (user_id, name) where user_id is not null;
