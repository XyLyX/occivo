# OCCIVO — Intake-to-Reply Decision Aid, Pilot v1.1

**Internal operating playbook / human + agent guide.** This document shapes recommendations; it does **not** certify supplier stock, prices, box inventory, courier availability, tax treatment, fulfilment or a customer response. See [agent-operations-v0.md](./agent-operations-v0.md) and [concierge-reply-template.md](./concierge-reply-template.md).

## A. Two-minute triage — hard constraints, not a ranking contest

Read in this sequence to identify blockers quickly. **All** hard constraints must pass before making an offer; a deadline does not override safety, customer exclusions, the all-in budget or fulfilment quality.

1. **Deadline:** Read timing band. If an actual promised day is necessary, establish the exact date, destination-local time and feasibility. The form currently collects a *relative band*, not a guaranteed delivery date.
2. **Destination:** Dubai area / elsewhere in UAE / outside UAE / self-delivery. **Outside UAE needs the country and, when needed, city or postal region**, before a delivery estimate or priced offer; clarify first.
3. **All-in budget:** Gift + individually sourced Duboxx presentation + personalisation + tax + shipping + reasonable direct handling/recovery provision; flag feasibility when budget and deadline collide. No unapproved above-budget option.
4. **Occasion, relationship and child age:** Set tone, appropriateness, intimacy and age-suitability.
5. **Avoidance:** Treat allergies, cultural concerns, dislikes, duplication and any age or regulatory limits as a veto, not a preference. Ask only necessary follow-up questions; avoid storing sensitive unnecessary details.
6. **Recipient's own words:** "About them," name (if shared), interests and personal context are the only source of personalised claims. **Never fabricate a hobby, shared memory or recipient personality.**
7. **Selected directions + presentation:** Use only to break ties and adapt the unboxing; not to overrule the preceding constraints.

**Triage outcomes**: \`READY_TO_CURATE\` if the brief is actionable; \`CLARIFY_DESTINATION\`, \`CLARIFY_DEADLINE\`, \`CLARIFY_AVOIDANCE\`, \`CLARIFY_FIT\`, or \`CANNOT_FULFIL_AS_SPECIFIED\` otherwise. These are internal working labels, **not** new database statuses. Record status in existing \`new/reviewing/sourcing/awaiting_customer/approved/fulfilled/cancelled/closed\` and note the exception until formal event fields are implemented.

## B. Three genuinely different directions — five-minute *draft*, not a fulfilment claim

Use three routes when possible:

| Direction | Purpose | Typical axis |
|---|---|---|
| **The Considered Classic** / safe & sure | Appropriate, high-quality and relatively low taste risk | Useful object, accessible quality, elegant presentation |
| **The Personal Touch** / thoughtful surprise | References something the customer genuinely told us | Interest-led keepsake, shared experience, personalisation |
| **The Memorable Gesture** / premium aspiration | Creates an exceptional, appropriate occasion moment | Experience, bespoke touch, special presentation |

Vary **at least one meaningful axis** across type, emotional intent, and presentation, but prefer two. Three nominally different hampers do not count. Show the tradeoff, not just different product names.

- Three is a **target**, never a reason to send a weak or unfulfillable third option.
- Two well-verified directions plus a plain explanation are better than three unsupported options.
- "Aspirational" means more distinctive **within the user's budget**. If a genuinely above-budget idea could be useful, ask permission first and label it unmistakably; do not silently upsell.
- Do not force a higher-priced option simply to fill lower/middle/upper price positions.
- A short personalised \`why_it_fits\` is mandatory. If no recipient preferences were supplied, ground reasoning in *occasion, relationship and stated constraints*, and explicitly identify the missing preferences rather than inventing them.

## C. Starting shapes by occasion (ideas, never commitments)

| Occasion | Considered Classic | Personal Touch | Memorable Gesture |
|---|---|---|---|
| Adult birthday | Quality everyday object | Interest-linked experience | Personal keepsake or composed set |
| Child birthday | Age-suitable book/game | Themed activity or kit | Bespoke safe item |
| Wedding | Useful, taste-aware home object | Shared experience | Personalised design item |
| Housewarming | Quality household essential | Suitable gourmet / welcome experience | Personalised home accent |
| Anniversary | Sentimental but useful | Experience for two | Taste-aware bespoke keepsake |
| New baby | Practical premium baby item | Personalised keepsake | Thoughtfully composed parent/baby set |
| Thank-you | Small well-presented gesture | Low-pressure experience | Personalised appreciation object |
| Corporate/client | Professionally appropriate object | Suitable experience | Custom premium piece |
| Just because | Small lovely object | Shared-interest surprise | Quiet personal keepsake |

Don't assume an experience can be booked, shipped or redeemed where the customer lives. For food/drink verify dietary, regional and shipping restrictions. Don't assume all recipients want personalisation or overt luxury.

## D. Budget viability guide (AED, inclusive end-to-end)

| Band | Reasonable starting forms | Common failure to avoid |
|---|---|---|
| Under 250 | Single excellent item, book, flowers, simple gourmet, refined packaging | Packaging/courier swallowing the budget; an affordable experience may still be suitable if verified |
| 250–500 | Quality small home item, curated compact gift, modest local experience | Multi-item sets with little QC/logistics allowance |
| 500–1,000 | Premium object or experience, small curated set | Bespoke assumptions, hidden delivery costs |
| 1,000–2,500 | Meaningful experience for two, design piece, careful customisation | Generic expensive hamper as a substitute for personal fit |
| 2,500–5,000 | Bespoke option, premium experience, high-quality multipart presentation | Enlarged cheap gift or unverified international fulfilment |
| 5,000+ / bespoke | Considered commission, high-end experience, extraordinary personal fit | Spending just to hit a price; there is no obligation to exhaust budget |

These are **hypotheses**, not product eligibility rules. Verify all actual prices and inclusions before communicating them.

## E. Personalisation — three minutes

For **each** proposed direction, fill:

- \`evidence_from_brief\`: customer wording / precise paraphrase, or only explicit relationship + occasion constraints if there was no recipient detail.
- \`why_it_fits\`: one sentence that *would not work unchanged for almost any other recipient*.
- \`difference_from_others\`: meaningful reason for this direction rather than an arbitrary label.

Examples: "They love cooking and rarely treat themselves" → "A considered kitchen object they would use repeatedly, chosen because cooking is one of their stated interests." Do **not** extrapolate to "they love luxury brands" unless told so.

If all justifications sound generic, ask one focused follow-up question or give an honestly provisional direction rather than manufacturing intimacy.

## F. Sourcing and delivery — a separate evidence-gated stage

**No credible seven-minute universal promise.** Some items may be researched rapidly; customised gifts and cross-border delivery may take hours/days to verify.

For each candidate record:
- [ ] **Vendor and exact SKU/service** identified, trustworthy and feasible, with source URL/direct supplier evidence and checked-at timestamp.
- [ ] **Price and direct costs in AED:** item, taxes, individual Duboxx box (size/quality and cost verified), wrapping, inscription/personalisation, logistics, insurance/customs where relevant and contingencies.
- [ ] **Quality and authenticity:** evidence of material/finish, vendor reliability and fault/return conditions. Do not accept a poorer item or box to improve margin.
- [ ] **Avoidance and suitability:** exclusions, age/cultural constraints and destination rules satisfied.
- [ ] **Delivery:** exact destination established, courier/supplier window checked for requested date, no false guarantees. Outside UAE requires country-specific handling and customs feasibility.
- [ ] **Presentation:** can actually assemble and deliver as shown; a handwritten note is a commitment only once production and timing are confirmed.
- [ ] **Backup:** at least the Classic direction has a viable alternate where feasible; otherwise disclose the dependency.
- [ ] **Margin:** indicative contribution = proposed price - directly attributable verified costs; it is **not** net profit.

**Evidence state per direction:** \`DRAFT\` → \`RESEARCHING\` → \`EVIDENCE_COMPLETE\` → \`HUMAN_APPROVED\`; if evidence missing, \`UNVERIFIED\` and blocked from fulfilment-ready representation. These are proposed internal agent states, not current database fields.

## G. Human approval + communication gate

- [ ] 2–3 credible directions, each tied to a real customer input.
- [ ] No hidden price increases or invented sourcing / shipping claims.
- [ ] Budget, avoid list, quality and packaging all pass.
- [ ] Every delivery and price statement states the source/verification age or uncertainty.
- [ ] Human reviewer chooses which directions to present, edits tone and explicitly approves.
- [ ] Reply sent **manually** from verified \`concierge@occivo.com\`; log actual timestamp in the same case.
- [ ] Customer may choose, request a refinement or decline; refine without losing request history.
- [ ] A customer who approves a concept **has not automatically placed or paid for an order**.

If verified sourcing cannot meet the *internal* response target, send a truthful **human-reviewed holding reply**. Never promise a completion time absent evidence. No public SLA until coverage and history substantiate it. Automatic receipts are not yet verified.

## H. Operating timing: what can be targeted vs guaranteed

| Work segment | Target for straightforward briefs | Promise? |
|---|---|---|
| Triage | ~2 minutes | Internal only |
| Draft three distinct concepts | ~5 minutes | Internal only |
| Write input-specific reasons | ~3 minutes | Internal only |
| Review proposal draft + compose acknowledgement | ~3–5 minutes | Internal only |
| Supplier evidence, packaging, tax and delivery validation | **Variable** by item and destination | **Never assume 7 minutes** |
| Send and log verified reply | Once approved and sender verified | Customer-facing SLA only after tested |

**The realistic target is ~15–20 minutes of editorial work, plus however long fulfilment verification takes.**

## I. Example — constraints can supersede curation

**Fictional example:** Partner/spouse anniversary; AED 1,000–2,500; request "within 2 weeks"; destination "outside UAE"; no hobbies or country specified.

**Correct result:** \`CLARIFY_DESTINATION\` and \`CLARIFY_DEADLINE\`; ask the destination country/city and exact delivery date. You may draft three tentative concepts internally, but must not claim they can be delivered or quote all-in prices without international sourcing evidence. Do not invent tastes or specific suppliers.
