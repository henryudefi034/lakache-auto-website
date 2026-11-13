# Lakache Auto CRM — deployment checklist

This is a **starter**, not a deployed production CRM. It is intentionally kept on the feature/private-crm-portal branch.

## Security prerequisites (required before publishing)
1. Confirm Supabase Auth is enabled; create the owner account manually, with MFA where available.
2. Inspect the actual schema of public.crm_admins and confirm its membership mapping to auth.users. The starter assumes crm_admins.user_id; adapt if different.
3. Enable and verify row-level security (RLS) for crm_inquiries, crm_buyers, crm_activities, crm_admins, and any other customer-data tables. Confirm non-admin authenticated users and anonymous visitors cannot SELECT, INSERT, UPDATE or DELETE protected records.
4. Verify that crm_admins membership cannot be self-assigned by clients. The browser-side admin check is UX only; RLS is the actual security boundary.
5. Configure Supabase Auth redirect URLs for https://crm.lakacheautos.com, restrict signups, and review authorized users.
6. Confirm the browser app uses only a Supabase publishable/anon key, NEVER a service-role or secret key.
7. Perform negative tests: logged out, non-admin user, admin user, expired session, and direct REST API access with anon key.
8. Add Content Security Policy, secure headers, and custom domain HTTPS at the eventual hosting provider. Consider pinning the Supabase JS version and self-hosting the dependency.

## Hosting
The public GitHub Pages site is not changed by this branch. Deploy only the crm/ directory to a separate host supporting HTTPS and custom domains, then point crm.lakacheautos.com via the DNS record supplied by that host. Avoid publishing the starter until prerequisites pass.

## Current scope
Read-only dashboard, search/filter, inquiry detail view, login/logout. No customer data writes. The summary counts reflect at most the latest 200 inquiries, not global totals. The displayed reference is a cosmetic preview generated from the UUID; the production reference must be stored or computed consistently using the inquiry creation year (not current year).

## Known integration considerations
- Existing website inquiry ingestion and Resend email templates remain unchanged.
- CRM table structure and RLS policies have not been independently verified.
- Customer identity joins, follow-up edits, notes, reminders, and pipeline writes are next-phase features.
