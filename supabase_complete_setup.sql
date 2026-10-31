-- ====================================================================
-- C & J Real Estate - Safe Idempotent Master Database Setup
-- Paste and run this in: Supabase -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Create PROVINCES table
create table if not exists public.provinces (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- 2. Create MUNICIPALITIES table
create table if not exists public.municipalities (
  id bigint generated always as identity primary key,
  province_id bigint not null references public.provinces(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (province_id, name)
);

-- 3. Create BARANGAYS table
create table if not exists public.barangays (
  id bigint generated always as identity primary key,
  municipality_id bigint not null references public.municipalities(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (municipality_id, name)
);

-- 4. Create PROPERTIES table
create table if not exists public.properties (
  id bigint generated always as identity primary key,
  province_id bigint references public.provinces(id) on delete set null,
  municipality_id bigint references public.municipalities(id) on delete set null,
  barangay_id bigint references public.barangays(id) on delete set null,
  label text default 'Clean Title',
  main_info text not null,
  sub_info text,
  listing_price numeric not null,
  price_display text not null,
  terms text default 'Negotiable',
  status text default 'Available',
  image_url text default 'property4',
  created_at timestamptz default now()
);

-- 5. Create PROPERTY_SUB_LABELS table
create table if not exists public.property_sub_labels (
  id bigint generated always as identity primary key,
  property_id bigint not null references public.properties(id) on delete cascade,
  text text not null,
  icon text default 'shield',
  created_at timestamptz default now()
);

-- 6. Create INQUIRIES & INQUIRY_ITEMS tables
create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  full_name text not null,
  email text not null,
  contact_number text not null,
  message text,
  status text default 'New',
  created_at timestamptz default now()
);

create table if not exists public.inquiry_items (
  id bigint generated always as identity primary key,
  inquiry_id bigint not null references public.inquiries(id) on delete cascade,
  property_id bigint references public.properties(id) on delete set null,
  created_at timestamptz default now()
);

-- 7. Enable RLS
alter table public.provinces enable row level security;
alter table public.municipalities enable row level security;
alter table public.barangays enable row level security;
alter table public.properties enable row level security;
alter table public.property_sub_labels enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;

-- 8. Drop existing policies first (prevents "already exists" errors)
drop policy if exists "Allow all on provinces" on public.provinces;
drop policy if exists "Allow all on municipalities" on public.municipalities;
drop policy if exists "Allow all on barangays" on public.barangays;
drop policy if exists "Allow all on properties" on public.properties;
drop policy if exists "Allow all on property_sub_labels" on public.property_sub_labels;
drop policy if exists "Allow all on inquiries" on public.inquiries;
drop policy if exists "Allow all on inquiry_items" on public.inquiry_items;

-- Also drop older policy names if any exist
drop policy if exists "Allow public select on provinces" on public.provinces;
drop policy if exists "Allow public select on municipalities" on public.municipalities;
drop policy if exists "Allow public select on barangays" on public.barangays;
drop policy if exists "Allow public select on properties" on public.properties;
drop policy if exists "Allow public insert on properties" on public.properties;
drop policy if exists "Allow public update on properties" on public.properties;
drop policy if exists "Allow public delete on properties" on public.properties;

-- Create Open Access Policies
create policy "Allow all on provinces" on public.provinces for all using (true) with check (true);
create policy "Allow all on municipalities" on public.municipalities for all using (true) with check (true);
create policy "Allow all on barangays" on public.barangays for all using (true) with check (true);
create policy "Allow all on properties" on public.properties for all using (true) with check (true);
create policy "Allow all on property_sub_labels" on public.property_sub_labels for all using (true) with check (true);
create policy "Allow all on inquiries" on public.inquiries for all using (true) with check (true);
create policy "Allow all on inquiry_items" on public.inquiry_items for all using (true) with check (true);

-- 9. Seed Initial Data (Central Luzon: Bataan & Pampanga)
-- (Pulong Santol, Porac, Pampanga is omitted so you can test adding it in /admin!)

insert into public.provinces (name)
values ('BATAAN'), ('PAMPANGA')
on conflict (name) do nothing;

insert into public.municipalities (province_id, name)
select p.id, m.name
from public.provinces p
cross join (values 
  ('BATAAN', 'Dinalupihan'),
  ('PAMPANGA', 'Porac')
) as m(prov_name, name)
where p.name = m.prov_name
on conflict (province_id, name) do nothing;

insert into public.barangays (municipality_id, name)
select m.id, b.name
from public.municipalities m
cross join (values 
  ('Dinalupihan', 'Bodega'),
  ('Dinalupihan', 'San Simon'),
  ('Porac', 'Sepung Bulaon')
) as b(mun_name, name)
where m.name = b.mun_name
on conflict (municipality_id, name) do nothing;

-- Insert 3 Initial Properties (only if not already seeded)
insert into public.properties (
  province_id, municipality_id, barangay_id,
  label, main_info, sub_info, listing_price, price_display, terms, image_url
)
select 
  p.id, m.id, b.id, d.label, d.main_info, d.sub_info, d.listing_price, d.price_display, d.terms, d.image_url
from (
  values 
    ('BATAAN', 'Dinalupihan', 'Bodega', 'Clean Title', '2.9 Hectares • 29,870 SQM', '197.7m Length × 150m Width • 6 Meters Roadwide', 1000, '₱1,000.00 / SQM', 'Negotiable', 'property1'),
    ('BATAAN', 'Dinalupihan', 'San Simon', 'Clean Title', '2.85 Hectares • 28,500 SQM', '193.7m W × 150m L • 70 SQM Resthouse and 500 SQM Fishpond', 1300, '₱1,300.00 / SQM', 'Negotiable', 'property2'),
    ('PAMPANGA', 'Porac', 'Sepung Bulaon', 'Clean Title', '2.8 Hectares • 28,083 SQM', '156m Width × 123m Length • 8–10 Meters Roadwide', 1600, '₱1,600.00 / SQM', 'Negotiable', 'property3')
) as d(prov_name, mun_name, brgy_name, label, main_info, sub_info, listing_price, price_display, terms, image_url)
join public.provinces p on p.name = d.prov_name
join public.municipalities m on m.name = d.mun_name and m.province_id = p.id
join public.barangays b on b.name = d.brgy_name and b.municipality_id = m.id
where not exists (
  select 1 from public.properties existing 
  where existing.barangay_id = b.id and existing.main_info = d.main_info
);

-- Insert Feature Highlights (sub_labels) for each property (if not already seeded)
insert into public.property_sub_labels (property_id, text, icon)
select prop.id, sub.text, sub.icon
from public.properties prop
join public.barangays b on b.id = prop.barangay_id
cross join lateral (
  select 'Clean Title Verified' as text, 'shield' as icon
  union all
  select 
    case 
      when b.name = 'Bodega' then 'Wide Road Access'
      when b.name = 'San Simon' then 'Fishpond & Resthouse'
      else '8–10m Roadwide Access'
    end, 'road'
  union all
  select 'Direct Owner Negotiation', 'handshake'
) sub
where not exists (
  select 1 from public.property_sub_labels psl 
  where psl.property_id = prop.id and psl.text = sub.text
);
