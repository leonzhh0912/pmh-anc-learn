-- PMH Smart ANC Learn: learner accounts, account-linked progress, staff monitoring, admin management.
--
-- Security model (see docs/ACCOUNTS-ARCHITECTURE.md):
--   * Default deny. No table or function is reachable by `anon`/`authenticated` unless granted below.
--   * Every table has RLS enabled. Learners may SELECT only their own rows. Nobody writes tables directly:
--     all writes go through SECURITY DEFINER functions that check the caller, use server time and audit.
--   * Roles are never read from the JWT, user metadata, URL or browser storage. They are looked up in
--     staff_members at the moment of every call, so revoking access takes effect immediately, even for
--     sessions that are still open.
--   * Staff and admin functions require a second factor (JWT `aal` = 'aal2').
--   * Staff see only learners in cohorts they are assigned to. Staff reads go through functions that
--     write the audit log; there is no direct table path for staff to read other people's rows.
--   * Collected data is limited to: display name, verified phone OR email (held by Supabase Auth),
--     account status and learning activity in this app. No clinical data, ID numbers, location.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Functions are executable by PUBLIC by default in Postgres: switch that off for everything we create.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;

------------------------------------------------------------------------------------------------------
-- Types and tables
------------------------------------------------------------------------------------------------------

create type public.account_status as enum ('active', 'deactivated');
create type public.staff_role as enum ('staff', 'admin');

-- One row per learner account. Credentials and the verified phone/email stay in auth.users.
create table public.learners (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  contact_method text not null check (contact_method in ('phone', 'email')),
  contact_hint text not null default '',               -- masked, e.g. 08x-xxx-5678, so•••@example.com
  name_verified_by uuid references auth.users (id),    -- set only by staff after checking in person
  name_verified_at timestamptz,
  status public.account_status not null default 'active',
  legacy_imported_at timestamptz,                      -- device progress imported once, on request
  created_at timestamptz not null default now()
);

create table public.staff_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.staff_role not null,
  status public.account_status not null default 'active',
  invited_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  status_changed_at timestamptz
);

create table public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and email like '%_@_%'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.staff_role not null,
  invited_by uuid references auth.users (id),          -- null only for the bootstrap administrator
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users (id),
  revoked_at timestamptz
);
create unique index staff_invitations_open_email on public.staff_invitations (email)
  where accepted_at is null and revoked_at is null;

-- Access scope: staff see learners in the cohorts they are granted (e.g. "ANC clinic").
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 80),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.cohort_learners (
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  learner_id uuid not null references public.learners (id) on delete cascade,
  added_by uuid references auth.users (id),
  added_at timestamptz not null default now(),
  primary key (cohort_id, learner_id)
);

create table public.staff_cohorts (
  staff_id uuid not null references public.staff_members (user_id) on delete cascade,
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  granted_by uuid references auth.users (id),
  granted_at timestamptz not null default now(),
  primary key (staff_id, cohort_id)
);

-- Progress per handbook lesson. "Completed" = the learner reached the last step and pressed finish
-- (the application rule; it does not prove understanding).
create table public.lesson_progress (
  learner_id uuid not null references public.learners (id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^MCH68-[A-Z]+-[0-9]{3}$'),
  content_version text not null check (char_length(content_version) <= 20),
  step_count int not null check (step_count between 1 and 60),
  current_step int not null default 0,
  furthest_step int not null default 0,
  first_completed_at timestamptz,                      -- never overwritten once set
  first_activity_at timestamptz not null,
  last_activity_at timestamptz not null,               -- device time of the latest event (clamped)
  last_synced_at timestamptz not null default now(),   -- server time the latest event arrived
  source text not null default 'app' check (source in ('app', 'legacy_import')),
  primary key (learner_id, lesson_id),
  check (current_step between 0 and step_count - 1),
  check (furthest_step between 0 and step_count - 1)
);

-- "Lesson 0" (how to use the app): kept apart from the 58 handbook lessons.
create table public.tutorial_progress (
  learner_id uuid primary key references public.learners (id) on delete cascade,
  started_at timestamptz,
  last_step int not null default 0 check (last_step between 0 and 20),
  completed_at timestamptz,
  skipped_at timestamptz,
  last_synced_at timestamptz not null default now()
);

-- Quiz answers as they were actually given in the app (from the time accounts were introduced).
create table public.quiz_answers (
  event_id uuid primary key,
  learner_id uuid not null references public.learners (id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^MCH68-[A-Z]+-[0-9]{3}$'),
  question_id text not null check (char_length(question_id) <= 60),
  attempt_no int not null check (attempt_no >= 1),     -- assigned by the server
  correct boolean not null,
  answered_at timestamptz not null,                    -- device time (clamped)
  recorded_at timestamptz not null default now()
);
create index quiz_answers_learner on public.quiz_answers (learner_id, lesson_id, question_id);

-- Actual playback coverage (merged ranges), not the final playhead position.
create table public.video_progress (
  learner_id uuid not null references public.learners (id) on delete cascade,
  video_id text not null check (video_id ~ '^V-[A-Z]+-[0-9]{3}$|^APP-TUTORIAL$'),
  duration_sec numeric not null check (duration_sec > 0 and duration_sec < 3600),
  watched_ranges jsonb not null default '[]'::jsonb,   -- [[start, end], ...] seconds, merged, sorted
  watched_sec numeric not null default 0,
  resume_sec numeric not null default 0,
  completed_at timestamptz,                            -- set once >= 90% of the video was played
  last_synced_at timestamptz not null default now(),
  primary key (learner_id, video_id)
);

-- Every accepted event, for the staff timeline and for idempotency (client-generated UUID).
create table public.learning_events (
  id uuid primary key,
  learner_id uuid not null references public.learners (id) on delete cascade,
  kind text not null,
  lesson_id text,
  data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,                    -- device time (clamped)
  recorded_at timestamptz not null default now()       -- server time
);
create index learning_events_learner on public.learning_events (learner_id, recorded_at desc);

-- Privileged actions. Written only by functions; no client can read, change or delete it directly.
create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid,
  actor_role text,
  action text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb
);
create index audit_log_at on public.audit_log (at desc);

------------------------------------------------------------------------------------------------------
-- Row Level Security: on for every table, default deny.
------------------------------------------------------------------------------------------------------

alter table public.learners enable row level security;
alter table public.staff_members enable row level security;
alter table public.staff_invitations enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_learners enable row level security;
alter table public.staff_cohorts enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.tutorial_progress enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.video_progress enable row level security;
alter table public.learning_events enable row level security;
alter table public.audit_log enable row level security;

-- Explicit grants. Nothing for anon. Authenticated users may only SELECT their own learner data.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
grant select on public.learners, public.lesson_progress, public.tutorial_progress,
  public.quiz_answers, public.video_progress to authenticated;

create policy "learner reads own profile" on public.learners
  for select to authenticated using (id = (select auth.uid()) and status = 'active');
create policy "learner reads own lesson progress" on public.lesson_progress
  for select to authenticated using (
    learner_id = (select auth.uid())
    and exists (select 1 from public.learners l where l.id = learner_id and l.status = 'active'));
create policy "learner reads own tutorial progress" on public.tutorial_progress
  for select to authenticated using (
    learner_id = (select auth.uid())
    and exists (select 1 from public.learners l where l.id = learner_id and l.status = 'active'));
create policy "learner reads own quiz answers" on public.quiz_answers
  for select to authenticated using (
    learner_id = (select auth.uid())
    and exists (select 1 from public.learners l where l.id = learner_id and l.status = 'active'));
create policy "learner reads own video progress" on public.video_progress
  for select to authenticated using (
    learner_id = (select auth.uid())
    and exists (select 1 from public.learners l where l.id = learner_id and l.status = 'active'));
-- staff_members, staff_invitations, cohorts, cohort_learners, staff_cohorts, learning_events and
-- audit_log have no policies and no grants: unreachable from the API except through functions.

------------------------------------------------------------------------------------------------------
-- Private helpers (schema not exposed by the API; not executable by API roles)
------------------------------------------------------------------------------------------------------

create function private.mask_phone(p text) returns text language sql immutable as $$
  -- '+66812345678' / '66812345678' -> '08x-xxx-5678'
  select case when p is null or p = '' then ''
    else '0' || substr(regexp_replace(p, '^\+?66', ''), 1, 1) || 'x-xxx-' || right(p, 4) end
$$;

create function private.mask_email(e text) returns text language sql immutable as $$
  select case when e is null or e = '' or position('@' in e) = 0 then ''
    else left(split_part(e, '@', 1), 2) || '•••@' || split_part(e, '@', 2) end
$$;

-- Device-reported times are kept for display but never trusted beyond "now".
create function private.clamp_time(t timestamptz) returns timestamptz language sql stable as $$
  select least(greatest(coalesce(t, now()), now() - interval '60 days'), now())
$$;

create function private.audit(p_action text, p_target uuid, p_details jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  select role::text into v_role from public.staff_members where user_id = auth.uid();
  insert into public.audit_log (actor_id, actor_role, action, target_id, details)
  values (auth.uid(), coalesce(v_role, case when auth.uid() is null then 'system' else 'learner' end),
          p_action, p_target, coalesce(p_details, '{}'::jsonb));
end $$;

-- Raises unless the caller is an ACTIVE staff member (or admin when p_admin) with a second factor.
-- Looked up on every call: a revoked or deactivated account loses access even with an open session.
create function private.require_staff(p_admin boolean default false) returns public.staff_role
language plpgsql security definer set search_path = '' as $$
declare v_role public.staff_role; v_status public.account_status;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '42501'; end if;
  select role, status into v_role, v_status from public.staff_members where user_id = auth.uid();
  if v_role is null or v_status <> 'active' then
    raise exception 'not_staff' using errcode = '42501';
  end if;
  if coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'mfa_required' using errcode = '42501';
  end if;
  if p_admin and v_role <> 'admin' then raise exception 'not_admin' using errcode = '42501'; end if;
  return v_role;
end $$;

create function private.require_learner() returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_status public.account_status;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '42501'; end if;
  select status into v_status from public.learners where id = auth.uid();
  if v_status is null then raise exception 'not_learner' using errcode = '42501'; end if;
  if v_status <> 'active' then raise exception 'account_deactivated' using errcode = '42501'; end if;
  return auth.uid();
end $$;

create function private.staff_can_see(p_learner uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff_cohorts sc
    join public.cohort_learners cl on cl.cohort_id = sc.cohort_id
    where sc.staff_id = auth.uid() and cl.learner_id = p_learner)
$$;

create function private.active_admins() returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.staff_members where role = 'admin' and status = 'active'
$$;

-- Merge [[a,b],...] ranges; returns sorted, non-overlapping ranges.
create function private.merge_ranges(p jsonb) returns jsonb language plpgsql immutable as $$
declare r record; out_ranges jsonb := '[]'::jsonb; cur_s numeric; cur_e numeric;
begin
  for r in
    select (e ->> 0)::numeric s, (e ->> 1)::numeric en
    from jsonb_array_elements(coalesce(p, '[]'::jsonb)) e
    where jsonb_typeof(e) = 'array' and (e ->> 1)::numeric > (e ->> 0)::numeric
    order by 1, 2
  loop
    if cur_s is null then cur_s := r.s; cur_e := r.en;
    elsif r.s <= cur_e + 0.5 then cur_e := greatest(cur_e, r.en);   -- touching/overlapping: join
    else out_ranges := out_ranges || jsonb_build_array(jsonb_build_array(cur_s, cur_e)); cur_s := r.s; cur_e := r.en;
    end if;
  end loop;
  if cur_s is not null then out_ranges := out_ranges || jsonb_build_array(jsonb_build_array(cur_s, cur_e)); end if;
  return out_ranges;
end $$;

------------------------------------------------------------------------------------------------------
-- New accounts. Public sign-up ALWAYS creates a learner. A staff account is created only when the
-- person signs up through the staff sign-in page (intent = 'staff') AND an administrator has an open,
-- unexpired invitation for that exact email. The role comes from the invitation, never from the user.
------------------------------------------------------------------------------------------------------

create function private.on_auth_user_created() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'intent', '') = 'staff' then
    if new.email is null or not exists (
      select 1 from public.staff_invitations i
      where i.email = lower(new.email) and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
    ) then
      raise exception 'no_staff_invitation' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

-- Profiles are created only once the phone/email has been verified with the one-time code.
create function private.on_auth_user_confirmed() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_inv public.staff_invitations;
begin
  if new.email_confirmed_at is null and new.phone_confirmed_at is null then return new; end if;
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

create trigger on_auth_user_created before insert on auth.users
  for each row execute function private.on_auth_user_created();
create trigger on_auth_user_confirmed after insert or update of email_confirmed_at, phone_confirmed_at on auth.users
  for each row execute function private.on_auth_user_confirmed();

------------------------------------------------------------------------------------------------------
-- Learner functions
------------------------------------------------------------------------------------------------------

-- Who am I? Used by the app to decide which screens to show. Never trusted for authorisation.
create function public.my_account() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_l public.learners; v_s public.staff_members;
begin
  if auth.uid() is null then return jsonb_build_object('kind', 'none'); end if;
  select * into v_s from public.staff_members where user_id = auth.uid();
  if v_s.user_id is not null then
    return jsonb_build_object('kind', 'staff', 'role', v_s.role, 'status', v_s.status,
      'display_name', v_s.display_name, 'aal', coalesce(auth.jwt() ->> 'aal', 'aal1'));
  end if;
  select * into v_l from public.learners where id = auth.uid();
  if v_l.id is not null then
    return jsonb_build_object('kind', 'learner', 'status', v_l.status, 'display_name', v_l.display_name,
      'contact_method', v_l.contact_method, 'contact_hint', v_l.contact_hint,
      'legacy_imported_at', v_l.legacy_imported_at, 'created_at', v_l.created_at);
  end if;
  return jsonb_build_object('kind', 'none');
end $$;

create function public.set_my_display_name(p_name text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := private.require_learner(); v_name text := left(trim(coalesce(p_name, '')), 80);
begin
  -- a self-chosen name is never "verified"; changing it clears any earlier staff verification
  update public.learners set display_name = v_name, name_verified_by = null, name_verified_at = null
  where id = v_id and display_name is distinct from v_name;
end $$;

-- Apply a batch of learning events from one device. Idempotent: each event has a client UUID and is
-- applied at most once, so retries, two tabs and offline queues never duplicate anything. Server time
-- is used for sync times; device time is clamped and kept only as "when it happened on the device".
create function public.sync_learning(p_events jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := private.require_learner();
  e jsonb; v_event_id uuid; v_kind text; v_at timestamptz; v_lesson text; v_data jsonb;
  v_inserted int; n_new int := 0; n_dup int := 0;
  v_steps int; v_step int; v_version text; v_attempt int;
  v_video text; v_dur numeric; v_ranges jsonb; v_watched numeric; v_pos numeric;
begin
  if jsonb_typeof(p_events) <> 'array' then raise exception 'events_must_be_array'; end if;
  if jsonb_array_length(p_events) > 200 then raise exception 'too_many_events'; end if;

  for e in select value from jsonb_array_elements(p_events) loop
    v_event_id := (e ->> 'id')::uuid;
    v_kind := e ->> 'kind';
    v_at := private.clamp_time((e ->> 'at')::timestamptz);
    v_lesson := nullif(e ->> 'lessonId', '');
    v_data := coalesce(e -> 'data', '{}'::jsonb);
    if v_event_id is null or v_kind is null then raise exception 'event_needs_id_and_kind'; end if;
    if v_kind not in ('lesson_step', 'lesson_complete', 'quiz_answer', 'video_watch',
                      'tutorial_start', 'tutorial_step', 'tutorial_complete', 'tutorial_skip') then
      raise exception 'unknown_event_kind: %', v_kind;
    end if;

    insert into public.learning_events (id, learner_id, kind, lesson_id, data, occurred_at)
    values (v_event_id, v_id, v_kind, v_lesson, v_data, v_at)
    on conflict (id) do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted = 0 then n_dup := n_dup + 1; continue; end if;   -- already applied (or not ours)
    n_new := n_new + 1;

    if v_kind in ('lesson_step', 'lesson_complete') then
      v_steps := (v_data ->> 'stepCount')::int;
      v_version := coalesce(v_data ->> 'version', '');
      v_step := case when v_kind = 'lesson_complete' then v_steps - 1 else (v_data ->> 'step')::int end;
      if v_lesson is null or v_steps is null or v_step is null or v_step < 0 or v_step >= v_steps then
        raise exception 'bad_lesson_event';
      end if;
      insert into public.lesson_progress as lp (learner_id, lesson_id, content_version, step_count,
        current_step, furthest_step, first_completed_at, first_activity_at, last_activity_at, last_synced_at)
      values (v_id, v_lesson, v_version, v_steps, v_step, v_step,
        case when v_kind = 'lesson_complete' then v_at end, v_at, v_at, now())
      on conflict (learner_id, lesson_id) do update set
        content_version = excluded.content_version,
        step_count = excluded.step_count,
        current_step = case when excluded.last_activity_at >= lp.last_activity_at
                            then least(excluded.current_step, excluded.step_count - 1) else lp.current_step end,
        furthest_step = least(greatest(lp.furthest_step, excluded.furthest_step), excluded.step_count - 1),
        first_completed_at = case
          when lp.first_completed_at is null then excluded.first_completed_at
          when excluded.first_completed_at is null then lp.first_completed_at
          else least(lp.first_completed_at, excluded.first_completed_at) end,
        first_activity_at = least(lp.first_activity_at, excluded.first_activity_at),
        last_activity_at = greatest(lp.last_activity_at, excluded.last_activity_at),
        last_synced_at = now();

    elsif v_kind = 'quiz_answer' then
      if v_lesson is null or coalesce(v_data ->> 'questionId', '') = '' or v_data -> 'correct' is null then
        raise exception 'bad_quiz_event';
      end if;
      perform pg_advisory_xact_lock(hashtext(v_id::text || v_lesson || (v_data ->> 'questionId')));
      select count(*) + 1 into v_attempt from public.quiz_answers
        where learner_id = v_id and lesson_id = v_lesson and question_id = v_data ->> 'questionId';
      insert into public.quiz_answers (event_id, learner_id, lesson_id, question_id, attempt_no, correct, answered_at)
      values (v_event_id, v_id, v_lesson, v_data ->> 'questionId', v_attempt, (v_data ->> 'correct')::boolean, v_at);

    elsif v_kind = 'video_watch' then
      v_video := v_data ->> 'videoId';
      v_dur := (v_data ->> 'duration')::numeric;
      v_pos := greatest(0, coalesce((v_data ->> 'position')::numeric, 0));
      if v_video is null or v_dur is null or v_dur <= 0 then raise exception 'bad_video_event'; end if;
      -- clip reported ranges to the video length
      select coalesce(jsonb_agg(jsonb_build_array(greatest(0, (r ->> 0)::numeric), least(v_dur, (r ->> 1)::numeric))), '[]'::jsonb)
        into v_ranges from jsonb_array_elements(coalesce(v_data -> 'ranges', '[]'::jsonb)) r
        where jsonb_typeof(r) = 'array';
      insert into public.video_progress as vp (learner_id, video_id, duration_sec, watched_ranges, resume_sec, last_synced_at)
      values (v_id, v_video, v_dur, private.merge_ranges(v_ranges), least(v_pos, v_dur), now())
      on conflict (learner_id, video_id) do update set
        duration_sec = excluded.duration_sec,
        watched_ranges = private.merge_ranges(vp.watched_ranges || v_ranges),
        resume_sec = excluded.resume_sec,
        last_synced_at = now();
      select coalesce(sum((r ->> 1)::numeric - (r ->> 0)::numeric), 0) into v_watched
        from public.video_progress vp, jsonb_array_elements(vp.watched_ranges) r
        where vp.learner_id = v_id and vp.video_id = v_video;
      update public.video_progress set
        watched_sec = v_watched,
        completed_at = coalesce(completed_at, case when v_watched >= 0.9 * duration_sec then now() end)
      where learner_id = v_id and video_id = v_video;

    else -- tutorial events
      insert into public.tutorial_progress as tp (learner_id, started_at, last_step, completed_at, skipped_at, last_synced_at)
      values (v_id, v_at, least(greatest(coalesce((v_data ->> 'step')::int, 0), 0), 20),
        case when v_kind = 'tutorial_complete' then v_at end,
        case when v_kind = 'tutorial_skip' then v_at end, now())
      on conflict (learner_id) do update set
        started_at = coalesce(least(tp.started_at, excluded.started_at), tp.started_at, excluded.started_at),
        last_step = greatest(tp.last_step, excluded.last_step),
        completed_at = coalesce(tp.completed_at, excluded.completed_at),
        skipped_at = coalesce(tp.skipped_at, excluded.skipped_at),
        last_synced_at = now();
    end if;
  end loop;

  return jsonb_build_object('accepted', n_new, 'duplicates', n_dup, 'synced_at', now());
end $$;

-- One-time, explicit import of progress that was saved anonymously on a device before sign-in.
-- Only the facts the old format holds are imported (furthest step, completion time, first-try
-- correctness); they are labelled source = 'legacy_import'. Nothing else is invented.
create function public.import_device_progress(p_lessons jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := private.require_learner(); k text; v jsonb; n int := 0; v_steps int; v_step int; v_done timestamptz;
begin
  if (select legacy_imported_at from public.learners where id = v_id) is not null then
    return jsonb_build_object('imported', 0, 'already_imported', true);
  end if;
  if jsonb_typeof(p_lessons) <> 'object' then raise exception 'lessons_must_be_object'; end if;
  for k, v in select * from jsonb_each(p_lessons) loop
    v_steps := (v ->> 'stepCount')::int;
    v_step := least(greatest(coalesce((v ->> 'step')::int, 0), 0), coalesce(v_steps, 1) - 1);
    v_done := case when v ->> 'completedAt' is not null then private.clamp_time((v ->> 'completedAt')::timestamptz) end;
    continue when k !~ '^MCH68-[A-Z]+-[0-9]{3}$' or v_steps is null or v_steps < 1 or v_steps > 60;
    insert into public.lesson_progress as lp (learner_id, lesson_id, content_version, step_count, current_step,
      furthest_step, first_completed_at, first_activity_at, last_activity_at, last_synced_at, source)
    values (v_id, k, coalesce(v ->> 'version', ''), v_steps, v_step, v_step, v_done,
      coalesce(v_done, now()), coalesce(v_done, now()), now(), 'legacy_import')
    on conflict (learner_id, lesson_id) do update set
      furthest_step = greatest(lp.furthest_step, excluded.furthest_step),
      first_completed_at = coalesce(least(lp.first_completed_at, excluded.first_completed_at), lp.first_completed_at, excluded.first_completed_at),
      last_synced_at = now();
    n := n + 1;
  end loop;
  update public.learners set legacy_imported_at = now() where id = v_id;
  insert into public.learning_events (id, learner_id, kind, data, occurred_at)
  values (gen_random_uuid(), v_id, 'legacy_import', jsonb_build_object('lessons', n), now());
  return jsonb_build_object('imported', n, 'already_imported', false);
end $$;

------------------------------------------------------------------------------------------------------
-- Staff functions (active staff/admin + second factor + cohort scope; every read is audited)
------------------------------------------------------------------------------------------------------

create function public.staff_list_learners(p_query text default '', p_filter text default 'all',
  p_page int default 1, p_page_size int default 25) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_q text := '%' || coalesce(trim(p_query), '') || '%'; v_size int := least(greatest(p_page_size, 1), 100);
  v_off int := (greatest(p_page, 1) - 1) * least(greatest(p_page_size, 1), 100); v_total int; v_rows jsonb;
begin
  perform private.require_staff();
  with scoped as (
    select l.* from public.learners l
    where exists (select 1 from public.staff_cohorts sc join public.cohort_learners cl on cl.cohort_id = sc.cohort_id
                  where sc.staff_id = auth.uid() and cl.learner_id = l.id)
      and (l.display_name ilike v_q or l.contact_hint ilike v_q)
  ), stats as (
    select s.id, s.display_name, s.contact_hint, s.contact_method, s.status, s.name_verified_at,
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
  )
  select (select count(*) from filtered)::int,
    coalesce((select jsonb_agg(to_jsonb(f) order by f.last_synced_at desc nulls last, f.display_name)
              from (select * from filtered order by last_synced_at desc nulls last, display_name limit v_size offset v_off) f), '[]'::jsonb)
  into v_total, v_rows;
  perform private.audit('staff.list_learners', null,
    jsonb_build_object('query', p_query, 'filter', p_filter, 'page', p_page, 'returned', jsonb_array_length(v_rows)));
  return jsonb_build_object('total', v_total, 'page', greatest(p_page, 1), 'page_size', v_size, 'rows', v_rows);
end $$;

create function public.staff_learner_detail(p_learner uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_result jsonb;
begin
  perform private.require_staff();
  if not private.staff_can_see(p_learner) then
    -- returned, not raised: raising would roll back the audit row that records the attempt
    perform private.audit('staff.view_learner_denied', p_learner, '{}'::jsonb);
    return jsonb_build_object('error', 'learner_not_in_scope');
  end if;
  select jsonb_build_object(
    'learner', (select jsonb_build_object('id', l.id, 'display_name', l.display_name, 'contact_hint', l.contact_hint,
        'contact_method', l.contact_method, 'status', l.status, 'name_verified_at', l.name_verified_at,
        'legacy_imported_at', l.legacy_imported_at, 'created_at', l.created_at)
      from public.learners l where l.id = p_learner),
    'tutorial', (select to_jsonb(tp) - 'learner_id' from public.tutorial_progress tp where tp.learner_id = p_learner),
    'lessons', coalesce((select jsonb_agg(to_jsonb(lp) - 'learner_id' order by lp.lesson_id)
      from public.lesson_progress lp where lp.learner_id = p_learner), '[]'::jsonb),
    'quiz', coalesce((select jsonb_agg(jsonb_build_object('lesson_id', q.lesson_id, 'question_id', q.question_id,
        'attempt_no', q.attempt_no, 'correct', q.correct, 'answered_at', q.answered_at) order by q.lesson_id, q.question_id, q.attempt_no)
      from public.quiz_answers q where q.learner_id = p_learner), '[]'::jsonb),
    'videos', coalesce((select jsonb_agg(to_jsonb(vp) - 'learner_id' order by vp.video_id)
      from public.video_progress vp where vp.learner_id = p_learner), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(x order by x.recorded_at desc) from (
        select ev.kind, ev.lesson_id, ev.data, ev.occurred_at, ev.recorded_at from public.learning_events ev
        where ev.learner_id = p_learner order by ev.recorded_at desc limit 100) x), '[]'::jsonb)
  ) into v_result;
  perform private.audit('staff.view_learner', p_learner, '{}'::jsonb);
  return v_result;
end $$;

------------------------------------------------------------------------------------------------------
-- Administrator functions (active admin + second factor; every change is audited)
------------------------------------------------------------------------------------------------------

create function public.admin_invite_staff(p_email text, p_display_name text, p_role public.staff_role) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_email text := lower(trim(p_email)); v_id uuid;
begin
  perform private.require_staff(true);
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'bad_email'; end if;
  if exists (select 1 from auth.users u where lower(u.email) = v_email) then
    -- an existing learner (or staff) account cannot silently become staff: use a separate work email
    raise exception 'email_already_has_account';
  end if;
  update public.staff_invitations set revoked_at = now()
    where email = v_email and accepted_at is null and revoked_at is null and expires_at <= now();
  insert into public.staff_invitations (email, display_name, role, invited_by)
    values (v_email, trim(p_display_name), p_role, auth.uid()) returning id into v_id;
  perform private.audit('admin.invite_staff', null, jsonb_build_object('invitation_id', v_id, 'email', v_email, 'role', p_role));
  return v_id;
end $$;

create function public.admin_revoke_invitation(p_invitation uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_staff(true);
  update public.staff_invitations set revoked_at = now() where id = p_invitation and accepted_at is null and revoked_at is null;
  if not found then raise exception 'invitation_not_open'; end if;
  perform private.audit('admin.revoke_invitation', null, jsonb_build_object('invitation_id', p_invitation));
end $$;

create function public.admin_list_staff() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v jsonb;
begin
  perform private.require_staff(true);
  select jsonb_build_object(
    'staff', coalesce((select jsonb_agg(jsonb_build_object('user_id', s.user_id, 'email', s.email, 'display_name', s.display_name,
        'role', s.role, 'status', s.status, 'created_at', s.created_at, 'status_changed_at', s.status_changed_at,
        'mfa_enrolled', exists (select 1 from auth.mfa_factors f where f.user_id = s.user_id and f.status = 'verified'),
        'cohorts', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name) order by c.name)
          from public.staff_cohorts sc join public.cohorts c on c.id = sc.cohort_id where sc.staff_id = s.user_id), '[]'::jsonb))
      order by s.status, s.display_name) from public.staff_members s), '[]'::jsonb),
    'invitations', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'email', i.email, 'display_name', i.display_name,
        'role', i.role, 'created_at', i.created_at, 'expires_at', i.expires_at) order by i.created_at desc)
      from public.staff_invitations i where i.accepted_at is null and i.revoked_at is null and i.expires_at > now()), '[]'::jsonb),
    'cohorts', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name,
        'learners', (select count(*) from public.cohort_learners cl where cl.cohort_id = c.id)) order by c.name)
      from public.cohorts c), '[]'::jsonb)
  ) into v;
  return v;
end $$;

create function public.admin_set_staff_role(p_user uuid, p_role public.staff_role) returns void
language plpgsql security definer set search_path = '' as $$
declare v_old public.staff_role;
begin
  perform private.require_staff(true);
  select role into v_old from public.staff_members where user_id = p_user for update;
  if v_old is null then raise exception 'not_staff_member'; end if;
  if v_old = 'admin' and p_role <> 'admin' and private.active_admins() <= 1
     and (select status from public.staff_members where user_id = p_user) = 'active' then
    raise exception 'last_active_admin';
  end if;
  update public.staff_members set role = p_role where user_id = p_user;
  perform private.audit('admin.set_staff_role', p_user, jsonb_build_object('from', v_old, 'to', p_role));
end $$;

create function public.admin_set_staff_status(p_user uuid, p_status public.account_status) returns void
language plpgsql security definer set search_path = '' as $$
declare v_old public.staff_members;
begin
  perform private.require_staff(true);
  select * into v_old from public.staff_members where user_id = p_user for update;
  if v_old.user_id is null then raise exception 'not_staff_member'; end if;
  if v_old.role = 'admin' and v_old.status = 'active' and p_status <> 'active' and private.active_admins() <= 1 then
    raise exception 'last_active_admin';
  end if;
  update public.staff_members set status = p_status, status_changed_at = now() where user_id = p_user;
  perform private.audit('admin.set_staff_status', p_user, jsonb_build_object('from', v_old.status, 'to', p_status));
end $$;

create function public.admin_create_cohort(p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform private.require_staff(true);
  insert into public.cohorts (name, created_by) values (trim(p_name), auth.uid()) returning id into v_id;
  perform private.audit('admin.create_cohort', null, jsonb_build_object('cohort_id', v_id, 'name', trim(p_name)));
  return v_id;
end $$;

create function public.admin_set_staff_cohort(p_staff uuid, p_cohort uuid, p_granted boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_staff(true);
  if not exists (select 1 from public.staff_members where user_id = p_staff) then raise exception 'not_staff_member'; end if;
  if p_granted then
    insert into public.staff_cohorts (staff_id, cohort_id, granted_by) values (p_staff, p_cohort, auth.uid())
      on conflict do nothing;
  else
    delete from public.staff_cohorts where staff_id = p_staff and cohort_id = p_cohort;
  end if;
  perform private.audit(case when p_granted then 'admin.grant_cohort' else 'admin.revoke_cohort' end, p_staff,
    jsonb_build_object('cohort_id', p_cohort));
end $$;

-- Account management view of learners: identity and status only, no learning progress.
create function public.admin_list_learners(p_query text default '', p_page int default 1, p_page_size int default 25) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_q text := '%' || coalesce(trim(p_query), '') || '%'; v_size int := least(greatest(p_page_size, 1), 100); v jsonb;
begin
  perform private.require_staff(true);
  select jsonb_build_object(
    'total', (select count(*) from public.learners l where l.display_name ilike v_q or l.contact_hint ilike v_q),
    'rows', coalesce((select jsonb_agg(r) from (
      select l.id, l.display_name, l.contact_hint, l.contact_method, l.status, l.created_at,
        coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name) order by c.name)
          from public.cohort_learners cl join public.cohorts c on c.id = cl.cohort_id where cl.learner_id = l.id), '[]'::jsonb) as cohorts
      from public.learners l where l.display_name ilike v_q or l.contact_hint ilike v_q
      order by l.created_at desc limit v_size offset (greatest(p_page, 1) - 1) * v_size) r), '[]'::jsonb)
  ) into v;
  perform private.audit('admin.list_learners', null, jsonb_build_object('query', p_query, 'page', p_page));
  return v;
end $$;

create function public.admin_set_learner_cohort(p_learner uuid, p_cohort uuid, p_member boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_staff(true);
  if p_member then
    insert into public.cohort_learners (cohort_id, learner_id, added_by) values (p_cohort, p_learner, auth.uid())
      on conflict do nothing;
  else
    delete from public.cohort_learners where cohort_id = p_cohort and learner_id = p_learner;
  end if;
  perform private.audit(case when p_member then 'admin.add_learner_to_cohort' else 'admin.remove_learner_from_cohort' end,
    p_learner, jsonb_build_object('cohort_id', p_cohort));
end $$;

create function public.admin_set_learner_status(p_learner uuid, p_status public.account_status) returns void
language plpgsql security definer set search_path = '' as $$
declare v_old public.account_status;
begin
  perform private.require_staff(true);
  select status into v_old from public.learners where id = p_learner for update;
  if v_old is null then raise exception 'not_learner'; end if;
  update public.learners set status = p_status where id = p_learner;
  perform private.audit('admin.set_learner_status', p_learner, jsonb_build_object('from', v_old, 'to', p_status));
end $$;

create function public.admin_audit_log(p_page int default 1, p_page_size int default 50) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_size int := least(greatest(p_page_size, 1), 200);
begin
  perform private.require_staff(true);
  return coalesce((select jsonb_agg(r) from (
    select a.id, a.at, a.actor_id, a.actor_role, a.action, a.target_id, a.details,
      coalesce((select s.display_name from public.staff_members s where s.user_id = a.actor_id), '') as actor_name
    from public.audit_log a order by a.at desc, a.id desc limit v_size offset (greatest(p_page, 1) - 1) * v_size) r), '[]'::jsonb);
end $$;

create function public.admin_health() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_staff(true);
  return jsonb_build_object(
    'learners', (select count(*) from public.learners),
    'learners_active', (select count(*) from public.learners where status = 'active'),
    'staff_active', (select count(*) from public.staff_members where status = 'active'),
    'admins_active', private.active_admins(),
    'events_24h', (select count(*) from public.learning_events where recorded_at > now() - interval '24 hours'),
    'last_event_at', (select max(recorded_at) from public.learning_events),
    'server_time', now());
end $$;

-- First administrator / administrator recovery. NOT callable through the API: run by a person with
-- direct database access (see docs/ACCOUNTS-ADMIN-GUIDE.md). Creates an admin invitation; the person
-- then signs in through the staff page with that email and sets up the authenticator app.
create function private.bootstrap_admin(p_email text, p_display_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_email text := lower(trim(p_email));
begin
  update public.staff_invitations set revoked_at = now() where email = v_email and accepted_at is null and revoked_at is null;
  insert into public.staff_invitations (email, display_name, role, invited_by) values (v_email, trim(p_display_name), 'admin', null)
    returning id into v_id;
  insert into public.audit_log (actor_id, actor_role, action, details)
    values (null, 'database_operator', 'bootstrap.admin_invitation', jsonb_build_object('invitation_id', v_id, 'email', v_email));
  return v_id;
end $$;

------------------------------------------------------------------------------------------------------
-- Function grants: API roles get exactly these, nothing else.
------------------------------------------------------------------------------------------------------

revoke execute on all functions in schema public from public, anon, authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;

grant execute on function
  public.my_account(),
  public.set_my_display_name(text),
  public.sync_learning(jsonb),
  public.import_device_progress(jsonb),
  public.staff_list_learners(text, text, int, int),
  public.staff_learner_detail(uuid),
  public.admin_invite_staff(text, text, public.staff_role),
  public.admin_revoke_invitation(uuid),
  public.admin_list_staff(),
  public.admin_set_staff_role(uuid, public.staff_role),
  public.admin_set_staff_status(uuid, public.account_status),
  public.admin_create_cohort(text),
  public.admin_set_staff_cohort(uuid, uuid, boolean),
  public.admin_list_learners(text, int, int),
  public.admin_set_learner_cohort(uuid, uuid, boolean),
  public.admin_set_learner_status(uuid, public.account_status),
  public.admin_audit_log(int, int),
  public.admin_health()
to authenticated;

-- The auth service must be able to fire the triggers.
grant usage on schema private to supabase_auth_admin;
grant execute on function private.on_auth_user_created(), private.on_auth_user_confirmed() to supabase_auth_admin;
