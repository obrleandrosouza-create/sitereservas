-- Extensões úteis
create extension if not exists pgcrypto;

-- Mesas
create table if not exists tables (
  id serial primary key,
  number int unique not null,
  capacity int not null,
  joinable boolean not null default false,
  created_at timestamptz default now()
);

-- Reservas
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  whatsapp text not null,
  phone text,
  email text,
  people int not null check (people > 0),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'CONFIRMED',
  source text not null default 'WEB',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reservation_tables (
  reservation_id uuid references reservations(id) on delete cascade,
  table_id int references tables(id) on delete restrict,
  primary key (reservation_id, table_id)
);

create index if not exists idx_res_start_end on reservations (start_time, end_time);
create index if not exists idx_res_status on reservations (status);
