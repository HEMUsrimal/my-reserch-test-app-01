-- PostgreSQL Schema for Sri Lankan Transit (Supabase)

-- 1. Create Drivers Table (Profile details linked to Auth.users)
create table if not exists public.drivers (
  id uuid references auth.users on delete cascade primary key,
  driver_nic text not null unique,
  full_name text not null,
  route_number text not null,
  route_name text not null,
  bus_category text not null check (bus_category in ('SLTB', 'Private', 'Semi-Luxury', 'Luxury')),
  ntc_permit_number text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for drivers table
alter table public.drivers enable row level security;

-- Create Policies for drivers table
create policy "Enable read access for all users"
  on public.drivers for select
  using (true);

create policy "Enable insert for authenticated users matching their uid"
  on public.drivers for insert
  with check (auth.uid() = id);

create policy "Enable update for drivers matching their uid"
  on public.drivers for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- 2. Create Live Transit Locations Table
create table if not exists public.live_transit_locations (
  bus_plate text primary key,
  driver_id uuid references public.drivers(id) on delete set null,
  route_number text not null,
  latitude double precision not null,
  longitude double precision not null,
  status text not null check (status in ('Active', 'Break', 'Emergency')),
  is_simulating boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for locations table
alter table public.live_transit_locations enable row level security;

-- Create Policies for locations table
create policy "Enable read access to locations for all users"
  on public.live_transit_locations for select
  using (true);

create policy "Enable upsert access to locations for active driver matching driver_id"
  on public.live_transit_locations for insert
  with check (auth.uid() = driver_id);

create policy "Enable update access to locations for active driver matching driver_id"
  on public.live_transit_locations for update
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);


-- 3. Enable Realtime database tracking for live locations
-- This adds the table to Supabase's Realtime publication
begin;
  -- If publication exists, add table to it
  alter publication supabase_realtime add table public.live_transit_locations;
commit;
