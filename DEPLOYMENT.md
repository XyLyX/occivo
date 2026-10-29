# OCCIVO — Deployment, Operations and Launch Gates

## Ownership

- GitHub: XyLyX/occivo (main)
- Domain: occivo.com registered with Porkbun; domain DNS has not been configured by this repository.
- Netlify: use the OCCIVO-owned account, *not* the separate LegiSchola account currently connected to ChatGPT.
- Do not publicize a production URL until QA, privacy and service-readiness reviews have passed.

## Deploying to Netlify

1. Connect XyLyX/occivo under OCCIVO's own Netlify account.
2. Create a site from Git; main branch; no build command; publish directory `.`; functions directory `netlify/functions`.
3. Use a restricted preview during security, product and accessibility testing.
4. Confirm Netlify Forms detected form `gift-request` and that a real test submission appears in the restricted dashboard. Configure notifications to an authorised team mailbox, not a public web endpoint.
5. Verify project access, SSL, site settings and security headers before connecting occivo.com.

## Contact configuration

Public contact identities:

| Address | Public use |
| --- | --- |
| hello@occivo.com | General enquiries and homepage footer |
| concierge@occivo.com | Gifting advice and personal requests |
| orders@occivo.com | Order coordination, quote and vendor enquiries |
| support@occivo.com | After-sales and delivery help |

The private administrative mailbox must not be disclosed in public HTML, client scripts or public configuration. Email aliases, Zoho send-as identities, SPF, DKIM and DMARC must be configured and independently tested; adding mailto: links does not create mailboxes.

## Server-side AI

- Netlify function `netlify/functions/recommend.mjs`, route `/api/recommend`.
- Server-side environment variable `OPENAI_API_KEY` is optional. Without it, the client falls back to illustrative gift directions. Optional `OPENAI_MODEL` can select a supported Chat Completions model.
- Never put credentials into GitHub, forms, client JS or a response.
- No name, email or phone number is sent to the recommendation service. Only the gifting brief and optional preferences are sent.
- **Before enabling public paid AI requests, add rate limiting, logging/alerting, request quotas and abuse controls.**
- AI output is an idea, not an offer. Final procurement, box selection, quality control, delivery timing and price require human verification.

## Request privacy, legal and quality

- Pilot requests use Netlify Forms (subject to plan/product compatibility). This is not yet a role-based custom admin dashboard.
- Review the privacy notice for actual processors, recipient details, international transfers, retention/deletion and applicable UAE law before collecting public data. Restrict team access.
- Test Netlify Forms submission and notification delivery with the real deployed site; local static servers do not save requests.
- Review business licence, consumer rights, refund handling, trademark, payment acceptance and delivery liabilities before accepting paid orders.
- Use individually purchased premium boxes from Duboxx during the 90-day pilot; capture dimensions, SKU, packaging cost, suitability and customer experience data. Never trade down quality for margin.
- Source actual product imagery and photography consistent with the Warm Editorial brief; illustrations are placeholders.

## Accessibility and browser release gate

- Test keyboard navigation, focus states, form validation and skip links on mobile and desktop.
- Run a manual NVDA or VoiceOver test through recipient selection, idea choice and request submission.
- Review fonts: Cormorant Garamond and DM Sans currently have fallback stacks. Add licensed self-hosted assets with `font-display: swap` and test layout changes.
- Test contrast not only pairwise, but in real composed states (buttons on cards, input borders and focus on sand backgrounds, errors, disabled).
- Check reduced motion, low connectivity, privacy text and no horizontal overflow at narrow widths.
- No public marketing until the request pipeline and human concierge operations are reliable.
