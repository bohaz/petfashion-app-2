-- ============================================================
-- PET FASHION APP · Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── DOGS ────────────────────────────────────────────────────
create table if not exists dogs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  name          text not null,
  breed         text,
  weight        numeric,
  size          text default 'XS',
  coat          text default 'corto',
  owner_name    text,
  phone         text,
  notes         text,
  visit_count   int default 0,
  last_visit    timestamptz
);

-- ── APPOINTMENTS ────────────────────────────────────────────
create table if not exists appointments (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz default now(),
  dog_id              uuid references dogs(id) on delete set null,
  client_name         text,
  owner_name          text,
  phone               text,
  service             text not null,
  qty                 int default 1,
  start_time          timestamptz not null,
  end_time            timestamptz not null,
  duration_minutes    int default 120,
  price               numeric default 0,
  price_override      boolean default false,
  status              text default 'pendiente',
  notes               text,
  reminder_sent       boolean default false,
  confirmation_sent   boolean default false,
  review_requested    boolean default false,
  completed_at        timestamptz,
  created_by          uuid references auth.users(id)
);

-- ── BUSINESS EXPENSES ───────────────────────────────────────
create table if not exists business_expenses (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  date        date not null,
  category    text not null,
  amount      numeric not null,
  description text,
  created_by  uuid references auth.users(id)
);

-- ── HOME EXPENSES ───────────────────────────────────────────
create table if not exists home_expenses (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  date        date not null,
  category    text not null,
  amount      numeric not null,
  description text,
  created_by  uuid references auth.users(id)
);

-- ── SETTINGS (single row) ───────────────────────────────────
create table if not exists settings (
  id          int primary key default 1,
  prices      jsonb,
  durations   jsonb,
  templates   jsonb,
  business    jsonb,
  updated_at  timestamptz default now()
);

-- Insert default settings row
insert into settings (id) values (1) on conflict (id) do nothing;

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
alter publication supabase_realtime add table dogs;
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table business_expenses;
alter publication supabase_realtime add table home_expenses;
alter publication supabase_realtime add table settings;

-- ============================================================
-- ROW LEVEL SECURITY
-- Política: solo usuarios autenticados acceden a todo
-- (ambos dueños tienen acceso completo)
-- ============================================================
alter table dogs               enable row level security;
alter table appointments       enable row level security;
alter table business_expenses  enable row level security;
alter table home_expenses      enable row level security;
alter table settings           enable row level security;

-- Dogs
create policy "Authenticated users can do everything on dogs"
  on dogs for all to authenticated using (true) with check (true);

-- Appointments
create policy "Authenticated users can do everything on appointments"
  on appointments for all to authenticated using (true) with check (true);

-- Business expenses
create policy "Authenticated users can do everything on business_expenses"
  on business_expenses for all to authenticated using (true) with check (true);

-- Home expenses
create policy "Authenticated users can do everything on home_expenses"
  on home_expenses for all to authenticated using (true) with check (true);

-- Settings
create policy "Authenticated users can do everything on settings"
  on settings for all to authenticated using (true) with check (true);

-- ============================================================
-- INDEXES (performance)
-- ============================================================
create index if not exists idx_appointments_start_time on appointments(start_time);
create index if not exists idx_appointments_status on appointments(status);
create index if not exists idx_appointments_dog_id on appointments(dog_id);
create index if not exists idx_business_expenses_date on business_expenses(date);
create index if not exists idx_home_expenses_date on home_expenses(date);
