-- Run in Lakache Auto Supabase SQL Editor before deploying the digest.
-- Tracks one reminder attempt per Pacific calendar day.
create table if not exists public.crm_followup_digest_runs (
  reminder_date date primary key,
  status text not null check (status in ('processing','accepted','failed')),
  due_count integer not null default 0,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.crm_followup_digest_runs enable row level security;
revoke all on public.crm_followup_digest_runs from anon, authenticated;
-- Edge Function uses the service role; no public browser access is needed.
-- Status 'accepted' means Resend accepted the request, not guaranteed inbox delivery.
-- A failed daily attempt is intentionally not retried automatically to avoid duplicates.
