-- Staff/admin second factor (authenticator app) becomes a server setting, OFF by default.
-- Decided 2026-11-11 by the developer for PMH: keep sign-in simple, many staff phones are old.
-- Without it, staff/admin access rests on: unique random passwords (bcrypt), Supabase Auth's per-IP rate
-- limits on sign-in, admins switching accounts off instantly, and the audit log of every look at a learner.
-- IT can switch the authenticator requirement on at any time (no code change):
--   update private.settings set value = 'true' where key = 'require_staff_mfa';
-- Only people with direct database access can change it: there is no API path to this table.

create table private.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
revoke all on private.settings from public, anon, authenticated;
insert into private.settings (key, value) values ('require_staff_mfa', 'false');

create function private.staff_mfa_required() returns boolean
language sql stable security definer set search_path = '' as $$
  -- if the setting is missing or unreadable, be strict
  select coalesce((select (value #>> '{}')::boolean from private.settings where key = 'require_staff_mfa'), true)
$$;

create or replace function private.require_staff(p_admin boolean default false) returns public.staff_role
language plpgsql security definer set search_path = '' as $$
declare v_role public.staff_role; v_status public.account_status;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '42501'; end if;
  select role, status into v_role, v_status from public.staff_members where user_id = auth.uid();
  if v_role is null or v_status <> 'active' then
    raise exception 'not_staff' using errcode = '42501';
  end if;
  if private.staff_mfa_required() and coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'mfa_required' using errcode = '42501';
  end if;
  if p_admin and v_role <> 'admin' then raise exception 'not_admin' using errcode = '42501'; end if;
  return v_role;
end $$;

create or replace function public.my_account() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_l public.learners; v_s public.staff_members;
begin
  if auth.uid() is null then return jsonb_build_object('kind', 'none'); end if;
  select * into v_s from public.staff_members where user_id = auth.uid();
  if v_s.user_id is not null then
    return jsonb_build_object('kind', 'staff', 'role', v_s.role, 'status', v_s.status,
      'display_name', v_s.display_name, 'aal', coalesce(auth.jwt() ->> 'aal', 'aal1'),
      'mfa_required', private.staff_mfa_required());
  end if;
  select * into v_l from public.learners where id = auth.uid();
  if v_l.id is not null then
    return jsonb_build_object('kind', 'learner', 'status', v_l.status, 'display_name', v_l.display_name,
      'contact_method', v_l.contact_method, 'contact_hint', v_l.contact_hint,
      'legacy_imported_at', v_l.legacy_imported_at, 'created_at', v_l.created_at);
  end if;
  return jsonb_build_object('kind', 'none');
end $$;

revoke execute on function private.staff_mfa_required() from public, anon, authenticated;
revoke execute on function private.require_staff(boolean) from public, anon, authenticated;
revoke execute on function public.my_account() from public, anon;
grant execute on function public.my_account() to authenticated;
