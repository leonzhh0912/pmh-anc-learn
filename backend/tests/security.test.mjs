// Database/API security and progress tests against the LOCAL Supabase stack with real sign-in flows.
// Every assertion is about what the server enforces; nothing here trusts the web app.
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  db, emailSignIn, ev, latestEmailCode, newClient, phoneSignIn, rpc, run, setStaffMfa, staffSignIn,
} from "./helpers.mjs";

const L1 = "MCH68-OVR-001"; // a real lesson id (7 steps)
const mail = (who) => `${who}-${run}@example.test`;
// fictional numbers; locally no SMS is ever sent (dev outbox)
const phoneB = `+6680${String(Date.now()).slice(-7)}`;

let admin, staff, staffSecret, learnerA, learnerB, cohortId;

before(async () => {
  // this file checks the strict setting (authenticator required); local-logins checks the default (off)
  await setStaffMfa(true);
  // first administrator: created by a person with direct database access, never through the API
  await db.query("select private.bootstrap_admin($1, $2)", [mail("admin"), "ผู้ดูแลระบบ (ทดสอบ)"]);
  admin = await staffSignIn(mail("admin"));
  learnerA = await emailSignIn(mail("learner-a"), { display_name: "คุณเอ (ทดสอบ)" });
  learnerB = await phoneSignIn(phoneB, { display_name: "คุณบี (ทดสอบ)" });
});

after(async () => {
  await setStaffMfa(false);
  await db.end();
});

describe("sign-up and roles", () => {
  test("email-only and phone-only learners get learner profiles with masked contacts", async () => {
    const a = await rpc(learnerA.client, "my_account");
    assert.equal(a.data.kind, "learner");
    assert.equal(a.data.contact_method, "email");
    assert.match(a.data.contact_hint, /^le•••@example\.test$/);
    const b = await rpc(learnerB.client, "my_account");
    assert.equal(b.data.kind, "learner");
    assert.equal(b.data.contact_method, "phone");
    assert.match(b.data.contact_hint, /^08x-xxx-\d{4}$/);
    assert.equal(learnerB.user.phone, phoneB.slice(1));
  });

  test("public sign-up asking for a role still creates a learner", async () => {
    const { client } = await emailSignIn(mail("wannabe"), { role: "admin", kind: "staff", is_admin: true });
    const me = await rpc(client, "my_account");
    assert.equal(me.data.kind, "learner");
    const r = await rpc(client, "admin_list_staff");
    assert.equal(r.error, "not_staff");
  });

  test("sign-up through the staff path without an invitation is refused", async () => {
    const c = newClient();
    const { error } = await c.auth.signInWithOtp({ email: mail("uninvited"), options: { data: { intent: "staff" } } });
    assert.ok(error, "expected an error");
    const { rows } = await db.query("select count(*)::int n from auth.users where email = $1", [mail("uninvited")]);
    assert.equal(rows[0].n, 0);
  });

  test("the bootstrap function is not reachable through the API", async () => {
    const r = await rpc(learnerA.client, "bootstrap_admin", { p_email: mail("x"), p_display_name: "x" });
    assert.ok(r.error);
    const anon = await newClient().rpc("my_account");
    assert.ok(anon.error, "anon must not execute API functions");
  });

  test("learners cannot write tables or read staff/audit tables directly", async () => {
    const c = learnerA.client;
    const ins = await c.from("staff_members").insert({ user_id: learnerA.user.id, email: "x@x", display_name: "x", role: "admin" });
    assert.ok(ins.error);
    const upd = await c.from("learners").update({ status: "active", display_name: "hacked" }).eq("id", learnerA.user.id);
    assert.ok(upd.error);
    const lp = await c.from("lesson_progress").insert({ learner_id: learnerA.user.id, lesson_id: L1, content_version: "1", step_count: 7, first_activity_at: new Date().toISOString(), last_activity_at: new Date().toISOString() });
    assert.ok(lp.error);
    for (const t of ["audit_log", "staff_members", "staff_invitations", "cohort_learners", "learning_events"]) {
      const r = await c.from(t).select("*").limit(1);
      assert.ok(r.error, `${t} must not be readable`);
    }
    const del = await c.from("audit_log").delete().gt("id", 0);
    assert.ok(del.error);
  });
});

describe("one-time codes", () => {
  test("a wrong code is rejected and a used code cannot be reused", async () => {
    const email = mail("otp");
    const c = newClient();
    const t0 = Date.now() - 1000;
    await c.auth.signInWithOtp({ email });
    const { code, subject } = await latestEmailCode(email, { after: t0 });
    assert.match(subject, /รหัสยืนยัน/);
    const wrong = String((Number(code) + 1) % 1000000).padStart(6, "0");
    const bad = await c.auth.verifyOtp({ email, token: wrong, type: "email" });
    assert.ok(bad.error, "wrong code must fail");
    const ok = await c.auth.verifyOtp({ email, token: code, type: "email" });
    assert.ifError(ok.error);
    const again = await newClient().auth.verifyOtp({ email, token: code, type: "email" });
    assert.ok(again.error, "a code works only once");
  });

  test("an expired code is rejected", async () => {
    const email = mail("expired");
    const c = newClient();
    const t0 = Date.now() - 1000;
    await c.auth.signInWithOtp({ email });
    const { code } = await latestEmailCode(email, { after: t0 });
    // age the code past the 10-minute expiry
    await db.query(
      `update auth.users set confirmation_sent_at = now() - interval '11 minutes',
         recovery_sent_at = now() - interval '11 minutes' where email = $1`, [email]);
    await db.query(
      `update auth.one_time_tokens set created_at = now() - interval '11 minutes'
         where user_id = (select id from auth.users where email = $1)`, [email]).catch(() => {});
    const r = await c.auth.verifyOtp({ email, token: code, type: "email" });
    assert.ok(r.error, "expired code must fail");
  });

  test("asking for a new code too quickly is refused", async () => {
    const email = mail("resend");
    const c = newClient();
    const first = await c.auth.signInWithOtp({ email });
    assert.ifError(first.error);
    const second = await c.auth.signInWithOtp({ email });
    assert.ok(second.error, "resend inside the cooldown must fail");
    assert.equal(second.error.status, 429);
  });

  test("SMS codes go to the local dev outbox only, in Thai", async () => {
    const { rows } = await db.query("select body from dev_only.sms_outbox where phone = $1 order by id desc limit 1", [phoneB.slice(1)]);
    assert.match(rows[0].body, /^รหัสยืนยัน ANC Learn: \d{6}/);
  });
});

describe("progress", () => {
  const meta = { stepCount: 7, version: "1.0.0" };
  let firstCompletedAt;

  test("events sync, and a second device sees the same progress", async () => {
    const batch = [
      ev("lesson_step", L1, { step: 0, ...meta }),
      ev("lesson_step", L1, { step: 3, ...meta }),
      ev("quiz_answer", L1, { questionId: "q1", correct: false }),
      ev("quiz_answer", L1, { questionId: "q1", correct: true }),
      ev("lesson_step", L1, { step: 6, ...meta }),
      ev("lesson_complete", L1, meta),
      ev("tutorial_start", null, { step: 0 }),
      ev("tutorial_complete", null, { step: 7 }),
    ];
    const r = await rpc(learnerA.client, "sync_learning", { p_events: batch });
    assert.ifError(r.error);
    assert.equal(r.data.accepted, 8);

    // "phone B": a fresh sign-in on another client
    const device2 = await emailSignIn(mail("learner-a"));
    const { data: rows, error } = await device2.client.from("lesson_progress").select("*");
    assert.ifError(error);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].lesson_id, L1);
    assert.equal(rows[0].furthest_step, 6);
    assert.ok(rows[0].first_completed_at);
    firstCompletedAt = rows[0].first_completed_at;
    const quiz = await device2.client.from("quiz_answers").select("question_id, attempt_no, correct").order("attempt_no");
    assert.deepEqual(quiz.data.map((q) => [q.attempt_no, q.correct]), [[1, false], [2, true]]);
    const tut = await device2.client.from("tutorial_progress").select("*").single();
    assert.ok(tut.data.completed_at);

    // retrying the exact same batch (lost response, second tab) changes nothing
    const again = await rpc(device2.client, "sync_learning", { p_events: batch });
    assert.equal(again.data.accepted, 0);
    assert.equal(again.data.duplicates, 8);
    const quiz2 = await device2.client.from("quiz_answers").select("event_id");
    assert.equal(quiz2.data.length, 2);
  });

  test("completing again later keeps the first completion time", async () => {
    await new Promise((r) => setTimeout(r, 1100));
    await rpc(learnerA.client, "sync_learning", { p_events: [ev("lesson_complete", L1, meta)] });
    const { data } = await learnerA.client.from("lesson_progress").select("first_completed_at").single();
    assert.equal(data.first_completed_at, firstCompletedAt);
  });

  test("an older event from an offline phone does not move progress backwards", async () => {
    const old = new Date(Date.now() - 3600_000).toISOString();
    await rpc(learnerA.client, "sync_learning", { p_events: [ev("lesson_step", L1, { step: 1, ...meta }, old)] });
    const { data } = await learnerA.client.from("lesson_progress").select("furthest_step, current_step").single();
    assert.equal(data.furthest_step, 6);
    assert.equal(data.current_step, 6);
  });

  test("device clocks cannot forge future times", async () => {
    await rpc(learnerB.client, "sync_learning", {
      p_events: [ev("lesson_step", L1, { step: 2, ...meta }, "2099-01-01T00:00:00Z")],
    });
    const { data } = await learnerB.client.from("lesson_progress").select("last_activity_at, last_synced_at").single();
    assert.ok(Date.parse(data.last_activity_at) <= Date.now() + 5000);
  });

  test("learner A cannot read or change learner B's records", async () => {
    const read = await learnerA.client.from("lesson_progress").select("*").eq("learner_id", learnerB.user.id);
    assert.deepEqual(read.data, []);
    const prof = await learnerA.client.from("learners").select("*");
    assert.deepEqual(prof.data.map((p) => p.id), [learnerA.user.id]);
    // re-sending B's event id from A's account must not touch B (ids are global, applied once)
    const { rows } = await db.query("select id from public.learning_events where learner_id = $1 limit 1", [learnerB.user.id]);
    const stolen = { ...ev("lesson_step", L1, { step: 0, ...meta }), id: rows[0].id };
    const r = await rpc(learnerA.client, "sync_learning", { p_events: [stolen] });
    assert.equal(r.data.duplicates, 1);
    const bAfter = await db.query("select furthest_step from public.lesson_progress where learner_id = $1", [learnerB.user.id]);
    assert.equal(bAfter.rows[0].furthest_step, 2);
    const aRows = await db.query("select count(*)::int n from public.learning_events where id = $1 and learner_id = $2", [rows[0].id, learnerA.user.id]);
    assert.equal(aRows.rows[0].n, 0);
  });

  test("seeking to the end of a video does not count as watching it", async () => {
    const v = { videoId: "V-OVR-001", duration: 300 };
    await rpc(learnerA.client, "sync_learning", {
      p_events: [ev("video_watch", L1, { ...v, ranges: [[0, 10], [5, 12], [290, 300]], position: 300 })],
    });
    let { data } = await learnerA.client.from("video_progress").select("*").single();
    assert.deepEqual(data.watched_ranges, [[0, 12], [290, 300]]);
    assert.equal(Number(data.watched_sec), 22);
    assert.equal(data.completed_at, null);
    await rpc(learnerA.client, "sync_learning", {
      p_events: [ev("video_watch", L1, { ...v, ranges: [[12, 290]], position: 290 })],
    });
    ({ data } = await learnerA.client.from("video_progress").select("*").single());
    assert.deepEqual(data.watched_ranges, [[0, 300]]);
    assert.ok(data.completed_at, "fully played -> completed");
  });

  test("device progress is imported once, only when asked, and labelled", async () => {
    const legacy = { "MCH68-K-001": { step: 3, stepCount: 8, completedAt: null, version: "1.0.0" } };
    const first = await rpc(learnerB.client, "import_device_progress", { p_lessons: legacy });
    assert.equal(first.data.imported, 1);
    const second = await rpc(learnerB.client, "import_device_progress", { p_lessons: legacy });
    assert.equal(second.data.already_imported, true);
    const { data } = await learnerB.client.from("lesson_progress").select("lesson_id, source, first_completed_at").eq("lesson_id", "MCH68-K-001").single();
    assert.equal(data.source, "legacy_import");
    assert.equal(data.first_completed_at, null, "no completion invented");
    const quiz = await learnerB.client.from("quiz_answers").select("*");
    assert.deepEqual(quiz.data, [], "no quiz attempts invented");
  });
});

describe("staff access", () => {
  test("admin invites a staff member; without a second factor they see nothing", async () => {
    const inv = await rpc(admin.client, "admin_invite_staff", { p_email: mail("nurse"), p_display_name: "พยาบาลทดสอบ", p_role: "staff" });
    assert.ifError(inv.error);
    const { client } = await emailSignIn(mail("nurse"), { intent: "staff" });
    const me = await rpc(client, "my_account");
    assert.equal(me.data.kind, "staff");
    assert.equal(me.data.aal, "aal1");
    const r = await rpc(client, "staff_list_learners", {});
    assert.equal(r.error, "mfa_required");
    const direct = await client.from("lesson_progress").select("*");
    assert.deepEqual(direct.data, [], "no direct table path to learner rows");
  });

  test("an existing learner email cannot be invited as staff", async () => {
    const r = await rpc(admin.client, "admin_invite_staff", { p_email: mail("learner-a"), p_display_name: "x", p_role: "staff" });
    assert.equal(r.error, "email_already_has_account");
  });

  test("with MFA, staff see only learners in their cohorts", async () => {
    const s = await staffSignIn(mail("nurse"));
    staff = s.client;
    staffSecret = s.totpSecret;
    const empty = await rpc(staff, "staff_list_learners", {});
    assert.equal(empty.data.total, 0, "no cohort yet -> nobody");

    const c = await rpc(admin.client, "admin_create_cohort", { p_name: `คลินิกทดสอบ ${run}` });
    cohortId = c.data;
    await rpc(admin.client, "admin_set_learner_cohort", { p_learner: learnerA.user.id, p_cohort: cohortId, p_member: true });
    const staffId = (await staff.auth.getUser()).data.user.id;
    await rpc(admin.client, "admin_set_staff_cohort", { p_staff: staffId, p_cohort: cohortId, p_granted: true });

    const list = await rpc(staff, "staff_list_learners", {});
    assert.ifError(list.error);
    assert.deepEqual(list.data.rows.map((r) => r.id), [learnerA.user.id]);
    assert.equal(list.data.rows[0].completed, 1);
    assert.ok(list.data.rows[0].tutorial_completed_at);

    const detail = await rpc(staff, "staff_learner_detail", { p_learner: learnerA.user.id });
    assert.ifError(detail.error);
    assert.equal(detail.data.lessons[0].lesson_id, L1);
    assert.equal(detail.data.quiz.length, 2);

    const denied = await rpc(staff, "staff_learner_detail", { p_learner: learnerB.user.id });
    assert.deepEqual(denied.data, { error: "learner_not_in_scope" }, "out-of-scope learner: no data at all");
  });

  test("staff reads are audited by the server, and staff cannot read or edit the audit log", async () => {
    const staffId = (await staff.auth.getUser()).data.user.id;
    const { rows } = await db.query(
      "select action from public.audit_log where actor_id = $1 order by id", [staffId]);
    const actions = rows.map((r) => r.action);
    assert.ok(actions.includes("staff.list_learners"));
    assert.ok(actions.includes("staff.view_learner"));
    assert.ok(actions.includes("staff.view_learner_denied"));
    const read = await staff.from("audit_log").select("*");
    assert.ok(read.error);
    const audit = await rpc(staff, "admin_audit_log", {});
    assert.equal(audit.error, "not_admin");
  });

  test("staff cannot promote themselves or grant themselves learners", async () => {
    const staffId = (await staff.auth.getUser()).data.user.id;
    assert.equal((await rpc(staff, "admin_set_staff_role", { p_user: staffId, p_role: "admin" })).error, "not_admin");
    assert.equal((await rpc(staff, "admin_set_learner_cohort", { p_learner: learnerB.user.id, p_cohort: cohortId, p_member: true })).error, "not_admin");
    const upd = await staff.from("staff_members").update({ role: "admin" }).eq("user_id", staffId);
    assert.ok(upd.error);
    const { rows } = await db.query("select role from public.staff_members where user_id = $1", [staffId]);
    assert.equal(rows[0].role, "staff");
  });

  test("revoking access works immediately, even for a session that is still open", async () => {
    const staffId = (await staff.auth.getUser()).data.user.id;
    await rpc(admin.client, "admin_set_staff_cohort", { p_staff: staffId, p_cohort: cohortId, p_granted: false });
    assert.equal((await rpc(staff, "staff_list_learners", {})).data.total, 0);
    assert.deepEqual((await rpc(staff, "staff_learner_detail", { p_learner: learnerA.user.id })).data, { error: "learner_not_in_scope" });

    await rpc(admin.client, "admin_set_staff_cohort", { p_staff: staffId, p_cohort: cohortId, p_granted: true });
    await rpc(admin.client, "admin_set_staff_status", { p_user: staffId, p_status: "deactivated" });
    assert.equal((await rpc(staff, "staff_list_learners", {})).error, "not_staff");

    await rpc(admin.client, "admin_set_staff_status", { p_user: staffId, p_status: "active" });
    assert.equal((await rpc(staff, "staff_list_learners", {})).data.total, 1);
  });

  test("a forged token claiming aal2 is rejected", async () => {
    const parts = (await staff.auth.getSession()).data.session.access_token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    const forged = [parts[0], Buffer.from(JSON.stringify({ ...payload, aal: "aal2", exp: payload.exp + 9999 })).toString("base64url"), parts[2]].join(".");
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/staff_list_learners`, {
      method: "POST",
      headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY, authorization: `Bearer ${forged}`, "content-type": "application/json" },
      body: "{}",
    });
    assert.equal(res.status, 401);
  });

  test("the last active administrator cannot be removed", async () => {
    const adminId = admin.user.id;
    assert.equal((await rpc(admin.client, "admin_set_staff_status", { p_user: adminId, p_status: "deactivated" })).error, "last_active_admin");
    assert.equal((await rpc(admin.client, "admin_set_staff_role", { p_user: adminId, p_role: "staff" })).error, "last_active_admin");
  });

  test("a deactivated learner cannot sync or read", async () => {
    await rpc(admin.client, "admin_set_learner_status", { p_learner: learnerB.user.id, p_status: "deactivated" });
    const r = await rpc(learnerB.client, "sync_learning", { p_events: [ev("lesson_step", L1, { step: 1, stepCount: 7, version: "1" })] });
    assert.equal(r.error, "account_deactivated");
    const read = await learnerB.client.from("lesson_progress").select("*");
    assert.deepEqual(read.data, []);
    await rpc(admin.client, "admin_set_learner_status", { p_learner: learnerB.user.id, p_status: "active" });
  });

  test("an admin session without its second factor cannot manage accounts", async () => {
    const { client } = await emailSignIn(mail("admin"), { intent: "staff" });
    assert.equal((await rpc(client, "admin_list_staff")).error, "mfa_required");
    assert.ok(staffSecret);
  });
});

describe("deletion and 5-year retention", () => {
  test("only an admin with a second factor can delete, and a reason is required", async () => {
    const { client, user } = await emailSignIn(mail("to-delete"), { display_name: "คุณซี (ทดสอบ)" });
    await rpc(client, "sync_learning", {
      p_events: [ev("lesson_complete", L1, { stepCount: 7, version: "1.0.0" }), ev("quiz_answer", L1, { questionId: "q1", correct: true })],
    });
    assert.equal((await rpc(staff, "admin_delete_learner", { p_learner: user.id, p_reason: "x" })).error, "not_admin");
    assert.equal((await rpc(client, "admin_delete_learner", { p_learner: user.id, p_reason: "x" })).error, "not_staff");
    assert.equal((await rpc(admin.client, "admin_delete_learner", { p_learner: user.id, p_reason: " " })).error, "reason_required");
  });

  test("deleting removes the sign-in and identity at once and keeps de-identified records for 5 years", async () => {
    const { rows: [c] } = await db.query("select id from auth.users where email = $1", [mail("to-delete")]);
    await rpc(admin.client, "admin_set_learner_cohort", { p_learner: c.id, p_cohort: cohortId, p_member: true });
    assert.ok((await rpc(staff, "staff_list_learners", { p_query: "คุณซี" })).data.total === 1);

    const r = await rpc(admin.client, "admin_delete_learner", { p_learner: c.id, p_reason: "เด็กอายุครบตามที่โรงพยาบาลกำหนด (ทดสอบ)" });
    assert.ifError(r.error);
    const years = (Date.parse(r.data.purge_after) - Date.parse(r.data.deleted_at)) / (365.25 * 24 * 3600 * 1000);
    assert.ok(Math.abs(years - 5) < 0.01, `purge after ~5 years, got ${years}`);

    const auth = await db.query("select count(*)::int n from auth.users where id = $1", [c.id]);
    assert.equal(auth.rows[0].n, 0, "phone/email and sign-in removed");
    const l = (await db.query("select display_name, contact_hint, deleted_at from public.learners where id = $1", [c.id])).rows[0];
    assert.equal(l.display_name, "");
    assert.equal(l.contact_hint, "");
    const kept = await db.query(
      "select (select count(*) from public.lesson_progress where learner_id = $1)::int lp, (select count(*) from public.quiz_answers where learner_id = $1)::int qa",
      [c.id]);
    assert.deepEqual(kept.rows[0], { lp: 1, qa: 1 }, "learning records kept, de-identified");

    assert.equal((await rpc(staff, "staff_list_learners", { p_query: "คุณซี" })).data.total, 0, "no longer shown to staff");
    assert.deepEqual((await rpc(staff, "staff_learner_detail", { p_learner: c.id })).data, { error: "learner_not_in_scope" });
    const admins = await rpc(admin.client, "admin_list_learners", {});
    assert.ok(!admins.data.rows.some((x) => x.id === c.id));
    assert.equal((await rpc(admin.client, "admin_set_learner_status", { p_learner: c.id, p_status: "active" })).error, "already_deleted");
    const { rows } = await db.query("select details from public.audit_log where action = 'admin.delete_learner' and target_id = $1", [c.id]);
    assert.match(rows[0].details.reason, /อายุครบ/);
  });

  test("records are removed automatically once the 5 years are over, and not before", async () => {
    const { rows: [c] } = await db.query("select id from public.learners where deleted_at is not null limit 1");
    assert.equal((await db.query("select private.purge_expired_learners() n")).rows[0].n, 0, "nothing due yet");
    await db.query("update public.learners set purge_after = now() - interval '1 minute' where id = $1", [c.id]);
    assert.equal((await db.query("select private.purge_expired_learners() n")).rows[0].n, 1);
    const left = await db.query(
      "select (select count(*) from public.learners where id = $1)::int l, (select count(*) from public.lesson_progress where learner_id = $1)::int lp, (select count(*) from public.learning_events where learner_id = $1)::int ev",
      [c.id]);
    assert.deepEqual(left.rows[0], { l: 0, lp: 0, ev: 0 });
    const job = await db.query("select schedule from cron.job where jobname = 'pmh-purge-expired-learners'");
    assert.equal(job.rows[0]?.schedule, "15 20 * * *", "daily purge scheduled");
  });
});
