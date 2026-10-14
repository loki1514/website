# OneLocal Partner Website — Development Journal

## 2026-10-14 — OneLocal Partner Website: partner sign-up broken, confirmation link off-brand

**Partner sign-ups failed with "permission denied"; the website now uses its own server key and its own confirmation page.**

- **Why:** Every partner who pressed Continue saw "permission denied for function submit_partner_application", so no
  application could be saved. On the live Supabase project, the right for the public website role to run that
  function had been removed (the function now only allows the database owner and the service role). The most likely
  cause is the Supabase Security Advisor fix that removes public access to powerful functions. Separately, the
  confirmation email sent partners to a supabase.co address instead of a OneLocal page.
- **Why it was not caught:** the earlier checks ran before the permission was removed, and nothing re-tests the live
  sign-up after database or dashboard changes. There is no automated end-to-end check against the live project.
- **Structural decisions:** The website server now calls the sign-up function with a server-only secret key, so the
  public role never needs access and the Security Advisor stays clean. The alternative, giving the public role access
  back, is kept only as a stopgap script (`supabase/remote_regrant_submit.sql`) because the advisor will flag it
  again and someone may remove it again. Email confirmation now lands on `/auth/confirm` on the website, which spends
  the token server-to-server, so partners never see supabase.co. Confirmation needs a button tap so that email link
  scanners cannot use up the link before the partner opens it.
- **Follow-up the same day:** the founder asked that partners never see a Supabase email or page. When the
  server-only key is set, the website now creates the partner's login already confirmed (Supabase Auth admin API),
  so no confirmation email is sent and the success screen says the login is ready. The Latur team's verification
  call replaces the email check. Without the key, the old email-confirmation path remains as a fallback.
- **What works now:** Once the secret key is set, sign-ups save again. Confirmation emails (after the template change
  below) open a OneLocal-branded page that confirms the email and tells the partner to sign in to VINII Partner.
- **Left undone (needs the founder, outside the code):**
  1. Add `SUPABASE_SECRET_KEY` (Supabase → Project Settings → API keys → secret key) to the website server's
     environment and restart it. Until then sign-ups stay broken, unless the stopgap SQL is run.
  2. Add `PUBLIC_SITE_URL` (the branded domain) to the same environment.
  3. Supabase → Authentication → URL Configuration: set Site URL to the branded domain and add
     `<domain>/auth/confirm` to Redirect URLs.
  4. Supabase → Authentication → Email Templates → Confirm signup: link to
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`.
  5. Supabase → Authentication → SMTP: use a OneLocal sender. The built-in sender shows a Supabase address and
     allows only a few emails per hour.
- **Open questions for the founder:** What is the branded domain? Who changed the live function permission, and
  should Security Advisor fixes go through a checklist that includes a live sign-up test?
