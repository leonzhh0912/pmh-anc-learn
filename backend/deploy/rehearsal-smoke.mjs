// REHEARSAL / STAGING ONLY. Never run against the production server: it creates fictional accounts.
// Exercises the whole staff-issued flow through the public HTTPS address of a freshly installed server:
// admin (password + authenticator) -> group + nurse -> nurse creates a patient -> patient learns ->
// nurse sees progress -> outsider refused -> admin deletes the patient.
//   SMOKE_URL=https://ancapi.rehearsal.test SMOKE_KEY=<publishable> SMOKE_ADMIN_EMAIL=... SMOKE_ADMIN_PASSWORD=... node rehearsal-smoke.mjs
import { createClient } from "@supabase/supabase-js";
import { TOTP } from "otpauth";

const { SMOKE_URL: url, SMOKE_KEY: key, SMOKE_ADMIN_EMAIL: adminEmail, SMOKE_ADMIN_PASSWORD: adminPassword } = process.env;
if (!url || !key || !adminEmail || !adminPassword) throw new Error("set SMOKE_URL, SMOKE_KEY, SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD");
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
let n = 0;
const check = (ok, what) => {
  if (!ok) throw new Error(`FAILED: ${what}`);
  console.log(`  OK  ${++n}. ${what}`);
};
const rpc = async (c, fn, args) => {
  const { data, error } = await c.rpc(fn, args);
  return { data, error: error?.message ?? null };
};
async function signIn(email, password) {
  const c = client();
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in ${email}: ${error.message}`);
  return c;
}
async function secondFactor(c) {
  const { data, error } = await c.auth.mfa.enroll({ factorType: "totp", friendlyName: "rehearsal" });
  if (error) throw error;
  const code = new TOTP({ secret: data.totp.secret, digits: 6, period: 30 }).generate();
  const v = await c.auth.mfa.challengeAndVerify({ factorId: data.id, code });
  if (v.error) throw v.error;
}
const tag = Date.now().toString(36);

const admin = await signIn(adminEmail, adminPassword);
check((await rpc(admin, "admin_list_staff")).error === "mfa_required", "admin without authenticator is refused");
await secondFactor(admin);
check(!(await rpc(admin, "admin_list_staff")).error, "admin with password + authenticator gets in");

const cohort = (await rpc(admin, "admin_create_cohort", { p_name: `ซ้อม ${tag}` })).data;
const nurseSlip = (await rpc(admin, "admin_create_staff", { p_email: `nurse-${tag}@pmh.example.test`, p_display_name: "พยาบาลซ้อม", p_role: "staff" })).data;
check(/^\d{10}$/.test(nurseSlip?.password ?? ""), "admin creates a nurse account with a one-time password");
const nurse = await signIn(nurseSlip.email, nurseSlip.password);
await secondFactor(nurse);
await rpc(admin, "admin_set_staff_cohort", { p_staff: nurseSlip.user_id, p_cohort: cohort, p_granted: true });

const slip = (await rpc(nurse, "staff_create_learner", { p_display_name: "ผู้เรียนซ้อม", p_cohort: cohort })).data;
check(/^\d{8}$/.test(slip?.username ?? ""), "nurse creates a patient (8-digit ID + password)");
const patient = await signIn(`${slip.username}@learners.anc-learn.invalid`, slip.password);
const ev = (kind, data) => ({ id: crypto.randomUUID(), kind, lessonId: "MCH68-OVR-001", data, at: new Date().toISOString() });
const meta = { stepCount: 7, version: "1.0.0" };
const s = await rpc(patient, "sync_learning", { p_events: [ev("lesson_step", { step: 3, ...meta }), ev("quiz_answer", { questionId: "q1", correct: false }), ev("lesson_complete", meta)] });
check(s.data?.accepted === 3, "patient signs in with the slip and progress is saved centrally");
const list = (await rpc(nurse, "staff_list_learners", {})).data;
check(list?.rows?.[0]?.username === slip.username && list.rows[0].completed === 1, "nurse sees the patient (newest first) with 1 lesson completed");

const outsider = await signIn(`${(await rpc(admin, "staff_create_learner", { p_display_name: "คนนอก", p_cohort: cohort })).data.username}@learners.anc-learn.invalid`, "0").catch(() => null);
check(outsider === null, "a wrong password is refused");
check((await rpc(patient, "staff_learner_detail", { p_learner: slip.learner_id })).error === "not_staff", "a patient cannot open staff data");
const { data: rows } = await client().from("lesson_progress").select("*");
check(Array.isArray(rows) && rows.length === 0, "nobody reads progress without signing in");

const del = await rpc(admin, "admin_delete_learner", { p_learner: slip.learner_id, p_reason: "rehearsal clean-up" });
check(!del.error, "admin deletes the patient (identity removed, de-identified records kept 5 years)");
check((await patient.auth.refreshSession()).error, "the deleted patient's session no longer works");
await rpc(admin, "admin_set_staff_status", { p_user: nurseSlip.user_id, p_status: "deactivated" });
check((await rpc(nurse, "staff_list_learners", {})).error === "not_staff", "a deactivated nurse loses access at once");
console.log(`\n${n} checks passed`);
