-- Corre isto no SQL Editor do teu projeto Supabase

create extension if not exists "uuid-ossp";

-- Tabela de rotas
create table public.routes (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  from_code     text not null,
  to_code       text not null,
  label         text not null,
  notify        boolean default true,
  threshold_eur numeric default 80,
  created_at    timestamptz default now()
);

-- Tabela de historico de precos
create table public.price_history (
  id             uuid default uuid_generate_v4() primary key,
  route_id       uuid references public.routes(id) on delete cascade not null,
  price          numeric not null,
  airline        text,
  departure_date text,
  return_date    text,
  duration_h     numeric,
  stops          integer default 0,
  checked_at     timestamptz default now()
);

-- Row Level Security
alter table public.routes        enable row level security;
alter table public.price_history enable row level security;

create policy "users_own_routes"
  on public.routes for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_own_history"
  on public.price_history for all
  using (
    exists (
      select 1 from public.routes
      where id = route_id and user_id = auth.uid()
    )
  );

-- Indices
create index on public.price_history(route_id, checked_at desc);
create index on public.routes(user_id);

-- ── MIGRATION (run if tables already exist) ──────────────────────────────────
alter table public.routes         add column if not exists date_from text;
alter table public.routes         add column if not exists date_to   text;
alter table public.price_history  add column if not exists rank      integer default 1;
alter table public.price_history  add column if not exists check_id  text;
alter table public.routes         add column if not exists passengers integer default 1;
