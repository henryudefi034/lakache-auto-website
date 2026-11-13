-- Phase 3B: administrator assignment foundation (REVIEW BEFORE RUNNING)
-- Run once in Supabase SQL Editor. This does NOT create staff accounts or change RLS.
-- Only existing crm_admins can be assigned. Do not treat this as restricted staff access.
BEGIN;
ALTER TABLE public.crm_inquiries
  ADD COLUMN IF NOT EXISTS assigned_to uuid NULL;
-- Reject assignments to accounts outside the current CRM administrator allowlist.
-- Existing auth.users are referenced indirectly through crm_admins.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crm_inquiries_assigned_to_admin_fkey' AND conrelid = 'public.crm_inquiries'::regclass) THEN
    ALTER TABLE public.crm_inquiries
      ADD CONSTRAINT crm_inquiries_assigned_to_admin_fkey
      FOREIGN KEY (assigned_to) REFERENCES public.crm_admins(user_id)
      ON DELETE SET NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS crm_inquiries_assigned_to_idx ON public.crm_inquiries(assigned_to);
COMMIT;

-- Verification (read only):
-- SELECT column_name,data_type FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='crm_inquiries' AND column_name='assigned_to';
-- SELECT user_id,email FROM public.crm_admins ORDER BY email;

-- IMPORTANT: Current CRM only authenticates crm_admins, who retain existing admin permissions.
-- Before introducing non-admin staff, separately design least-privilege RLS and authenticated
-- actor tracking, then test those policies against the actual existing schema.
