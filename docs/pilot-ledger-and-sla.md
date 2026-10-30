# OCCIVO 90-day Pilot — Data and Metrics

## Source of truth

Use existing private Supabase \`gift_requests\` + \`gift_request_events\`. **No parallel Zoho/Google tracker is needed.** One case reference across all customer emails, drafts, vendor evaluations and fulfilment records. The private dashboard currently shows up to 100 requests with stage filters; it is not yet a complete order/accounting system.

### Already live
- Request reference, receipt timestamp, customer email and optional WhatsApp
- Recipient name (optional), relationship, occasion, timing category, budget band, delivery area
- Optional notes, directions, exclusions, presentation and greeting-card preference
- Request status, internal notes, event log, consent timestamp
- No auto-confirmation email

### Data to add ONLY after confirming the intake-to-admin loop
- First human reply timestamp; three directions sent timestamp; sending identity
- Each direction's draft, verified candidate, sourcing source, verification time, all-in indicative quote
- Customer selection/refinement reason, quote validity and acceptance timestamp
- Actual ordered item/SKU, vendor; purchase and payment state (subject to licensing/payment readiness)
- Duboxx box SKU/size, packaging cost, gift-item cost, personalisation, delivery cost, replacements/refunds
- Quality inspection status and evidence; expected and actual delivery date; exception/recovery notes
- Permission to use feedback as testimonial (explicit opt-in)

### Status and milestones
Current statuses: new, reviewing, sourcing, awaiting_customer, approved, fulfilled, cancelled, closed. Do not map **approved** to **paid**, or **fulfilled** to **delivered on time**, without evidence. "Quoted", "replied", "won" and "lost" are separate outcomes/milestones requiring a documented mapping.

### Real KPI definitions
- First-response time: first timestamped human reply minus submitted_at.
- Directions turnaround: first timestamped verified three-directions message minus submitted_at.
- Proposal choice: customers who select one direction divided by customers who received proposals.
- Quote-to-paid conversion: paid orders divided by approved, sent quotes; only once payment records exist.
- On-time delivery: delivered on/before verified promised datetime divided by delivered orders with actual and promised timestamps.
- Contribution per order: paid amount minus item, packaging, personalisation, logistics, direct platform and recovery costs. Exclude overhead; call it contribution, not net profit.
- Quality incident rate: fulfilled orders with a defect, packaging or delivery exception divided by fulfilled orders.
- Repeat customers: unique repeat paying customer counts, with appropriate privacy controls.

Report "not measurable" rather than turning missing evidence into a flattering percentage.

### Operating cadence
- **Daily, once enabled**: review new and aged requests; stalled sourcing; unresolved support; upcoming deadlines; draft and approval queue.
- **Weekly**: triage response time, chosen directions, paid conversion, direct costs, quality exceptions and source reliability.
- **Monthly/90-day**: demand patterns, Duboxx individual box consumption and cost, repeat purchase, contribution margin and customer-experience evidence before considering bulk packaging.

Internal first-response goal: next UAE business day **only when staff coverage is defined**; no public or automatic promise yet.
