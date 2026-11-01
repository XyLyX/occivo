-- OCCIVO Watchtower schema reference, already applied to Supabase 2026-11-01.
-- Use this document for audits or creating another environment; Netlify does not execute it.
create table if not exists public.watchtower_runs (
 id uuid primary key default gen_random_uuid(), started_at timestamptz not null default now(),
 finished_at timestamptz, state text not null default 'running'
 check (state in ('running','success','failed')),
 scanned_count integer not null default 0 check (scanned_count >= 0),
 active_count integer not null default 0 check (active_count >= 0),
 error_message text);
create index if not exists watchtower_runs_started_at_idx on public.watchtower_runs(started_at desc);
alter table public.watchtower_runs enable row level security;
revoke all on public.watchtower_runs from anon, authenticated;
create table if not exists public.watchtower_alerts (
 alert_key text primary key,
 request_id uuid not null references public.gift_requests(id) on delete cascade,
 code text not null, severity text not null check (severity in ('urgent','high','normal')),
 title text not null, detail text not null,
 detected_at timestamptz not null default now(),
 last_seen_at timestamptz not null default now(),
 resolved_at timestamptz,
 scan_id uuid not null references public.watchtower_runs(id));
create index if not exists watchtower_alerts_open_idx on public.watchtower_alerts(resolved_at,severity,last_seen_at desc);
create index if not exists watchtower_alerts_request_idx on public.watchtower_alerts(request_id);
alter table public.watchtower_alerts enable row level security;
revoke all on public.watchtower_alerts from anon, authenticated;
