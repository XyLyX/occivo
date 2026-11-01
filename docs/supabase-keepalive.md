# OCCIVO Supabase keepalive fallback

**Status:** Zero-data SQL heartbeat function installed. GitHub Actions schedule: third calendar day, 05:17 UTC / 09:17 Dubai. Includes on-demand "Run workflow", and an initial push trigger for the first smoke test.

## What this does

- Calls POST /rest/v1/rpc/occivo_keepalive_v1 with a *publishable* project key. The RPC returns only integer 1 and uses SECURITY INVOKER. It does not query client tables or expose personal data.
- Sets HTTP timeout and retries transient errors twice. A failure marks the GitHub Actions run red.
- Limits the workflow token to read-only GitHub content.
- Uses the existing XyLyX/occivo repo. No cron-job.org signup, third-party action, or privileged GitHub secret is required.
- Runs on calendar days 1,4,7,... every month. This is **not an exact 72-hour interval** across month boundaries.

## Important limitations

- Supabase's **Free plan** may pause projects with insufficient user database activity in the prior week. Official guidance says a *few user requests per day* are typically enough, **but still not guaranteed**. One request every three days does not guarantee the project remains active. On Pro and higher plans, inactivity pausing is not applicable.
- The existing OCCIVO Netlify Watchtower is designed to query Supabase **every 30 minutes** if its schedule actually runs. Confirm the latest successful scheduled Watchtower scan separately. The GitHub heartbeat is only a backup, not a substitute for operational monitoring.
- GitHub scheduled workflows on public repositories are disabled automatically after 60 days of no repository activity, and scheduled runs can be delayed or skipped. Keep an eye on GitHub Actions and any Supabase pause warnings.
- This check is an activity probe, **not production uptime monitoring**. Green means the RPC returned 1. It does not confirm admin login, client requests, email or Watchtower alerts.

## How to verify

1. GitHub → XyLyX/occivo → Actions → **OCCIVO Supabase keepalive**. Check the green initial push-run.
2. Select **Run workflow** to retry manually if needed.
3. Expect the next recurring run on the next day-of-month matching the expression. Read its timestamp in GitHub Actions.
4. If GitHub stops scheduling because the repository is idle, resume the workflow; for reliability consider a dedicated monitoring service or Supabase Pro.

Function definition reference: docs/supabase-keepalive.sql.
