# OCCIVO Watchtower v1 — Operations

**Release:** Private deterministic exception scanner. No AI, no emails, no WhatsApp, no automatic purchase or status changes.

## Components and schedule

- Every 30 minutes (UTC cron */30 * * * *) on the *published* Netlify site. Netlify Scheduled Functions cannot be called through a public URL.
- AAL2 MFA-admin-only GET and POST on /api/admin-watchtower; POST means "Scan now".
- Supabase watchtower_runs and watchtower_alerts are private (RLS and no direct grants to anon/authenticated).
- The dashboard displays scan health, urgent/high/normal counts, clickable alerts, and a manual scan button.

## Alert rules

| Condition | Severity | What it signifies |
|---|---|---|
| New request | High | Awaiting triage; not evidence that a reply was not sent |
| New over 4 hours | Urgent | Internal escalation only |
| Outside UAE, country unspecified | High | Clarify exact delivery country and date |
| Today/tomorrow or within 3 days, still triaging/sourcing | Urgent | Short lead-time risk |
| Reviewing with no recorded update for 24 hours | High | Review requires attention |
| Sourcing with no recorded update for 48 hours | High | Supplier follow-up may be needed |
| Awaiting customer for 72 hours | Normal | Consider a single manual follow-up |
| Approved for 48 hours without a recorded update | High | Review procurement and fulfilment, not necessarily overdue |

A successful scan updates existing keyed alerts and resolves alerts whose conditions no longer hold. A failed scan does not clear the old queue. Alerts are not manually dismissible; operators resolve the underlying condition.

## Known limitations

- Intake captures relative timing (such as "within 2 weeks"), not a verified exact deadline.
- There are no verified email-sent, paid, dispatched, delivered, or quote-approved event timestamps yet.
- Updated_at is a coarse activity signal, not proof of a customer response or completed fulfilment.
- No automatic out-of-app notifications. All alerts are visible only in the private admin dashboard.
- The dashboard reports a late/stale scan after 75 minutes without a run.
- At most 5,000 active cases are scanned; reaching this limit fails rather than silently skipping remaining cases.

## Acceptance checklist

- [ ] Supabase private tables and service role permissions verified.
- [ ] Netlify deployed scheduled function and MFA-protected admin API.
- [ ] GitHub tests pass.
- [ ] Admin "Scan now" runs successfully (user with valid AAL2 session).
- [ ] Successful scan appears in watchtower_runs; alerts align with active cases.
- [ ] Changing case status resolves affected alerts on the next scan.
- [ ] Netlify scheduled invocation observed at the next half-hour mark.
- [ ] Email/WhatsApp intentionally left disabled until sender verification.

**No claim of continuous monitoring until a production scheduled run and saved alerts are verified.**
