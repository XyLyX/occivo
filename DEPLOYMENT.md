# OCCIVO — Deployment and security gates

## Hosting
- In Netlify use GitHub XyLyX/occivo, branch main, publish directory public, Functions directory netlify/functions.
- Keep team-only visitor restrictions until QA passes; do not connect the production custom domain prematurely.
- Netlify deployment ID has not been independently confirmed from the connected project response.

## REQUIRED MANUAL SECRET CONFIGURATION
- Netlify environment-variable connector returned HTTP 403. Configure the following directly in Netlify UI: Project configuration > Environment variables.
- SUPABASE_SECRET_KEY: create a dedicated sb_secret_... key in OCCIVO Supabase Settings > API Keys. Scope must include Functions and it must be marked secret. Redeploy after saving.
- NEVER send a secret via chat or GitHub. Public project URL and publishable key are provided as safe server fallbacks.
- If this secret is absent the form fails safely with an explicit not-saved message.

## Supabase Auth: administrator
- In Supabase project vtpaxzptyyggapnlkoma open Authentication > Users > Add user and create the private OCCIVO administrator mailbox as a verified user with a unique strong password.
- Supabase Auth login is separate from the Netlify/Supabase dashboard login. Disable public signup for this internal-only project.
- Visit /admin.html, sign in, enroll an authenticator app, verify the TOTP code. Subsequent logins require TOTP.
- The server independently verifies the session, email confirmation and aal2 before any customer record is released.

## Release tests
1. Visit /concierge.html, complete a real test request with consent, verify receipt displays OC-... and the row appears in Supabase gift_requests.
2. Verify an event is written to gift_request_events. Bad requests and network failures must not show success.
3. Verify anonymous callers receive 403 for /api/admin-requests; no direct table reads with publishable keys.
4. Test /admin.html sign-in and TOTP. Check list, detail, status save and history update.
5. Test 320px/375px/1280px, keyboard-only selection and an actual NVDA/VoiceOver reader.
6. Ensure server function code under netlify/functions is not reachable as a published static file.
7. Confirm order and concierge mail aliases operate before relying on outbound customer communications.

## Other obligations
- Review UAE privacy and international data transfer risks: the Supabase database is hosted in EU Paris.
- Review licensing, consumer rights, delivery, replacement and payment duties before processing paid orders.
- Pilot packaging: individual luxury boxes from Duboxx; never compromise product or fulfilment quality for margin.
- Add retention, monitoring, spam/bot protection and operational SLA before opening unrestricted public intake.