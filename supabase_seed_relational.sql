-- ====================================================================
-- C and J Real Estate - Seed Script for Your Relational Schema
-- Run this in your Supabase Project -> SQL Editor -> New Query
-- ====================================================================

-- 1. Insert Provinces (Bataan and Pampanga)
insert into public.provinces (name)
values ('BATAAN'), ('PAMPANGA')
on conflict do nothing;

-- 2. Insert Municipalities
insert into public.municipalities (province_id, name)
select p.id, m.name
from public.provinces p
cross join (values 
  ('BATAAN', 'Dinalupihan'),
  ('PAMPANGA', 'Porac')
) as m(prov_name, name)
where p.name = m.prov_name
on conflict do nothing;

-- 3. Insert Barangays (Bodega, San Simon, Sepung Bulaon)
-- Note: Pulong Santol is intentionally excluded for your /admin test!
insert into public.barangays (municipality_id, name)
select m.id, b.name
from public.municipalities m
cross join (values 
  ('Dinalupihan', 'Bodega'),
  ('Dinalupihan', 'San Simon'),
  ('Porac', 'Sepung Bulaon')
) as b(mun_name, name)
where m.name = b.mun_name
on conflict do nothing;

-- 4. Insert Initial 3 Properties
insert into public.properties (
  province_id,
  municipality_id,
  barangay_id,
  label,
  main_info,
  listing_price,
  price_display,
  terms
)
select 
  p.id as province_id,
  m.id as municipality_id,
  b.id as barangay_id,
  d.label,
  d.main_info,
  d.listing_price,
  d.price_display,
  d.terms
from (
  values 
    (
      'BATAAN',
      'Dinalupihan',
      'Bodega',
      'Clean Title',
      '2.9 Hectares • 29,870 SQM',
      1000,
      '₱1,000.00 / SQM',
      'Negotiable'
    ),
    (
      'BATAAN',
      'Dinalupihan',
      'San Simon',
      'Clean Title',
      '2.85 Hectares • 28,500 SQM',
      1300,
      '₱1,300.00 / SQM',
      'Negotiable'
    ),
    (
      'PAMPANGA',
      'Porac',
      'Sepung Bulaon',
      'Clean Title',
      '2.8 Hectares • 28,083 SQM',
      1600,
      '₱1,600.00 / SQM',
      'Negotiable'
    )
) as d(prov_name, mun_name, brgy_name, label, main_info, listing_price, price_display, terms)
join public.provinces p on p.name = d.prov_name
join public.municipalities m on m.name = d.mun_name and m.province_id = p.id
join public.barangays b on b.name = d.brgy_name and b.municipality_id = m.id;

-- 5. Enable RLS and add public access policies so your website can read and add lots
alter table public.provinces enable row level security;
alter table public.municipalities enable row level security;
alter table public.barangays enable row level security;
alter table public.properties enable row level security;

create policy if not exists "Allow public select on provinces" on public.provinces for select using (true);
create policy if not exists "Allow public select on municipalities" on public.municipalities for select using (true);
create policy if not exists "Allow public select on barangays" on public.barangays for select using (true);
create policy if not exists "Allow public insert on barangays" on public.barangays for insert with check (true);

create policy if not exists "Allow public select on properties" on public.properties for select using (true);
create policy if not exists "Allow public insert on properties" on public.properties for insert with check (true);
create policy if not exists "Allow public update on properties" on public.properties for update using (true);
create policy if not exists "Allow public delete on properties" on public.properties for delete using (true);
