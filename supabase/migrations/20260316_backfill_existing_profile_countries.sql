-- Backfill existing profile records that were created before country/currency existed.
-- Safe to run multiple times.

alter table public.profiles
  add column if not exists country text,
  add column if not exists currency text;

alter table public.client_profiles
  add column if not exists country text,
  add column if not exists currency text;

alter table public.provider_profiles
  add column if not exists country text,
  add column if not exists currency text;

create or replace function public.currency_for_country(p_country text)
returns text
language sql
immutable
as $$
  select case upper(coalesce(trim(p_country), ''))
    when 'CA' then 'CAD'
    when 'US' then 'USD'
    when 'GB' then 'GBP'
    when 'FR' then 'EUR'
    when 'DE' then 'EUR'
    when 'ES' then 'EUR'
    when 'IT' then 'EUR'
    when 'NL' then 'EUR'
    when 'AU' then 'AUD'
    when 'NZ' then 'NZD'
    else 'USD'
  end;
$$;

-- Normalize existing profile values and fill missing country/currency.
update public.profiles
set
  country = coalesce(nullif(upper(trim(country)), ''), 'CA');

update public.profiles
set
  currency = coalesce(
    nullif(upper(trim(currency)), ''),
    public.currency_for_country(country)
  );

-- Backfill client profiles from profiles where possible.
update public.client_profiles cp
set
  country = coalesce(nullif(upper(trim(cp.country)), ''), p.country, 'CA')
from public.profiles p
where cp.user_id = p.id;

update public.client_profiles
set
  country = 'CA'
where country is null or trim(country) = '';

update public.client_profiles
set
  currency = coalesce(
    nullif(upper(trim(currency)), ''),
    public.currency_for_country(country)
  );

-- Backfill provider profiles from profiles where possible.
update public.provider_profiles pp
set
  country = coalesce(nullif(upper(trim(pp.country)), ''), p.country, 'CA')
from public.profiles p
where pp.user_id = p.id;

update public.provider_profiles
set
  country = 'CA'
where country is null or trim(country) = '';

update public.provider_profiles
set
  currency = coalesce(
    nullif(upper(trim(currency)), ''),
    public.currency_for_country(country)
  );
