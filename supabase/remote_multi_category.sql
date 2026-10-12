-- 12 Oct 2026: a shop can pick more than one category on the partner website.
-- Adds `categories` (every pick, in order) and updates submit_partner_application to save it.
-- `category` stays the first pick. Run this whole file in the Supabase SQL editor; it is safe to run repeatedly.
-- Same column change as database/migrations/0338_partner_application_multi_category.sql.

begin;

alter table public.ol_partner_applications add column if not exists categories text[] not null default '{}';
update public.ol_partner_applications set categories = array[category] where category is not null and cardinality(categories) = 0;
alter table public.ol_partner_applications drop constraint if exists ol_partner_applications_categories_ck;
alter table public.ol_partner_applications add constraint ol_partner_applications_categories_ck check (
  cardinality(categories) <= 15
  and char_length(array_to_string(categories, '|')) <= 600
  and (cardinality(categories) = 0 or categories[1] is not distinct from category));

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
  -- Every category the shop picked, in pick order. The first one is the primary `category`.
  v_cats        text[] := coalesce((select array_agg(btrim(x) order by o) from jsonb_array_elements_text(
                    case when jsonb_typeof(payload->'categories') = 'array' then payload->'categories' else '[]'::jsonb end
                  ) with ordinality as t(x, o) where btrim(x) <> ''), '{}');
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
  if cardinality(v_cats) = 0 and v_category is not null then v_cats := array[v_category]; end if;
  if cardinality(v_cats) > 15 then raise exception 'Please check the form and try again.' using errcode = 'P0400'; end if;
  if cardinality(v_cats) > 0 then v_category := v_cats[1]; end if;
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
        category_family = v_family, category = v_category, categories = v_cats, subcategories = v_subs,
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
        category_family, category, categories, subcategories, outlets, address, pin_code, whatsapp_ok, gstin, fssai, services, own_delivery, notes
      ) values (
        v_city, v_type, v_business, v_owner, v_phone, v_email, v_btype,
        'partner-signup-2026-10-10', now(), 'partner_website', v_submit_key,
        case when v_stage = 'draft' then 'draft' else 'submitted' end,
        v_family, v_category, v_cats, v_subs, v_outlets, v_address, v_pin, v_whatsapp, v_gstin, v_fssai, v_services, v_own, v_notes
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

-- Make PostgREST see the change immediately.
select pg_notify('pgrst', 'reload schema');

-- Verification: must return one row each.
select column_name, data_type from information_schema.columns where table_name = 'ol_partner_applications' and column_name = 'categories';
select proname from pg_proc where proname = 'submit_partner_application';
