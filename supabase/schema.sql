-- Gift Finance schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text,
  type text not null default 'Retirement',
  cls text not null,
  value numeric not null default 0,
  cost numeric not null default 0,
  nav numeric not null default 0,
  nav_prev numeric not null default 0,
  units numeric not null default 0,
  daily_pct numeric not null default 0,
  total_pct numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  balance numeric not null default 0,
  rate numeric not null default 0,
  monthly numeric not null default 0,
  interest numeric not null default 0,
  principal numeric not null default 0,
  years numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- One row per month, e.g. month = 'Jul 2026'
-- gross_income / pvd_pct are optional (nullable): when a month hasn't set them yet, the app
-- falls back to the most recent month that has, so the Savings Rate / PVD / retirement
-- projection figures never go blank, they just stay at the last real value until updated.
create table if not exists spending (
  id uuid primary key default gen_random_uuid(),
  month text not null unique,
  budget numeric not null default 0,
  income numeric not null default 0,
  gross_income numeric,
  pvd_pct numeric,
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
