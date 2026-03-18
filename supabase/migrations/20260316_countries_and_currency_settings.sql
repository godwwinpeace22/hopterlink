-- Add country/currency support and admin-managed allowed countries.

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

update public.profiles
set
  country = coalesce(upper(trim(country)), 'CA'),
  currency = coalesce(currency, public.currency_for_country(country));

update public.client_profiles cp
set
  country = coalesce(cp.country, p.country),
  currency = coalesce(cp.currency, p.currency)
from public.profiles p
where cp.user_id = p.id;

update public.provider_profiles pp
set
  country = coalesce(pp.country, p.country),
  currency = coalesce(pp.currency, p.currency)
from public.profiles p
where pp.user_id = p.id;

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.app_settings enable row level security;

drop policy if exists "app settings readable by everyone" on public.app_settings;
create policy "app settings readable by everyone"
  on public.app_settings
  for select
  using (true);

drop policy if exists "app settings writable by admin" on public.app_settings;
create policy "app settings writable by admin"
  on public.app_settings
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

insert into public.app_settings (key, value)
values (
  'allowed_countries',
  '[{"code":"CA","name":"Canada"},{"code":"US","name":"United States"}]'::jsonb
)
on conflict (key) do nothing;
