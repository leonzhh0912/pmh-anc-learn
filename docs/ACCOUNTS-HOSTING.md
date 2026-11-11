# Accounts: hosting, providers, costs and go-live steps

**Nothing here has been bought, created or deployed.** Every item marked **DECISION** needs a named PMH person.
Prices and rules were checked on official pages on 2026-11-11 (sources at the end). They change, so re-check
them before buying.

## Decided on 2026-11-11 (relayed by the developer)

- **H1 (revised):** a server **inside Phimai Hospital** running self-hosted Supabase, no cloud
  (docs/HOSPITAL-SERVER-SETUP.md). The Thai-cloud guide stays as an alternative.
- **H3/H4 (revised the same day, budget):** no SMS or email sender. Staff create patient accounts and print
  slips (patient ID + random password); administrators create staff accounts the same way. The SMS sender
  (ThaiBulkSMS/SMSMKT) stays in the code, switched off.
- **Privacy/IT (H8):** PMH IT approved; the director approved keeping de-identified data 5 years for research
  (reported by the developer).
- **H5:** TOTP authenticator app for staff.
- **H7:** owners will be added.
- **Retention:** de-identified data is kept 5 years after an account is deleted.

The step-by-step setup is in **docs/THAI-CLOUD-SETUP.md**. H2 (no Supabase plan needed when self-hosting; the cost
is the server), H6 and H8 remain.

## Decisions PMH must make (BLOCKED until made)

| # | Decision | Options | Notes |
|---|---|---|---|
| H1 | **Where learner data lives** | (a) Supabase Cloud, Singapore `ap-southeast-1` (no Thailand region); (b) self-hosted Supabase in Thailand (AWS `ap-southeast-7` Bangkok, Google Cloud `asia-southeast3` Bangkok, or a Thai government or hospital cloud) | (a) is a cross-border transfer (PDPA s.28/29), which needs a lawful basis. Whether learning activity linked to a maternity clinic is "health data" (s.26) is a privacy-officer question. A 2025 DGA draft says s.26 data *should* stay in Thailand (draft; status unconfirmed). Self-hosting means PMH IT owns TLS, updates, backups and keys (minimum 4 GB RAM, 2 CPU, 40 GB). |
| H2 | **Plan** | Supabase Free (pauses after 1 week of inactivity, no backups) vs **Pro from US$25/month** (daily backups kept 7 days, no pausing); PITR +US$100/month for 7 days | Free is not acceptable for real users. |
| H3 | **Email sender for codes** | Amazon SES (Singapore has an SMTP endpoint; about US$0.10 per 1,000), Resend (free 3,000/month), Postmark (US$15/month) | Supabase's built-in email sends only to team members (about 2 per hour). A custom SMTP sender is **required** for real users. Needs a sending domain with SPF/DKIM set up by hospital IT. |
| H4 | **SMS for phone sign-in** | Twilio (about US$0.0305 per SMS to Thailand), Thai providers via the send-SMS hook (SMSMKT 0.30–0.60 THB/SMS plus VAT, minimum package 1,000 THB; ThaiBulkSMS from 0.15 THB, terms unconfirmed) | Thailand requires a **registered sender ID**. Unregistered IDs have been blocked since 6 Oct 2025, and registration takes about 2 weeks (Twilio). A Thai provider needs a small Edge Function for the hook. Budget per sign-in, not per user. |
| H5 | **Staff second factor** | TOTP authenticator app (free, built) vs phone-SMS MFA (US$75/month add-on) | TOTP is implemented and tested. |
| H6 | **Where the app is served** | Keep GitHub Pages (no custom security headers) or move to Cloudflare Pages / Netlify (custom headers via `_headers`) or a hospital server | GitHub's own docs say Pages "shouldn't be used for sensitive transactions like sending passwords". A host with headers is recommended for the accounts build. |
| H7 | **Owners and costs** | Who holds the Supabase organisation, billing, the SMS and email accounts and the domain; at least two PMH owners each | The project must not depend on one person's accounts. |
| H8 | **Privacy approval** | PMH privacy/IT sign-off of the purpose, retention, deletion, caregiver accounts and the Thai notice (`/privacy` page, DRAFT) | docs/ACCOUNTS-SCOPE.md lists every item. |

**Cheapest workable starting point for discussion only (not a recommendation to buy):** email sign-in only,
Supabase Pro in Singapore (if H1 allows), and SES or Resend for email. Phone sign-in added later, once a Thai
sender ID is registered. Roughly US$25–35 per month plus SMS usage.

## Configuration (no secrets in Git)

| Where | Variable | Notes |
|---|---|---|
| App build (public values) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Template: `app/accounts.env.example` (copy to `app/.env.accounts.local`). Build with `npm run build:accounts`. The publishable key is designed to be public: access is enforced by RLS and functions. **Never** put a secret or service-role key in a `VITE_` variable. |
| Supabase project (dashboard or CLI) | SMTP host, user and password; SMS provider credentials or send-SMS hook secret | Stored in Supabase, never in Git. |
| Operators only | database password, secret key | Needed for `bootstrap_admin`, deleting accounts and restores. Keep in PMH's password manager. |

Production auth settings to apply in the hosted project (the local `config.toml` values are for development):
- email `otp_length` 6 and `otp_expiry` 600;
- resend cooldown (`max_frequency`) 60 s;
- rate limits: emails per hour suited to clinic volume, SMS per hour capped to the budget;
- CAPTCHA (Turnstile or hCaptcha) on sign-up if abuse appears;
- `minimum_password_length` ≥ 10 if passwords are ever enabled;
- email confirmations on (codes verify the address);
- TOTP enrol and verify on;
- sessions: consider an inactivity timeout for staff.

**Redirect URLs.** Codes are typed in, so no sign-in links or redirects are used. Still set `site_url` and the
allowed redirect list to the exact production origin(s) only.

**Email templates.** `backend/supabase/templates/otp-code.html` (Thai, shows `{{ .Token }}`) for both the
"Confirm signup" and "Magic Link" templates. Copy it into the hosted project.

**SMS.** Delete the local `dev_only` hook and the placeholder Twilio block. Configure the approved provider or
an HTTPS send-SMS hook. Test with consenting staff phones before any patient uses it.

**HTTPS.** HTTPS is required everywhere: the app origin, the Supabase API and the SMTP connection (TLS).
Supabase Cloud and Pages provide it. A self-hosted setup needs certificates and auto-renewal.

**Security headers** (on a host that allows them):
- `Content-Security-Policy`:
  - `default-src 'self'`
  - `connect-src 'self' https://<project>.supabase.co`
  - `img-src 'self' data:`
  - `media-src 'self'`
  - `style-src 'self' 'unsafe-inline'`
  - `frame-ancestors 'none'`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

GitHub Pages cannot send headers. A `<meta>` CSP is possible there, but `frame-ancestors` doesn't work in it.

## Backups, monitoring, release and rollback

- **Backups.**
  - Pro: daily backups kept 7 days; PITR is optional.
  - Self-hosted: nightly `pg_dump` to encrypted storage in Thailand, kept for the period PMH sets.
  - **Restore drill before go-live:** restore into a staging project, then run `backend/tests` against it. This
    has NOT been done yet.
- **Monitoring.**
  - Admin page "สถานะระบบ" shows counts and the last event time.
  - Supabase dashboard: auth logs, failed sign-ins, email/SMS errors and quotas.
  - Alert on SMS spend.
  - No third-party analytics.
- **Migrations.** These are version-controlled (`backend/supabase/migrations/`). Apply with
  `supabase db push` to staging first, then production after PMH review.
- **Release.**
  1. Merge to a release branch.
  2. Deploy the accounts build to staging, with a staging Supabase project and fictional accounts.
  3. Run `npm test` (backend) and `npm run test:accounts` against staging.
  4. PMH reviews and signs off.
  5. Promote.

  `main` keeps publishing the public no-accounts site, so pushing to `main` is not how accounts go live.
- **Rollback.**
  - Frontend: redeploy the previous build. With accounts switched off (no `VITE_SUPABASE_*`), the site falls
    back to device-only progress.
  - Database: migrations are additive. To roll back, restore a backup, or apply a down-migration reviewed with
    PMH IT.

## Retention (DECISION)

Not set. Proposal for PMH to decide:
- learning activity kept while the account is active, plus N months after the last activity;
- audit log kept M years;
- deactivated accounts deleted after K months.

Until decided, nothing is deleted automatically.

## Moving to a new web address

Browser storage belongs to one origin. Guest progress on `phimai-hospital.github.io` cannot be read from another
domain, and the app does not attempt to move it.
- **Signed-in learners** lose nothing, because their progress is on the server.
- **Guests** start fresh on the new address. Tell staff and patients before the switch, and keep the old address
  running for a while.
- A one-time "export code" transfer could be added later if PMH wants it. It is not built.

## Sources (accessed 2026-11-11)

- Supabase:
  - pricing: supabase.com/pricing
  - regions: supabase.com/docs/guides/platform/regions
  - custom SMTP: supabase.com/docs/guides/auth/auth-smtp
  - rate limits: supabase.com/docs/guides/auth/rate-limits
  - MFA: supabase.com/docs/guides/auth/auth-mfa (and /phone)
  - send-SMS hook: supabase.com/docs/guides/auth/auth-hooks/send-sms-hook
  - self-hosting: supabase.com/docs/guides/self-hosting/docker
  - API keys: supabase.com/docs/guides/api/api-keys
- Twilio:
  - Thailand SMS pricing: twilio.com/en-us/sms/pricing/th
  - Thailand guidelines: twilio.com/en-us/guidelines/th/sms
- Thai SMS providers: smsmkt.com/pricing, thaibulksms.com
- Email: aws.amazon.com/ses/pricing, docs.aws.amazon.com/general/latest/gr/ses.html, resend.com/pricing,
  postmarkapp.com/pricing
- PDPA (B.E. 2562), English unofficial translation: s.26, 28, 29
- DGA cloud draft: standard.dga.or.th (Feb 2025 public hearing deck)
- AWS regions: docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html
- Google Cloud Bangkok launch: cloud.google.com/blog (21 Jan 2026)
- GitHub Pages limits: docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Cloudflare Pages headers: developers.cloudflare.com/pages/configuration/headers
- Netlify headers: docs.netlify.com/manage/routing/headers
