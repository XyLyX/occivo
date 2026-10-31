# OCCIVO Agent Operations v0.1 — Controlled 90-day Pilot

Status: **Approved operating design, NOT deployed autonomous agents.** The initial live app already has customer intake and a private Supabase request ledger. First complete a real request end-to-end, admin MFA test and secure email routing; only then activate scheduled workers gradually.

## Purpose and design choice

Do not spin up an isolated agent per website module. Those quickly disagree, duplicate work and produce contradictory order statuses. Build **one deterministic case orchestrator**, four narrow specialist agents, and one deterministic Watchtower.

| Role | Trigger | Input | Output | Autonomy during pilot |
|---|---|---|---|---|
| Intake / Case Orchestrator (rules, not LLM) | New Supabase request | Validated gifting brief, consent, reference | Record, stage, urgency, deduplication and task assignment | Automate after verified request test |
| 1. Gifting Curator | Request awaiting directions | Minimized recipient preferences, occasion, budget, delivery, avoidance | Three distinct concept drafts and explanations tied to input | Draft only; no claims of stock or price |
| 2. Sourcing & Feasibility | Curator draft | Candidate gift categories, customer deadline and budget | Supplier options, evidence, price ranges, stock verification timestamps, delivery feasibility | Research and propose only; no purchase, vendor promises or contact without authorization |
| 3. Presentation & Fulfilment | Feasible shortlisted direction / approved order | Product sizes and handling needs; Duboxx box formats; delivery constraints | Packaging plan, QC checklist, fulfilment stages, issue alerts | Track/check; human approves packing and dispatch |
| 4. Concierge Communications | Verified option pack or customer follow-up | Verified choices, customer preferences, contact channel | Personalised three-directions reply draft, clarification draft, follow-up draft | Draft only; human sends after review |
| Watchtower (rules/reporting, not LLM) | Scheduled job after launch QA | Request statuses, timestamps and exception flags | Action queue, overdue cases, evidence gaps, weekly pilot metrics | Report internally; no automatic customer communication |

**The operator retains final control over:** customer messaging, quote issuance, order acceptance, supplier choice, substitutions, purchasing, refunds, payment confirmation and final dispatch. At pilot volumes, there is no benefit in separate autonomous purchasing or support agents.

## Single case record; no separate sheets

Source of truth is Supabase:
- public.gift_requests — request reference, email, optional WhatsApp, structured gifting_brief JSON, status, notes and consent timestamp.
- public.gift_request_events — event history.
- **Future, not yet created:** proposals/directions, candidate_supplier_quotes, contact_events, order_costs, packaging_qc, delivery_events. Add only when real cases prove the exact fields needed.
- Keep supplier identities, costs, margins and customer data private; never return them to the browser.
- Never make a second Zoho Sheet or Google Sheet the master operational tracker.

Current status enum is \`new → reviewing → sourcing → awaiting_customer → approved → fulfilled\`, with \`cancelled\` or \`closed\` exits. The application already uses this enum. Do not suddenly invent \`won\`, \`replied\`, \`quoted\`, \`paid\`, \`lost\`, \`delivered\` as status values without a migration and UI compatibility changes. Track such milestones as distinct **events** or separate structured fields when implemented.

## Agent rules (all share these)

1. Product quality, product authenticity, packaging, reliable fulfilment and recipient experience are HARD constraints. Profit margin is optimised only after those constraints pass; decline or reprice infeasible requests rather than silently downgrading.
2. AI may recommend concepts, not assert real stock, vendor price, purchase or delivery. Every factual supplier claim needs a source + verification timestamp + operator evidence review. Missing evidence means UNVERIFIED.
3. Respect customer budget as **all-in**, including item, individual Duboxx box, personalisation, consolidation, packaging material, delivery, replacements/contingency and applicable tax. Track contributions in AED, without falsely labelling them net profit.
4. Honour avoidance notes and culturally appropriate handling. Avoid unnecessary sensitive recipient data. Do not ask for recipient phone/email at intake.
5. Three proposals must differ in reason and character, not merely swap products in the same category. Each includes **concept, input-specific fit, estimated all-in AED band, verification state and delivery feasibility**.
6. Escalate within the same case: under 48h deadline, unsupported destination, ambiguous restrictions, adverse quality signal, verified supplier nonresponse, cost beyond budget, damaged item, customer complaint or unresolved delivery.
7. At least one human reviews source, budget, feasibility and wording **before** any options or quote are sent. Customer must approve final price before sourcing; operator approves procurement and QC before dispatch.
8. No agent may independently send customer messages, access admin account credentials, store passwords, disclose service-role secrets, purchase goods, or issue refunds during pilot.
9. All agent actions must be **idempotent**, keyed by request_ref + task version; store evidence timestamps and changes as events. Do not process the same intake twice.
10. The system must record exceptions honestly: \`unverified\`, \`awaiting_human\`, \`customer_question\`, \`blocked_sourcing\`; avoid fabricated claims of completion.

## Internal workflow — event-driven

1. **Submission:** Validate email/consent, store case and reference, create intake event. Only acknowledge a successful database write; never pretend email was sent.
2. **Triage:** Check urgent date, location, constraints, budget and omissions. Internal one-business-day first-response target; no public SLA until substantiated by real operations.
3. **Curation:** Draft three directions based on actual wording from the customer's form. Attach explanation and confidence.
4. **Sourcing:** Research up to a few credible candidates per direction. Evidence for price and availability required before they are called verified; calculate all-in cost.
5. **Operator review:** Reject unsupported or low-quality options. Approve the three-directions customer-facing draft and its feasibility caveats.
6. **Customer response:** Human sends from configured concierge@occivo.com and records send time. Replies and refinements stay attached to the same reference.
7. **Final quote/approval:** Confirm exact item(s), Duboxx box, total price, availability and delivery window, then seek explicit customer approval before purchase.
8. **Fulfilment:** Operator procures, inspects, assembles, checks presentation and dispatches; record delivery evidence and any recovery event.
9. **Learning:** Weekly metrics from actual transactions and resolved issues, not invented conversion/satisfaction numbers.

## Monitoring policy — after readiness

- Near-real-time alerts for deadline risk, new paid requests, missing evidence or delivery exceptions ONLY once job runner is reliably deployed.
- Daily internal Watchtower digest: new requests, age of oldest unresolved case, triage needed, reply due, sourcing blocked, approvals needed, unresolved issues.
- Weekly analysis: response-time distribution, quote acceptance, direction choice, on-time delivery, QC failures, packaging costs, contribution margin, customer recovery and repeat requests.
- Do not schedule paid AI loops on empty databases or blanket-scan every case. Rule-driven triggers, queue dedupe, budget caps and retries with backoff.
- A user-facing reminder or daily report should be opt-in; no silent WhatsApp or customer notifications.


## Curation policy binding (pilot v1.1)

The Curator, Sourcing and Communications agents must all follow [intake-to-directions-guide.md](./intake-to-directions-guide.md) and the human scan sheet [concierge-desk-card.md](./concierge-desk-card.md). A design-only machine-readable rule map is kept in `config/gifting-decision-policy.json`; it is **not** a deployed job runner or enforcement engine. Deadline, avoidance, budget, source evidence and product/packaging quality are simultaneous hard gates. The trio is Classic / Personal / Memorable, but **two verifiably good directions beat an invented third**. Most importantly, target 15–20 minutes of *editorial drafting* separately from variable sourcing, QC and cross-border delivery verification. Do not offer external SLA or claim autonomous email dispatch from this design.

## Launch gates

1. One real end-to-end dummy request produces a reference and a Supabase row, then displays correctly in MFA-protected admin.
2. A human can reply from the concierge alias and receive a reply back; aliases, authentication, SPF/DKIM/DMARC and any chosen sending service verified.
3. Manual 3-direction template passes QC and uses source evidence. No agent sends automatically.
4. Operator can log exact supplier quote, Duboxx box and fulfilment decision for 3–5 real cases.
5. Only then enable Curator draft generation; then sourcing research; then Watchtower reporting. Add autonomous execution only after failure and exception patterns are understood.

**The pilot's job is to learn whether customers trust OCCIVO and whether exceptional fulfilment can be delivered repeatedly—not to prove a multi-agent system can run without people.**
