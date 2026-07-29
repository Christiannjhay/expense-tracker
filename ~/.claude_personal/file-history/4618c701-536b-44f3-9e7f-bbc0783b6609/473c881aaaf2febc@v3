alter table public.profiles
  add column currency text not null default 'USD'
  check (currency in ('USD','EUR','GBP','JPY','PHP','AUD','CAD','SGD'));
