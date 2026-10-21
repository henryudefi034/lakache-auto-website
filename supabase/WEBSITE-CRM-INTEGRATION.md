# Website → CRM integration (deployment pending)

The public contact page **still uses Formspree**. Do not change it until the secure endpoint is deployed and tested.

## Architecture
The browser posts inquiry details to a Supabase Edge Function. Cloudflare Turnstile verifies the submission; the function writes a buyer and linked inquiry using a server-only Supabase service-role key. No anonymous database INSERT grants are needed. Existing RLS remains enabled. The endpoint creates a new buyer per submission, so duplicates are possible and should be reviewed manually. Marketing consent is always false.

## Required configuration
1. Create a Cloudflare Turnstile widget for `lakacheautos.com`; obtain a **site key** (public) and **secret key** (private). Set hostname restriction.
2. Deploy `supabase/functions/website-inquiry/index.ts` as an Edge Function named `website-inquiry` with JWT verification **disabled** for public visitors. Supabase CLI example: `supabase functions deploy website-inquiry --no-verify-jwt`. Confirm deployment uses the correct Supabase project.
3. In Supabase Edge Function secrets set `TURNSTILE_SECRET_KEY` to the Turnstile secret. Supabase normally supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` automatically; verify these exist **only** server-side. Never commit or share them.
4. Add the Turnstile widget to the public form, then update the form submission JavaScript to POST JSON to `https://<project-ref>.supabase.co/functions/v1/website-inquiry` including `turnstile_token`. The Turnstile site key may be public. Do not enable this until deployment succeeds.
5. Test valid submission, expired/invalid Turnstile, cross-origin requests, missing fields, and CRM record creation. Verify Formspree remains the active fallback until cutover.
6. Independently test signed-out and signed-in non-admin direct database access. Review privacy notice, spam protection and rate limits before production. CORS is not authentication; Turnstile is the anti-abuse control, and further IP rate limiting is advisable.

## Fields accepted
`name` (required), `email` (required), `message` (required), `vehicle_interest`, `phone`, `company`, `buyer_type`, `destination_country`, `turnstile_token` (required), and hidden `website` honeypot.

## Operational note
The website is static GitHub Pages; it cannot safely store a service-role credential. This server function must be deployed separately. If Edge Functions are unavailable, a trusted Formspree webhook or server-side automation is an alternative, but should be verified for the user's Formspree plan.
