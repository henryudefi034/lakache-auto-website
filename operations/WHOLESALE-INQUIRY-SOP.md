# LAKACHE AUTO — Wholesale Inquiry Operations
Version 1.0 · Draft operating standard · Owner: Lakache Auto
Scope: wholesale vehicle/export inquiries; not retail sales, licensing advice, or automated eligibility approval.

## Operating principles
- Every lead has an owner, a status, a next action and a timestamp. No inquiry is considered a sale merely because it was submitted.
- CRM records are **unverified by default**. Never label a buyer verified without independently checking credentials and documenting the evidence.
- Separate customer service from compliance decisions. No payment, delivery commitment, export promise, or vehicle hold until appropriate verification and deal review.
- Keep personal information in the protected CRM; don't store ID documents, payment card data, banking details, passwords, or sensitive buyer records in GitHub, public forms, or ordinary email.
- Marketing contact is separate from transactional responses. Do not assume marketing consent from an inquiry.

## Standard pipeline and target response times
| CRM status | Meaning | Owner action |
| --- | --- | --- |
| new | Submission received, not reviewed | Check spam, duplicate, contact information, and vehicle interest; acknowledge within **1 business day** (internal service target, not guaranteed customer promise) |
| qualifying | Active eligibility and needs review | Confirm business identity, dealer/export credentials as relevant, destination, budget, timeline, logistics, and requested vehicle documentation |
| follow_up | Waiting on next buyer/seller action | Record a dated follow-up and specific next step; check follow-up queue each business day |
| negotiating | Qualified parties discussing commercial terms | Record offer, conditions, approvals and expiration; avoid binding commitments without review |
| won | Completed transaction with documented approvals | Reconcile sale and retain supporting documents under retention policy |
| lost | Opportunity did not proceed | Record reason; stop inappropriate outreach |
| closed | No further action or invalid/duplicate | Record reason; no silent deletion |

## Daily checklist (15–20 minutes)
1. Sign in to the private CRM; check new inquiries and follow-ups.
2. Acknowledge legitimate new inquiries, and assign an owner (initially the operator).
3. Review eligibility and vehicle availability before quoting final terms.
4. Update status, next action, follow-up date and activity note after each interaction.
5. Check mailbox/Formspree while migration is incomplete; don't assume all channels automatically enter CRM.
6. Escalate suspicious activity, requests for sensitive payment details, sanctions/export issues, or mismatched buyer identities.

## Minimum qualification fields
Buyer/contact name, email, business/company (if applicable), buyer type, destination country, vehicle interest, buying timeline, shipping plan, intended transaction channel and contact preference. A self-reported 'licensed dealer' selection is not proof of a license.

## Verification and deal gates
**Gate A — Initial review:** valid inquiry, deduplicated contact, reachable address, clear vehicle request.
**Gate B — Eligibility:** independently verify trade license/entity, business identity, relevant jurisdictional rules, and any applicable export/sanctions screening. For California wholesale-only activity, confirm the transaction is permitted for the actual buyer and structure; do not assume a foreign individual or company is automatically eligible.
**Gate C — Commercial approval:** verify vehicle title/status, disclosures, condition documentation, availability, price, deposit terms, shipping/export responsibilities, and written contract.
**Gate D — Fulfillment:** verify cleared payment through approved channels, signed documentation, release authorization, shipping documents, and delivery status. Keep auditable records.
Legal, tax, export, dealer licensing, privacy and sanctions requirements should be reviewed with qualified professionals as operations expand.

## Buyer communication templates
**Acknowledgment:** "Thank you for contacting Lakache Auto about [vehicle]. We've received your inquiry and will review the details. Before discussing transaction terms, we may need to confirm your business and purchasing eligibility. We'll follow up using your preferred contact method."
**Qualification request:** "To help us assess your inquiry, could you confirm your business name, location, dealer/export credentials (if applicable), destination country, desired vehicle, and buying timeline? Please don't email sensitive ID or financial documents; we'll provide a secure method if verification documents are needed."
**Follow-up:** "Following up on your inquiry about [vehicle]. Are you still interested, and is there anything you'd like us to clarify? We can discuss next steps once the relevant eligibility and vehicle details are confirmed."

## Controls and metrics
- Daily: new unreviewed leads, overdue follow-ups, unread form/mailbox messages.
- Weekly: inquiries by source, first-response time, qualified leads, conversion by stage, lost reasons, duplicates, aging by status.
- Monthly: audit permissions, backup/export procedures, data retention, failed submissions, spam rates, compliance exceptions.
- Keep admin access limited; enable MFA on GitHub, Supabase, Cloudflare, and email. Test a non-admin account cannot read CRM data.
- Set a written retention/deletion policy and privacy notice before collecting real buyer information.
- Track site inquiry IDs and email notification delivery; plan retry/idempotency before relying on automatic submission for production.

## Deployment gates
1. **Current:** website test page confirmed a new buyer and inquiry reached CRM; public contact still sends to Formspree.
2. **Preparation:** expand backend intake to capture full form context, protect against duplicates, decide transactional notification service and monitor failures.
3. **Pilot:** test full contact form with dummy data, Turnstile invalid/expired, mobile, failures, and staff handoff; confirm email notifications separately.
4. **Cutover:** switch the public form only after documented acceptance; maintain a working email fallback and rollback plan.
5. **Post-launch:** review logs and CRM daily for first two weeks; record incidents and improve workflow.

## Current limitations / next engineering tasks
- CRM lacks formal lead owner, deal value, activity history UI, duplicate detection, and structured qualification checklist.
- Current Edge Function creates one buyer per inquiry; a repeat buyer can create duplicates.
- Current Edge Function does not send an acknowledgment or notification email.
- Contact form contains additional fields (city/region, shipping, timeline, contact preference) not currently persisted as structured columns. Add columns or append them to an explicit context section of the inquiry message after validating lengths.
- Existing Formspree and other listing inquiry forms are separate; do not claim all inquiries automatically sync.
