-- Partner website → Supabase direct intake (founder, 11 Oct 2026).
-- Paste this whole file into the Supabase SQL editor on project ywylhzcxuoeilygzdonx and run it once.
--
-- What it does:
--   1. Creates public.ol_partner_applications (same as database/migrations 0334 + 0335 + 0336), if missing.
--   2. Creates public.submit_partner_application(jsonb): the function the website calls with the publishable key.
--      It runs with owner rights (security definer), validates the payload, dedupes by the browser's submit key,
--      and answers only { reference, status, existing } — never personal data. The table itself stays closed:
--      anon can call the function and nothing else.
begin;

-- ── 1. table (0334) ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.ol_partner_applications (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique default ('OLP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  city_id         text not null references public.ol_service_areas(city_id),
  business_name   text not null check (char_length(btrim(business_name)) between 2 and 120),
  business_type   text not null check (business_type in ('restaurant','cloud_kitchen','cafe_bakery','sweets','grocery','supermarket','pharmacy','beauty','retail','other')),
  outlets         integer not null default 1 check (outlets between 1 and 500),
  address         text check (char_length(btrim(address)) between 5 and 400),
  pin_code        text check (pin_code ~ '^[1-9][0-9]{5}$'),
  owner_name      text not null check (char_length(btrim(owner_name)) between 2 and 120),
  phone           text not null check (phone ~ '^[6-9][0-9]{9}$'),
  email           text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  whatsapp_ok     boolean not null default true,
  gstin           text check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'),
  fssai           text check (fssai is null or fssai ~ '^[0-9]{14}$'),
  services        text[] not null default '{delivery}' check (services <@ array['delivery','pickup','dine_in']::text[] and cardinality(services) between 1 and 3),
  own_delivery    boolean not null default false,
  notes           text check (notes is null or char_length(notes) <= 1000),
  consent_version text not null check (char_length(consent_version) between 1 and 40),
  consent_at      timestamptz not null,
  status          text not null default 'submitted' check (status in ('submitted','reviewing','approved','rejected','withdrawn')),
  organization_id uuid,
  reviewed_by     uuid references auth.users(id) on delete set null,
  reviewed_at     timestamptz,
  review_note     text check (review_note is null or char_length(review_note) <= 1000),
  submit_key      text not null,
  source          text not null default 'partner_website' check (source in ('partner_website','field_sales','partner_app')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint ol_partner_applications_submit_key_uq unique (submit_key),
  constraint ol_partner_applications_review_ck check ((status in ('approved','rejected')) = (reviewed_at is not null)),
  constraint ol_partner_applications_org_ck check (organization_id is null or status = 'approved')
);

-- ── 0335: partner types, category path, drafts ────────────────────────────────────────────────────
alter table public.ol_partner_applications
  add column if not exists partner_type text,
  add column if not exists category_family text,
  add column if not exists category text,
  add column if not exists subcategories text[] not null default '{}';

alter table public.ol_partner_applications drop constraint if exists ol_partner_applications_partner_type_ck;
alter table public.ol_partner_applications add constraint ol_partner_applications_partner_type_ck
  check (partner_type is null or partner_type in ('store','restaurant','service','logistic'));
alter table public.ol_partner_applications drop constraint if exists ol_partner_applications_category_ck;
alter table public.ol_partner_applications add constraint ol_partner_applications_category_ck check (
  (category_family is null or char_length(category_family) between 2 and 80)
  and (category is null or char_length(category) between 2 and 80)
  and cardinality(subcategories) <= 30);
alter table public.ol_partner_applications drop constraint if exists ol_partner_applications_business_type_check;
alter table public.ol_partner_applications add constraint ol_partner_applications_business_type_check
  check (business_type in ('restaurant','cloud_kitchen','cafe_bakery','sweets','grocery','supermarket','pharmacy','beauty','retail','service','logistics','other'));
alter table public.ol_partner_applications drop constraint if exists ol_partner_applications_status_check;
alter table public.ol_partner_applications add constraint ol_partner_applications_status_check
  check (status in ('draft','submitted','reviewing','approved','rejected','withdrawn'));
alter table public.ol_partner_applications drop constraint if exists ol_partner_applications_complete_ck;
alter table public.ol_partner_applications add constraint ol_partner_applications_complete_ck
  check (status = 'draft' or (address is not null and pin_code is not null and partner_type is not null));

create unique index if not exists ol_partner_applications_open_phone_uq on public.ol_partner_applications (city_id, phone)
  where status in ('draft','submitted','reviewing');
create index if not exists ol_partner_applications_queue_idx on public.ol_partner_applications (status, created_at);

-- ── 0336: link to the partner's login account ─────────────────────────────────────────────────────
alter table public.ol_partner_applications
  add column if not exists applicant_user_id uuid references auth.users(id) on delete set null;
create index if not exists ol_partner_applications_applicant_idx on public.ol_partner_applications (applicant_user_id);

-- ── status guard trigger (0334 + 0335) ────────────────────────────────────────────────────────────
create or replace function public.ol_partner_applications_guard() returns trigger language plpgsql set search_path = public, pg_temp as $f$
begin
  new.updated_at := now();
  if new.status <> old.status and not (
       (old.status = 'draft' and new.status in ('submitted','withdrawn'))
    or (old.status = 'submitted' and new.status in ('reviewing','approved','rejected','withdrawn'))
    or (old.status = 'reviewing' and new.status in ('approved','rejected','withdrawn'))) then
    raise exception 'OL_WRONG_STATE: % -> % is not allowed', old.status, new.status;
  end if;
  if old.status in ('approved','rejected','withdrawn') and (new.business_name, new.phone, new.address) is distinct from (old.business_name, old.phone, old.address) then
    raise exception 'OL_APPLICATION_CLOSED: a decided application cannot be edited';
  end if;
  return new;
end $f$;
revoke all on function public.ol_partner_applications_guard() from public, anon, authenticated;
drop trigger if exists ol_partner_applications_guard on public.ol_partner_applications;
create trigger ol_partner_applications_guard before update on public.ol_partner_applications for each row execute function public.ol_partner_applications_guard();

alter table public.ol_partner_applications enable row level security;
revoke all on public.ol_partner_applications from public, anon, authenticated;
grant select, insert, update on public.ol_partner_applications to service_role;
grant select on public.ol_partner_applications to authenticated;
drop policy if exists ol_partner_applications_admin on public.ol_partner_applications;
create policy ol_partner_applications_admin on public.ol_partner_applications for select to authenticated using (public.is_platform_admin());

-- ── 2. the intake function the website calls ─────────────────────────────────────────────────────
-- Mirrors One Local Mobile App/OL-ui/frontend/server/partner-applications.ts: two stages (draft, submit),
-- one row per browser submit key, one open application per phone per city. Raises 400 with a readable
-- message on bad input; returns jsonb { reference, status, existing }.
create or replace function public.submit_partner_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $f$
declare
  v_stage       text := case when payload->>'stage' = 'draft' then 'draft' else 'submit' end;
  v_submit_key  text := payload->>'submit_key';
  v_type        text := payload->>'partner_type';
  v_business    text := btrim(regexp_replace(coalesce(payload->>'business_name', ''), '\s+', ' ', 'g'));
  v_owner       text := btrim(regexp_replace(coalesce(payload->>'owner_name', ''), '\s+', ' ', 'g'));
  v_phone       text := regexp_replace(coalesce(payload->>'phone', ''), '\D', '', 'g');
  v_email       text := lower(btrim(coalesce(payload->>'email', '')));
  v_city        text := coalesce(nullif(payload->>'city_id', ''), 'latur');
  v_address     text := nullif(btrim(regexp_replace(coalesce(payload->>'address', ''), '\s+', ' ', 'g')), '');
  v_pin         text := nullif(btrim(coalesce(payload->>'pin_code', '')), '');
  v_gstin       text := nullif(upper(btrim(coalesce(payload->>'gstin', ''))), '');
  v_fssai       text := nullif(btrim(coalesce(payload->>'fssai', '')), '');
  v_family      text := nullif(btrim(coalesce(payload->>'category_family', '')), '');
  v_category    text := nullif(btrim(coalesce(payload->>'category', '')), '');
  v_subs        text[] := coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'subcategories', '[]'::jsonb)) x), '{}');
  v_services    text[] := coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'services', '["delivery"]'::jsonb)) x), '{delivery}');
  v_outlets     integer := coalesce(nullif(payload->>'outlets', '')::integer, 1);
  v_whatsapp    boolean := coalesce((payload->>'whatsapp_ok')::boolean, true);
  v_own         boolean := coalesce((payload->>'own_delivery')::boolean, false);
  v_notes       text := nullif(btrim(coalesce(payload->>'notes', '')), '');
  v_btype       text;
  v_prior       record;
  v_ref         text;
  v_status      text;
begin
  if v_submit_key is null or v_submit_key !~ '^[A-Za-z0-9_-]{16,80}$' then
    raise exception 'Please check the form and try again.' using errcode = 'P0400';
  end if;
  if coalesce((payload->>'consent')::boolean, false) is not true then
    raise exception 'Please accept to continue' using errcode = 'P0400';
  end if;
  if v_type not in ('store','restaurant','service','logistic') then
    raise exception 'Please check the form and try again.' using errcode = 'P0400';
  end if;
  if char_length(v_business) not between 2 and 120 then raise exception 'Enter your business name.' using errcode = 'P0400'; end if;
  if char_length(v_owner) not between 2 and 120 then raise exception 'Enter the owner''s full name.' using errcode = 'P0400'; end if;
  v_phone := regexp_replace(v_phone, '^(91|0)(?=[6-9]\d{9}$)', '');
  if v_phone !~ '^[6-9][0-9]{9}$' then raise exception 'Enter a 10-digit mobile number' using errcode = 'P0400'; end if;
  if v_email = '' or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 200 then
    raise exception 'That email looks wrong' using errcode = 'P0400';
  end if;

  if v_stage = 'submit' then
    if v_type = 'restaurant' and cardinality(v_subs) = 0 then raise exception 'Pick at least one restaurant type.' using errcode = 'P0400'; end if;
    if v_type = 'store' and v_family is null then raise exception 'Choose your store family.' using errcode = 'P0400'; end if;
    if v_type in ('store','service') and v_category is null then raise exception 'Choose your category.' using errcode = 'P0400'; end if;
    if v_type in ('store','service') and cardinality(v_subs) = 0 then raise exception 'Select at least one subcategory.' using errcode = 'P0400'; end if;
    if v_address is null or char_length(v_address) < 5 then raise exception 'Enter your shop address.' using errcode = 'P0400'; end if;
    if v_pin is null or v_pin !~ '^[1-9][0-9]{5}$' then raise exception 'PIN code must be 6 digits' using errcode = 'P0400'; end if;
    if v_outlets not between 1 and 500 then raise exception 'Please check the form and try again.' using errcode = 'P0400'; end if;
    if v_gstin is not null and v_gstin !~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$' then raise exception 'GSTIN looks wrong' using errcode = 'P0400'; end if;
    if v_fssai is not null and v_fssai !~ '^[0-9]{14}$' then raise exception 'FSSAI licence is 14 digits' using errcode = 'P0400'; end if;
    if not (v_services <@ array['delivery','pickup','dine_in']::text[]) or cardinality(v_services) not between 1 and 3 then
      raise exception 'Please check the form and try again.' using errcode = 'P0400';
    end if;
  end if;

  -- The single business_type the rest of the platform reads, derived from the path.
  v_btype := case
    when v_type = 'logistic' then 'logistics'
    when v_type = 'service' then 'service'
    when v_type = 'restaurant' then case
      when 'Café' = any(v_subs) or 'Bakery' = any(v_subs) then 'cafe_bakery'
      when 'Sweets' = any(v_subs) then 'sweets' else 'restaurant' end
    when 'Pharmacy / chemist' = any(v_subs) then 'pharmacy'
    when 'Supermarket' = any(v_subs) then 'supermarket'
    when v_category = 'Bakery and sweets' then 'sweets'
    when v_family = 'Grocery and daily needs' then 'grocery'
    when v_category = 'Beauty and health' then 'beauty'
    else 'retail' end;

  -- Idempotency: same browser key answers the same application.
  select id, reference, status into v_prior from public.ol_partner_applications where submit_key = v_submit_key;
  if found and v_prior.status <> 'draft' then
    return jsonb_build_object('reference', v_prior.reference, 'status', v_prior.status, 'existing', true);
  end if;

  begin
    if found then
      update public.ol_partner_applications set
        city_id = v_city, partner_type = v_type, business_name = v_business, owner_name = v_owner, phone = v_phone, email = v_email,
        business_type = v_btype, consent_version = 'partner-signup-2026-10-10', consent_at = now(),
        category_family = v_family, category = v_category, subcategories = v_subs,
        outlets = v_outlets, address = v_address, pin_code = v_pin, whatsapp_ok = v_whatsapp, gstin = v_gstin, fssai = v_fssai,
        services = v_services, own_delivery = v_own, notes = v_notes,
        status = case when v_stage = 'draft' then 'draft' else 'submitted' end
      where id = v_prior.id and status = 'draft'
      returning reference, status into v_ref, v_status;
      if not found then
        -- The draft was submitted in the meantime; answer that application.
        select reference, status into v_ref, v_status from public.ol_partner_applications where submit_key = v_submit_key;
        return jsonb_build_object('reference', v_ref, 'status', v_status, 'existing', true);
      end if;
    else
      insert into public.ol_partner_applications (
        city_id, partner_type, business_name, owner_name, phone, email, business_type,
        consent_version, consent_at, source, submit_key, status,
        category_family, category, subcategories, outlets, address, pin_code, whatsapp_ok, gstin, fssai, services, own_delivery, notes
      ) values (
        v_city, v_type, v_business, v_owner, v_phone, v_email, v_btype,
        'partner-signup-2026-10-10', now(), 'partner_website', v_submit_key,
        case when v_stage = 'draft' then 'draft' else 'submitted' end,
        v_family, v_category, v_subs, v_outlets, v_address, v_pin, v_whatsapp, v_gstin, v_fssai, v_services, v_own, v_notes
      )
      returning reference, status into v_ref, v_status;
    end if;
  exception
    when unique_violation then
      -- One open application per phone per city: answer the one that exists.
      select reference, status into v_ref, v_status from public.ol_partner_applications
        where city_id = v_city and phone = v_phone and status in ('draft','submitted','reviewing') limit 1;
      if found then
        return jsonb_build_object('reference', v_ref, 'status', v_status, 'existing', true);
      end if;
      raise;
  end;

  return jsonb_build_object('reference', v_ref, 'status', v_status, 'existing', false);
end $f$;
revoke all on function public.submit_partner_application(jsonb) from public;
grant execute on function public.submit_partner_application(jsonb) to anon, authenticated;

commit;
