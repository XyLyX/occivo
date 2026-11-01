# OCCIVO — Manual Customer Contact Ledger v1

**Live pilot design:** A real first-response trail is required before Watchtower can distinguish a newly created record from an enquiry the operator has actually contacted.

## Security and data model
- Private Supabase table \`public.contact_events\` with RLS enabled; direct \`anon\` and \`authenticated\` access revoked.
- \`/api/admin-contacts\` requires confirmed admin Supabase MFA AAL2. No public endpoint or service key in the browser.
- An operator generates an idempotency UUID and explicitly checks **I personally confirm this outbound contact has already been sent**.
- Records channel, purpose, optional internal note, and the time **the operator logged the event**. It does not read any inbox or independently verify recipient delivery.
- A repeat click with the same UUID is idempotent. Contact history appears under the case detail, separate from status history.
- This release does not send mail or WhatsApp and does not alter a case's processing status.

## Watchtower response milestone
- The Watchtower scanner reads recorded outbound events in its private server-side job.
- If an active request is at least **four hours old** and no outbound record exists, an alert explicitly says **No first response recorded**.
- This does **not** mean the customer was necessarily never contacted. The operator may have sent a message but failed to log it; check the external mailbox first.
- Recording an outbound contact and running the next successful scan resolves that particular alert. It does not resolve case-triage or destination-missing alerts automatically.
- A missing contact event and a successful email delivery are completely separate facts.

## Correct operating sequence
1. Open the case in MFA-protected admin.
2. Use the **Open email draft** link to draft a message, and choose the **verified sender account** in the email client.
3. Actually send the response externally; do not assume opening an email draft constitutes delivery.
4. Return to the same case. Record the channel, message purpose and optional note, and attest that it has been sent.
5. Scan Watchtower; confirm the no-first-response-recorded alert clears. Update the case status separately.
6. Verify the mailbox can receive replies before attempting automated acknowledgements or future external alerts.

## Remaining gates
- Successful receipt and reply at \`concierge@occivo.com\` are **not yet verified**.
- **No mail delivery evidence** is integrated into Supabase.
- Scheduled Watchtower runs require separate verification; manual successful scans do not prove cron.
- Exact promised delivery dates, payments, QC, procurement and actual dispatch remain out of scope.
