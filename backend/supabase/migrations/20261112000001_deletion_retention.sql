-- Account deletion by administrators and 5-year retention of de-identified learning data for research.
-- Decided by the developer on behalf of PMH, 2026-11-11 (docs/ACCOUNTS-SCOPE.md):
--   * administrators delete learner accounts (usually once the child has reached an age set by PMH; the
--     app stores no ages, so the administrator decides);
--   * deleting removes the sign-in (phone/email, sessions, factors), the name and the contact hint at once;
--   * the learning records stay, no longer linked to any person, for 5 years for research, then are
--     removed automatically. Research use itself still needs PMH's research/ethics approval.

-- The learner row must outlive the auth user so that de-identified records can be kept.
alter table public.learners drop constraint learners_id_fkey;
alter table public.learners
  add column deleted_at timestamptz,
  add column purge_after timestamptz,
  add constraint deleted_has_purge check ((deleted_at is null) = (purge_after is null));
alter table public.learners drop constraint learners_name_verified_by_fkey;
alter table public.learners add constraint learners_name_verified_by_fkey
  foreign key (name_verified_by) references auth.users (id) on delete set null;

create index learners_purge_after on public.learners (purge_after) where purge_after is not null;

-- Deleted learners never appear in staff or admin lists (they are no longer people in the system).
create or replace function private.staff_can_see(p_learner uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff_cohorts sc
    join public.cohort_learners cl on cl.cohort_id = sc.cohort_id
    join public.learners l on l.id = cl.learner_id and l.deleted_at is null
    where sc.staff_id = auth.uid() and cl.learner_id = p_learner)
$$;

create function public.admin_delete_learner(p_learner uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_l public.learners; v_reason text := left(trim(coalesce(p_reason, '')), 200);
begin
  perform private.require_staff(true);
  if v_reason = '' then raise exception 'reason_required'; end if;
  select * into v_l from public.learners where id = p_learner for update;
  if v_l.id is null then raise exception 'not_learner'; end if;
  if v_l.deleted_at is not null then raise exception 'already_deleted'; end if;

  -- 1. the sign-in: phone/email, sessions, refresh tokens and factors go with the auth user
  delete from auth.users where id = p_learner;
  -- 2. identity in our tables
  update public.learners set
    display_name = '', contact_hint = '', name_verified_by = null, name_verified_at = null,
    status = 'deactivated', deleted_at = now(), purge_after = now() + interval '5 years'
  where id = p_learner;
  delete from public.cohort_learners where learner_id = p_learner;
  -- 3. the learning records (progress, quiz answers, video coverage, events) stay, de-identified

  perform private.audit('admin.delete_learner', p_learner,
    jsonb_build_object('reason', v_reason, 'purge_after', now() + interval '5 years'));
  return jsonb_build_object('deleted_at', now(), 'purge_after', now() + interval '5 years');
end $$;

-- Removes de-identified records whose 5 years are over. Runs daily (pg_cron) where available.
create function private.purge_expired_learners() returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  delete from public.learners where purge_after is not null and purge_after <= now();
  get diagnostics n = row_count;
  if n > 0 then
    insert into public.audit_log (actor_id, actor_role, action, details)
    values (null, 'system', 'system.purge_expired', jsonb_build_object('learners', n));
  end if;
  return n;
end $$;

-- list functions: leave deleted accounts out
create or replace function public.admin_list_learners(p_query text default '', p_page int default 1, p_page_size int default 25) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_q text := '%' || coalesce(trim(p_query), '') || '%'; v_size int := least(greatest(p_page_size, 1), 100); v jsonb;
begin
  perform private.require_staff(true);
  select jsonb_build_object(
    'total', (select count(*) from public.learners l where l.deleted_at is null and (l.display_name ilike v_q or l.contact_hint ilike v_q)),
    'deleted_kept', (select count(*) from public.learners l where l.deleted_at is not null),
    'rows', coalesce((select jsonb_agg(r) from (
      select l.id, l.display_name, l.contact_hint, l.contact_method, l.status, l.created_at,
        coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name) order by c.name)
          from public.cohort_learners cl join public.cohorts c on c.id = cl.cohort_id where cl.learner_id = l.id), '[]'::jsonb) as cohorts
      from public.learners l where l.deleted_at is null and (l.display_name ilike v_q or l.contact_hint ilike v_q)
      order by l.created_at desc limit v_size offset (greatest(p_page, 1) - 1) * v_size) r), '[]'::jsonb)
  ) into v;
  perform private.audit('admin.list_learners', null, jsonb_build_object('query', p_query, 'page', p_page));
  return v;
end $$;

create or replace function public.admin_health() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_staff(true);
  return jsonb_build_object(
    'learners', (select count(*) from public.learners where deleted_at is null),
    'learners_active', (select count(*) from public.learners where status = 'active' and deleted_at is null),
    'deleted_kept', (select count(*) from public.learners where deleted_at is not null),
    'next_purge', (select min(purge_after) from public.learners where purge_after is not null),
    'staff_active', (select count(*) from public.staff_members where status = 'active'),
    'admins_active', private.active_admins(),
    'events_24h', (select count(*) from public.learning_events where recorded_at > now() - interval '24 hours'),
    'last_event_at', (select max(recorded_at) from public.learning_events),
    'server_time', now());
end $$;

-- a deleted learner can never be reactivated (there is no person behind the record any more)
create or replace function public.admin_set_learner_status(p_learner uuid, p_status public.account_status) returns void
language plpgsql security definer set search_path = '' as $$
declare v_old public.learners;
begin
  perform private.require_staff(true);
  select * into v_old from public.learners where id = p_learner for update;
  if v_old.id is null then raise exception 'not_learner'; end if;
  if v_old.deleted_at is not null then raise exception 'already_deleted'; end if;
  update public.learners set status = p_status where id = p_learner;
  perform private.audit('admin.set_learner_status', p_learner, jsonb_build_object('from', v_old.status, 'to', p_status));
end $$;

revoke execute on function public.admin_delete_learner(uuid, text) from public, anon, authenticated;
revoke execute on function private.purge_expired_learners() from public, anon, authenticated;
grant execute on function public.admin_delete_learner(uuid, text) to authenticated;
revoke execute on function public.admin_list_learners(text, int, int), public.admin_health(),
  public.admin_set_learner_status(uuid, public.account_status) from public, anon;
grant execute on function public.admin_list_learners(text, int, int), public.admin_health(),
  public.admin_set_learner_status(uuid, public.account_status) to authenticated;

-- daily purge at 03:15 Bangkok time (20:15 UTC), when pg_cron is available
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('pmh-purge-expired-learners', '15 20 * * *', 'select private.purge_expired_learners()');
  else
    raise notice 'pg_cron not available: run select private.purge_expired_learners() daily (docs/THAI-CLOUD-SETUP.md)';
  end if;
end $$;
