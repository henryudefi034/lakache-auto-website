-- Lakache Auto private CRM starter schema. Run only in your own Supabase SQL editor.
create extension if not exists pgcrypto;
create table if not exists public.crm_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.crm_buyers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  company text,
  buyer_type text,
  destination_country text,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected')),
  marketing_consent boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.crm_inquiries (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.crm_buyers(id) on delete set null,
  vehicle_interest text,
  message text,
  source text not null default 'manual',
  status text not null default 'new' check (status in ('new','qualifying','follow_up','negotiating','won','lost','closed')),
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.crm_inquiries(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.crm_admins enable row level security;
alter table public.crm_buyers enable row level security;
alter table public.crm_inquiries enable row level security;
alter table public.crm_activities enable row level security;
revoke all on public.crm_admins, public.crm_buyers, public.crm_inquiries, public.crm_activities from anon, authenticated;
grant select on public.crm_admins to authenticated;
grant select, insert, update, delete on public.crm_buyers, public.crm_inquiries, public.crm_activities to authenticated;
create policy "admins read own membership" on public.crm_admins for select to authenticated using (user_id = (select auth.uid()));
create policy "admins manage buyers" on public.crm_buyers for all to authenticated using (exists (select 1 from public.crm_admins a where a.user_id=(select auth.uid()))) with check (exists (select 1 from public.crm_admins a where a.user_id=(select auth.uid())));
create policy "admins manage inquiries" on public.crm_inquiries for all to authenticated using (exists (select 1 from public.crm_admins a where a.user_id=(select auth.uid()))) with check (exists (select 1 from public.crm_admins a where a.user_id=(select auth.uid())));
create policy "admins manage activities" on public.crm_activities for all to authenticated using (exists (select 1 from public.crm_admins a where a.user_id=(select auth.uid()))) with check (exists (select 1 from public.crm_admins a where a.user_id=(select auth.uid())));
-- After signing up through Supabase Auth, insert the intended admin's auth.users UUID
-- in crm_admins using the Supabase SQL editor. Never create a public signup-based admin grant.
