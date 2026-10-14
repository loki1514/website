-- 14 Oct 2026: sign-ups fail with "permission denied for function submit_partner_application".
-- Cause: EXECUTE on the function was revoked from anon and authenticated on the live project (its ACL is now
-- postgres + service_role only). Most likely the Security Advisor fix for "anon can execute SECURITY DEFINER function".
--
-- PREFERRED fix needs no SQL: set SUPABASE_SECRET_KEY on the website's server. The website then calls the function
-- with the secret key (service_role), which already has EXECUTE, and anon stays locked out.
--
-- STOPGAP only if the secret key cannot be set yet: run this in the Supabase SQL editor. It restores the
-- original grant from remote_setup.sql. The Security Advisor will flag it again.
grant execute on function public.submit_partner_application(jsonb) to anon, authenticated;
select pg_notify('pgrst', 'reload schema');
-- Verification: must return true.
select has_function_privilege('anon', 'public.submit_partner_application(jsonb)', 'execute');
