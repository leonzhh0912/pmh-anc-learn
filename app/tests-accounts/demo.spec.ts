/**
 * The first end-to-end milestone (brief, Phase D), through the real UI and the real local auth service:
 *  1 a fictional learner signs in, 2-3 opens and completes Lesson 0, 4 completes a handbook lesson,
 *  5 progress saves centrally, 6-7 another browser shows the same progress, 8-9 an authorised staff member
 *  (invited by an administrator, with a second factor) sees it, 10 an unauthorised user cannot.
 * Screenshots go to docs/guides/img/ for the staff/admin guides.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { db, uiEmailSignIn, uiSecondFactor, walkLesson } from "./helpers";
import { env } from "./env";
import type { Lesson } from "../src/content/schema";

const lesson: Lesson = JSON.parse(readFileSync(join(import.meta.dirname, "../../content/lessons/MCH68-OVR-001.json"), "utf8"));
const shots = join(import.meta.dirname, "../../docs/guides/img");
mkdirSync(shots, { recursive: true });
const shot = (page: Page, name: string) => page.screenshot({ path: join(shots, `${name}.png`), fullPage: false });

const LEARNER = "somjai.test@example.test";
const OTHER = "other.learner@example.test";
const ADMIN = "admin.test@pmh.example.test";
const NURSE = "nurse.test@pmh.example.test";

test.describe.configure({ mode: "serial" });

async function desktop(browser: Browser) {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, locale: "th-TH", timezoneId: "Asia/Bangkok", isMobile: false, hasTouch: false });
  return ctx.newPage();
}

let learnerId = "";

test("learner: sign in, Lesson 0, one lesson, progress saved to the account", async ({ page }) => {
  await test.step("1. sign in with an email one-time code", async () => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "เข้าสู่ระบบ" })).toBeVisible();
    await shot(page, "learner-home");
    await uiEmailSignIn(page, LEARNER);
    await expect(page).toHaveURL(/\/account$/);
    await page.getByLabel("ชื่อที่ให้เจ้าหน้าที่เห็น").fill("สมใจ (ทดสอบ)");
    await page.getByRole("button", { name: "บันทึกชื่อ" }).click();
    await expect(page.getByRole("status").filter({ hasText: "บันทึกแล้ว" })).toBeVisible();
    learnerId = (await db.query("select id from auth.users where email = $1", [LEARNER])).rows[0].id;
  });

  await test.step("2-3. Lesson 0 is the first card; complete every practice step", async () => {
    await page.goto("/");
    const start = page.locator(".start-here");
    await expect(start).toContainText("วิธีใช้งาน");
    // the tutorial card comes before the lesson card
    const order = await page.locator(".start-here, .continue").evaluateAll((els) => els.map((e) => e.className));
    expect(order[0]).toContain("start-here");
    await start.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("เริ่มต้น");
    await expect(page.locator(".page-chip")).toHaveCount(0); // no handbook citation on the tutorial
    await page.getByRole("button", { name: "เริ่ม", exact: true }).click();
    await expect(page.locator(".tutorial__done")).toContainText("ดีมาก");
    const next = () => page.locator(".lesson__nav").getByRole("button", { name: "ต่อไป" }).click();
    await next();

    await page.getByRole("button", { name: /^เบอร์โทรศัพท์/ }).click();
    await page.getByRole("button", { name: "ส่งรหัส (ฝึก)" }).click();
    await page.getByLabel("พิมพ์รหัส 6 หลักจากข้อความตัวอย่าง").fill("123456");
    await page.getByRole("button", { name: "ยืนยันรหัส (ฝึก)" }).click();
    await expect(page.locator(".tutorial__done")).toContainText("สำเร็จ");
    await shot(page, "tutorial-login-practice");
    await next();

    await page.getByRole("button", { name: "ความรู้" }).click();
    await page.getByRole("button", { name: "ธงโภชนาการ คืออะไร" }).click();
    await expect(page.locator(".tutorial__done")).toContainText("ธงโภชนาการ");
    await next();

    const mock = page.locator(".mock--lesson");
    await mock.getByRole("button", { name: "ต่อไป" }).click();
    await mock.getByRole("button", { name: "ย้อนกลับ" }).click();
    await mock.getByRole("button", { name: "‹ หน้าแรก" }).click();
    await expect(page.locator(".tutorial__done")).toContainText("ครบแล้ว");
    await next();

    await page.getByRole("group", { name: "ขนาดตัวอักษร (ฝึก)" }).getByRole("button", { name: "ใหญ่", exact: true }).click();
    await expect(page.locator(".tutorial__done")).toContainText("ตัวอักษร");
    await page.getByRole("group", { name: "ขนาดตัวอักษร (ฝึก)" }).getByRole("button", { name: "ปกติ", exact: true }).click();
    await next();

    await page.locator(".quiz__options").getByRole("button", { name: "ต่อไป" }).click();
    await expect(page.locator(".feedback--gentle")).toBeVisible();
    await page.getByRole("button", { name: "ลองตอบอีกครั้ง" }).click();
    await page.locator(".quiz__options").getByRole("button", { name: "‹ หน้าแรก" }).click();
    await expect(page.locator(".feedback--correct")).toBeVisible();
    await next();
    await expect(page.locator(".savestates")).toContainText("บันทึกเข้าบัญชีแล้ว");
    await next();
    await page.getByRole("button", { name: "จบวิธีใช้งาน ไปเรียนเลย" }).click();
    await expect(page.locator(".start-here")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "ดูวิธีใช้งานอีกครั้ง" })).toBeVisible();
    await expect(page.locator(".home__progress")).toContainText("จาก 58 บทเรียน"); // tutorial not counted
  });

  await test.step("4. complete one handbook lesson (first quiz answer wrong once)", async () => {
    await walkLesson(page, lesson, { wrongFirst: true });
  });

  await test.step("5. progress is saved to the account", async () => {
    await page.goto("/account");
    await expect(page.locator(".syncbox")).toContainText("บันทึกเข้าบัญชีแล้ว", { timeout: 20_000 });
    await expect(page.locator(".syncbox__meta")).not.toContainText("ส่งเข้าบัญชีล่าสุด —");
    // everything was done while signed in, so nothing may have landed in the device's guest store
    await expect(page.locator(".account__import")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("pmh-anc-learn:progress:v1"))).toBeNull();
    await shot(page, "learner-account-synced");
    const { rows } = await db.query(
      "select lesson_id, first_completed_at, furthest_step from public.lesson_progress where learner_id = $1",
      [learnerId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].lesson_id).toBe(lesson.id);
    expect(rows[0].first_completed_at).not.toBeNull();
    const tut = await db.query("select completed_at from public.tutorial_progress where learner_id = $1", [learnerId]);
    expect(tut.rows[0].completed_at).not.toBeNull();
  });
});

test("another browser: the same progress after signing in", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "th-TH", timezoneId: "Asia/Bangkok", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator(".home__progress")).toContainText("เรียนจบแล้ว 0 จาก 58"); // nothing before sign-in
  await uiEmailSignIn(page, LEARNER);
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText("บทเรียนจากสมุดสีชมพู: เรียนจบแล้ว 1 จาก 58 บท")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/วิธีใช้งาน: เรียนจบแล้ว/)).toBeVisible();
  await page.goto("/");
  await expect(page.locator(".home__progress")).toContainText("เรียนจบแล้ว 1 จาก 58");

  // shared phone: sign out removes this account's data from the device
  await page.goto("/account");
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".home__progress")).toContainText("เรียนจบแล้ว 0 จาก 58");
  const leftovers = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes(":account:") || k.includes("auth")));
  expect(leftovers).toEqual([]);
  await page.goBack();
  await expect(page.getByText("สมใจ (ทดสอบ)")).toHaveCount(0);
  await ctx.close();
});

test("staff: an authorised nurse sees the learner; others cannot", async ({ browser }) => {
  // first administrator: created by a person with database access (never through the app)
  await db.query("select private.bootstrap_admin($1, $2)", [ADMIN, "ผู้ดูแลระบบ (ทดสอบ)"]);
  const admin = await desktop(browser);
  await uiEmailSignIn(admin, ADMIN, "/staff");
  await uiSecondFactor(admin);
  await expect(admin.getByRole("heading", { name: "ความคืบหน้าผู้เรียน" })).toBeVisible();

  await admin.goto("/admin");
  await admin.getByLabel("อีเมลงาน").fill(NURSE);
  await admin.getByLabel("ชื่อที่แสดง").fill("พยาบาลทดสอบ");
  await admin.getByRole("button", { name: "สร้างบัญชี", exact: true }).click();
  await expect(admin.getByText("สร้างบัญชีแล้ว")).toBeVisible();
  await admin.getByRole("tab", { name: "บัญชีผู้เรียน" }).click();
  const row = admin.locator(".admin__staff").filter({ hasText: "สมใจ (ทดสอบ)" });
  await row.getByLabel("คลินิกฝากครรภ์ (ข้อมูลทดสอบ)").click();
  await expect(row.getByLabel("คลินิกฝากครรภ์ (ข้อมูลทดสอบ)")).toBeChecked();
  await shot(admin, "admin-learners");

  // the nurse accepts by signing in on the staff page with the invited email, then sets up the authenticator
  const nurse = await desktop(browser);
  await uiEmailSignIn(nurse, NURSE, "/staff");
  await shot(nurse, "staff-second-factor");
  await uiSecondFactor(nurse);
  await expect(nurse.getByText("พบ 0 คน")).toBeVisible(); // no cohort yet: sees nobody

  await admin.getByRole("tab", { name: "เจ้าหน้าที่และกลุ่ม" }).click();
  const nurseRow = admin.locator(".admin__staff").filter({ hasText: "พยาบาลทดสอบ" });
  await nurseRow.getByLabel("คลินิกฝากครรภ์ (ข้อมูลทดสอบ)").click();
  await expect(nurseRow.getByLabel("คลินิกฝากครรภ์ (ข้อมูลทดสอบ)")).toBeChecked();
  await shot(admin, "admin-staff");

  await nurse.reload();
  const learnerRow = nurse.locator(".learners__row").filter({ hasText: "สมใจ (ทดสอบ)" });
  await expect(learnerRow).toContainText("จบ 1 จาก 58 บท");
  await expect(learnerRow).toContainText("วิธีใช้งาน: จบแล้ว");
  await shot(nurse, "staff-list");
  await learnerRow.getByRole("link").click();
  const done = nurse.locator(".lessonrow").filter({ hasText: lesson.title });
  await expect(done).toContainText("จบตามกติกาของแอป");
  await expect(done).toContainText("อาจต้องอธิบายเพิ่ม");
  await shot(nurse, "staff-learner-detail");

  await admin.getByRole("tab", { name: "บันทึกการใช้งาน" }).click();
  await expect(admin.locator(".timeline-log")).toContainText("เปิดข้อมูลผู้เรียน");
  await shot(admin, "admin-audit");

  // an unauthorised learner: the staff page refuses, and so does the database when asked directly
  const other = await (await browser.newContext({ locale: "th-TH" })).newPage();
  await uiEmailSignIn(other, OTHER);
  await other.goto("/staff");
  await expect(other.getByRole("heading", { name: "บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่" })).toBeVisible();
  const direct = await other.evaluate(
    async ({ url, key, id }) => {
      const raw = localStorage.getItem("pmh-anc-learn:auth");
      const token = raw ? JSON.parse(raw).access_token : "";
      const res = await fetch(`${url}/rest/v1/rpc/staff_learner_detail`, {
        method: "POST",
        headers: { apikey: key, authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ p_learner: id }),
      });
      const table = await fetch(`${url}/rest/v1/lesson_progress?learner_id=eq.${id}`, {
        headers: { apikey: key, authorization: `Bearer ${token}` },
      });
      return { status: res.status, body: await res.text(), rows: await table.json() };
    },
    { url: env.SUPABASE_URL, key: env.SUPABASE_PUBLISHABLE_KEY, id: learnerId },
  );
  expect(direct.status).toBeGreaterThanOrEqual(400);
  expect(direct.body).toContain("not_staff");
  expect(direct.rows).toEqual([]);

  // revoking the nurse's scope hides the learner on the next request, without signing her out
  await admin.getByRole("tab", { name: "เจ้าหน้าที่และกลุ่ม" }).click();
  await nurseRow.getByLabel("คลินิกฝากครรภ์ (ข้อมูลทดสอบ)").click();
  await expect(nurseRow.getByLabel("คลินิกฝากครรภ์ (ข้อมูลทดสอบ)")).not.toBeChecked();
  await nurse.goto("/staff");
  await expect(nurse.getByText("พบ 0 คน")).toBeVisible();

  // an administrator deletes the other learner's account (reason required; identity removed, records kept 5 years)
  await admin.getByRole("tab", { name: "บัญชีผู้เรียน" }).click();
  const otherRow = admin.locator(".admin__staff").filter({ hasText: "ot•••@example.test" });
  admin.once("dialog", (d) => void d.accept("เด็กอายุครบตามที่โรงพยาบาลกำหนด (ทดสอบ)"));
  await otherRow.getByRole("button", { name: "ลบบัญชี" }).click();
  await expect(admin.getByText(/ลบบัญชี .* แล้ว/)).toBeVisible();
  await expect(otherRow).toHaveCount(0);
  const gone = await db.query("select count(*)::int n from auth.users where email = $1", [OTHER]);
  expect(gone.rows[0].n).toBe(0);
  await admin.getByRole("tab", { name: "สถานะระบบ" }).click();
  await expect(admin.locator(".facts")).toContainText("บัญชีที่ลบแล้ว");
});
