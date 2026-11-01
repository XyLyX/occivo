-- Private OCCIVO manual operator-contact records; applied via Supabase on 2026-11-01.
create table if not exists public.contact_events (
 id uuid primary key,
 gift_request_id uuid not null references public.gift_requests(id) on delete cascade,
 direction text not null default 'outbound' check (direction = 'outbound'),
 channel text not null check (channel in ('email','phone','whatsapp','other')),
 purpose text not null check (purpose in ('clarification','holding','directions','followup','other')),
 operator_note text,
 attestation text not null default 'operator_recorded' check (attestation = 'operator_recorded'),
 logged_at timestamptz not null default now()
);
create index if not exists contact_events_request_created_idx on public.contact_events(gift_request_id,logged_at desc);
alter table public.contact_events enable row level security;
revoke all on public.contact_events from anon, authenticated;
