# Lakache Auto branded inquiry emails — deployment notes

## Status
The HTML/text rendering module is staged in this repository for review. **It is not yet deployed to Supabase.** GitHub Pages does not deploy Edge Functions. The currently working Supabase `website-inquiry` function must be updated separately.

## Integrate without changing the working CRM logic
1. In the existing Supabase `website-inquiry` Edge Function, add `email-templates.ts` beside `index.ts`.
2. Import:
   `import { customerConfirmation, internalSalesNotification } from "./email-templates.ts";`
3. After the CRM insert returns the real inquiry ID, map the validated payload/record to `InquiryEmailData`:
   - `inquiryId`: actual saved inquiry UUID (not just the client submission ID)
   - `buyerName`, `buyerEmail`, `phone`, `vehicle`, `destination`, `buyerType`, `message`
   - `location`, `shipping`, `timeline`, `contactPreference` only when separately available; otherwise leave empty. The current public form may append these details to the message field.
4. Call `const salesEmail = internalSalesNotification(data)` and `const buyerEmail = customerConfirmation(data)`.
5. In the existing Resend requests, replace the old `subject` and `text` values with `salesEmail.subject`, `salesEmail.text`, `html: salesEmail.html` (and equivalent buyer values).
6. **Preserve** current `from`, `to`, `reply_to`, Resend API key, CORS, Turnstile, CRM insert, duplicate handling, `trackEmail` and error handling exactly as they work now. Do not change environment variables.
7. Deploy only after inspecting the full live `index.ts` and confirming field names.

## Testing before deployment
- Render both HTML emails with fictional inquiry data, including special characters such as `<`, `&`, and quotes; ensure values are escaped.
- Send test emails through Resend and check Gmail desktop/mobile appearance and plain-text fallback.
- Verify sales and buyer email delivery and the matching inquiry UUID.
- Verify the CRM record and existing `crm_email_events` entries.
- Check that a Resend failure does not erase a saved inquiry.
- Verify the faded LA footer remains legible when images are disabled (it uses text, not a remote image).
- Only then activate the HTML messages.

## Design
- White body, dark charcoal header, restrained red accents, light gray LA footer watermark.
- Email-client-compatible table layout and inline CSS.
- Text-based LA mark avoids broken remote images; replace with a verified public logo URL later if desired.
- No external tracking pixels or embedded scripts.
