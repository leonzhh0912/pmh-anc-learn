// Staff-issued logins (no SMS/email cost): admins create staff with a password, staff create patients with a
// patient ID + password. Real Supabase Auth sign-in against the LOCAL stack; fictional people only.
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { db, newClient, passwordSignIn, patientEmail, rpc, run, setStaffMfa, staffPasswordSignIn } from "./helpers.mjs";

const mail = (who) => `${who}-${run}@pmh.example.test`;
let admin, nurse, nurseId, cohortA, cohortB, created;

before(async () => {
  await setStaffMfa(true); // these first checks cover the strict setting; the last block covers the default (off)
  const { rows } = await db.query("select private.bootstrap_admin_password($1, $2) pw", [mail("admin"), "ผู้ดูแลระบบ (ทดสอบ)"]);
  assert.match(rows[0].pw, /^\d{10}$/);
  admin = await staffPasswordSignIn(mail("admin"), rows[0].pw);
  cohortA = (await rpc(admin.client, "admin_create_cohort", { p_name: `ANC A ${run}` })).data;
  cohortB = (await rpc(admin.client, "admin_create_cohort", { p_name: `ANC B ${run}` })).data;
});

after(async () => {
  await setStaffMfa(false);
  // leave no extra active administrator behind for the other test files
  await db.query("update public.staff_members set status = 'deactivated' where email = $1", [mail("admin")]);
});

describe("staff accounts created by an administrator", () => {
  test("admin creates a staff account with a one-time password; staff need the authenticator too", async () => {
    const r = await rpc(admin.client, "admin_create_staff", { p_email: mail("nurse"), p_display_name: "พยาบาลทดสอบ", p_role: "staff" });
    assert.ifError(r.error);
    assert.match(r.data.password, /^\d{10}$/);
    const first = await passwordSignIn(mail("nurse"), r.data.password);
    const me = await rpc(first.client, "my_account");
    assert.equal(me.data.kind, "staff");
    assert.equal((await rpc(first.client, "staff_list_learners", {})).error, "mfa_required");
    const learnerRow = await db.query("select count(*)::int n from public.learners where id = $1", [first.user.id]);
    assert.equal(learnerRow.rows[0].n, 0, "a staff account never gets a patient profile");
    nurse = await staffPasswordSignIn(mail("nurse"), r.data.password);
    nurseId = nurse.user.id;
    await rpc(admin.client, "admin_set_staff_cohort", { p_staff: nurseId, p_cohort: cohortA, p_granted: true });
  });

  test("only administrators create staff; passwords are stored hashed, never in clear or in the audit log", async () => {
    assert.equal((await rpc(nurse.client, "admin_create_staff", { p_email: mail("x"), p_display_name: "x", p_role: "admin" })).error, "not_admin");
    const { rows } = await db.query("select encrypted_password from auth.users where email = $1", [mail("nurse")]);
    assert.match(rows[0].encrypted_password, /^\$2[aby]\$10\$/);
    const audit = await db.query("select details::text d from public.audit_log where action = 'admin.create_staff'");
    assert.ok(audit.rows.every((a) => !/\d{10}/.test(a.d)), "no password in the audit log");
  });

  test("admin resets a staff login (forgotten password + lost authenticator phone)", async () => {
    const r = await rpc(admin.client, "admin_reset_staff_login", { p_user: nurseId, p_reset_authenticator: true });
    assert.ifError(r.error);
    const { rows } = await db.query("select count(*)::int n from auth.mfa_factors where user_id = $1", [nurseId]);
    assert.equal(rows[0].n, 0);
    const old = await nurse.client.auth.refreshSession();
    assert.ok(old.error, "old sessions are signed out (refresh refused)");
    nurse = await staffPasswordSignIn(mail("nurse"), r.data.password);
  });
});

describe("patient accounts created by staff", () => {
  test("staff create a patient in their own group and get an ID + password for the slip", async () => {
    const r = await rpc(nurse.client, "staff_create_learner", { p_display_name: "แม่สมศรี (ทดสอบ)", p_cohort: cohortA });
    assert.ifError(r.error);
    created = r.data;
    assert.match(created.username, /^[1-9]\d{7}$/);
    assert.match(created.password, /^\d{10}$/);
    const p = await passwordSignIn(patientEmail(created.username), created.password);
    const me = await rpc(p.client, "my_account");
    assert.equal(me.data.kind, "learner");
    assert.equal(me.data.contact_method, "username");
    assert.equal(me.data.contact_hint, `ID ${created.username.slice(0, 4)}-${created.username.slice(4)}`);
    assert.equal(me.data.display_name, "แม่สมศรี (ทดสอบ)");
    const list = await rpc(nurse.client, "staff_list_learners", {});
    assert.ok(list.data.rows.some((x) => x.username === created.username));
  });

  test("staff cannot create patients outside their groups; patients and signed-out people cannot create anyone", async () => {
    assert.equal((await rpc(nurse.client, "staff_create_learner", { p_display_name: "x", p_cohort: cohortB })).error, "cohort_not_assigned");
    const p = await passwordSignIn(patientEmail(created.username), created.password);
    assert.equal((await rpc(p.client, "staff_create_learner", { p_display_name: "x", p_cohort: cohortA })).error, "not_staff");
    assert.ok((await newClient().rpc("staff_create_learner", { p_display_name: "x", p_cohort: cohortA })).error);
    const audit = await db.query("select details::text d from public.audit_log where action = 'staff.create_learner'");
    assert.ok(audit.rows.length >= 1 && audit.rows.every((a) => !a.d.includes(created.password)));
  });

  test("a patient can choose their own password; a wrong password is refused", async () => {
    const p = await passwordSignIn(patientEmail(created.username), created.password);
    assert.ifError((await p.client.auth.updateUser({ password: "ต่างจากเดิม1" })).error);
    await assert.rejects(passwordSignIn(patientEmail(created.username), created.password));
    const again = await passwordSignIn(patientEmail(created.username), "ต่างจากเดิม1");
    assert.ok(again.user.id);
  });

  test("forgotten password: staff issue a new one; the old one and old sessions stop working", async () => {
    const before = await passwordSignIn(patientEmail(created.username), "ต่างจากเดิม1");
    const r = await rpc(nurse.client, "staff_reset_learner_password", { p_learner: created.learner_id });
    assert.ifError(r.error);
    await assert.rejects(passwordSignIn(patientEmail(created.username), "ต่างจากเดิม1"));
    assert.ok((await before.client.auth.refreshSession()).error, "old session cannot be refreshed");
    assert.ok((await passwordSignIn(patientEmail(created.username), r.data.password)).user.id);
  });

  test("staff cannot reset a patient outside their groups", async () => {
    const other = await rpc(admin.client, "staff_create_learner", { p_display_name: "นอกกลุ่ม (ทดสอบ)", p_cohort: cohortB });
    assert.ifError(other.error);
    assert.equal((await rpc(nurse.client, "staff_reset_learner_password", { p_learner: other.data.learner_id })).error, "learner_not_in_scope");
  });

  test("patient lists are sorted by creation date, newest first", async () => {
    const newer = await rpc(nurse.client, "staff_create_learner", { p_display_name: "ใหม่ล่าสุด (ทดสอบ)", p_cohort: cohortA });
    const list = await rpc(nurse.client, "staff_list_learners", {});
    assert.equal(list.data.rows[0].username, newer.data.username);
    const dates = list.data.rows.map((x) => Date.parse(x.created_at));
    assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
    const admins = await rpc(admin.client, "admin_list_learners", {});
    const ad = admins.data.rows.map((x) => Date.parse(x.created_at));
    assert.deepEqual(ad, [...ad].sort((a, b) => b - a));
  });

  test("the bootstrap and account-creation helpers are not reachable through the API", async () => {
    for (const fn of ["bootstrap_admin_password", "create_password_user", "set_password", "random_digits"]) {
      assert.ok((await nurse.client.rpc(fn, {})).error, fn);
    }
  });
});

describe("default setting: no authenticator for staff (simple sign-in)", () => {
  test("staff and admins work with password only; learners still get nothing; IT can switch it back on", async () => {
    await setStaffMfa(false);
    const r = await rpc(admin.client, "admin_create_staff", { p_email: mail("simple"), p_display_name: "พยาบาลไม่มีแอป", p_role: "staff" });
    assert.ifError(r.error);
    const plain = await passwordSignIn(mail("simple"), r.data.password); // password only, no authenticator
    const me = await rpc(plain.client, "my_account");
    assert.equal(me.data.aal, "aal1");
    assert.equal(me.data.mfa_required, false);
    assert.ifError((await rpc(plain.client, "staff_list_learners", {})).error);
    assert.equal((await rpc(plain.client, "admin_list_staff")).error, "not_admin", "roles still apply");
    const p = await passwordSignIn(patientEmail(created.username), (await rpc(admin.client, "staff_reset_learner_password", { p_learner: created.learner_id })).data.password);
    assert.equal((await rpc(p.client, "staff_list_learners", {})).error, "not_staff", "learners still get nothing");
    const wrong = await newClient().auth.signInWithPassword({ email: mail("simple"), password: "0000000000" });
    assert.ok(wrong.error, "a wrong staff password is refused");

    await setStaffMfa(true);
    assert.equal((await rpc(plain.client, "staff_list_learners", {})).error, "mfa_required", "switching it on applies at once");
    assert.equal((await rpc(plain.client, "my_account")).data.mfa_required, true);
    await setStaffMfa(false);
    assert.ifError((await rpc(plain.client, "staff_list_learners", {})).error);
  });

  test("the setting cannot be changed through the API", async () => {
    const t = await admin.client.from("settings").select("*");
    assert.ok(t.error);
    assert.ok((await admin.client.rpc("staff_mfa_required", {})).error);
  });
});
