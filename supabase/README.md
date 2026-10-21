# Lakache Auto Private Wholesale CRM — Phase 1
Status: database schema prepared, NOT deployed or connected. Existing public forms remain unchanged.

## Business goals
- Capture and qualify wholesale buyer inquiries.
- Track vehicle interests, follow-up dates, buyer verification, and sales outcomes.
- Record communication notes while separating marketing consent from inquiry submission.
- Measure lead-to-sale conversion and lost opportunities.

## Setup
1. Create a Supabase project under a Lakache Auto-controlled account at https://supabase.com/dashboard.
2. In the SQL editor, review and run `supabase/crm-schema.sql` once on the new project.
3. Enable Supabase Auth; turn off public signups for the admin application. Create the intended admin user securely.
4. Find that user's UUID in Auth > Users, and add it to `public.crm_admins` via the SQL editor. Never grant admin membership automatically based on email alone.
5. Use a publishable key only in frontend code, protected by RLS. Never commit secret keys.
6. Test signed-out access, non-admin signed-in access, and admin access before importing real customer information.
7. Decide whether to use Formspree's paid webhooks/API or a new secure ingestion endpoint; do not expose a database-write credential in GitHub Pages.
8. Implement data deletion, export, audit logging, backups, and privacy notice review before production use.

## Initial pipeline
new → qualifying → follow_up → negotiating → won / lost / closed

## Safety
Do not place customer PII in this public repository. Do not import customer inquiries before access policies are verified. The schema does not constitute a deployed CRM.
