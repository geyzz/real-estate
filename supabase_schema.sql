-- ============================================================
-- C and J Real Estate - Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor -> New Query
-- ============================================================

-- 1. Create PROPERTIES Table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  label text default 'Clean Title',
  main_info text not null,
  sub_info text not null,
  listing_price numeric not null,
  price_display text not null,
  terms text default 'Negotiable',
  province text not null,
  municipality text not null,
  barangay text not null,
  status text default 'Available',
  image_url text not null,
  created_at timestamptz default now()
);

-- 2. Create PROPERTY_SUB_LABELS Table
create table if not exists public.property_sub_labels (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  text text not null,
  icon text default 'shield',
  created_at timestamptz default now()
);

-- 3. Create PROPERTY_IMAGES Table
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- 4. Create INQUIRIES Table (For Contact Consultation Form)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text not null,
  contact_number text not null,
  message text,
  status text default 'Pending',
  created_at timestamptz default now()
);

create table if not exists public.inquiry_items (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  created_at timestamptz default now()
);

-- 5. Enable Row Level Security (RLS)
alter table public.properties enable row level security;
alter table public.property_sub_labels enable row level security;
alter table public.property_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;

-- 6. Create Open Access Policies for Public Client API
-- Properties: Public can View, Insert, Update, Delete
create policy "Allow public select on properties"
  on public.properties for select using (true);

create policy "Allow public insert on properties"
  on public.properties for insert with check (true);

create policy "Allow public update on properties"
  on public.properties for update using (true);

create policy "Allow public delete on properties"
  on public.properties for delete using (true);

-- Sub-labels policies
create policy "Allow public all on property_sub_labels"
  on public.property_sub_labels for all using (true) with check (true);

-- Images policies
create policy "Allow public all on property_images"
  on public.property_images for all using (true) with check (true);

-- Inquiries policies
create policy "Allow public insert on inquiries"
  on public.inquiries for insert with check (true);

create policy "Allow public select on inquiries"
  on public.inquiries for select using (true);

create policy "Allow public insert on inquiry_items"
  on public.inquiry_items for insert with check (true);

-- 7. Seed Initial 3 Properties (Excluding Pulong Santol for /admin testing)
insert into public.properties (label, main_info, sub_info, listing_price, price_display, terms, province, municipality, barangay, status, image_url)
values
  (
    'Clean Title',
    '2.9 Hectares • 29,870 SQM',
    '197.7m Length × 150m Width • 6 Meters Roadwide',
    1000,
    '₱1,000.00 / SQM',
    'Negotiable',
    'BATAAN',
    'Dinalupihan',
    'Bodega',
    'Available',
    'property1'
  ),
  (
    'Clean Title',
    '2.85 Hectares • 28,500 SQM',
    '193.7m W × 150m L • 70 SQM Resthouse and 500 SQM Fishpond',
    1300,
    '₱1,300.00 / SQM',
    'Negotiable',
    'BATAAN',
    'Dinalupihan',
    'San Simon',
    'Available',
    'property2'
  ),
  (
    'Clean Title',
    '2.8 Hectares • 28,083 SQM',
    '156m Width × 123m Length • 8–10 Meters Roadwide',
    1600,
    '₱1,600.00 / SQM',
    'Negotiable',
    'PAMPANGA',
    'Porac',
    'Sepung Bulaon',
    'Available',
    'property3'
  );
