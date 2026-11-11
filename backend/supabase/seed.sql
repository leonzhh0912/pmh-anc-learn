-- LOCAL DEVELOPMENT ONLY (applied by `supabase db reset`, never by migrations, never in production).
--
-- dev_only.sms_outbox is a stand-in SMS gateway, like Mailpit for email: Supabase Auth generates a real
-- one-time code and calls the "send SMS" hook; locally the hook stores the message here instead of
-- sending it. Tests and the local demo read the code from this table. Production must configure an
-- approved SMS provider instead (docs/ACCOUNTS-HOSTING.md), and this schema must not exist there.

create schema if not exists dev_only;
revoke all on schema dev_only from public, anon, authenticated;

create table dev_only.sms_outbox (
  id bigint generated always as identity primary key,
  phone text not null,
  body text not null,
  otp text not null,
  created_at timestamptz not null default now()
);

create function dev_only.send_sms(event jsonb) returns jsonb language plpgsql as $$
begin
  insert into dev_only.sms_outbox (phone, otp, body)
  values (event -> 'user' ->> 'phone', event -> 'sms' ->> 'otp',
          'รหัสยืนยัน ANC Learn: ' || (event -> 'sms' ->> 'otp') || ' ใช้ได้ 10 นาที ห้ามบอกรหัสนี้กับผู้อื่น');
  return '{}'::jsonb;
end $$;

grant usage on schema dev_only to supabase_auth_admin;
grant insert, select on dev_only.sms_outbox to supabase_auth_admin;
grant execute on function dev_only.send_sms(jsonb) to supabase_auth_admin;
revoke execute on function dev_only.send_sms(jsonb) from public, anon, authenticated;

-- A fictional cohort for the local demo. Real cohorts are created by an administrator.
insert into public.cohorts (name) values ('คลินิกฝากครรภ์ (ข้อมูลทดสอบ)');
