# Phase 3C — Staff Management & Permissions: security-first rollout

Status: DESIGN / READ-ONLY AUDIT. No production database changes.

## Confirmed from current frontend
- CRM login checks membership in public.crm_admins.
- Frontend queries crm_buyers, crm_inquiries, crm_activities, crm_admins directly using Supabase client.
- Assignment UI currently offers crm_admins user IDs, and "My inquiries" is a browser-side filter.
- Existing assigned_to references crm_admins(user_id) according to the prior migration reviewed by the owner.
- Current CRM supports inquiry editing, buyer editing, activity notes and follow-up export.

## Proposed roles
- owner: manages staff, settings and all records.
- sales_manager: sees and assigns team inquiries and buyer profiles.
- sales_rep: sees assigned inquiries and their linked buyers; can update permitted fields and log activities, but cannot self-assign, change role, verify a buyer or view unrelated customer data.
- inactive: cannot access CRM.

## Blocking security checks before any role rollout
1. Capture existing RLS status and policies for crm_admins, crm_buyers, crm_inquiries, crm_activities.
2. Inspect all tables, FKs, grants, triggers, functions, and public Edge Functions that access CRM records.
3. Determine how staff invitations and role grants are safely provisioned (server-only, owner-only).
4. Define ownership/role table without weakening existing crm_admins authorization.
5. Enforce permissions in database RLS and restricted functions, not browser filters.
6. Verify staff cannot query unrelated buyers, notes, exports, or activities via direct API.
7. Test admin, manager, representative, disabled user, anonymous user, and ownership changes.
8. Create reviewed migration, rollback, and acceptance tests; request explicit approval before production SQL or merge.

## Read-only Supabase SQL audit
Run in SQL Editor. This does not change any records.

```sql
SELECT c.table_schema,c.table_name,c.row_security,c.relforcerowsecurity
FROM (
  SELECT n.nspname AS table_schema,cl.relname AS table_name,
         cl.relrowsecurity AS row_security,cl.relforcerowsecurity AS relforcerowsecurity
  FROM pg_class cl JOIN pg_namespace n ON n.oid=cl.relnamespace
  WHERE n.nspname='public' AND cl.relname IN
    ('crm_admins','crm_buyers','crm_inquiries','crm_activities')
) c ORDER BY c.table_name;

SELECT schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
FROM pg_policies WHERE schemaname='public'
  AND tablename IN ('crm_admins','crm_buyers','crm_inquiries','crm_activities')
ORDER BY tablename,policyname;

SELECT table_name,column_name,data_type,is_nullable
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('crm_admins','crm_buyers','crm_inquiries','crm_activities')
ORDER BY table_name,ordinal_position;

SELECT tc.table_name,tc.constraint_name,tc.constraint_type,
       pg_get_constraintdef(pc.oid) AS definition
FROM information_schema.table_constraints tc
JOIN pg_namespace pn ON pn.nspname=tc.table_schema
JOIN pg_class cl ON cl.relname=tc.table_name AND cl.relnamespace=pn.oid
JOIN pg_constraint pc ON pc.conname=tc.constraint_name AND pc.conrelid=cl.oid
WHERE tc.table_schema='public'
  AND tc.table_name IN ('crm_admins','crm_buyers','crm_inquiries','crm_activities')
ORDER BY tc.table_name,tc.constraint_name;
```

## Non-goals until audit complete
- No role or staff tables added.
- No edits to production RLS.
- No frontend-only access controls presented as security.
- No staff invitations or production role assignments.

## UI plan after authorization is proven
Staff directory: full name, email, role, status, last activity.
Assignment selector: readable staff identity, searchable.
Queue: mine, unassigned, team (where authorized).
Audit history: actor ID, event, timestamp, target record, changes with sensitive data minimized.
