# OCCIVO · The Art of Thoughtful Gifting

Dubai-first premium gifting concierge — controlled beta.

## Customer journey
- Warm Editorial website with gifting brief, three concept directions and human sourcing request.
- The /api/requests Netlify Function writes only validated requests to Supabase when its secret is configured.
- If a write fails, the site explicitly says the request was NOT saved and directs customers to concierge@occivo.com.
- No payment acceptance, guaranteed inventory, quote, or delivery.

## Private operations
- /admin.html requires verified OCCIVO administrator Supabase Auth credentials and TOTP MFA (server checks aal2).
- View requests, change statuses, maintain internal notes, inspect event history.
- Anonymous and ordinary authenticated database table access is revoked and RLS is enabled.
- Secret credentials belong only in Netlify Functions environment variables.

## Configuration
- Repository: XyLyX/occivo. Netlify project: occivo.
- Supabase project: vtpaxzptyyggapnlkoma (EU Paris).
- Netlify publishes ONLY public/, while server functions remain in netlify/functions/.
- Read DEPLOYMENT.md before accepting real requests.