-- Gift Finance schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- One row per fund PER MONTH (like debts/spending), e.g. code = 'SCBRM2', month = 'Sep 2026'.
-- Logging a fund update inserts a new month's row rather than overwriting, so the app can chart
-- a value/cost trend over time (Portfolio Growth, Net Worth Trajectory). The "current" value for
-- a fund is just its row for the most recent month. (code, month) is unique so re-saving the
-- same month corrects it instead of creating a duplicate.
create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text,
  type text not null default 'Retirement',
  cls text not null,
  month text,
  value numeric not null default 0,
  cost numeric not null default 0,
  nav numeric not null default 0,
  nav_prev numeric not null default 0,
  units numeric not null default 0,
  daily_pct numeric not null default 0,
  total_pct numeric not null default 0,
  updated_at timestamptz not null default now()
);
create unique index if not exists holdings_code_month_idx on holdings (code, month);

-- One row per debt PER MONTH (like spending), e.g. name = 'Home Loan', month = 'Sep 2026'.
-- Logging a balance update inserts a new month's row rather than overwriting, so the app
-- can chart a payoff trend over time. The "current" balance for a debt is just its row for
-- the most recent month. (name, month) is unique so re-saving the same month corrects it
-- instead of creating a duplicate.
create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  month text,
  balance numeric not null default 0,
  rate numeric not null default 0,
  monthly numeric not null default 0,
  interest numeric not null default 0,
  principal numeric not null default 0,
  years numeric not null default 0,
  updated_at timestamptz not null default now()
);
create unique index if not exists debts_name_month_idx on debts (name, month);

-- One row per month, e.g. month = 'Jul 2026'
-- gross_income / pvd_pct / pvd_employer_pct / tax_bracket_pct are optional (nullable): when a
-- month hasn't set them yet, the app falls back to the most recent month that has, so the
-- Savings Rate / PVD / retirement projection / tax-savings figures never go blank, they just
-- stay at the last real value until updated. pvd_pct is HER OWN PVD contribution rate;
-- pvd_employer_pct is the employer match rate — tracked separately since her rate rises over
-- time while the employer's stays fixed. tax_bracket_pct is her marginal Thai PIT rate, used to
-- estimate RMF/SSF/PVD tax savings in the Wealth Analysis tab.
create table if not exists spending (
  id uuid primary key default gen_random_uuid(),
  month text not null unique,
  budget numeric not null default 0,
  income numeric not null default 0,
  gross_income numeric,
  pvd_pct numeric,
  pvd_employer_pct numeric,
  tax_bracket_pct numeric,
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  date date not null,
  category text not null default 'Misc',
  description text,
  amount numeric not null,
  method text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_month_idx on transactions (month);

alter table holdings enable row level security;
alter table debts enable row level security;
alter table spending enable row level security;
alter table transactions enable row level security;

-- Single-user app using the public anon key with no auth configured, so these
-- policies grant the anon role full read/write access to every row. Anyone
-- who has the anon key (it ships in client-side JS) can read and edit this
-- data. Add Supabase Auth + narrower policies before this app has other users.
create policy "anon full access" on holdings for all using (true) with check (true);
create policy "anon full access" on debts for all using (true) with check (true);
create policy "anon full access" on spending for all using (true) with check (true);
create policy "anon full access" on transactions for all using (true) with check (true);
