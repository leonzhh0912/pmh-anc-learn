-- Staff-issued logins (no SMS or email cost), decided 2026-11-11 for PMH's budget:
--   * staff create a patient account and hand the patient a slip with a patient ID (8 digits) and a
--     password (10 digits). Every password is random and different; there is no shared hospital password;
--     passwords are hashed by Postgres (bcrypt, the same as Supabase Auth) and never stored in clear;
--   * administrators create staff accounts the same way (work email + password); staff still need an
--     authenticator app as a second factor;
--   * staff can issue a new password (forgotten password); sessions on other devices are signed out.
-- Accounts are created directly in auth.users (the documented columns Supabase Auth reads), inside one
-- checked, audited transaction, so no service key is needed anywhere. backend/tests covers sign-in with them.

alter table public.learners drop constraint learners_contact_method_check;
alter table public.learners add constraint learners_contact_method_check check (contact_method in ('phone', 'email', 'username'));
alter table public.learners
  add column username text unique check (username ~ '^[0-9]{8}$'),
  add column created_by uuid references auth.users (id) on delete set null;

create function private.random_digits(n int) returns text language plpgsql volatile as $$
declare out text := ''; b int;
begin
  while length(out) < n loop
    b := get_byte(extensions.gen_random_bytes(1), 0);
    if b < 250 then out := out || (b % 10)::text; end if;   -- rejection sampling: no bias
  end loop;
  return out;
end $$;

-- Create a confirmed email+password user. The email for patients is an internal, undeliverable address
-- derived from the patient ID (<id>@learners.anc-learn.invalid); nothing is ever sent to it.
create function private.create_password_user(p_email text, p_password text, p_kind text, p_display_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := gen_random_uuid();
begin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', lower(p_email),
    extensions.crypt(p_password, extensions.gen_salt('bf', 10)), now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'pmh_kind', p_kind),
    jsonb_build_object('display_name', p_display_name), now(), now(), '', '', '', '');
  insert into auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  values (gen_random_uuid(), v_id::text, v_id,
    jsonb_build_object('sub', v_id::text, 'email', lower(p_email), 'email_verified', true), 'email', now(), now());
  return v_id;
end $$;

create function private.set_password(p_user uuid, p_password text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf', 10)), updated_at = now()
  where id = p_user;
  -- sign the account out everywhere
  delete from auth.sessions where user_id = p_user;
  delete from auth.refresh_tokens where user_id = p_user::text;
end $$;

-- Staff accounts created by an administrator must not get a learner profile from the sign-up trigger.
create or replace function private.on_auth_user_confirmed() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_inv public.staff_invitations;
begin
  if new.email_confirmed_at is null and new.phone_confirmed_at is null then return new; end if;
  if coalesce(new.raw_app_meta_data ->> 'pmh_kind', '') = 'staff' then return new; end if;
  if exists (select 1 from public.learners where id = new.id)
     or exists (select 1 from public.staff_members where user_id = new.id) then
    return new;
  end if;

  if coalesce(new.raw_user_meta_data ->> 'intent', '') = 'staff' and new.email is not null then
    select * into v_inv from public.staff_invitations i
    where i.email = lower(new.email) and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
    for update;
    if v_inv.id is not null then
      insert into public.staff_members (user_id, email, display_name, role, invited_by)
      values (new.id, lower(new.email), v_inv.display_name, v_inv.role, v_inv.invited_by);
      update public.staff_invitations set accepted_at = now(), accepted_user_id = new.id where id = v_inv.id;
      insert into public.audit_log (actor_id, actor_role, action, target_id, details)
      values (new.id, v_inv.role::text, 'staff.invitation_accepted', new.id,
              jsonb_build_object('invitation_id', v_inv.id, 'role', v_inv.role));
      return new;
    end if;
    raise exception 'no_staff_invitation' using errcode = '42501';
  end if;

  insert into public.learners (id, display_name, contact_method, contact_hint)
  values (
    new.id,
    left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 80),
    case when coalesce(new.phone, '') <> '' then 'phone' else 'email' end,
    case when coalesce(new.phone, '') <> '' then private.mask_phone(new.phone) else private.mask_email(new.email) end
  );
  return new;
end $$;

-- ---------------------------------------------------------------- patients (staff)

create function public.staff_create_learner(p_display_name text, p_cohort uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_role public.staff_role := private.require_staff(); v_user text; v_pass text; v_id uuid;
  v_name text := left(trim(coalesce(p_display_name, '')), 80);
begin
  if v_name = '' then raise exception 'name_required'; end if;
  if not exists (select 1 from public.cohorts where id = p_cohort) then raise exception 'no_such_cohort'; end if;
  if v_role <> 'admin' and not exists (select 1 from public.staff_cohorts where staff_id = auth.uid() and cohort_id = p_cohort) then
    raise exception 'cohort_not_assigned';
  end if;
  loop
    v_user := private.random_digits(8);
    exit when left(v_user, 1) <> '0' and not exists (select 1 from public.learners where username = v_user);
  end loop;
  v_pass := private.random_digits(10);
  v_id := private.create_password_user(v_user || '@learners.anc-learn.invalid', v_pass, 'learner_local', v_name);
  update public.learners set username = v_user, contact_method = 'username',
    contact_hint = 'ID ' || left(v_user, 4) || '-' || right(v_user, 4), created_by = auth.uid(), display_name = v_name
  where id = v_id;
  insert into public.cohort_learners (cohort_id, learner_id, added_by) values (p_cohort, v_id, auth.uid());
  perform private.audit('staff.create_learner', v_id, jsonb_build_object('cohort_id', p_cohort));
  -- the password is returned once, for the printed slip; it is not stored anywhere in clear
  return jsonb_build_object('learner_id', v_id, 'username', v_user, 'password', v_pass, 'display_name', v_name);
end $$;

create function public.staff_reset_learner_password(p_learner uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_role public.staff_role := private.require_staff(); v_l public.learners; v_pass text;
begin
  select * into v_l from public.learners where id = p_learner;
  if v_l.id is null or v_l.deleted_at is not null then raise exception 'not_learner'; end if;
  if v_l.contact_method <> 'username' then raise exception 'not_staff_issued_account'; end if;
  if v_role <> 'admin' and not private.staff_can_see(p_learner) then raise exception 'learner_not_in_scope'; end if;
  v_pass := private.random_digits(10);
  perform private.set_password(p_learner, v_pass);
  perform private.audit('staff.reset_learner_password', p_learner, '{}'::jsonb);
  return jsonb_build_object('username', v_l.username, 'password', v_pass, 'display_name', v_l.display_name);
end $$;

-- ---------------------------------------------------------------- staff (administrators)

create function public.admin_create_staff(p_email text, p_display_name text, p_role public.staff_role) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_email text := lower(trim(p_email)); v_pass text; v_id uuid;
begin
  perform private.require_staff(true);
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'bad_email'; end if;
  if trim(coalesce(p_display_name, '')) = '' then raise exception 'name_required'; end if;
  if exists (select 1 from auth.users u where lower(u.email) = v_email) then raise exception 'email_already_has_account'; end if;
  v_pass := private.random_digits(10);
  v_id := private.create_password_user(v_email, v_pass, 'staff', trim(p_display_name));
  insert into public.staff_members (user_id, email, display_name, role, invited_by)
  values (v_id, v_email, trim(p_display_name), p_role, auth.uid());
  perform private.audit('admin.create_staff', v_id, jsonb_build_object('email', v_email, 'role', p_role));
  return jsonb_build_object('user_id', v_id, 'email', v_email, 'password', v_pass, 'display_name', trim(p_display_name));
end $$;

-- forgotten password and/or lost authenticator phone
create function public.admin_reset_staff_login(p_user uuid, p_reset_authenticator boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_s public.staff_members; v_pass text;
begin
  perform private.require_staff(true);
  select * into v_s from public.staff_members where user_id = p_user;
  if v_s.user_id is null then raise exception 'not_staff_member'; end if;
  v_pass := private.random_digits(10);
  perform private.set_password(p_user, v_pass);
  if p_reset_authenticator then delete from auth.mfa_factors where user_id = p_user; end if;
  perform private.audit('admin.reset_staff_login', p_user, jsonb_build_object('authenticator_reset', p_reset_authenticator));
  return jsonb_build_object('email', v_s.email, 'password', v_pass, 'display_name', v_s.display_name);
end $$;

-- First administrator with a password, for IT with direct database access (never through the API):
--   select private.bootstrap_admin_password('admin@hospital', 'Name');   -> returns the password once
create function private.bootstrap_admin_password(p_email text, p_display_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_email text := lower(trim(p_email)); v_pass text := private.random_digits(10); v_id uuid;
begin
  if exists (select 1 from auth.users u where lower(u.email) = v_email) then raise exception 'email_already_has_account'; end if;
  v_id := private.create_password_user(v_email, v_pass, 'staff', trim(p_display_name));
  insert into public.staff_members (user_id, email, display_name, role) values (v_id, v_email, trim(p_display_name), 'admin');
  insert into public.audit_log (actor_id, actor_role, action, target_id, details)
  values (null, 'database_operator', 'bootstrap.admin_password', v_id, jsonb_build_object('email', v_email));
  return v_pass;
end $$;

-- ---------------------------------------------------------------- staff list: newest accounts first by default

drop function public.staff_list_learners(text, text, int, int);
create function public.staff_list_learners(p_query text default '', p_filter text default 'all',
  p_page int default 1, p_page_size int default 25, p_sort text default 'created') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_q text := '%' || coalesce(trim(p_query), '') || '%'; v_size int := least(greatest(p_page_size, 1), 100);
  v_off int := (greatest(p_page, 1) - 1) * least(greatest(p_page_size, 1), 100); v_total int; v_rows jsonb;
begin
  perform private.require_staff();
  with scoped as (
    select l.* from public.learners l
    where l.deleted_at is null
      and exists (select 1 from public.staff_cohorts sc join public.cohort_learners cl on cl.cohort_id = sc.cohort_id
                  where sc.staff_id = auth.uid() and cl.learner_id = l.id)
      and (l.display_name ilike v_q or l.contact_hint ilike v_q or coalesce(l.username, '') ilike v_q)
  ), stats as (
    select s.id, s.display_name, s.contact_hint, s.contact_method, s.username, s.status, s.name_verified_at, s.created_at,
      tp.completed_at as tutorial_completed_at, tp.started_at as tutorial_started_at, tp.skipped_at as tutorial_skipped_at,
      (select count(*) from public.lesson_progress lp where lp.learner_id = s.id and lp.first_completed_at is not null)::int as completed,
      (select count(*) from public.lesson_progress lp where lp.learner_id = s.id and lp.first_completed_at is null)::int as in_progress,
      (select max(lp.last_activity_at) from public.lesson_progress lp where lp.learner_id = s.id) as last_activity_at,
      greatest((select max(lp.last_synced_at) from public.lesson_progress lp where lp.learner_id = s.id), tp.last_synced_at) as last_synced_at
    from scoped s left join public.tutorial_progress tp on tp.learner_id = s.id
  ), filtered as (
    select * from stats where case p_filter
      when 'not_started' then completed = 0 and in_progress = 0
      when 'in_progress' then in_progress > 0
      when 'tutorial_not_done' then tutorial_completed_at is null
      else true end
  ), ordered as (
    select f.*, row_number() over (order by
      case when p_sort = 'activity' then f.last_synced_at end desc nulls last,
      f.created_at desc, f.display_name) as rn
    from filtered f
  )
  select (select count(*) from filtered)::int,
    coalesce((select jsonb_agg(to_jsonb(o) - 'rn' order by o.rn) from ordered o where o.rn > v_off and o.rn <= v_off + v_size), '[]'::jsonb)
  into v_total, v_rows;
  perform private.audit('staff.list_learners', null,
    jsonb_build_object('query', p_query, 'filter', p_filter, 'sort', p_sort, 'page', p_page, 'returned', jsonb_array_length(v_rows)));
  return jsonb_build_object('total', v_total, 'page', greatest(p_page, 1), 'page_size', v_size, 'rows', v_rows);
end $$;

-- cohorts the caller may put a new patient into (staff: their own; admins: all)
create function public.staff_my_cohorts() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_role public.staff_role := private.require_staff();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name) order by c.name)
    from public.cohorts c
    where v_role = 'admin' or exists (select 1 from public.staff_cohorts sc where sc.staff_id = auth.uid() and sc.cohort_id = c.id)), '[]'::jsonb);
end $$;

-- grants
revoke execute on all functions in schema private from public, anon, authenticated;
revoke execute on function public.staff_create_learner(text, uuid), public.staff_reset_learner_password(uuid),
  public.admin_create_staff(text, text, public.staff_role), public.admin_reset_staff_login(uuid, boolean),
  public.staff_list_learners(text, text, int, int, text), public.staff_my_cohorts() from public, anon;
grant execute on function public.staff_create_learner(text, uuid), public.staff_reset_learner_password(uuid),
  public.admin_create_staff(text, text, public.staff_role), public.admin_reset_staff_login(uuid, boolean),
  public.staff_list_learners(text, text, int, int, text), public.staff_my_cohorts() to authenticated;
grant execute on function private.on_auth_user_confirmed() to supabase_auth_admin;
