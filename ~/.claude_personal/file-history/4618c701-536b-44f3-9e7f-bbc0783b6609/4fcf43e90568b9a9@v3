alter table public.periods drop constraint periods_type_check;
alter table public.periods
  add constraint periods_type_check
  check (type = any (array['month'::text, 'trip'::text, 'period'::text]));
