# OCCIVO · Pilot request ledger (existing Supabase, no separate sheet)
The live source of truth is private public.gift_requests, NOT a new Zoho or Google Sheet. The admin application shows the latest 100 with status filters and individual details.

## Already captured
- request_ref (OC-XXXXXXXXXXXXXX)
- created_at / updated_at
- customer_email, optional customer_phone
- gifting_brief JSON: recipient, recipient_name, recipient_other, child_age, occasion, occasion_other, timing, budget, destination, dubai_area, about_them, directions, avoid, presentation, card_message, other_notes
- selected_concept: initially a placeholder saying human curation is pending
- status, internal_notes, consent_at, source
- events in gift_request_events

## Existing status mapping
- new — submitted; not yet reviewed
- reviewing — triage and personal curation
- sourcing — checking candidate products, packaging and delivery
- awaiting_customer — options sent or awaiting further response
- approved — customer approved verified offer; not necessarily paid
- fulfilled — completed and delivered
- cancelled — withdrawn
- closed — no further action, including lost prospects

For analysis, separate quoted, paid, won and lost would require future status additions and clearly defined business rules; don't mislabel a request as an order.

## 90-day KPIs
- Form start-to-submit conversion (requires consented analytics before instrumenting; not yet implemented)
- Submission-to-first-human-response elapsed hours
- Submission-to-three-directions elapsed hours
- Accepted proposal rate; cancellations/closed
- All-in proposed price vs actual gift, Duboxx box, sourcing, shipping, replacements
- Delivery promise adherence; quality incidents and recovery costs
- Top recipient/occasion/budget/delivery/location segments
- Avoidance/presentation-field usage and whether suggestions reflect them

## Response-time policy
Internal initial target: triage and respond within one UAE business day. **Do not publish as a guaranteed SLA until staffing and tracking substantiate it.** The website currently promises only a human reply, no time guarantee.

## Email automation status
No automatic confirmation emails are configured or verified. The website displays the stored request reference only after a successful Supabase write. Introduce a dedicated transaction mail provider (or compliant verified provider) and test sender identity, delivery and failure handling before enabling receipts.
