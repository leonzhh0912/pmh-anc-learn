// Test helpers: real Supabase Auth against the LOCAL stack (no mocks). Email codes are read from
// Mailpit, SMS codes from the local dev outbox (dev_only.sms_outbox). All people are fictional.
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { TOTP } from "otpauth";

const env = process.env;
for (const k of ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "DATABASE_URL", "MAILPIT_URL"]) {
  if (!env[k]) throw new Error(`${k} missing: run tests with --env-file=.env.local (npm test does this)`);
}

export const run = Date.now().toString(36);
export const db = new pg.Pool({ connectionString: env.DATABASE_URL, max: 2 });

export function newClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function latestEmailCode(email, { after = 0 } = {}) {
  for (let i = 0; i < 40; i++) {
    const res = await fetch(`${env.MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}&limit=5`);
    const list = await res.json();
    const msg = (list.messages ?? []).find((m) => Date.parse(m.Created) > after);
    if (msg) {
      const full = await (await fetch(`${env.MAILPIT_URL}/api/v1/message/${msg.ID}`)).json();
      const code = /\b(\d{6})\b/.exec(full.Text ?? full.HTML ?? "")?.[1];
      if (code) return { code, subject: full.Subject, text: full.Text };
    }
    await sleep(250);
  }
  throw new Error(`no email code for ${email}`);
}

export async function latestSmsCode(e164, { afterId = 0 } = {}) {
  const phone = e164.replace(/^\+/, "");
  for (let i = 0; i < 40; i++) {
    const { rows } = await db.query(
      "select id, otp, body from dev_only.sms_outbox where phone = $1 and id > $2 order by id desc limit 1",
      [phone, afterId],
    );
    if (rows[0]) return rows[0];
    await sleep(250);
  }
  throw new Error(`no sms code for ${e164}`);
}

export async function lastSmsId() {
  const { rows } = await db.query("select coalesce(max(id), 0)::int as id from dev_only.sms_outbox");
  return rows[0].id;
}

/** Ask for a code; if the resend cooldown is still running, wait it out like a person would. */
async function requestCode(c, params) {
  for (let i = 0; i < 3; i++) {
    const { error } = await c.auth.signInWithOtp(params);
    if (!error) return;
    const wait = /after (\d+) seconds/.exec(error.message)?.[1];
    if (error.status !== 429 || !wait) throw error;
    await sleep((Number(wait) + 1) * 1000);
  }
  throw new Error("cooldown did not end");
}

/** Sign in (or sign up) with an email one-time code. Returns a client holding the session. */
export async function emailSignIn(email, data = {}) {
  const c = newClient();
  await requestCode(c, { email, options: { shouldCreateUser: true, data } });
  const t0 = Date.now() - 1500;
  const { code } = await latestEmailCode(email, { after: t0 });
  const { data: s, error: e2 } = await c.auth.verifyOtp({ email, token: code, type: "email" });
  if (e2) throw e2;
  return { client: c, user: s.user };
}

export async function phoneSignIn(phone, data = {}) {
  const c = newClient();
  const before = await lastSmsId();
  await requestCode(c, { phone, options: { shouldCreateUser: true, data } });
  const { otp } = await latestSmsCode(phone, { afterId: before });
  const { data: s, error: e2 } = await c.auth.verifyOtp({ phone, token: otp, type: "sms" });
  if (e2) throw e2;
  return { client: c, user: s.user };
}

/** Staff sign-in through the staff path, then TOTP enrolment (first time) or challenge -> aal2. */
export async function staffSignIn(email, { totpSecret } = {}) {
  const { client, user } = await emailSignIn(email, { intent: "staff" });
  let secret = totpSecret;
  let factorId;
  if (!secret) {
    const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: `test-${run}` });
    if (error) throw error;
    secret = data.totp.secret;
    factorId = data.id;
  } else {
    const { data } = await client.auth.mfa.listFactors();
    factorId = data.totp[0].id;
  }
  const code = new TOTP({ secret, digits: 6, period: 30 }).generate();
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) throw error;
  return { client, user, totpSecret: secret };
}

/** Run an RPC and return { data, error } with the Postgres error message (e.g. 'not_staff'). */
export async function rpc(client, fn, args) {
  const { data, error } = await client.rpc(fn, args);
  return { data, error: error ? error.message : null, code: error?.code };
}

export function ev(kind, lessonId, data = {}, at = new Date().toISOString()) {
  return { id: crypto.randomUUID(), kind, lessonId, data, at };
}

/** Password sign-in (staff-issued patient accounts and password staff accounts). */
export async function passwordSignIn(email, password) {
  const c = newClient();
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client: c, user: data.user };
}

export const patientEmail = (username) => `${username}@learners.anc-learn.invalid`;

/** Staff with a password: sign in, then authenticator (enrol on first use) -> aal2. */
export async function staffPasswordSignIn(email, password, { totpSecret } = {}) {
  const { client, user } = await passwordSignIn(email, password);
  let secret = totpSecret;
  let factorId;
  const { data: f } = await client.auth.mfa.listFactors();
  const verified = f?.totp?.find((x) => x.status === "verified");
  if (verified && secret) factorId = verified.id;
  else {
    const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: `t-${Date.now()}` });
    if (error) throw error;
    secret = data.totp.secret;
    factorId = data.id;
  }
  const code = new TOTP({ secret, digits: 6, period: 30 }).generate();
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) throw error;
  return { client, user, totpSecret: secret };
}

/** Server setting: whether staff/admins need an authenticator code (default off since 2026-11-11). */
export async function setStaffMfa(on) {
  await db.query("update private.settings set value = $1::jsonb, updated_at = now() where key = 'require_staff_mfa'", [on ? "true" : "false"]);
}
