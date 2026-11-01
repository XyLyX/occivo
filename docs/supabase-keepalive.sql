-- Migration reference: live on Supabase project vtpaxzptyyggapnlkoma.
-- This function deliberately reads NO database tables and returns NO user data.
-- The API publishes a harmless constant under the anon role; no secret key is needed.
create or replace function public.occivo_keepalive_v1()
returns integer
language sql
stable
security invoker
set search_path = ''
as $body$
  select 1::integer;
$body$;
revoke all on function public.occivo_keepalive_v1() from public;
revoke all on function public.occivo_keepalive_v1() from authenticated;
grant execute on function public.occivo_keepalive_v1() to anon;
comment on function public.occivo_keepalive_v1()
  is 'OCCIVO low-impact, anonymous, public heartbeat. Returns constant 1 only; no customer data. Does not guarantee avoidance of Supabase free-plan inactivity pausing.';
